import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4173;
const DIST = join(__dirname, "dist");

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/assets", express.static(join(DIST, "assets"), { maxAge: "1y", immutable: true }));
app.use(express.static(DIST, { maxAge: "1h" }));

app.get("*", (_req, res) => {
  const index = join(DIST, "index.html");
  if (existsSync(index)) res.sendFile(index);
  else res.status(503).send("Build not found.");
});

createServer(app).listen(PORT, () => console.log(`InkReal server running on port ${PORT}`));
