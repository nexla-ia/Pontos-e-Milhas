import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const extensions = new Set(['.ts', '.tsx']);

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    try {
      return await defaultResolve(specifier, context, defaultResolve);
    } catch (error) {
      const candidates = new Set([
        specifier,
        specifier.endsWith('.js') ? `${specifier.slice(0, -3)}.ts` : `${specifier}.ts`,
        `${specifier}.tsx`,
      ]);

      for (const candidate of candidates) {
        try {
          return await defaultResolve(candidate, context, defaultResolve);
        } catch (err) {
          // try next candidate
        }
      }

      throw error;
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (!extensions.has(getExtension(url))) {
    return defaultLoad(url, context, defaultLoad);
  }

  const source = await readFile(fileURLToPath(url), 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: fileURLToPath(url),
  });

  return {
    format: 'module',
    source: transpiled.outputText,
    shortCircuit: true,
  };
}

function getExtension(url) {
  const { pathname } = new URL(url);
  const match = pathname.match(/\.[^.]+$/);
  return match ? match[0] : '';
}
