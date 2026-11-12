import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nativeJsPath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    content = content.replace(
      'const nativeModule = requireWithFriendlyError(',
      `let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError(`
    );
    content = content.replace(
      ');\n\nconst { parse,',
      `);\n} catch (err) {\n\ttry {\n\t\tnativeModule = require('@rollup/wasm-node/dist/native.js');\n\t} catch (wasmErr) {\n\t\tthrow err;\n\t}\n}\n\nconst { parse,`
    );
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('[patch-rollup] Patched rollup to support wasm fallback on Windows App Control environments.');
  }
}
