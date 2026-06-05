#!/usr/bin/env node
/**
 * build.js — shared-partial sync for The Miners 1928 website.
 *
 * Each page keeps its navigation and footer written inline, so every .html
 * file is complete on its own and works with no build step. This script's only
 * job is to copy the canonical markup from the partials/ folder into every
 * page, between marker comments.
 *
 *   Run it with:   node build.js
 *
 * TO CHANGE THE NAV OR FOOTER SITE-WIDE:
 *   1. Edit partials/nav.html or partials/footer.html
 *   2. Run `node build.js`
 *
 * Do NOT hand-edit the markup *between* the markers inside a page
 * (e.g. between <!-- NAV:START --> and <!-- NAV:END -->); those regions are
 * overwritten on the next build. Editing anything else in a page is fine.
 *
 * Adding a new page? Add its filename to the PAGES list below and include the
 * marker comments where you want the nav/footer to appear.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PARTIALS_DIR = path.join(ROOT, 'partials');

// Marker region name -> source partial file in partials/
const REGIONS = {
  NAV: 'nav.html',
  FOOTER: 'footer.html',
};

// Pages kept in sync. Add new pages here.
const PAGES = [
  'index.html',
  'stay.html',
  'dining-lounge28.html',
  'dining-cafe.html',
  'weddings.html',
  'private-events.html',
  'events.html',
  'our-story.html',
  'contact.html',
  'careers.html',
];

function loadPartial(file) {
  return fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8').trim();
}

function syncRegion(html, region, content) {
  const start = `<!-- ${region}:START -->`;
  const end = `<!-- ${region}:END -->`;
  const re = new RegExp(`${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}`);
  if (!re.test(html)) return { html, found: false };
  return { html: html.replace(re, `${start}\n${content}\n${end}`), found: true };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const partials = {};
for (const [region, file] of Object.entries(REGIONS)) {
  partials[region] = loadPartial(file);
}

let updated = 0;
for (const page of PAGES) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) {
    console.warn(`!  skip   ${page} (file not found)`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const regionsFound = [];
  for (const region of Object.keys(REGIONS)) {
    const res = syncRegion(html, region, partials[region]);
    html = res.html;
    if (res.found) regionsFound.push(region);
  }
  if (html !== original) {
    fs.writeFileSync(file, html);
    updated++;
    console.log(`✓  build  ${page}  [${regionsFound.join(', ')}]`);
  } else {
    const note = regionsFound.length ? 'no change' : 'no markers — skipped';
    console.log(`·  ok     ${page}  (${note})`);
  }
}

console.log(`\nDone. ${updated} file(s) updated.`);
