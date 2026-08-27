/**
 * Monorepo Metro config (PROJECT_SPEC §6): let the app resolve @kh/* workspace
 * packages and watch the whole repo so edits to packages/ hot-reload.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// tsconfigPaths is on by default in recent SDKs; set defensively when present.
if (config.experiments) {
  config.experiments.tsconfigPaths = true;
}

module.exports = config;
