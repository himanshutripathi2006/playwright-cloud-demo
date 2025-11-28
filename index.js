const express = require("express");
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SCREENSHOT_DIR = "/data/screenshots";

// Ensure screenshot directory exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

app.get("/", (req, res) => {
  res.send("Playwright Cloud Testing Running Successfully");
});

app.get("/run-test", async (req, res) => {
  const website = req.query.url || "https://example.com";
  const filename = `screenshot-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);

  try {
    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(website, { waitUntil: "networkidle" });
    await page.screenshot({ path: filepath, fullPage: true });
    await browser.close();

    res.json({
      ok: true,
      message: "Screenshot captured successfully",
      file: `/screenshots/${filename}`
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve screenshots from disk
app.use("/screenshots", express.static(SCREENSHOT_DIR));

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
