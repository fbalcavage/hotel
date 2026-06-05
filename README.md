# The Miners 1928 — Website

A static, multi-page website. Plain HTML, CSS, and JavaScript — no framework
and no server-side code. Every page can be opened directly in a browser and
uploaded as-is.

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `stay.html` | Stay With Us (hotel + rooms + FAQ) |
| `dining-lounge28.html` | Dining — Lounge 28 |
| `dining-cafe.html` | Dining — Company Store Café |
| `weddings.html` | Weddings |
| `private-events.html` | Private Events & Meetings |
| `events.html` | Upcoming Events |
| `our-story.html` | Our Story |
| `contact.html` | Contact |
| `careers.html` | Careers |

Shared assets live in `assets/css/` and `assets/js/`. Images live in `images/`.

## Editing content

Open the page's `.html` file and edit it normally. The page text, images, and
section layout are all right there in the file. Save and upload — that's it.
**No build step is needed for everyday content edits.**

## Changing the navigation bar or footer (shared across every page)

The nav and footer are identical on every page, so they are stored once in the
`partials/` folder and copied into each page by a small script.

1. Edit `partials/nav.html` (the top menu) or `partials/footer.html`.
2. Run the sync script once:

   ```
   node build.js
   ```

   This copies your change into every page. (Requires [Node.js](https://nodejs.org);
   any recent version works.)

**Important:** inside each page the shared regions are wrapped in markers:

```html
<!-- NAV:START -->
   ... navigation markup ...
<!-- NAV:END -->
```

Don't hand-edit the markup *between* those markers in a page — it gets
overwritten the next time `build.js` runs. Edit `partials/nav.html` instead.
Everything *outside* the markers is yours to edit freely.

If you don't have Node.js and only need a quick nav/footer tweak, you can edit
the markup inside the markers on every page by hand — the site still works
without ever running the script. The script just saves you from repeating the
same edit ten times.

## Collecting missing photos (photo reference codes)

Every photo spot on the site has a short code like `WED-3` or `STAY-1` so you
can tell a photographer exactly which spot a photo is for.

- **The codes are shown on every page** as small numbered tags over each photo
  spot (red = a photo is there, blue = empty slot needing one). To hide them for
  a clean preview, add `?photos=off` to the address, e.g. `weddings.html?photos=off`.
  **Before going live, turn them off** (see the note at the bottom of this section).
- **The master list:** [`PHOTO-CHECKLIST.md`](PHOTO-CHECKLIST.md) lists every
  code, which page and section it's in, the current image, and its description.
- **After adding or removing images,** re-run the numbering so codes and the
  checklist stay accurate:

  ```
  node photo-spots.js
  ```

- **Before going live (turn the tags off site-wide):** open `assets/js/site.js`,
  find the `var photosOn = ...` line in the "Photo-spot reference tags" section,
  and change it to `var photosOn = false;`. (Or just ask and I'll do it.)

## Adding a new page

1. Copy an existing page as a starting point (it already has the marker
   comments and the correct `<head>` / script includes).
2. Add the new filename to the `PAGES` list near the top of `build.js`.
3. Run `node build.js` to pull in the shared nav and footer.
