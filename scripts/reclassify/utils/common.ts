export function parseBoolean(value: string): boolean {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`布尔参数仅支持 true 或 false，收到: ${value}`)
}

export function parseNonNegativeInteger(value: string, key: string): number {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} 参数无效: ${value}`)
  }

  return parsed
}

export function parsePositiveInteger(value: string, key: string): number {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} 参数无效: ${value}`)
  }

  return parsed
}

export function sanitizeCategoryName(name: unknown): string {
  if (typeof name !== 'string') {
    return ''
  }

  const normalized = name.trim()

  if (!normalized || normalized === '.' || normalized === '..') {
    return ''
  }

  if (/[\\/]/u.test(normalized)) {
    return ''
  }

  if (/[:*?"<>|]/u.test(normalized)) {
    return ''
  }

  return normalized
}

export function normalizeConfidence(input: unknown): number | null {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    return null
  }

  if (input < 0) {
    return 0
  }

  if (input > 1) {
    return 1
  }

  return Number(input.toFixed(2))
}

export function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}
