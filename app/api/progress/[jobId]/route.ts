import { store } from "@/lib/mock-store";

// GET /api/progress/:jobId — Server-Sent Events stream.
// The frontend opens this with `new EventSource(...)` and expects one JSON
// object per `message` event, matching the Job shape in lib/types.ts.
// TODO(backend): replace the interval below with real push updates from your
// download engine (e.g. forward Telethon's progress callback through here).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = () => {
        const job = store.jobs.get(jobId);
        if (!job) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(job)}\n\n`));
        if (["done", "error", "cancelled", "deleted"].includes(job.status)) {
          clearInterval(timer);
          controller.close();
        }
      };

      send();
      const timer = setInterval(send, 500);

      // Clean up if the client disconnects.
      return () => clearInterval(timer);
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
