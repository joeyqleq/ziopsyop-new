/**
 * parse-telegram.mjs — Telegram HTML export parser for ZIOPSYOP Part III
 *
 * Parses Al-Manar, Al-Mayadeen, and Channel 14 Telegram exports.
 * Filters for Lebanon-Israel axis content and auto-categorizes events.
 *
 * Output: /data/telegram-events.json
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { parse as parseHTML } from "node-html-parser";

const ROOT = resolve(import.meta.dirname, "..");
const EXPORT_DIR = join(ROOT, "telegram_export");
const OUTPUT_FILE = join(ROOT, "data", "telegram-events.json");

// Sources config
const SOURCES = [
  { dir: "almanar", label: "almanar" },
  { dir: "almayadeen", label: "almayadeen" },
  { dir: "channel_14", label: "channel_14" },
];

// CONTEXT keywords — must have at least one to confirm Lebanon-Israel axis
const CONTEXT_KEYWORDS = [
  "lebanon", "lebanese", "israel", "israeli", "hezbollah", "hezballah",
  "hizbollah", "idf", "nasrallah", "beirut", "south lebanon", "unifil",
  "mossad", "litani", "nabatieh", "tyre", "baalbek", "dahiyeh",
  "southern suburbs", "galilee", "kiryat shmona", "metula", "hermon",
  "golani", "radwan", "iron dome", "occupation", "zionist",
];

// ACTION keywords — relevant events (need context keyword too)
const ACTION_KEYWORDS = [
  "ceasefire", "invasion", "strike", "assassination", "attack", "soldiers",
  "airstrike", "rocket", "drone", "fpv", "iran", "us forces", "sanctions",
  "resistance", "martyrs", "casualties", "killed", "wounded",
];

// KEEP keywords — combined (context keywords alone are sufficient; action keywords need context)
const KEEP_KEYWORDS = [
  ...CONTEXT_KEYWORDS,
  ...ACTION_KEYWORDS,
];

// SKIP keywords — Gaza/Palestine-only (unless also mentions Lebanon)
const SKIP_PALESTINE_ONLY = ["gaza", "hamas", "west bank", "palestinian"];

// Category detection rules
const CATEGORY_RULES = {
  military_action: [
    "strike", "airstrike", "attack", "drone", "rocket", "fpv",
    "killed", "soldiers", "troops", "operation", "shelling", "bombardment",
    "missile", "intercepted", "launched", "targeted",
  ],
  casualties: [
    "killed", "wounded", "martyrs", "dead", "injuries", "death toll",
    "victims", "casualties", "body", "bodies",
  ],
  political: [
    "government", "minister", "un ", "unifil", "ceasefire", "agreement",
    "withdrawal", "resolution", "diplomacy", "negotiate", "summit",
    "secretary", "council", "parliament",
  ],
  media_narrative: [
    "media says", "claim", "deny", "report", "sources confirm",
    "according to", "alleged", "propaganda", "narrative", "disinformation",
    "lies", "fabricat",
  ],
  escalation: [
    "invasion", "crossing", "bombardment", "expanding", "escalating",
    "ground operation", "incursion", "mobiliz", "reservists", "full-scale",
  ],
  ceasefire: [
    "ceasefire", "truce", "pause", "halt", "agreement", "cessation",
    "de-escalation", "humanitarian corridor",
  ],
};

/**
 * Parse date from Telegram export format: "DD.MM.YYYY HH:MM:SS UTC+02:00"
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  // Format: "DD.MM.YYYY HH:MM:SS UTC+02:00" or "DD.MM.YYYY HH:MM:SS"
  const match = dateStr.match(
    /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})(?:\s+UTC([+-]\d{2}:\d{2}))?/
  );
  if (!match) return null;

  const [, day, month, year, hour, min, sec, tz] = match;
  // Build ISO string
  const tzOffset = tz || "+02:00";
  return `${year}-${month}-${day}T${hour}:${min}:${sec}${tzOffset}`;
}

/**
 * Detect category based on text content
 */
function detectCategory(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    scores[category] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[category]++;
      }
    }
  }

  // Return highest scoring category, or "uncategorized" if none match
  const sorted = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? sorted[0][0] : "uncategorized";
}

/**
 * Check if message should be kept (Lebanon-Israel axis filter)
 *
 * Logic: Must have at least one CONTEXT keyword (Lebanon/Israel/Hezbollah etc).
 * Action-only keywords (strike, attack, killed) are NOT sufficient alone —
 * they need a context anchor to avoid Ukraine/Syria/other noise.
 */
