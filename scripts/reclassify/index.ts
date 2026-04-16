import path from 'node:path'
import { runApply } from './apply.ts'
import { parseArgs, validateArgs } from './cli.ts'
import { DOCS_ROOT_NAME } from './config.ts'
import { runPreview } from './preview.ts'

export async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const rootDir = process.cwd()
  const docsRoot = path.resolve(rootDir, DOCS_ROOT_NAME)
  const resultFilePath = path.resolve(rootDir, args.resultFile)

  validateArgs(args)

  if (args.mode === 'preview') {
    await runPreview({ docsRoot, resultFilePath, args })
    return
  }

  await runApply({ docsRoot, resultFilePath, args })
}
