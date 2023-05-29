// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

const buildPath = process.env.BUILD_PATH || 'build';

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
const paths = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath,
};

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
if (__dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1) {
  const templatePath = '../cra-template/template';
  paths.ownPath = resolveOwn('.');
  paths.ownNodeModules = resolveOwn('node_modules'); // This is empty on npm 3
  paths.appTypeDeclarations = resolveApp('src/react-app-env.d.ts');
  paths.ownTypeDeclarations = resolveOwn('lib/react-app.d.ts');

  if (!fs.existsSync(resolveOwn('node_modules'))) {
    // If the user hasn't run `npm install` yet, we assume the default template.
    paths.appBuild = resolveApp(buildPath);
    paths.appPublic = resolveOwn(`${templatePath}/public`);
    paths.appHtml = resolveOwn(`${templatePath}/public/index.html`);
    paths.appIndexJs = resolveModule(resolveOwn, `${templatePath}/src/index`);
    paths.appSrc = resolveOwn(`${templatePath}/src`);
    paths.appTsConfig = resolveOwn(`${templatePath}/tsconfig.json`);
    paths.appJsConfig = resolveOwn(`${templatePath}/jsconfig.json`);
    paths.yarnLockFile = resolveOwn(`${templatePath}/yarn.lock`);
    paths.testsSetup = resolveModule(resolveOwn, `${templatePath}/src/setupTests`);
    paths.proxySetup = resolveOwn(`${templatePath}/src/setupProxy.js`);
    paths.appNodeModules = resolveOwn('node_modules');
    paths.appWebpackCache = resolveOwn('node_modules/.cache');
    paths.appTsBuildInfoFile = resolveOwn('node_modules/.cache/tsconfig.tsbuildinfo');
    paths.swSrc = resolveModule(resolveOwn, `${templatePath}/src/service-worker`);
    paths.publicUrlOrPath = publicUrlOrPath;
  }
}
// @remove-on-eject-end

module.exports = paths;
module.exports.moduleFileExtensions = moduleFileExtensions;