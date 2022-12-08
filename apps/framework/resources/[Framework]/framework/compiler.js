const esbuild = require("esbuild");
const { filelocPlugin } = require("esbuild-plugin-fileloc");
const fs = require("fs");

const IS_WATCH = process.argv.includes("--watch");

const TARGET_ENTRIES = [
  {
    target: "node16",
    format: "cjs",
    entryPoints: ["./src/server/server.ts"],
    platform: "node",
    outfile: "./dist/server/server.js",
    plugins: [filelocPlugin()],
  },
  {
    target: "es2020",
    format: "iife",
    entryPoints: ["./src/client/client.ts"],
    outfile: "./dist/client/client.js",
  },
];

const buildBundle = async () => {
  if (fs.existsSync("./dist")) fs.rmSync("./dist", { recursive: true });

  try {
    const baseOptions = {
      logLevel: "info",
      minify: false,
      minifyWhitespace: false,
      bundle: true,
      charset: "utf8",
      absWorkingDir: process.cwd(),
    };

    for (const targetOpts of TARGET_ENTRIES) {
      const mergedOpts = { ...baseOptions, ...targetOpts };

      if (IS_WATCH) {
        mergedOpts.watch = {
          onRebuild(error) {
            if (error) console.error(`[ESBuild Watch] (${targetOpts.entryPoints[0]}) Failed to rebuild bundle`);
            else console.log(`[ESBuild Watch] (${targetOpts.entryPoints[0]}) Sucessfully rebuilt bundle`);
          },
        };
      }

      const { errors } = await esbuild.build(mergedOpts);

      if (errors.length) {
        console.error(`[ESBuild] Bundle failed with ${errors.length} errors`);
        process.exit(1);
      }
    }
  } catch (e) {
    console.log("[ESBuild] Build failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));
