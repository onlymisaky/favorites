import {
  CURSOR_CHAT_URL,
  DEFAULT_CURSOR_COOKIE,
} from "./config.mjs";
import { createRequestId } from "./utils/common.mjs";

export async function callCursorChat(options) {
  const response = await fetch(CURSOR_CHAT_URL, {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      cookie: process.env.DOC_MANAGER_CURSOR_COOKIE || DEFAULT_CURSOR_COOKIE,
      Referer: "https://cursor.com/help",
    },
    body: JSON.stringify({
      context: [
        {
          type: "file",
          content: "",
          filePath: `/${options.relativePath.replace(/\.md$/u, "")}`,
        },
        {
          type: "help_origin",
          content: "true",
        },
      ],
      model: options.model,
      id: createRequestId(),
      messages: [
        {
          parts: [
            {
              type: "text",
              text: options.prompt,
            },
          ],
          id: createRequestId(),
          role: "user",
        },
      ],
      trigger: "submit-message",
    }),
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const errorBody = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");
    const errorMessage =
      typeof errorBody === "string"
        ? errorBody
        : getErrorMessageFromPayload(errorBody);

    throw new Error(errorMessage || options.failureMessage);
  }

  if (contentType.includes("text/event-stream")) {
    const streamedContent = await readCursorChatSse(response);

    if (!streamedContent) {
      throw new Error(options.emptyContentError);
    }

    return streamedContent;
  }

  const content = await readCursorChatJson(response);

  if (!content) {
    throw new Error(options.failureMessage);
  }

  return content;
}

export async function readCursorChatJson(response) {
  const data = await response.json().catch(() => null);
  const content = extractSummaryContentFromPayload(data);

  if (!content) {
    throw new Error(getErrorMessageFromPayload(data) || "Cursor chat failed.");
  }

  return content;
}

export async function readCursorChatSse(response) {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let aggregatedContent = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/u);
    buffer = events.pop() ?? "";

    // SSE 数据是按事件块切开的，必须先缓冲到完整事件后再解析，避免半包 JSON 误判失败。
    for (const eventText of events) {
      const parsedEvent = parseCursorSseEvent(eventText);

      if (parsedEvent.done) {
        return aggregatedContent.trim();
      }

      if (parsedEvent.error) {
        throw new Error(parsedEvent.error);
      }

      if (parsedEvent.content) {
        aggregatedContent += parsedEvent.content;
      }
    }
  }

  if (buffer.trim()) {
    const parsedEvent = parseCursorSseEvent(buffer);

    if (parsedEvent.error) {
      throw new Error(parsedEvent.error);
    }

    if (parsedEvent.content) {
      aggregatedContent += parsedEvent.content;
    }
  }

  return aggregatedContent.trim();
}

export function parseCursorSseEvent(eventText) {
  const dataLines = eventText
    .split(/\r?\n/u)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  if (dataLines.length === 0) {
    return { content: "", done: false };
  }

  const dataText = dataLines.join("\n");

  if (dataText === "[DONE]") {
    return { content: "", done: true };
  }

  try {
    const payload = JSON.parse(dataText);
    const eventType = typeof payload.type === "string" ? payload.type : "";

    if (eventType === "finish") {
      return {
        content: "",
        done: true,
        error: getErrorMessageFromPayload(payload),
      };
    }

    if (eventType === "text-delta") {
      return {
        content: typeof payload.delta === "string" ? payload.delta : "",
        error: getErrorMessageFromPayload(payload),
        done: false,
      };
    }

    return {
      content: "",
      error: getErrorMessageFromPayload(payload),
      done: false,
    };
  } catch {
    return { content: "", done: false };
  }
}

export function extractSummaryContentFromPayload(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => extractSummaryContentFromPayload(item)).join("");
  }

  if (typeof payload !== "object") {
    return "";
  }

  const directTextKeys = [
    "text",
    "delta",
    "content",
    "completion",
    "response",
    "output_text",
  ];

  for (const key of directTextKeys) {
    if (typeof payload[key] === "string") {
      return payload[key];
    }
  }

  const nestedKeys = [
    "message",
    "data",
    "chunk",
    "result",
    "delta",
    "content",
    "parts",
    "choices",
    "messages",
  ];

  for (const key of nestedKeys) {
    if (key in payload) {
      const extracted = extractSummaryContentFromPayload(payload[key]);

      if (extracted) {
        return extracted;
      }
    }
  }

  return "";
}

export function getErrorMessageFromPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (
    payload.error &&
    typeof payload.error === "object" &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  if (typeof payload.message === "string" && payload.type === "error") {
    return payload.message;
  }

  return "";
}
