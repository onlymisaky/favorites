import path from "node:path";
import type { Plugin } from "vite";
import type { DocManagerOptions } from "../shared/types";
import { createDocManagerRequestHandler } from "./routes";

const DEFAULT_DOCS_ROOT = "wechat";
const DEFAULT_SITE_BASE = "/favorites/";

export function createDocManagerPlugin(options: DocManagerOptions = {}) {
  const docsRoot = path.resolve(
    process.cwd(),
    options.docsRoot ?? DEFAULT_DOCS_ROOT,
  );
  const siteBase = options.siteBase ?? DEFAULT_SITE_BASE;
  const handleDocManagerRequest = createDocManagerRequestHandler({
    docsRoot,
    siteBase,
  });

  return {
    name: "favorites-doc-manager",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        await handleDocManagerRequest({ req, res, next });
      });
    },
  } satisfies Plugin;
}
