import { chromium } from "playwright-core";

const SHOTS = process.env.SHOT_DIR ?? ".";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });

// list view
const count = await page.locator(".weapon-card").count();
console.log("weapon cards:", count);
await page.screenshot({ path: `${SHOTS}/01-list.png` });

// filter: search
await page.fill(".search", "transmission");
const filtered = await page.locator(".weapon-card").count();
console.log("after search 'transmission':", filtered);

// open detail
await page.click(".weapon-card");
await page.waitForSelector(".weapon-detail");
console.log("detail title:", await page.textContent(".detail-header h1"));

// base range value
const rangeRow = page.locator(".stat-row", { hasText: "Range" }).first();
console.log("base range:", await rangeRow.locator(".stat-value").textContent());

// select Full Bore (+15 range)
await page.click('.perk-btn:has-text("Full Bore")');
console.log("range after Full Bore:", (await rangeRow.locator(".stat-value").textContent()).trim());

// masterwork range
await page.selectOption(".masterwork-row select", { label: "Range +10" });
console.log("range after MW:", (await rangeRow.locator(".stat-value").textContent()).trim());

// TTK table
const ttkRows = await page.locator(".ttk-table tbody tr").count();
console.log("ttk rows:", ttkRows);
console.log("base row:", (await page.locator(".ttk-table tr.highlight").textContent()).replace(/\s+/g, " "));

await page.screenshot({ path: `${SHOTS}/02-detail.png`, fullPage: true });

// conditional perk toggle
await page.click('.perk-btn:has-text("Keep Away")');
await page.check(".conditional-toggle input");
console.log("range with Keep Away conditional:", (await rangeRow.locator(".stat-value").textContent()).trim());

// back to list, exercise filters
await page.click(".back-link");
await page.selectOption(".filter-bar select >> nth=1", { label: "Submachine Gun" });
console.log("SMGs:", await page.locator(".weapon-card").count());

console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();
