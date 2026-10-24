---
name: add-project
description: Add a new project from "Project Inbox" to the BOLD website (v2) — look at the pictures, write the copy, build the panel, preview, and publish only on the owner's yes. Use when the user says they put a new project in the inbox, or types /add-project.
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

Writes `v2/img/<slug>-NN.jpg` (1400px, JPEG 82) and prints each size for `width`/`height`.
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

## 4. Build it into `v2/index.html`

- Add a `<section class="panel project p-<slug>" id="p-<slug>">` after the last project panel and
  before `<!-- 7. Approach -->`. Copy the structure of an existing panel:
  - mostly portrait pictures → `.strip` with `.tile.tall` (4:5)
  - landscape pictures → `.mosaic` with `.tile.wide` (3:2), one `.tile.portrait` allowed
  - a real sequence (sketch → final) → `ol.sequence` with `.tile.sq`
- First picture `loading="lazy"` like the others; every `img` has `alt`, `width`, `height`.
- Optional panel ground from the project's own colours (as Trishakti uses its maroon); keep text
  contrast ≥ 4.5:1. Otherwise keep the black ground.
- Add the project to the work index list (`.index-list`) with the right `data-discipline`
  (`branding` or `architecture`) and an `href="#p-<slug>"`. If it was already listed without
  pictures (e.g. "Photographs soon" / "In design"), turn that row into a link instead of adding one.
- Update counts that the new project changes: the index heading ("Six projects. Four cities.
  Three years."), the hero link ("See six projects"), and the service proof lines.

## 5. Check it

Preview with the `bold-site` launch config (`.claude/launch.json`, http://localhost:4173/v2/).
Check the new panel at 1440×900, 1180×820, 820×1180 and 375×812: pictures fill the height, nothing
overflows, captions readable, index link scrolls to the panel. No console errors from `v2/`.

## 6. Publish only on a yes

- Commit on the current branch with the project name in the message.
- Ask before pushing. A push to `main` on GitHub (mayankbuildbold/buildbold-site) deploys to
  Vercel within about 30 seconds.
- After the owner approves, move the inbox folder to `Project Inbox/_published/`.
