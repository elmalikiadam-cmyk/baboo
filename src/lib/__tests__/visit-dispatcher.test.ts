import { describe, it, expect } from "vitest";
import { rankAgentCandidates } from "../visit-dispatcher";

describe("rankAgentCandidates", () => {
  it("trie d'abord par charge croissante", () => {
    const ranked = rankAgentCandidates([
      { userId: "a", load: 5, avgRating: 4.9, raw: "a" },
      { userId: "b", load: 1, avgRating: 3.0, raw: "b" },
      { userId: "c", load: 3, avgRating: 4.5, raw: "c" },
    ]);
    expect(ranked.map((r) => r.userId)).toEqual(["b", "c", "a"]);
  });

  it("départage par rating descendant à charge égale", () => {
    const ranked = rankAgentCandidates([
      { userId: "a", load: 2, avgRating: 4.0, raw: "a" },
      { userId: "b", load: 2, avgRating: 4.7, raw: "b" },
      { userId: "c", load: 2, avgRating: 3.5, raw: "c" },
    ]);
    expect(ranked.map((r) => r.userId)).toEqual(["b", "a", "c"]);
  });

  it("traite avgRating null comme 0", () => {
    const ranked = rankAgentCandidates([
      { userId: "a", load: 0, avgRating: null, raw: "a" },
      { userId: "b", load: 0, avgRating: 4.5, raw: "b" },
    ]);
    expect(ranked[0]!.userId).toBe("b");
  });

  it("ne mute pas le tableau d'entrée", () => {
    const input = [
      { userId: "a", load: 5, avgRating: 4.9, raw: "a" },
      { userId: "b", load: 1, avgRating: 3.0, raw: "b" },
    ];
    const snapshot = JSON.stringify(input);
    rankAgentCandidates(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("renvoie un tableau vide pour une entrée vide", () => {
    expect(rankAgentCandidates([])).toEqual([]);
  });
});