function shouldKeep(text) {
  if (!text || text.trim().length < 10) return false;

  const lower = text.toLowerCase();

  // MUST have at least one context keyword to anchor to Lebanon-Israel axis
  const hasContextKeyword = CONTEXT_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasContextKeyword) return false;

  // Check if it is Palestine-ONLY content (skip if no Lebanon connection)
  const hasPalestineKeyword = SKIP_PALESTINE_ONLY.some((kw) => lower.includes(kw));
  if (hasPalestineKeyword) {
    // Only skip if it does NOT also mention Lebanon/Hezbollah
    const hasLebanonContext = [
      "lebanon", "lebanese", "hezbollah", "beirut", "nasrallah", "litani",
      "south lebanon", "dahiyeh", "nabatieh", "resistance", "unifil",
    ].some((kw) => lower.includes(kw));
    if (!hasLebanonContext) return false;
  }

  // Skip Syria-only content
  const hasSyriaOnly = ["syria", "syrian", "damascus", "assad", "aleppo"].some((kw) => lower.includes(kw));
  if (hasSyriaOnly) {
    const hasLebanonContext = CONTEXT_KEYWORDS.slice(0, 15).some((kw) => lower.includes(kw));
    if (!hasLebanonContext) return false;
  }

  return true;
}

/**
 * Extract matched topic keywords from text
 */
function extractTopics(text) {
  const lower = text.toLowerCase();
  return KEEP_KEYWORDS.filter((kw) => lower.includes(kw));
}

/**
 * Clean text content — strip HTML tags, normalize whitespace
 */
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse a single HTML file
 */
function parseFile(filePath, source) {
  const html = readFileSync(filePath, "utf-8");
  const root = parseHTML(html, { blockTextElements: { style: false, script: false } });
  const events = [];

  // Find all message divs
  const messages = root.querySelectorAll('.message.default');

  for (const msg of messages) {
    const id = msg.getAttribute("id") || "";
    const messageId = id.replace("message", "");

    // Get date from title attribute
    const dateEl = msg.querySelector(".pull_right.date.details");
    const dateTitle = dateEl?.getAttribute("title") || "";
    const isoDate = parseDate(dateTitle);

    if (!isoDate) continue;

    // Check if media-only (has media_wrap but no text or empty text)
    const mediaWrap = msg.querySelector(".media_wrap");
    const textEl = msg.querySelector(".text");

    // Get text content
    const rawText = textEl ? textEl.innerHTML : "";
    const text = cleanText(rawText);

    // Skip media-only or empty messages
    if (!text || text.length < 10) continue;
    // Skip if text is just a URL
    if (/^https?:\/\/\S+$/.test(text)) continue;

    // Apply Lebanon-Israel filter
    if (!shouldKeep(text)) continue;

    const category = detectCategory(text);
    const topics = extractTopics(text);

    events.push({
      source,
      date: isoDate,
      text,
      messageId: `${source}_${messageId}`,
      category,
      topics,
    });
  }

  return events;
}

/**
 * Main parser
 */
function main() {
  console.log("=== ZIOPSYOP Telegram Parser ===\n");

  const allEvents = [];
  const stats = {};

  for (const { dir, label } of SOURCES) {
    const sourceDir = join(EXPORT_DIR, dir);
    const files = readdirSync(sourceDir)
      .filter((f) => f.startsWith("messages") && f.endsWith(".html"))
      .sort((a, b) => {
        // messages.html first, then messages2.html, messages3.html etc.
        const numA = a === "messages.html" ? 1 : parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = b === "messages.html" ? 1 : parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
      });

    console.log(`[${label}] Found ${files.length} HTML files`);
    let sourceCount = 0;
    let totalMessages = 0;

    for (const file of files) {
      const filePath = join(sourceDir, file);
      const events = parseFile(filePath, label);
      sourceCount += events.length;
      allEvents.push(...events);

      // Count total messages parsed (before filtering)
      const html = readFileSync(filePath, "utf-8");
      const msgCount = (html.match(/class="message default/g) || []).length;
      totalMessages += msgCount;
    }

    stats[label] = { files: files.length, kept: sourceCount, total: totalMessages };
    console.log(`[${label}] Parsed ${totalMessages} messages -> ${sourceCount} kept (${((sourceCount / totalMessages) * 100).toFixed(1)}% relevance)\n`);
  }

  // Sort all events by date
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Category distribution
  const categoryDist = {};
  for (const e of allEvents) {
    categoryDist[e.category] = (categoryDist[e.category] || 0) + 1;
  }

  // Write output
  writeFileSync(OUTPUT_FILE, JSON.stringify(allEvents, null, 2));

  console.log("=== SUMMARY ===");
  console.log(`Total events extracted: ${allEvents.length}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  console.log("Per-source breakdown:");
  for (const [src, s] of Object.entries(stats)) {
    console.log(`  ${src}: ${s.kept} events from ${s.total} messages (${s.files} files)`);
  }

  console.log("\nCategory distribution:");
  for (const [cat, count] of Object.entries(categoryDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Date range
  if (allEvents.length > 0) {
    const first = allEvents[0].date.slice(0, 10);
    const last = allEvents[allEvents.length - 1].date.slice(0, 10);
    console.log(`\nDate range: ${first} to ${last}`);
  }
}

main();
