export function validateDirectoryName(name: string) {
  if (!name) {
    return '分类名称不能为空。'
  }

  if (name === '.' || name === '..') {
    return '分类名称不合法。'
  }

  if (/[\\/]/.test(name)) {
    return '仅支持顶层分类。'
  }

  if (/[:*?"<>|]/.test(name)) {
    return '分类名称包含不支持的字符。'
  }

  return null
}
