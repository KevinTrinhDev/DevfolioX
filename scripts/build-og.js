// scripts/build-og.js
// Generate clean Open Graph cards as PNGs (1200x630) using sharp.
// One-shot script — run with `node scripts/build-og.js` whenever the design
// or copy changes. Output: public/images/og/{home,links,articles,projects}.png

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "images", "og");
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1200;
const H = 630;

// Shared design tokens — match the site palette.
const BG = "#050816";
const TEXT = "#ffffff";
const MUTED = "#a1a1aa";
const ACCENT = "#6366f1"; // indigo-500
const ACCENT_2 = "#8b5cf6"; // violet-500

/**
 * Renders a single OG card SVG (string) for the given content.
 *  - eyebrow: small uppercase label at the top
 *  - title:   big bold name/title
 *  - subtitle: longer descriptor, wrapped manually if needed
 *  - footer:  small wordmark at the bottom-left
 */
function svg({ eyebrow, title, subtitle, footer = "kevintrinh.dev" }) {
  // We use DejaVu Sans which is system-installed and renders cleanly via librsvg.
  const FONT = "DejaVu Sans";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="${ACCENT}"/>
      <stop offset="50%" stop-color="${ACCENT_2}"/>
      <stop offset="100%" stop-color="${ACCENT}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.85" cy="0.18" r="0.5">
      <stop offset="0%"   stop-color="${ACCENT}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.12" cy="0.85" r="0.45">
      <stop offset="0%"   stop-color="${ACCENT_2}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT_2}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <!-- Soft accent glows -->
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="url(#topbar)"/>

  <!-- Eyebrow -->
  <text x="80" y="160" font-family="${FONT}" font-size="22" font-weight="700"
        letter-spacing="6" fill="${ACCENT}" textLength="${Math.min(eyebrow.length * 14, 600)}" lengthAdjust="spacing">
    ${escapeXml(eyebrow.toUpperCase())}
  </text>

  <!-- Title -->
  <text x="80" y="290" font-family="${FONT}" font-size="92" font-weight="700"
        fill="${TEXT}">${escapeXml(title)}</text>

  <!-- Subtitle (wrap to two lines if long) -->
  ${renderSubtitle(subtitle, FONT)}

  <!-- Footer wordmark -->
  <circle cx="92" cy="552" r="6" fill="${ACCENT}"/>
  <text x="110" y="560" font-family="${FONT}" font-size="22" font-weight="500"
        fill="${MUTED}">${escapeXml(footer)}</text>
</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Naive line wrap — splits the subtitle into two lines if it's longer than
// `chars`. Good enough for OG cards (we keep subtitles short anyway).
function renderSubtitle(text, font, chars = 56) {
  if (text.length <= chars) {
    return `<text x="80" y="370" font-family="${font}" font-size="32" font-weight="400"
            fill="${MUTED}">${escapeXml(text)}</text>`;
  }
  // split at the nearest space before `chars`
  let split = text.lastIndexOf(" ", chars);
  if (split < 0) split = chars;
  const a = text.slice(0, split).trim();
  const b = text.slice(split).trim();
  return `<text x="80" y="370" font-family="${font}" font-size="32" font-weight="400"
            fill="${MUTED}">${escapeXml(a)}</text>
          <text x="80" y="416" font-family="${font}" font-size="32" font-weight="400"
            fill="${MUTED}">${escapeXml(b)}</text>`;
}

const CARDS = [
  {
    file: "home.png",
    eyebrow: "Portfolio",
    title: "Kevin Trinh",
    subtitle:
      "Full-stack developer & CS student at the University of Houston.",
  },
  {
    file: "links.png",
    eyebrow: "Links",
    title: "Find me online",
    subtitle: "Socials, portfolio, and content — all in one place.",
  },
  {
    file: "articles.png",
    eyebrow: "Articles",
    title: "Writing & Notes",
    subtitle:
      "Deep dives, guides, and dev notes from Kevin Trinh.",
  },
  {
    file: "projects.png",
    eyebrow: "Projects",
    title: "Things I’ve built",
    subtitle:
      "Open-source apps, tools, and side projects by Kevin Trinh.",
  },
];

(async () => {
  for (const card of CARDS) {
    const out = path.join(OUT_DIR, card.file);
    const buf = Buffer.from(svg(card));
    await sharp(buf).png({ compressionLevel: 9 }).toFile(out);
    const stat = fs.statSync(out);
    console.log(`✓ ${card.file}  (${(stat.size / 1024).toFixed(1)} KB)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
