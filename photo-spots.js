#!/usr/bin/env node
/**
 * photo-spots.js — number every photo location on the website.
 *
 * Each photo spot (an <img> or an empty "coming soon" gallery slot) gets a
 * short, stable reference code like WED-3 or STAY-1. The code is written into
 * the page as a data-photo="..." attribute, and a master list is written to
 * PHOTO-CHECKLIST.md.
 *
 *   Run it with:   node photo-spots.js
 *
 * WHY: so you can hand someone a page and say "we need a new photo for WED-3."
 * To SEE the numbers on the site, open any page with ?photos on the end of the
 * address, e.g.  weddings.html?photos
 *
 * Re-run this any time you add, remove, or reorder images — the codes follow
 * the order the photos appear on each page, and the checklist is regenerated.
 * The navigation logo and footer are intentionally skipped.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// page file -> short reference prefix used in the codes
const PAGES = {
  'index.html': 'HOME',
  'stay.html': 'STAY',
  'dining-lounge28.html': 'LOUNGE',
  'dining-cafe.html': 'CAFE',
  'weddings.html': 'WED',
  'private-events.html': 'PRIV',
  'events.html': 'EVENT',
  'our-story.html': 'STORY',
  'contact.html': 'CONTACT',
  'careers.html': 'CAREER',
};

// images that are part of the layout, not content photos — never numbered
const SKIP_IMAGES = new Set(['the_miners_logo.png', 'favicon.svg']);

// menu page images (MENU-*) are content, but not "photo spots" to be sourced
const SKIP_PATTERN = /^MENU-/i;

// human-friendly page titles for the checklist
const TITLES = {
  'index.html': 'Home',
  'stay.html': 'Stay With Us',
  'dining-lounge28.html': 'Dining — Lounge 28',
  'dining-cafe.html': 'Dining — Company Store Café',
  'weddings.html': 'Weddings',
  'private-events.html': 'Private Events & Meetings',
  'events.html': 'Upcoming Events',
  'our-story.html': 'Our Story',
  'contact.html': 'Contact',
  'careers.html': 'Careers',
};

// One token matcher with four alternatives, tried in order at each position:
//   1. a whole NAV/FOOTER region (skipped, so the logo/footer aren't numbered)
//   2. an <img> tag
//   3. an empty .gallery__placeholder slot
//   4. a plain HTML comment (used as a section label, e.g. <!-- HERO -->)
const TOKEN = new RegExp(
  '(<!-- (?:NAV|FOOTER):START -->[\\s\\S]*?<!-- (?:NAV|FOOTER):END -->)' +
  '|(<img\\b[^>]*>)' +
  '|(<div\\b[^>]*class="[^"]*gallery__placeholder[^"]*"[^>]*>)' +
  '|(<!--[\\s\\S]*?-->)',
  'g'
);

function attr(tag, name) {
  const m = tag.match(new RegExp(name + '="([^"]*)"'));
  return m ? m[1] : '';
}

function basename(src) {
  return src.split('/').pop();
}

// remove any codes we added on a previous run so re-runs stay clean
function strip(tag) {
  return tag
    .replace(/\s+data-photo="[^"]*"/g, '')
    .replace(/\s+data-photo-empty/g, '');
}

function escapeCell(s) {
  return s.replace(/\|/g, '\\|').trim();
}

const records = []; // { page, code, status, section, file, alt, note }
let updated = 0;

for (const [page, prefix] of Object.entries(PAGES)) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) {
    console.warn(`!  skip   ${page} (file not found)`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  let n = 0;
  let section = '';

  html = html.replace(TOKEN, function (m, navBlock, imgTag, phDiv, comment) {
    if (navBlock) return m; // leave nav/footer untouched

    if (comment) {
      // turn a comment into a short label: drop "=" banners, collapse whitespace
      const text = comment
        .replace(/<!--|-->/g, '')
        .replace(/=/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) section = text;
      return m;
    }

    if (imgTag) {
      const imgBase = basename(attr(imgTag, 'src'));
      if (SKIP_IMAGES.has(imgBase) || SKIP_PATTERN.test(imgBase)) {
        return strip(imgTag); // layout image (logo etc.) or menu page — don't number
      }
    }

    n += 1;
    const code = `${prefix}-${n}`;

    if (imgTag) {
      const src = attr(imgTag, 'src');
      const isPlaceholderImg = /data-todo=/.test(imgTag);
      records.push({
        page,
        code,
        status: isPlaceholderImg ? 'replace' : 'have',
        section,
        file: basename(src),
        alt: attr(imgTag, 'alt'),
        note: isPlaceholderImg ? attr(imgTag, 'data-todo') : '',
      });
      return strip(imgTag).replace(/^<img/, `<img data-photo="${code}"`);
    }

    // gallery placeholder = empty slot, needs a brand-new photo
    records.push({
      page,
      code,
      status: 'empty',
      section,
      file: '(empty slot)',
      alt: '',
      note: '',
    });
    return strip(phDiv).replace(/^<div/, `<div data-photo="${code}" data-photo-empty`);
  });

  if (html !== original) {
    fs.writeFileSync(file, html);
    updated++;
    console.log(`✓  ${page.padEnd(22)} ${n} photo spot(s)`);
  } else {
    console.log(`·  ${page.padEnd(22)} ${n} photo spot(s) (no change)`);
  }
}

// ---- write the checklist ----
const STATUS_LABEL = {
  have: '🔴 have',
  replace: '🔴 replace',
  empty: '🔵 needs photo',
};

let md = '';
md += '# Photo Reference Checklist — The Miners 1928\n\n';
md += 'Every photo spot on the website has a short code (e.g. `WED-3`). Use the\n';
md += 'code to tell us exactly which spot a photo is for.\n\n';
md += '**The codes are shown on every page right now** as small numbered tags over\n';
md += 'each photo spot. (To hide them for a clean preview, add `?photos=off` to the\n';
md += 'address, e.g. `weddings.html?photos=off`.)\n\n';
md += '**Legend**\n\n';
md += '- 🔴 **have** — a photo is in place.\n';
md += '- 🔴 **replace** — a stand-in photo is there now; a better one is wanted.\n';
md += '- 🔵 **needs photo** — empty slot; a brand-new photo is needed.\n\n';
md += '_Generated by `node photo-spots.js`. Re-run after adding or removing images._\n';

let totals = { have: 0, replace: 0, empty: 0 };
for (const page of Object.keys(PAGES)) {
  const rows = records.filter((r) => r.page === page);
  if (!rows.length) continue;
  md += `\n## ${TITLES[page]} (\`${page}\`)\n\n`;
  md += '| Code | Status | Section | Current image | Description |\n';
  md += '|------|--------|---------|---------------|-------------|\n';
  for (const r of rows) {
    totals[r.status]++;
    const desc = r.alt || r.note || '';
    md += `| \`${r.code}\` | ${STATUS_LABEL[r.status]} | ${escapeCell(r.section)} | ${escapeCell(r.file)} | ${escapeCell(desc)} |\n`;
  }
}

const total = records.length;
md =
  md.replace(
    '_Generated by `node photo-spots.js`. Re-run after adding or removing images._\n',
    `**Totals:** ${total} photo spots — ${totals.have} have, ${totals.replace} to replace, ${totals.empty} empty slots needing a photo.\n\n` +
      '_Generated by `node photo-spots.js`. Re-run after adding or removing images._\n'
  );

fs.writeFileSync(path.join(ROOT, 'PHOTO-CHECKLIST.md'), md);

console.log(`\nDone. ${updated} page(s) updated, ${total} photo spots, checklist -> PHOTO-CHECKLIST.md`);
