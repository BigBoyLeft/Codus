const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");

const IS_WATCH = process.argv.includes("--watch");
const BUILD_DB = process.argv.includes("--db");
const FILTER = process.argv.find((arg) => arg.startsWith("--filter="));

console.log(`Building ${FILTER ? FILTER.replace("--filter=", "") : "all"} bundles`);

(async () => {
  if (BUILD_DB) {
    await buildDB();
  }

  let resources = [];
  if (FILTER) {
    resources = FILTER.replace("--filter=", "").split(",");
  } else {
    resources = fs.readdirSync(path.join(__dirname, "resources", "[Framework]"));
  }

  for (const resource of resources) {
    await buildResource(resource);
  }
})();

async function buildResource(resource) {
  return new Promise((resolve, reject) => {
    const resourcePath = path.join(__dirname, "resources", "[Framework]", resource);

    if (!fs.existsSync(resourcePath)) reject(console.error(`[Compiler] Resource ${resource} does not exist`));

    exec(`cd ${resourcePath} && pnpm run ${IS_WATCH ? "watch" : "build"}`, (err, stdout, stderr) => {
      if (err) return reject(err);

      console.log(stdout);
      console.error(stderr);

      resolve();
    });
  });
}

async function buildDB() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, "resources", "[Framework]", "framework");

    if (!fs.existsSync(dbPath)) reject(console.error(`[Compiler] Main Framework resources does not exists at path ${dbPath}`));

    exec(`cd ${dbPath} && pnpm run db:generate && pnpm run db:push`, (err, stdout, stderr) => {
      if (err) return reject(err);

      console.log(stdout);
      console.error(stderr);

      resolve();
    });
  });
}
