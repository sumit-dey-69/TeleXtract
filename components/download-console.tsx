"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DownloadConsole({
  onSubmit,
  busy,
}: {
  onSubmit: (link: string, folder: string, rename: string) => void;
  busy: boolean;
}) {
  const [link, setLink] = useState("");
  const [rename, setRename] = useState("");
  const [folder, setFolder] = useState("");
  const [browsing, setBrowsing] = useState(false);

  async function browse() {
    setBrowsing(true);
    try {
      const res = await fetch("/api/pick-folder", { method: "POST" });
      const data = await res.json();
      if (data.path) {
        setFolder(data.path);
      } else if (data.error) {
        alert(data.error + "\n\nYou can also just type a folder path directly in the field.");
      }
    } finally {
      setBrowsing(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!link.trim()) return;
    onSubmit(link.trim(), folder.trim(), rename.trim());
    setLink("");
    setRename("");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <Input
            placeholder="e.g. https://t.me/example_channel/123"
            autoComplete="off"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <Button type="submit" disabled={busy}>
            Fetch
          </Button>
        </form>

        <Input
          placeholder="Rename file (optional)"
          autoComplete="off"
          value={rename}
          onChange={(e) => setRename(e.target.value)}
        />

        <div className="flex gap-2.5">
          <Input
            placeholder="downloads"
            autoComplete="off"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={browse} disabled={browsing}>
            {browsing ? "Waiting…" : "Browse…"}
          </Button>
        </div>

        <p className="font-mono text-[11.5px] text-muted">
          supports public (t.me/username/id) and private (t.me/c/id/msg) links · leave folder
          blank to use ./downloads · leave rename blank to keep the original filename
        </p>
      </CardContent>
    </Card>
  );
}
