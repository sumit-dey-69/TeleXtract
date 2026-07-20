import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions";
import { getApiHash, getApiId } from "./env";
import { clearSession, loadSession, saveSession } from "./session-store";

type Status = "idle" | "awaiting_code" | "awaiting_password" | "authorized" | "error";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
}

function defer<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

interface AuthState {
  client: TelegramClient | null;
  status: Status;
  error?: string;
  codeDeferred?: Deferred<string>;
  passwordDeferred?: Deferred<string>;
}

// Persisted on globalThis so it survives Next.js dev-mode hot reloads.
const g = globalThis as unknown as { __telextractAuth?: AuthState };
const state: AuthState = g.__telextractAuth ?? (g.__telextractAuth = { client: null, status: "idle" });

async function getClient(): Promise<TelegramClient> {
  if (state.client) return state.client;
  const session = loadSession();
  const client = new TelegramClient(new StringSession(session), getApiId(), getApiHash(), {
    connectionRetries: 5,
  });
  await client.connect();
  state.client = client;
  if (session && (await client.isUserAuthorized())) {
    state.status = "authorized";
  }
  return client;
}

export async function getStatus(): Promise<{ authorized: boolean; name?: string }> {
  try {
    const client = await getClient();
    if (state.status !== "authorized") {
      if (!(await client.isUserAuthorized())) return { authorized: false };
      state.status = "authorized";
    }
    const me = await client.getMe();
    const name =
      [me?.firstName, me?.lastName].filter(Boolean).join(" ") || me?.username || undefined;
    return { authorized: true, name };
  } catch (err) {
    console.error("getStatus failed:", err);
    return { authorized: false };
  }
}

async function waitForStatusChange(from: Status, timeoutMs = 25_000): Promise<void> {
  const start = Date.now();
  while (state.status === from) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for Telegram's response. Please try again.");
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}

export async function sendCode(phone: string): Promise<void> {
  const client = await getClient();

  state.status = "awaiting_code";
  state.error = undefined;
  state.codeDeferred = defer<string>();
  state.passwordDeferred = defer<string>();

  const codeRequested = defer<void>();

  // Kicked off in the background — client.start() resolves once the whole
  // login flow (code, and password if needed) completes.
  client
    .start({
      phoneNumber: async () => phone,
      phoneCode: async () => {
        codeRequested.resolve();
        return state.codeDeferred!.promise;
      },
      password: async () => {
        state.status = "awaiting_password";
        return state.passwordDeferred!.promise;
      },
      onError: (err) => {
        state.status = "error";
        state.error = err instanceof Error ? err.message : String(err);
        state.codeDeferred?.reject(err);
        state.passwordDeferred?.reject(err);
      },
    })
    .then(() => {
      state.status = "authorized";
      state.error = undefined;
      saveSession((client.session.save() as string | void) || "");
    })
    .catch((err) => {
      if (state.status !== "error") {
        state.status = "error";
        state.error = err instanceof Error ? err.message : String(err);
      }
    });

  await codeRequested.promise;
}

export async function verifyCode(
  code: string
): Promise<{ status: "authorized" | "awaiting_password" }> {
  if (!state.codeDeferred || state.status !== "awaiting_code") {
    throw new Error("No login in progress — request a code first.");
  }
  state.codeDeferred.resolve(code);
  await waitForStatusChange("awaiting_code");

  const finalStatus = state.status as unknown as Status;
  if (finalStatus === "error") throw new Error(state.error || "Login failed.");
  return { status: finalStatus === "authorized" ? "authorized" : "awaiting_password" };
}

export async function verifyPassword(password: string): Promise<void> {
  if (!state.passwordDeferred || state.status !== "awaiting_password") {
    throw new Error("No two-step password prompt in progress.");
  }
  state.passwordDeferred.resolve(password);
  await waitForStatusChange("awaiting_password");

  const finalStatus = state.status as unknown as Status;
  if (finalStatus === "error") throw new Error(state.error || "Login failed.");
}

export async function logout(): Promise<void> {
  if (state.client) {
    try {
      await state.client.logOut();
    } catch {
      // ignore — we're clearing the local session either way
    }
  }
  clearSession();
  state.client = null;
  state.status = "idle";
  state.error = undefined;
}

/** Used by the download/resolve routes — throws a clear error if not logged in. */
export async function requireClient(): Promise<TelegramClient> {
  const client = await getClient();
  if (state.status !== "authorized" && !(await client.isUserAuthorized())) {
    throw new Error("Not logged in to Telegram.");
  }
  return client;
}
