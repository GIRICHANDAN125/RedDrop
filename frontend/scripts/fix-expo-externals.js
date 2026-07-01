const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

function patchExpoExternals(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[postinstall] Expo externals file not found: ${filePath}`);
    return;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  const target = "        const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId);";
  const replacement = [
    "        const safeModuleId = moduleId.replace(/^node:/, \"\");",
    "        const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, safeModuleId);",
  ].join('\n');

  if (!original.includes(target)) {
    if (original.includes('safeModuleId = moduleId.replace(/^node:/, "");')) {
      console.log('[postinstall] Expo externals patch already present.');
      return;
    }
    console.warn('[postinstall] Expo externals target line not found; no changes made.');
    return;
  }

  const updated = original.replace(target, replacement).replace(
    "            await _fs.default.promises.writeFile(shimPath, tapNodeShimContents(moduleId));",
    "            await _fs.default.promises.writeFile(shimPath, tapNodeShimContents(safeModuleId));"
  );

  if (updated === original) {
    console.log('[postinstall] Expo externals already patched.');
    return;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('[postinstall] Patched Expo CLI externals for Windows-safe node: shims.');
}

patchExpoExternals(targetFile);
