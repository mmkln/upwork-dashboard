const { spawn } = require("child_process");

const ROUTING_MODE_BY_TARGET = {
  browser: "browser",
  "github-pages": "hash",
};

const target = process.argv[2] || "browser";
const routingMode = ROUTING_MODE_BY_TARGET[target];

if (!routingMode) {
  console.error(`Unknown build target "${target}". Use "browser" or "github-pages".`);
  process.exit(1);
}

const reactScriptsBuild = require.resolve("react-scripts/scripts/build");

console.log(`Building ${target} with ${routingMode} routing`);

const child = spawn(process.execPath, [reactScriptsBuild], {
  env: {
    ...process.env,
    REACT_APP_ROUTING_MODE: routingMode,
    REACT_APP_BASE_PATH: "/upwork-dashboard",
  },
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
