import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT && process.env.PORT !== "8080" ? parseInt(process.env.PORT, 10) : 3e3;
const DIST_DIR = path.resolve(__dirname, "dist");
app.use(express.static(DIST_DIR, {
  maxAge: "1d",
  etag: true
}));
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mega Bazar production server running on http://0.0.0.0:${PORT}`);
});

export default app;
