---
name: add-project
description: Add a new project from "Project Inbox" to the BOLD website — look at the pictures, write the copy, build the panel, preview, and publish only on the owner's yes. Use when the user says they put a new project in the inbox, or types /add-project.
---

# Add a project to the BOLD site

The owner drops raw material in `Project Inbox/<Project name>/`: pictures plus `notes.txt`
(template in `Project Inbox/_example - copy this folder/`). The inbox is gitignored and never
published as is. Only the pictures and words the owner approves go on the site.

## 1. Read what arrived

- List `Project Inbox/` and skip `_example…` and `_published/`. If more than one new folder exists,
  ask which one(s).
- Read `notes.txt` in full. Respect "must NOT go on the website".
- Look at every picture (make a contact sheet with PIL in the scratchpad if there are many).
  Decide which ones lead and which to drop (duplicates, weak shots, anything showing private info).
- If notes are thin, ask at most three short questions: what was the client's need, what's the
  idea behind the design, which picture is the hero. Don't invent facts.

## 2. Prepare the pictures

```bash
scripts/prep-images.sh "Project Inbox/<Project name>" <slug>
```

Writes `img/<slug>-NN.jpg` (1400px, JPEG 82) and prints each size for `width`/`height`.
Delete any outputs you decided not to use.

## 3. Write the copy (house voice)

Follow the Ogilvy rules (`anthropic-skills:ogilvy-copywriting`): facts over adjectives, the client's
real need, one idea per project, plain words, captions that work as tiny ads.

- Say **spaces**, not "buildings", for the architecture side (BOLD does buildings, interiors and
  landscapes). Brand work is "brand identity".
- Panel: `h2` = project name; meta line = "<what BOLD did>, <city>, <year>"; two short paragraphs
  (the need, then the idea and how it shows up); a caption for every picture.
- No praise words ("stunning", "beautiful"), no invented quotes, numbers or clients.
- Show the owner the copy deck in chat before building if anything was guessed.

## 4. Build it into the site

Each project has its own full page, and the pages share `style.css` and `main.js`:

- **`project-<slug>.html` (one per project) holds the whole project.** Copy an existing project page
  (for example `project-pacework.html`), change the `<title>`, the `skip` link, and the `section.panel
  project` (its `id` is `p-<slug>`). Keep the header and the contact section. Every picture of the project goes in the panel.
- **`projects.html` (the Work page) is the shelf of folders only.** Add one `<li class="fd fd-brand">`
  to `ul.shelf` with every picture as an `<a class="fd-paper" href="project-<slug>.html">` (the
  `style="--i:N"` counts from 0), then the `button.fd-toggle` with the name and place/year. Projects with no pictures yet use the `is-soon` shape.
- **`index.html` (the homepage) shows one picture per project** in the "Selected work." section,
  split into Spaces and Brand identity. Add a tile to the right list, newest first: under
  `<!-- tiles:brands (newest first) -->` or `<!-- tiles:spaces -->`. Copy an existing `<li>`: square
  `.wp-frame` picture (pick the clearest one; a light or colourful picture, not a mark on black),
  `.wp-name`, `.wp-meta` ("<city>, <year>"), linking to `project-<slug>.html`. If the project was an
  "In design" tile, replace that tile instead of adding one.

Panel markup — `<section class="panel project p-<slug>" id="p-<slug>">`, copied from an existing panel:
  - mostly portrait pictures → `.strip` with `.tile.tall` (4:5)
  - landscape pictures → `.mosaic` with `.tile.wide` (3:2), one `.tile.portrait` allowed
  - a real sequence (sketch → final) → `ol.sequence` with `.tile.sq`; more than four squares → also add
    a two-row rule like `.p-kaafi .sequence` in `style.css`
- Every `img` has `alt`, `width`, `height` and `loading="lazy"`.
- Optional panel ground from the project's own colours (as Trishakti uses its maroon); keep text
  contrast ≥ 4.5:1. Otherwise keep the black ground.
- Each project gets one `<li class="fd ...">` in the `ul.shelf` in projects.html, shaped like the
  existing ones (branding gets `fd-brand`, architecture gets `fd-arch`), with all of its pictures as
  `a.fd-paper` entries in `.fd-papers`, each linking to `project-<slug>.html`. Projects with no pictures
  yet use the `is-soon` shape. If the project was already listed as `is-soon`, replace that `li` with
  the full shape instead of adding one.
- Update counts: the Brand identity proof line on the homepage and the Work page `h1`.

## 5. Check it

Preview with the `bold-site` launch config (`.claude/launch.json`): http://localhost:4173/ and
http://localhost:4173/projects.html. Check the new panel at 1440×900, 1180×820, 820×1180 and 375×812: pictures fill the height, nothing
overflows, captions readable, index link scrolls to the panel. No console errors on either page.

## 6. Publish only on a yes

- Commit on the current branch with the project name in the message.
- Ask before pushing. A push to `main` on GitHub (mayankbuildbold/buildbold-site) deploys to
  Vercel within about 30 seconds.
- After the owner approves, move the inbox folder to `Project Inbox/_published/`.
