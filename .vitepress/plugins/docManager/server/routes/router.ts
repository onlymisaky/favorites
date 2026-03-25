import type { IncomingMessage, ServerResponse } from "node:http";
import { DOC_MANAGER_BASE } from "../../shared";
import { stripBasePath } from "../utils/document";
import { sendJson } from "../utils/http";
import { handleCategoriesRequest } from "./handlers/categories";
import {
  handleDeleteRequest,
  handleMoveRequest,
} from "./handlers/documentMutations";
import {
  handleSummaryApplyRequest,
  handleSummaryPreviewRequest,
} from "./handlers/summary";
import type { RouteDefinition, RouteHandler } from "./shared";

type DocManagerRequestHandler = (options: {
  req: IncomingMessage;
  res: ServerResponse;
  next: () => void;
}) => Promise<void>;

type RouteMap = Map<string, RouteHandler>;

const ROUTES: RouteDefinition[] = [
  {
    method: "GET",
    path: `${DOC_MANAGER_BASE}/categories`,
    handler: handleCategoriesRequest,
  },
  {
    method: "POST",
    path: `${DOC_MANAGER_BASE}/delete`,
    handler: handleDeleteRequest,
  },
  {
    method: "POST",
    path: `${DOC_MANAGER_BASE}/move`,
    handler: handleMoveRequest,
  },
  {
    method: "POST",
    path: `${DOC_MANAGER_BASE}/summarize/preview`,
    handler: handleSummaryPreviewRequest,
  },
  {
    method: "POST",
    path: `${DOC_MANAGER_BASE}/summarize/apply`,
    handler: handleSummaryApplyRequest,
  },
];
const ROUTE_MAP = createRouteMap(ROUTES);

export function createDocManagerRequestHandler(options: {
  docsRoot: string;
  siteBase: string;
}): DocManagerRequestHandler {
  return async ({ req, res, next }) => {
    const requestUrl = req.url ? new URL(req.url, "http://localhost") : null;
    const pathname = requestUrl
      ? stripBasePath(requestUrl.pathname, options.siteBase)
      : null;

    if (!pathname || !pathname.startsWith(DOC_MANAGER_BASE)) {
      next();
      return;
    }

    const route = ROUTE_MAP.get(createRouteKey(req.method ?? "GET", pathname));

    if (!route) {
      sendJson(res, 404, { success: false, error: "Unknown endpoint." });
      return;
    }

    try {
      await route({
        req,
        res,
        docsRoot: options.docsRoot,
      });
    } catch (error) {
      if (!res.writableEnded) {
        sendJson(res, 500, {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Doc manager request failed.",
        });
      }
    }
  };
}

function createRouteMap(routes: RouteDefinition[]): RouteMap {
  return new Map(
    routes.map((route) => [
      createRouteKey(route.method, route.path),
      route.handler,
    ]),
  );
}

function createRouteKey(method: string, path: string) {
  return `${method.toUpperCase()} ${path}`;
}
