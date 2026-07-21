"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusEyebrow } from "@/components/status-eyebrow";
import { LoginCard } from "@/components/login-card";
import { DownloadConsole } from "@/components/download-console";
import { ConflictDialog } from "@/components/conflict-dialog";
import { JobCard } from "@/components/job-card";
import { HistoryCard } from "@/components/history-card";
import { suggestAlternative } from "@/lib/utils";
import type { AuthStatus, Job, HistoryItem } from "@/lib/types";

export default function Page() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [conflict, setConflict] = useState<{
    link: string;
    destFolder: string;
    message: string;
    suggested: string;
  } | null>(null);

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/auth/status");
    const data: AuthStatus = await res.json();
    setAuth(data);
    return data.authorized;
  }, []);

  const restoreJobs = useCallback(async () => {
    const res = await fetch("/api/jobs");
    const list: Job[] = await res.json();
    setJobs(list.slice().reverse());
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/history");
    setHistory(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      const authorized = await refreshStatus();
      if (authorized) await restoreJobs();
    })();
  }, [refreshStatus, restoreJobs]);

  async function onLoggedIn() {
    await refreshStatus();
    await restoreJobs();
  }

  async function logout() {
    if (!confirm("Log out of this Telegram session?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshStatus();
  }

  const pendingResolve = useRef<((value: string | null) => void) | null>(null);

  async function resolveAndConfirmName(
    link: string,
    destFolder: string,
    desiredName: string
  ): Promise<string | null> {
    let name = desiredName;
    for (;;) {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, dest_folder: destFolder, filename: name }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return null;
      }
      if (!data.conflict) return data.filename;

      const suggestion = suggestAlternative(data.filename);
      const newName = await new Promise<string | null>((resolve) => {
        setConflict({
          link,
          destFolder,
          message: `A file with same name already exists in that folder. Rename it to continue.`,
          suggested: suggestion,
        });
        pendingResolve.current = resolve;
      });
      if (newName === null) return null;
      name = newName;
    }
  }

  async function handleSubmit(link: string, folder: string, rename: string) {
    setSubmitting(true);
    try {
      const finalName = await resolveAndConfirmName(link, folder, rename);
      if (finalName === null) return;

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, dest_folder: folder, filename: finalName }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      const newJob: Job = {
        job_id: data.job_id,
        link,
        dest_folder: folder || "(server default)",
        status: "downloading",
        pct: 0,
        current: 0,
        total: 0,
      };
      setJobs((prev) => [newJob, ...prev]);
    } finally {
      setSubmitting(false);
    }
  }

  function removeJobFromView(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
  }

  return (
    <>
      <div className="mb-3.5 flex items-center justify-between">
        <StatusEyebrow
          online={!!auth?.authorized}
          label={
            auth === null
              ? "CHECKING…"
              : auth.authorized
              ? "SESSION ACTIVE" + (auth.name ? ` — ${auth.name.toUpperCase()}` : "")
              : "LOGGED OUT"
          }
        />
        {auth?.authorized && (
          <Button variant="ghost" size="pill" onClick={logout}>
            Log out
          </Button>
        )}
      </div>

      <h1 className="mb-2 font-display text-[34px] leading-[1.15] font-bold tracking-tight">
        TeleXtract
        <span className="font-medium text-muted">
          {" "}— your Telegram media downloader
        </span>
      </h1>

      <p className="mb-9 max-w-[46ch] text-sm text-muted">
        Download media from Telegram public and private channels using your own authenticated account.
        Fast, secure, and built for a seamless experience.
      </p>

      {auth && !auth.authorized && <LoginCard onLoggedIn={onLoggedIn} />}

      {auth?.authorized && (
        <>
          <DownloadConsole onSubmit={handleSubmit} busy={submitting} />

          <Tabs defaultValue="active" className="mt-7">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="history" onClick={loadHistory}>
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="flex flex-col gap-2.5">
                {jobs.length === 0 ? (
                  <p className="py-8 text-center font-mono text-[12.5px] text-muted">
                    No transmissions yet — paste a link above.
                  </p>
                ) : (
                  jobs.map((job) => (
                    <JobCard key={job.job_id} job={job} onRemoved={removeJobFromView} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex flex-col gap-2.5">
                {history.length === 0 ? (
                  <p className="py-8 text-center font-mono text-[12.5px] text-muted">
                    No history yet.
                  </p>
                ) : (
                  history.map((item) => (
                    <HistoryCard key={item.job_id} item={item} onChanged={loadHistory} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      <ConflictDialog
        open={!!conflict}
        message={conflict?.message ?? ""}
        suggested={conflict?.suggested ?? ""}
        onCancel={() => {
          pendingResolve.current?.(null);
          setConflict(null);
        }}
        onConfirm={(name) => {
          pendingResolve.current?.(name);
          setConflict(null);
        }}
      />
    </>
  );
}
