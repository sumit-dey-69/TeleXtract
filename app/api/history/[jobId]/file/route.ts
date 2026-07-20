import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getHistoryItem } from "@/lib/telegram/history-store";
import { resolveDestPath } from "@/lib/telegram/jobs";

// GET /api/history/:jobId/file
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const item = getHistoryItem(jobId);
  if (!item) return Response.json({ error: "History entry not found." }, { status: 404 });

  try {
    const filePath = resolveDestPath(item.dest_folder || "", item.filename || "");
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: "File not found on disk." }, { status: 404 });
    }
    const stat = fs.statSync(filePath);
    const nodeStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
    return new Response(webStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not read the file." },
      { status: 404 }
    );
  }
}
