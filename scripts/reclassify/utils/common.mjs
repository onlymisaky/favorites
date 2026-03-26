export function parseBoolean(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`布尔参数仅支持 true 或 false，收到: ${value}`);
}

export function parseNonNegativeInteger(value, key) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} 参数无效: ${value}`);
  }

  return parsed;
}

export function parsePositiveInteger(value, key) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} 参数无效: ${value}`);
  }

  return parsed;
}

export function extractJsonObject(content) {
  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/u);

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return "";
  }

  return content.slice(startIndex, endIndex + 1).trim();
}

export function sanitizeCategoryName(name) {
  if (typeof name !== "string") {
    return "";
  }

  const normalized = name.trim();

  if (!normalized || normalized === "." || normalized === "..") {
    return "";
  }

  if (/[\\/]/u.test(normalized)) {
    return "";
  }

  if (/[:*?"<>|]/u.test(normalized)) {
    return "";
  }

  return normalized;
}

export function normalizeConfidence(input) {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    return null;
  }

  if (input < 0) {
    return 0;
  }

  if (input > 1) {
    return 1;
  }

  return Number(input.toFixed(2));
}

export function chunkItems(items, chunkSize) {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

export function createRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
