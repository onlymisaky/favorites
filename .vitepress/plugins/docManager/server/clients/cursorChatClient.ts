import type { DocSummaryModel } from '../../shared'
import { normalizeGeneratedMarkdown } from '../utils/document'
import {
  extractSummaryContentFromPayload,
  getErrorMessageFromPayload,
} from '../utils/parsing'

interface CursorChatRequest {
  model: DocSummaryModel
  relativePath: string
  systemPrompt: string
  userPrompt: string
  emptyContentError: string
  failureMessage: string
}

interface ParsedSseEvent {
  content: string
  done: boolean
  error?: string
}

export async function callCursorChat(options: CursorChatRequest) {
  const response = await requestCursorChat(options)
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('text/event-stream')) {
    const streamedContent = await readCursorChatSse(response)

    if (!streamedContent) {
      throw new Error(options.emptyContentError)
    }

    return streamedContent
  }

  const content = await readCursorChatJson(response)

  if (!content) {
    throw new Error(options.failureMessage)
  }

  return content
}

export async function streamCursorChat(
  options: CursorChatRequest,
  onDelta: (delta: string) => void,
) {
  const response = await requestCursorChat(options)
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('text/event-stream')) {
    const streamedContent = await readCursorChatSse(response, onDelta)

    if (!streamedContent) {
      throw new Error(options.emptyContentError)
    }

    return streamedContent
  }

  const content = await readCursorChatJson(response)

  if (!content) {
    throw new Error(options.failureMessage)
  }

  onDelta(content)
  return content
}

async function requestCursorChat(options: CursorChatRequest) {
  const response = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      context: [
        {
          type: 'file',
          content: '',
          filePath: `/${options.relativePath.replace(/\.md$/, '')}`,
        },
        {
          type: 'help_origin',
          content: 'true',
        },
      ],
      id: createSummaryRequestId(),
      messages: [
        {
          parts: [
            {
              type: 'text',
              text: options.systemPrompt,
            },
          ],
          id: createSummaryRequestId(),
          role: 'system',
        },
        {
          parts: [
            {
              type: 'text',
              text: options.userPrompt,
            },
          ],
          id: createSummaryRequestId(),
          role: 'user',
        },
      ],
      trigger: 'submit-message',
    }),
  })

  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    const errorBody = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '')
    const errorMessage
      = typeof errorBody === 'string'
        ? errorBody
        : getErrorMessageFromPayload(errorBody)

    throw new Error(errorMessage || options.failureMessage)
  }

  return response
}

async function readCursorChatJson(response: Response) {
  const data = await response.json().catch(() => null)
  const content = extractSummaryContentFromPayload(data)

  if (!content) {
    throw new Error(getErrorMessageFromPayload(data) || 'Cursor chat failed.')
  }

  return content
}

async function readCursorChatSse(
  response: Response,
  onDelta?: (delta: string) => void,
) {
  if (!response.body) {
    return ''
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let aggregatedContent = ''

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split(/\r?\n\r?\n/)
    buffer = events.pop() ?? ''

    for (const eventText of events) {
      const parsedEvent = parseCursorSseEvent(eventText)

      if (parsedEvent.done) {
        return normalizeGeneratedMarkdown(aggregatedContent)
      }

      if (parsedEvent.error) {
        throw new Error(parsedEvent.error)
      }

      if (parsedEvent.content) {
        aggregatedContent += parsedEvent.content
        onDelta?.(parsedEvent.content)
      }
    }
  }

  if (buffer.trim()) {
    const parsedEvent = parseCursorSseEvent(buffer)

    if (parsedEvent.error) {
      throw new Error(parsedEvent.error)
    }

    if (parsedEvent.content) {
      aggregatedContent += parsedEvent.content
      onDelta?.(parsedEvent.content)
    }
  }

  return normalizeGeneratedMarkdown(aggregatedContent)
}

function parseCursorSseEvent(eventText: string): ParsedSseEvent {
  const dataLines = eventText
    .split(/\r?\n/)
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())

  if (dataLines.length === 0) {
    return { content: '', done: false }
  }

  const dataText = dataLines.join('\n')

  if (dataText === '[DONE]') {
    return { content: '', done: true }
  }

  try {
    const payload = JSON.parse(dataText) as Record<string, unknown>
    const eventType = typeof payload.type === 'string' ? payload.type : ''

    if (eventType === 'finish') {
      return {
        content: '',
        done: true,
        error: getErrorMessageFromPayload(payload),
      }
    }

    if (eventType === 'text-delta') {
      return {
        content: typeof payload.delta === 'string' ? payload.delta : '',
        error: getErrorMessageFromPayload(payload),
        done: false,
      }
    }

    if (
      eventType === 'start'
      || eventType === 'start-step'
      || eventType === 'text-start'
      || eventType === 'text-end'
      || eventType === 'finish-step'
    ) {
      return {
        content: '',
        error: getErrorMessageFromPayload(payload),
        done: false,
      }
    }

    return {
      content: extractSummaryContentFromPayload(payload),
      error: getErrorMessageFromPayload(payload),
      done: payload.done === true,
    }
  }
  catch {
    return {
      content: dataText,
      done: false,
    }
  }
}

function createSummaryRequestId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}
