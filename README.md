# Larkspur Falls

A browser game about time, people, and a missing girl. There's no combat.
You get 14 days in a foggy Oregon logging town to work out what happened to Odessa Vale before the Harvest Bonfire.

    npm install
    npm run dev      # http://localhost:5173
    npm run sim      # balance simulation (400 bot runs)

- Each day has 3 slots. People keep schedules, and you can see who's where on the map.
- There are 6 bond arcs, 5 scenes each, gated by traits (Nerve, Empathy, Insight, Charm). How you answer builds trust, and people only share their secrets once they trust you.
- Three random crises happen per run. If you miss one, you lose that person for the rest of the run.
- There are 5 hand-written truths. One is picked each run, and the clues for it are spread across people and places. Dreams are always true.
- On Bonfire night you name who, where and why, then go with whoever is willing to come.

Character art by Sutemo (see CREDITS.md). Location backdrops are painted in code (`src/art/scenes.ts`).

Content lives in `src/data/`, the rules in `src/engine.ts`, and the UI in `src/ui/app.ts`.
