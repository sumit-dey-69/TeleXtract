import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getJobFilePath } from "@/lib/telegram/jobs";

// GET /api/jobs/:jobId/file — streams a completed download to the browser.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    const filePath = getJobFilePath(jobId);
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
