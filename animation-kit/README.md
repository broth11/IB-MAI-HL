# IB MAI HL animation kit: construction guide

How the IB MAI HL animations are built, using the first set, **Voronoi diagrams** (SL 3.5, SL 3.6), as the worked example. Use this
guide, and the source in `voronoi/`, as the template for every new animation set.

- Live result: [anims/voronoi.html](https://broth11.github.io/IB-MAI-HL/anims/voronoi.html), shown on the
  [SL 3.6 card](https://broth11.github.io/IB-MAI-HL/topic-3.html#3.6).
- Built 21 Nov 2026 in a Codex session from Ben's brief (below). On 22 Nov 2026 the source in `voronoi/` was confirmed to rebuild the
  published page **byte for byte** (`node build.js --draft`, same MD5 as the live file).
- The player, tabs, step images and colour tokens come from the AP Statistics animation block
  ([broth11/ap-stats](https://github.com/broth11/ap-stats), for example [CED 2.7](https://broth11.github.io/ap-stats/ced-2.html#2.7)),
  so MAI and AP Stats animations look and behave the same.

## 1. What a finished set is

One self-contained, offline HTML file holding several animations (the Voronoi set has 7). The file contains everything: KaTeX with its fonts
inlined, the maths labels pre-rendered as MathJax glyphs, any calculator screens as base64 WebP images, and the player code. No network
requests, so it works from Drive, from `file://`, inside an iframe and on GitHub Pages.

Each animation in the set has:

| Part | What it does |
|---|---|
| **Animation / Step images** toggle | Animation plays the timeline; Step images shows the finished picture of each step with Previous and Next. |
| Toolbar under the player | Circular play/pause icon button, restart icon, speed dropdown (0.25x to 1x, no "Speed" word), progress bar. |
| **What to watch** tab | One-column list of step buttons. Clicking a step jumps there (or shows its still). The active step's sentence sits in a fixed panel below the list. On phones a dropdown replaces the list. |
| **What you see** tab | A `see` paragraph and a `notice` list: what the picture shows and why it is true. |
| **Remember** tab and line | The one-sentence takeaway, also printed under the player. |
| Held summary | The last step recomposes the whole idea and holds, so a paused still frame teaches the concept on its own. |
| No-JS fallback | The final picture and the `see` text, in a `<noscript>`. Reduced-motion visitors open on Step images, and the Animation button stays available. |

The page header reads **"Voronoi Diagrams: *Sketch title*"** on the top row, with a narrow animation dropdown and previous/next arrows at the
right. Only one animation shows at a time, and the page sizes the square player so the whole set (player, toolbar, steps) fits on screen
without scrolling. `page.html#<animation-id>` opens a given animation, which is how the topic page's list drives the embedded player.

## 2. Ben's brief and decisions (carry these into every new set)

From the build conversation, in Ben's words where possible:

1. **Ask first.** Before building, ask where the set will live, confirm anything ambiguous in a construction (for example "four sites
   A, B, C, D with vertices $V_1$ and $V_2$"), and **show a storyboard for every animation and wait for approval**.
2. **Clean, new examples with simple equations**, not copied from lesson PDFs. Reuse one coordinate set across the whole set so students
   carry the same diagram from one animation to the next. Voronoi uses $A(-4,0)$, $B(8,0)$, $C(0,4)$, $D(0,-4)$.
3. **Calculator steps use real Casio fx-CG50 captures** (the `fx-cg50-capture` skill), with the key chain stored next to them
   (`casio/gdc_intersection.json`). Use the method Ben names: for line intersections it is **GRAPH → G-Solv → INTSECT**, not EQUA.
4. **All maths is typeset**: KaTeX for text panels, MathJax glyphs inside the SVG. Never plain-text maths.
5. **Show the right-angle square** wherever a perpendicular is known.
6. **The whole set fits on one screen without scrolling**; non-animation text is two sizes larger than the AP Stats default.
7. **Draw only what the step needs.** Example: the three-site summary frame does not draw segment $VA$ (it stays in the radius working).
8. **Show why edges stop**: for an added site, show the two perpendicular bisectors meeting at the vertex where both kept edges end.
9. **Give context for choices.** Largest empty circle: the larger circle when the goal is maximum clearance (a waste dump), the smaller when
   a site must be within a distance (a depot within 4.5 km of a town).
10. **Use the textbook's vocabulary and rules** (Haese AI SL/HL, Voronoi chapter). Tie rule for nearest-neighbour interpolation:
    average the values of all sites tied for nearest (30 mm on an edge, 28 mm at a vertex in the example).
11. **Layout** (Ben's revision list): title on the top row, dropdown at the right corner and narrow, step buttons in **one column**,
    the Animation/Step images toggle and playback icons **under** the animation, so the square player can be as large as possible.

## 3. Source files (`voronoi/`)

| File | Role |
|---|---|
| `chapters.js` | **Content.** One `lesson(id, title, stage, subtitle, see, notice, remember, rows)` per animation. Each row is `[id, label, text, alt, reveal=1.25, hold=2.4]`: step id, button label, panel sentence (KaTeX `$...$`), alt text of its still, seconds to draw, seconds to hold. Times are computed: `t` = start, `rest` = `t + reveal + hold/2` (the still frame). The last row is the summary (short reveal, long hold). |
| `scenes.js` | **Drawing.** Geometry (`sites`, vertices, the viewBox mapping `sx`, `sy`), helpers (`line`, `circle`, `polygon`, `rightSquare`, `bisectorSquare`, `label`, `text`/`mathRun`) and one scene function per animation that draws step `i` at progress `p` (0 to 1, eased). `render(index, cfg, t, captures)` returns the full 600×600 SVG string. |
| `player.js` | `createPlayer(index, stage, root)`: the clock, `requestAnimationFrame` loop and the API the block expects: `play`, `pause`, `seek`, `setSpeed`, `time`, `duration`, `chapters`. Also `mt()` for KaTeX in text. |
| `navigation.js` | One-animation-at-a-time picker, previous/next, `#id` routing, and `fitActivePanel()`, which sets `--frame-budget` so the set fits the viewport. |
| `collection.css` | Page layout on top of the AP Stats block CSS (header row, toolbar under the player, icon buttons, phone and landscape rules). |
| `build.js` | **Bundler.** Pre-renders every label (runs each scene at 13 points per step to collect them), patches the AP Stats block script to drive an inline SVG stage instead of an iframe, inlines KaTeX and its fonts, embeds the captures, writes the HTML. |
| `check.js`, `check-revision.js` | Browser tests (section 6). |
| `casio/` | fx-CG50 screens (`.webp`, embedded) and the verified key chain (`.json`). |

### Colours: never write a colour

Scenes use role tokens, resolved by `anim_theme.js` from the page's theme so the same file follows the student (orange/blue) and teacher
(green/violet) palettes:

`@ink` text and outlines, `@surface` background, `@muted` secondary text, `@a` first series, `@b` second series, `@pos` good outcome,
`@neg` bad outcome, and readable text variants `@at @bt @pt @nt` (darkened to reach contrast on the surface; `label()` picks them for you).
Voronoi maps sites to tokens: A `@b`, B `@a`, C `@pos`, D `@neg`.

## 4. Dependencies (on Ben's Mac)

`build.js` reads three things outside this folder (paths are relative to the home folder):

| Needed | Path | Why |
|---|---|---|
| KaTeX | `~/ap-stats-site/assets/vendor/katex/` (any copy of KaTeX 0.16.9 works, for example this repo's `assets/vendor/katex`) | Text maths, fonts inlined into the page |
| MathJax glyph tool | `~/Documents/Courses/AP Statistics/AP Statistics Splitter/_animation_eval/tools/tex/tex2glyph.js` | Renders SVG labels in Computer Modern, matching KaTeX |
| AP Stats animation block | `~/.claude/skills/unit-page/scripts/anim_block/` (`anim_block.js`, `anim_block.css`, `anim_theme.js`) | Player behaviour, tabs, step images, theme tokens |

The checks need Puppeteer (`~/Documents/Courses/MAI HL/_tools/pdf_export/node_modules/puppeteer`) and Google Chrome.

`build.js` changes the block script by exact string substitution. If `anim_block.js` changes in the unit-page skill, the build stops with
"Reference player no longer has expected code: …". Update the matching `substitute(...)` line rather than forcing it.

## 5. Making a new set

1. **Storyboard and approval** (section 2, point 1). Agree the list of animations, the shared example, and any calculator method.
2. Copy `voronoi/` to a new folder (for example `animation-kit/<topic>/`).
3. Write `chapters.js`: one `lesson(...)` per animation, steps ending in a summary.
4. Write `scenes.js`: the shared geometry and one scene function per animation, in the same order. Keep everything inside the 600×600
   box, labels with `label()`/`text()` (maths in `$...$`), colours as tokens only.
5. In `build.js`, change the set-specific strings: `optionTitles` (dropdown), `shortLabels` (phone step picker), the page `<title>`, the
   header eyebrow and heading, and the capture `names` (or remove captures). In `scenes.js` `render()`, change the footer
   (`MAI HL · Unit 4B`).
6. Capture calculator screens with the `fx-cg50-capture` skill if needed; save `.webp` files and the key chain JSON in `casio/`.
7. Build a draft: `node build.js --draft` (writes `<Set>.html` beside the source). Without `--draft` it writes to `../outputs/`.
8. Run the checks (section 6) and look at every step image.
9. Put the finished file in the unit folder in Drive, then add it to the site: in the course's
   `_unit-pages/syllabus-content.json`, add an `animation-set` entry under the right syllabus code
   (`{"type": "animation-set", "id", "title", "source": "<file in Drive>", "page": "anims/<id>.html", "taught": "Unit …"}`).
   The next unit-page build copies it in, lists its animations on the topic card, and publishes.

## 6. Checks before it ships

- `node check.js`: loads the set at 1440×1000; play/pause really stops the clock; speed and restart; step buttons set `aria-current`; for
  every animation, both tabs, keyboard tab switching, every step image's alt text, **no SVG text outside the 600×600 box**, the calculator
  still is an embedded WebP; then a 375 px phone (no sideways scroll), and reduced motion (no live animation, a still for every set).
  Fails on any page error.
- `node check-revision.js`: nine screen profiles (desktop, iPad, phones in portrait and landscape); the active set fits without scrolling,
  no failed requests.
- Look at the screenshots it writes, and check the maths against the textbook.

## 7. Not in this repo

Six alternative designs of the same content (Field Notes, Screening Room, Prediction Lab, Geometry Workbench, Comparison Atlas, Retrieval
Deck) were made in the same Codex session as experiments. They are on Ben's Mac in the Codex work folder for 21 Nov 2026, not published.

## 8. How this folder survives site builds

The student site in this repo is rebuilt and pushed by the unit-page skill, which mirrors the build into the repo and deletes other files.
This folder and `README.md` survive because the MAI course's `course.json` lists them under `publish.keep`. Add any new top-level folder
you want kept to that list.
