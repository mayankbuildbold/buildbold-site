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

Two pages share `style.css` and `main.js`:

- **`projects.html` (the Work page) holds every project.** Always add the new panel there, just before
  `<!-- projects:end -->`, and add its row to that page's `.index-list` with `href="#p-<slug>"`.
- **`index.html` (the homepage) features at most four projects**, between `<!-- featured:start -->` and
  `<!-- featured:end -->`. Ask the owner whether the new project should be featured. If yes, copy the
  same panel there and ask which featured project it replaces; remove that one from the homepage (it
  stays on the Work page). Homepage index rows link to `#p-<slug>` when featured, otherwise to
  `projects.html#p-<slug>`.

Panel markup — `<section class="panel project p-<slug>" id="p-<slug>">`, copied from an existing panel:
  - mostly portrait pictures → `.strip` with `.tile.tall` (4:5)
  - landscape pictures → `.mosaic` with `.tile.wide` (3:2), one `.tile.portrait` allowed
  - a real sequence (sketch → final) → `ol.sequence` with `.tile.sq`; more than four squares → also add
    a two-row rule like `.p-kaafi .sequence` in `style.css`
- Every `img` has `alt`, `width`, `height` and `loading="lazy"`.
- Optional panel ground from the project's own colours (as Trishakti uses its maroon); keep text
  contrast ≥ 4.5:1. Otherwise keep the black ground.
- `data-discipline` on index rows: `branding` or `architecture`. If the project was already listed
  without pictures ("Photographs soon" / "In design"), turn that row into a link instead of adding one.
- Update counts on both pages: homepage index heading ("Seven projects. Four cities. Three years."),
  hero link ("See seven projects"), the Brand identity proof line, and the Work page `h1`.

## 5. Check it

Preview with the `bold-site` launch config (`.claude/launch.json`): http://localhost:4173/ and
http://localhost:4173/projects.html. Check the new panel at 1440×900, 1180×820, 820×1180 and 375×812: pictures fill the height, nothing
overflows, captions readable, index link scrolls to the panel. No console errors on either page.

## 6. Publish only on a yes

- Commit on the current branch with the project name in the message.
- Ask before pushing. A push to `main` on GitHub (mayankbuildbold/buildbold-site) deploys to
  Vercel within about 30 seconds.
- After the owner approves, move the inbox folder to `Project Inbox/_published/`.
