// build.mjs
import * as esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

await esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "build/js/main.js",
    plugins: [
      copy({
        assets: [
          {
            from: ["./src/index.html"],
            to: ["../"],
          },
          {
            from: ["./src/styles.css"],
            to: ["../css/styles.css"],
          },
          {
            from: ["./src/favicon.svg"],
            to: ["../images/favicon.svg"],
          },
        ],
      }),
    ],
  })
  .catch(() => process.exit(1));
