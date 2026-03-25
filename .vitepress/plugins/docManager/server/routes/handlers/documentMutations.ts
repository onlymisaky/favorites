import fs from "node:fs/promises";
import path from "node:path";
import { DOC_MANAGER_FALLBACK_PATH } from "../../../shared";
import type {
  DeleteDocumentRequest,
  MoveDocumentRequest,
  MutationResponse,
} from "../../../shared/types";
import {
  getTopLevelDirectoryName,
  toPosixPath,
} from "../../utils/document";
import { sendJson } from "../../utils/http";
import { validateDirectoryName } from "../../utils/validation";
import {
  readRequiredJsonBody,
  resolveRequiredSourcePath,
  type RouteHandler,
} from "../shared";

export const handleDeleteRequest: RouteHandler = async (context) => {
  const body = await readRequiredJsonBody<DeleteDocumentRequest>(context);

  if (!body) {
    return;
  }

  const sourcePath = await resolveRequiredSourcePath(
    context,
    body.relativePath,
  );

  if (!sourcePath) {
    return;
  }

  await fs.unlink(sourcePath);
  sendJson(context.res, 200, {
    success: true,
    redirectPath: DOC_MANAGER_FALLBACK_PATH,
  } satisfies MutationResponse);
};

export const handleMoveRequest: RouteHandler = async (context) => {
  const body = await readRequiredJsonBody<MoveDocumentRequest>(context);

  if (!body) {
    return;
  }

  const sourcePath = await resolveRequiredSourcePath(
    context,
    body.relativePath,
  );

  if (!sourcePath) {
    return;
  }

  if (typeof body.targetDirName !== "string") {
    sendJson(context.res, 400, {
      success: false,
      error: "Missing targetDirName.",
    });
    return;
  }

  const targetDirName = body.targetDirName.trim();
  const directoryError = validateDirectoryName(targetDirName);

  if (directoryError) {
    sendJson(context.res, 400, { success: false, error: directoryError });
    return;
  }

  const currentDirName = getTopLevelDirectoryName(body.relativePath);

  if (currentDirName === targetDirName) {
    sendJson(context.res, 400, {
      success: false,
      error: "Document is already in that category.",
    });
    return;
  }

  const targetDirectory = path.join(context.docsRoot, targetDirName);
  await fs.mkdir(targetDirectory, { recursive: true });
  const targetPath = path.join(targetDirectory, path.basename(sourcePath));

  try {
    await fs.access(targetPath);
    sendJson(context.res, 409, {
      success: false,
      error: "A document with the same name already exists in that category.",
    });
    return;
  } catch {
    // noop
  }

  await fs.rename(sourcePath, targetPath);

  sendJson(context.res, 200, {
    success: true,
    redirectPath: DOC_MANAGER_FALLBACK_PATH,
    targetPath: toPosixPath(path.relative(context.docsRoot, targetPath)),
  } satisfies MutationResponse);
};
