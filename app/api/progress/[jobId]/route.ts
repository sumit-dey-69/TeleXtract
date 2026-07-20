import { getJob, onJobUpdate } from "@/lib/telegram/jobs";

// GET /api/progress/:jobId — Server-Sent Events stream of live job progress.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const send = (job: ReturnType<typeof getJob>) => {
        if (closed || !job) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(job)}\n\n`));
        if (["done", "error", "cancelled", "deleted"].includes(job.status)) {
          closed = true;
          unsubscribe();
          controller.close();
        }
      };

      const current = getJob(jobId);
      if (!current) {
        controller.close();
        return;
      }
      send(current);

      const unsubscribe = onJobUpdate(jobId, send);

      return () => {
        closed = true;
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
