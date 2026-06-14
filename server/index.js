/**
 * Chat Mapper backend — a tiny share-link fetch proxy.
 *
 * The browser can't fetch chatgpt.com / claude.ai / gemini directly (CORS), and
 * public CORS proxies are flaky and frequently blocked. This server fetches the
 * share page (or ChatGPT's share JSON) with a browser-like User-Agent and
 * returns it with permissive CORS so the frontend can parse it.
 *
 * Zero dependencies — uses Node's built-in http + global fetch (Node >= 18).
 * It is NOT an open proxy: only the allow-listed AI share hosts are permitted.
 */
import { createServer } from "node:http";

const PORT = process.env.PORT || 10000;

const ALLOWED_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "claude.ai",
  "gemini.google.com",
  "bard.google.com",
  "poe.com",
];

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/json,*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

function hostAllowed(hostname) {
  const h = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((allowed) => h === allowed || h.endsWith(`.${allowed}`));
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

function sendJson(res, status, obj) {
  setCors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, "http://localhost");

  if (reqUrl.pathname === "/" || reqUrl.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "chat-mapper-proxy" });
    return;
  }

  if (reqUrl.pathname !== "/api/fetch") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const target = reqUrl.searchParams.get("url");
  if (!target) {
    sendJson(res, 400, { error: "Missing ?url" });
    return;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    sendJson(res, 400, { error: "Invalid url" });
    return;
  }

  if (parsed.protocol !== "https:" || !hostAllowed(parsed.hostname)) {
    sendJson(res, 403, { error: "Host not allowed" });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const upstream = await fetch(parsed.toString(), {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);

    const body = await upstream.text();
    setCors(res);
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "text/plain; charset=utf-8",
    });
    res.end(body);
  } catch (err) {
    sendJson(res, 502, { error: "Upstream fetch failed", detail: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`chat-mapper proxy listening on :${PORT}`);
});
