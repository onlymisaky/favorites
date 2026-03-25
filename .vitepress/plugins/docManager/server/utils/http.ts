import type { IncomingMessage, ServerResponse } from "node:http";

const SSE_RETRY_INTERVAL = 1000;

export type JsonBody = Record<string, unknown>;

export function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function startSse(res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(`retry: ${SSE_RETRY_INTERVAL}\n\n`);
  res.flushHeaders?.();
}

export function writeSseEvent(
  res: ServerResponse,
  event: string,
  data: Record<string, unknown>,
) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function endSse(
  res: ServerResponse,
  success: boolean,
  errorMessage?: string,
) {
  if (errorMessage) {
    res.end(
      `event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n` +
        `event: done\ndata: ${JSON.stringify({ success })}\n\n`,
    );
    return;
  }

  res.end(`event: done\ndata: ${JSON.stringify({ success })}\n\n`);
}

export function readJsonBody(req: IncomingMessage): Promise<JsonBody | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      try {
        resolve(
          JSON.parse(Buffer.concat(chunks).toString("utf-8")) as JsonBody,
        );
      } catch {
        resolve(null);
      }
    });
  });
}

export function acceptsEventStream(req: IncomingMessage) {
  const acceptHeader = req.headers.accept;
  const acceptValue = Array.isArray(acceptHeader)
    ? acceptHeader.join(",")
    : (acceptHeader ?? "");

  return acceptValue.includes("text/event-stream");
}
