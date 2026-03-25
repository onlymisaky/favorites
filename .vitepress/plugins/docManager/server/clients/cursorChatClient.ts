import type { DocSummaryModel } from "../../shared";
import {
  extractSummaryContentFromPayload,
  getErrorMessageFromPayload,
} from "../utils/parsing";
import { normalizeGeneratedMarkdown } from "../utils/document";

type CursorChatRequest = {
  model: DocSummaryModel;
  relativePath: string;
  prompt: string;
  emptyContentError: string;
  failureMessage: string;
};

type ParsedSseEvent = {
  content: string;
  done: boolean;
  error?: string;
};

export async function callCursorChat(options: CursorChatRequest) {
  const response = await requestCursorChat(options);
  const contentType = response.headers.get("content-type") ?? "";

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

export async function streamCursorChat(
  options: CursorChatRequest,
  onDelta: (delta: string) => void,
) {
  const response = await requestCursorChat(options);
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/event-stream")) {
    const streamedContent = await readCursorChatSse(response, onDelta);

    if (!streamedContent) {
      throw new Error(options.emptyContentError);
    }

    return streamedContent;
  }

  const content = await readCursorChatJson(response);

  if (!content) {
    throw new Error(options.failureMessage);
  }

  onDelta(content);
  return content;
}

async function requestCursorChat(options: CursorChatRequest) {
  const response = await fetch("https://cursor.com/api/chat", {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      priority: "u=1, i",
      "sec-ch-ua":
        '"Chromium";v="146", "Not-A.Brand";v="24", "Microsoft Edge";v="146"',
      "sec-ch-ua-arch": '"arm"',
      "sec-ch-ua-bitness": '"64"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"14.6.1"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      cookie:
        "IndrX2ZuSmZramJSX0NIYUZoRzRzUGZ0cENIVHpHNXk0VE0ya2ZiUkVzQU14X2Fub255bW91c1VzZXJJZCI%3D=ImI5M2IyNzg1LWJiZmMtNGE5My04YzRkLWQ4NWNiYWRlNTFiOCI=; ph_phc_TXdpocbGVeZVm5VJmAsHTMrCofBQu3e0kN8HGMNGTVW_posthog=%7B%22distinct_id%22%3A%220191db79-dfc5-7771-b6a9-b654777830b3%22%2C%22%24sesid%22%3A%5B1760085676769%2C%220199cd48-12b5-7195-80f4-c36dccf66529%22%2C1760085676725%5D%7D; htjs_anonymous_id=5c714ccd-db77-44a1-97f5-38e48cc308e3; htjs_sesh={%22id%22:1760085677619%2C%22expiresAt%22:1760087477619%2C%22timeout%22:1800000%2C%22sessionStart%22:true%2C%22autoTrack%22:true}; muxData==undefined&mux_viewer_id=f95b568f-6404-411d-9a29-03b857d1929c&msn=0.6395640329292229&sid=ef2c9898-67b4-4658-a768-953c57d1929f&sst=1762409943711&sex=1762411449706; __stripe_mid=7995652d-210b-4858-b920-c41dc0ed33c3b1aa55; cursor_anonymous_id=92c6cb8f-7129-4207-92f4-2639d925d8c0; logoCountry=US; generaltranslation.referrer-locale=en-US; statsig_stable_id=40d8bf9c-e206-49dc-8a3e-1e2df7ae89af; generaltranslation.locale-routing-enabled=true",
      Referer: "https://cursor.com/help",
    },
    body: JSON.stringify({
      context: [
        {
          type: "file",
          content: "",
          filePath: `/${options.relativePath.replace(/\.md$/, "")}`,
        },
        {
          type: "help_origin",
          content: "true",
        },
      ],
      model: options.model,
      id: createSummaryRequestId(),
      messages: [
        {
          parts: [
            {
              type: "text",
              text: options.prompt,
            },
          ],
          id: createSummaryRequestId(),
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

  return response;
}

async function readCursorChatJson(response: Response) {
  const data = await response.json().catch(() => null);
  const content = extractSummaryContentFromPayload(data);

  if (!content) {
    throw new Error(getErrorMessageFromPayload(data) || "Cursor chat failed.");
  }

  return content;
}

async function readCursorChatSse(
  response: Response,
  onDelta?: (delta: string) => void,
) {
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
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";

    for (const eventText of events) {
      const parsedEvent = parseCursorSseEvent(eventText);

      if (parsedEvent.done) {
        return normalizeGeneratedMarkdown(aggregatedContent);
      }

      if (parsedEvent.error) {
        throw new Error(parsedEvent.error);
      }

      if (parsedEvent.content) {
        aggregatedContent += parsedEvent.content;
        onDelta?.(parsedEvent.content);
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
      onDelta?.(parsedEvent.content);
    }
  }

  return normalizeGeneratedMarkdown(aggregatedContent);
}

function parseCursorSseEvent(eventText: string): ParsedSseEvent {
  const dataLines = eventText
    .split(/\r?\n/)
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
    const payload = JSON.parse(dataText) as Record<string, unknown>;
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

    if (
      eventType === "start" ||
      eventType === "start-step" ||
      eventType === "text-start" ||
      eventType === "text-end" ||
      eventType === "finish-step"
    ) {
      return {
        content: "",
        error: getErrorMessageFromPayload(payload),
        done: false,
      };
    }

    return {
      content: extractSummaryContentFromPayload(payload),
      error: getErrorMessageFromPayload(payload),
      done: payload.done === true,
    };
  } catch {
    return {
      content: dataText,
      done: false,
    };
  }
}

function createSummaryRequestId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
