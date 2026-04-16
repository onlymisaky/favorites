import type { SummaryReviewDetails } from '../../shared'

export function readStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      )
    : []
}

export function parseSummaryReviewDetails(
  input: unknown,
): SummaryReviewDetails | undefined {
  if (!input || typeof input !== 'object') {
    return undefined
  }

  const record = input as Record<string, unknown>

  return {
    missingSections: readStringList(record.missingSections),
    missingLinks: readStringList(record.missingLinks),
    missingImages: readStringList(record.missingImages),
    missingConcepts: readStringList(record.missingConcepts),
    missingConstraints: readStringList(record.missingConstraints),
  }
}
