import * as compiler from "@vue/compiler-sfc";
import path from "node:path";

export const compilerProxy = new Proxy(compiler, {
  get(target, prop, receiver) {
    const originalMethod = Reflect.get(target, prop, receiver);

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args: any[]) {
      if (prop === "compileTemplate") {
        try {
          return originalMethod.apply(this, args);
        } catch (error) {
          const [options] = args;

          if (!options || typeof options.filename !== "string") {
            throw error;
          }

          return originalMethod.apply(this, [
            {
              ...options,
              source: createFallbackTemplate(path.basename(options.filename)),
              ast: undefined,
            },
          ]);
        }
      }

      const result = originalMethod.apply(this, args);

      if (prop !== "parse" || !result.errors || result.errors.length === 0) {
        return result;
      }

      const [content, ...otherArgs] = args;
      const allScriptTagsRegex = /<script\s*>.*?<\/script>/gs;
      const scriptTags = content.match(allScriptTagsRegex);

      return originalMethod.apply(this, [
        `${scriptTags?.[0] ?? ""}\n<template>${createFallbackTemplate(
          args[1].filename,
        )}</template>`,
        ...otherArgs,
      ]);
    };
  },
});

function createFallbackTemplate(filename: string) {
  return `<div>${path.basename(filename)}</div>`;
}
