import path from "node:path";
import { runApply } from "./apply.mjs";
import { parseArgs, validateBatchSize, validateMode, validateModel } from "./cli.mjs";
import { DOCS_ROOT_NAME } from "./config.mjs";
import { runPreview } from "./preview.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const docsRoot = path.resolve(rootDir, DOCS_ROOT_NAME);
  const resultFilePath = path.resolve(rootDir, args.resultFile);

  validateMode(args.mode);
  validateModel(args.model);
  validateBatchSize(args.batchSize);

  if (args.mode === "preview") {
    await runPreview({ docsRoot, resultFilePath, args });
    return;
  }

  await runApply({ docsRoot, resultFilePath, args });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "脚本执行失败。");
  process.exitCode = 1;
});
