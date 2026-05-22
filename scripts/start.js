const { spawn } = require("child_process");

const API_URLS = {
  local: "http://127.0.0.1:8000/api",
  remote: "https://mxllapi.pythonanywhere.com/api",
};

const aliases = {
  "--local": "local",
  "-l": "local",
  "--remote": "remote",
  "-r": "remote",
};

const requestedTarget = process.argv[2] || "remote";
const target = aliases[requestedTarget] || requestedTarget;

if (target === "--help" || target === "-h") {
  console.log("Usage: npm start -- [local|remote]");
  console.log("       npm start defaults to remote");
  console.log("       npm run start:local");
  console.log("       npm run start:remote");
  process.exit(0);
}

if (!API_URLS[target]) {
  console.error(`Unknown backend target "${requestedTarget}". Use "local" or "remote".`);
  process.exit(1);
}

const apiUrl = process.env.REACT_APP_API_URL || API_URLS[target];
const reactScriptsStart = require.resolve("react-scripts/scripts/start");

console.log(`Starting app with ${target} backend: ${apiUrl}`);

const child = spawn(process.execPath, [reactScriptsStart], {
  env: {
    ...process.env,
    REACT_APP_API_URL: apiUrl,
  },
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
