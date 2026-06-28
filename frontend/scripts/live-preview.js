const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const clients = new Set();

let buildRunning = false;
let buildQueued = false;
let debounceTimer = null;

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const liveReloadClient = `
(() => {
  if (window.__artiqalLivePreview) return;
  window.__artiqalLivePreview = true;
  document.documentElement.dataset.livePreview = "true";

  const connect = () => {
    const events = new EventSource("/__live-reload");
    events.addEventListener("reload", () => window.location.reload());
    events.onerror = () => {
      events.close();
      window.setTimeout(connect, 1200);
    };
  };

  connect();
})();
`;

function notifyReload() {
  for (const response of clients) {
    response.write("event: reload\n");
    response.write("data: reload\n\n");
  }
  console.log(`[preview] Reloaded ${clients.size} browser tab${clients.size === 1 ? "" : "s"}.`);
}

function injectLiveReload(html) {
  const scriptTag = '<script src="/__live-reload-client.js"></script>';
  if (html.includes(scriptTag)) return html;
  return html.includes("</body>")
    ? html.replace("</body>", `  ${scriptTag}\n</body>`)
    : `${html}\n${scriptTag}\n`;
}

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    };

    if (extension === ".html") {
      headers["Cache-Control"] = "no-store";
      data = Buffer.from(injectLiveReload(data.toString("utf8")));
    }

    response.writeHead(200, headers);
    response.end(data);
  });
}

function handleRequest(request, response) {
  let pathname = "/";
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  } catch {
    pathname = "/";
  }

  if (pathname === "/__live-reload-client.js") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/javascript; charset=utf-8",
    });
    response.end(liveReloadClient);
    return;
  }

  if (pathname === "/__live-reload") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
    });
    response.write(": connected\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  let filePath = path.join(buildDir, pathname);
  if (!filePath.startsWith(buildDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      const hasExtension = Boolean(path.extname(filePath));
      sendFile(response, hasExtension ? filePath : path.join(buildDir, "index.html"));
      return;
    }

    if (!error && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    sendFile(response, filePath);
  });
}

function runBuild(reason) {
  if (buildRunning) {
    buildQueued = true;
    return;
  }

  buildRunning = true;
  buildQueued = false;
  console.log(`[preview] Rebuilding after ${reason}...`);

  const nodeDir = path.dirname(process.execPath);
  const buildProcess = spawn(
    process.execPath,
    [path.join(rootDir, "node_modules", "@craco", "craco", "dist", "bin", "craco.js"), "build"],
    {
      cwd: rootDir,
      env: {
        ...process.env,
        BROWSER: "none",
        CI: "false",
        PATH: `${nodeDir}${path.delimiter}${process.env.PATH || ""}`,
      },
      stdio: "inherit",
    },
  );

  buildProcess.on("close", (code) => {
    buildRunning = false;
    if (code === 0) {
      notifyReload();
    } else {
      console.log(`[preview] Build failed with exit code ${code}. Keeping the current preview.`);
    }

    if (buildQueued) {
      runBuild("queued changes");
    }
  });
}

function scheduleBuild(reason) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runBuild(reason), 700);
}

function watchTarget(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return;

  const isDirectory = fs.statSync(absolutePath).isDirectory();
  fs.watch(absolutePath, { recursive: isDirectory }, (_eventType, filename) => {
    if (!filename) return;
    if (String(filename).includes(`${path.sep}build${path.sep}`)) return;
    scheduleBuild(`${relativePath}/${filename}`);
  });
}

http.createServer(handleRequest).listen(port, host, () => {
  console.log(`[preview] Live preview ready at http://${host}:${port}`);
  console.log("[preview] Watching for source changes. Keep your browser tab on this URL for auto-refresh.");
});

[
  "src",
  "public",
  "craco.config.js",
  "package.json",
  "postcss.config.js",
  "tailwind.config.js",
].forEach(watchTarget);
