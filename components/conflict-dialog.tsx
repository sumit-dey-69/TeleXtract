"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ConflictDialog({
  open,
  message,
  suggested,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  message: string;
  suggested: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  return (
    <ConflictDialogInner
      key={suggested}
      open={open}
      message={message}
      suggested={suggested}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

function ConflictDialogInner({
  open,
  message,
  suggested,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  message: string;
  suggested: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  const [value, setValue] = useState(suggested);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filename already exists</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onConfirm(value.trim());
          }}
          className="flex gap-2.5"
        >
          <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
          <Button type="submit" className="cursor-pointer">Continue</Button>
        </form>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="text-left font-mono text-[11.5px] text-muted underline cursor-pointer"
          >
            ‹- cancel this download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
