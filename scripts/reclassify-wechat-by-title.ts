import { main } from './reclassify/index.ts'

main().catch((error) => {
  console.error(error instanceof Error ? error.message : '脚本执行失败。')
  process.exitCode = 1
})
