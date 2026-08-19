import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished portfolio with its stylesheet", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>RAINA 周小雨 — AI Product Manager<\/title>/i);
  assert.match(
    html,
    /<link(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']\/_next\/static\/css\/[^"']+\.css["'])[^>]*>/i,
  );
  assert.match(html, /Five visual stories/);
  assert.match(html, /从小岛毕业/);
  assert.match(html, /\/images\/graduation-cover-v3\.jpg/);
  assert.match(html, /Portfolio<br\/>过往设计作品集/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("ships the portfolio design rules in the production CSS bundle", async () => {
  const cssRoot = new URL("../dist/client/_next/static/css/", import.meta.url);
  const files = (await readdir(cssRoot)).filter((file) => file.endsWith(".css"));
  assert.ok(files.length > 0, "expected at least one production CSS bundle");

  const css = await readFile(new URL(files[0], cssRoot), "utf8");
  assert.match(css, /\.site-header\{/);
  assert.match(css, /\.hero\{/);
  assert.match(css, /\.project-grid\{/);
  assert.match(css, /\.book-reader\{/);
  assert.match(css, /--paper:#f0eee8/);
});
