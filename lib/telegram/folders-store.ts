import fs from "fs";
import path from "path";
import { DATA_DIR, DEFAULT_DOWNLOAD_ROOT } from "./env";

const FOLDERS_FILE = path.join(DATA_DIR, "folders.json");

export interface SavedFolder {
  id: string;
  path: string;
}

function readAll(): SavedFolder[] {
  try {
    return JSON.parse(fs.readFileSync(FOLDERS_FILE, "utf-8"));
  } catch {
    return [{ id: "default", path: DEFAULT_DOWNLOAD_ROOT }];
  }
}

function writeAll(items: SavedFolder[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FOLDERS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function listFolders(): SavedFolder[] {
  return readAll();
}

export function addFolder(folderPath: string): SavedFolder {
  const items = readAll();
  const folder = { id: Math.random().toString(36).slice(2, 9), path: folderPath };
  items.push(folder);
  writeAll(items);
  return folder;
}

export function removeFolder(id: string) {
  writeAll(readAll().filter((f) => f.id !== id));
}
