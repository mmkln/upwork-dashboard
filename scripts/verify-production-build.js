const fs = require("fs");
const path = require("path");

const EXPECTED_API_URL = "https://mxllapi.pythonanywhere.com/api";
const LOCAL_API_PATTERN = /https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/api/i;
const buildDirectory = path.resolve(__dirname, "..", "build", "static", "js");

if (!fs.existsSync(buildDirectory)) {
  throw new Error(`Production build directory not found: ${buildDirectory}`);
}

const mainBundles = fs
  .readdirSync(buildDirectory)
  .filter((fileName) => /^main\.[^.]+\.js$/.test(fileName));

if (mainBundles.length !== 1) {
  throw new Error(
    `Expected one production main bundle, found ${mainBundles.length}.`,
  );
}

const bundlePath = path.join(buildDirectory, mainBundles[0]);
const bundle = fs.readFileSync(bundlePath, "utf8");
const localApiUrl = bundle.match(LOCAL_API_PATTERN)?.[0];

if (localApiUrl) {
  throw new Error(`Refusing to deploy a bundle with local API URL: ${localApiUrl}`);
}

if (!bundle.includes(EXPECTED_API_URL)) {
  throw new Error(
    `Expected production API URL is missing from the bundle: ${EXPECTED_API_URL}`,
  );
}

console.log(`Verified production API URL: ${EXPECTED_API_URL}`);
