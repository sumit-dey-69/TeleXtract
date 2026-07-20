import type { TelegramClient, Api } from "teleproto";
import { requireClient } from "./auth-manager";

interface ParsedLink {
  kind: "public" | "private";
  ref: string | number;
  msgId: number;
}

export function parseLink(link: string): ParsedLink {
  const privateMatch = link.match(/t\.me\/c\/(\d+)\/(\d+)/);
  if (privateMatch) {
    return { kind: "private", ref: Number(privateMatch[1]), msgId: Number(privateMatch[2]) };
  }
  const publicMatch = link.match(/t\.me\/([A-Za-z0-9_]+)\/(\d+)/);
  if (publicMatch) {
    return { kind: "public", ref: publicMatch[1], msgId: Number(publicMatch[2]) };
  }
  throw new Error("That doesn't look like a Telegram message link.");
}

async function resolveEntity(client: TelegramClient, parsed: ParsedLink) {
  if (parsed.kind === "public") {
    return client.getEntity(parsed.ref as string);
  }
  // Private channel links only carry the bare channel ID — Telegram needs an
  // access hash too, which the client only has cached for chats the account
  // has already seen. Refreshing the dialog list first makes that reliable.
  const peerId = Number(`-100${parsed.ref}`);
  try {
    return await client.getEntity(peerId);
  } catch {
    await client.getDialogs({ limit: 200 });
    return client.getEntity(peerId);
  }
}

export async function fetchMessage(link: string): Promise<Api.Message> {
  const client = await requireClient();
  const parsed = parseLink(link);
  const entity = await resolveEntity(client, parsed);
  const messages = await client.getMessages(entity, { ids: [parsed.msgId] });
  const message = messages[0] as unknown as Api.Message;
  if (!message || !message.media) {
    throw new Error("No downloadable media found at that link.");
  }
  return message;
}

export function extractFileInfo(message: Api.Message): { filename: string; size: number } {
  const doc = (message as unknown as { document?: Api.Document }).document;
  if (!doc) {
    throw new Error("This message doesn't contain a video or file — only text or a photo.");
  }
  const nameAttr = doc.attributes?.find(
    (a): a is Api.DocumentAttributeFilename => a.className === "DocumentAttributeFilename"
  );
  const filename = nameAttr?.fileName || `telegram_${message.id}.mp4`;
  return { filename, size: Number(doc.size) };
}
