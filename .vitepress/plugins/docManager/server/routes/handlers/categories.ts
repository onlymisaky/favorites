import fs from "node:fs/promises";
import { sendJson } from "../../utils/http";
import type { RouteHandler } from "../shared";

export const handleCategoriesRequest: RouteHandler = async ({
  docsRoot,
  res,
}) => {
  const entries = await fs.readdir(docsRoot, { withFileTypes: true });
  const categories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

  sendJson(res, 200, { success: true, categories });
};
