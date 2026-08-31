import { describe, expect, test } from "bun:test";

import { BUILT_IN_MUSIC_GENRES } from "./music-library";

describe("built-in music library", () => {
  test("provides a non-empty playlist for every genre", () => {
    const styles = BUILT_IN_MUSIC_GENRES.map((genre) => genre.style);

    expect(styles.length).toBe(26);
    expect(new Set(styles).size).toBe(styles.length);
    expect(BUILT_IN_MUSIC_GENRES.every((genre) => genre.tracks.length > 0)).toBe(true);
  });
});
