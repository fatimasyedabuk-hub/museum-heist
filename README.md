# The Museum Heist
*An interactive mystery. Six scenes. One stolen painting. Can you uncover the truth?*

**CCT 360 · Interactive Discovery group project (The Curious Case)**
**Group:** Fatima Bukhari · Lama Hamdan · Dima Hamdan
**Live website:** [https://YOUR-USERNAME.github.io/REPO-NAME/]

## Concept
The player is a detective. *The Moonlit Garden*, the centrepiece of a museum, has been stolen with no alarm and no forced door.
By exploring rooms, collecting clues, reviewing CCTV and interviewing three suspects, the player decides who did it.
The accusation has to be earned from evidence, and the ending changes with who is accused and how much evidence was found.

## Scenes
1. **Introduction:** sets the mystery and starts the investigation.
2. **Investigation Board:** the hub for the suspects, the four clue cards and navigation to every room.
3. **Gallery:** clickable hotspots on the empty frame; the Gallery Plaque and Frame Fabric clues are found here.
4. **Security Room:** three switchable CCTV feeds and an access log; the Badge Log and Transfer Slip clues are found here.
5. **Suspect Interviews:** question Mara Vale, Iris Chen and Leo Grant. Questions unlock as evidence is collected.
6. **Final Reveal:** accuse a suspect, then see the verdict and how the evidence supports (or contradicts) it.

## How to run
Open `index.html` in any modern browser. No build step, server or internet connection is needed (fonts fall back to
Georgia and system sans-serif if offline). Progress is saved in the browser (`localStorage`);
use **Start over** on the first scene (or **Restart** on the final screen) to reset.

## Project structure
```
index.html          page shell (semantic HTML)
css/styles.css      all styling, responsive at 760px
js/app.js           all interaction and state
assets/images/      16 scene, suspect, clue and CCTV images
assets/icons/       6 navigation icons
CREDITS.md          source and attribution for every image, icon and font
```

## Requirements map
| Requirement | How it is met |
|---|---|
| 4–6 interconnected scenes | 6 scenes, all reachable from the navigation bar |
| ≥ 5 interactive elements | Clue cards with detail modals, gallery hotspots, CCTV feed tabs, interview questions, suspect and accusation cards, restart |
| ≥ 2 state-based interactions | Collected clues, viewed feeds and asked questions are remembered; the Suspect Interviews scene unlocks at 2 clues and the Final Reveal at 3; all progress survives a refresh |
| Multiple pathways | Rooms can be visited in any order; interview answers depend on evidence found; three suspects can be accused, with different outcomes |
| Images / media | 16 images and 6 icons, used as the main visual element of each scene |
| Responsive layout | Tested at desktop (1280px) and phone (375px) widths |
| JavaScript-driven | Single state object, event delegation, localStorage persistence, history/hash navigation, modals |

## Quick walkthrough (contains spoilers)
Gallery: inspect the plaque beside the frame and the frame's top-right corner. Security Room: view all three feeds and take
the access log (hallway feed) and dock paperwork (loading feed). Interview all three suspects, then accuse **Mara Vale**
in the Final Reveal. Accusing Iris or Leo ends in a failed case, with an explanation.

## Accessibility
Keyboard-operable controls, visible focus states, ARIA labels and live regions, alt text on every image, and reduced-motion support.

## Credits
See `CREDITS.md` for the source and licence notes for every image, icon and font. The code, story, characters and dialogue are original.
