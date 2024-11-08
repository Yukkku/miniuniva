import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.0/mod.js";

const ctx = await esbuild.context({
  plugins: [...denoPlugins()],
  outfile: new URL("./dist/main.min.js", import.meta.url).pathname,
  entryPoints: [new URL("./main.ts", import.meta.url).pathname],
  bundle: true,
  minify: true,
  format: "esm",
});

ctx.serve({
  servedir: new URL("./dist", import.meta.url).pathname,
  port: 8000,
});
