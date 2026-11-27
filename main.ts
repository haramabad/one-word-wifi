// one-word-wifi — main.ts
//
// Roman is a personal agent; this program picks the one word that
// describes your Wi-Fi and writes it to /output/entry.txt.
//
// The pick: liar. My Wi-Fi is a liar — it shows full bars, swears
// it is connected, and delivers nothing. It is funny at once, true
// of home Wi-Fi as everyone lives it (the bars lie, the page never
// loads), surprising next to the obvious "slow" / "laggy" /
// "buffering", and four letters long, so it lands in one beat and
// works as a network name on its own.
//
// The judge weighs, most important first: (1) one word describing
// Wi-Fi as the entrant lives it, (2) funny at once, a real laugh
// rather than a pun that needs explaining, (3) true to how home
// Wi-Fi actually behaves, so the joke lands because it is
// recognisable, (4) a surprising angle, not the word everyone
// reaches for, (5) works as a single word with no context needed,
// spelled so a reader gets it instantly. Each candidate below is
// scored 0..2 on each, most weight on the first, and the highest
// total wins.

import { mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  word: string;
  // Each 0..2. Weighted most to least, as the judge weighs them:
  // describes Wi-Fi as lived, funny at once, true of home Wi-Fi,
  // surprising, instantly readable with no context.
  fit: number;
  funny: number;
  truthful: number;
  surprising: number;
  instant: number;
};

const WEIGHTS = { fit: 3, funny: 2, truthful: 2, surprising: 1, instant: 1 };

const CANDIDATES: Candidate[] = [
  // The winner: it shows full bars and delivers nothing. Short,
  // funny, true of every home network, and nobody's first word
  // for Wi-Fi — the accusation is the joke.
  { word: "liar", fit: 2, funny: 2, truthful: 2, surprising: 2, instant: 2 },
  // Full bars, no internet: it teases you with a connection it
  // will not give. Strong, but a beat longer than the winner.
  { word: "tease", fit: 2, funny: 2, truthful: 2, surprising: 2, instant: 2 },
  // There, gone, there again: the signal plays peekaboo from room
  // to room. Playful and true, but longer, so it lands slower.
  { word: "peekaboo", fit: 2, funny: 2, truthful: 2, surprising: 2, instant: 2 },
  // It says it is connected, nothing loads, and somehow the
  // problem is always you. Current and funny, but eleven letters
  // and jargon-adjacent, so it reads slower than the winner.
  { word: "gaslighting", fit: 2, funny: 2, truthful: 2, surprising: 2, instant: 1 },
  // Nothing works until you pay attention to it: restart me,
  // move closer, stand in this exact spot. Funny, but the joke
  // is about the router's demands, not the Wi-Fi itself.
  { word: "hostage", fit: 2, funny: 1, truthful: 2, surprising: 2, instant: 2 },
  // Works in the kitchen, dies in the bedroom, fine again by the
  // window. True and fresh, but a quieter laugh than the winner.
  { word: "fickle", fit: 2, funny: 1, truthful: 2, surprising: 2, instant: 2 },
  // The signal vanishes mid-call and comes back like nothing
  // happened. True, but "ghost" is everyone's word for anything
  // that disappears.
  { word: "ghost", fit: 2, funny: 1, truthful: 2, surprising: 1, instant: 2 },
  // Works when it feels like it, sulks when it does not. True,
  // but flat: a mood, not a joke.
  { word: "moody", fit: 2, funny: 1, truthful: 2, surprising: 1, instant: 2 },
  // Restarts, updates, unplug it and plug it back in: it always
  // needs something from you. True, but more of a complaint than
  // a laugh.
  { word: "needy", fit: 2, funny: 1, truthful: 2, surprising: 1, instant: 2 },
  // Drops for no reason, back five seconds later. True, but the
  // word everyone already uses for bad Wi-Fi.
  { word: "flaky", fit: 2, funny: 1, truthful: 2, surprising: 0, instant: 2 },
  // The first word anyone reaches for. True, but not funny and
  // not surprising at all.
  { word: "slow", fit: 2, funny: 0, truthful: 2, surprising: 0, instant: 2 },
  // Drops the moment anything important starts: a video call, a
  // download at 99%. A drama queen, but the joke needs the story.
  { word: "dramatic", fit: 2, funny: 1, truthful: 1, surprising: 1, instant: 2 },
];

function score(c: Candidate): number {
  return (
    c.fit * WEIGHTS.fit +
    c.funny * WEIGHTS.funny +
    c.truthful * WEIGHTS.truthful +
    c.surprising * WEIGHTS.surprising +
    c.instant * WEIGHTS.instant
  );
}

function pick(): Candidate {
  let best = CANDIDATES[0];
  for (const c of CANDIDATES.slice(1)) {
    const s = score(c);
    const b = score(best);
    // Tie-break: the shorter word lands faster, so it wins ties.
    if (s > b || (s === b && c.word.length < best.word.length)) best = c;
  }
  return best;
}

function outputDir(): string {
  // The grader provides /output; a local run falls back to ./output.
  for (const dir of ["/output", join(process.cwd(), "output")]) {
    try {
      mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      // Not writable here — try the next one.
    }
  }
  throw new Error("no writable output directory");
}

const winner = pick();

// Self-check against the gate: the entry must be one word, 1–20
// characters of UTF-8 text, not only white space.
if (
  !/^[A-Za-z]+$/.test(winner.word) ||
  winner.word.length < 1 ||
  winner.word.length > 20 ||
  winner.word.trim().length === 0
) {
  throw new Error(`winner is not a single word: ${JSON.stringify(winner.word)}`);
}

const file = join(outputDir(), "entry.txt");
writeFileSync(file, winner.word + "\n", "utf8");
chmodSync(file, 0o644);
console.log(winner.word);
