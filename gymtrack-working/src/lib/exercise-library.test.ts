import { describe, expect, test } from "bun:test";
import { renameExerciseLibraryOption } from "./exercise-library";
import type { Exercise } from "./gym-types";

const cableExercise: Exercise = {
  id: "custom-cable",
  name: "Cable Row",
  nameEn: "Cable Row",
  muscleGroup: "גב",
  equipment: "פולי / כבלים",
  equipmentOptions: ["פולי / כבלים"],
  cableGripOptions: ["מאחז משולש"],
  description: "",
  videoUrl: "",
  images: [],
  notes: "",
};

describe("exercise library option editing", () => {
  test("renames equipment and carries its image to every saved record", () => {
    const updated = renameExerciseLibraryOption(
      {
        ...cableExercise,
        equipment: "מוט",
        equipmentOptions: ["מוט", "מכונה"],
        equipmentImages: { מוט: "https://example.com/barbell.jpg" },
      },
      "equipment",
      "מוט",
      "מוט אולימפי",
      "https://example.com/olympic-bar.jpg",
    );

    expect(updated.equipment).toBe("מוט אולימפי");
    expect(updated.equipmentOptions).toEqual(["מוט אולימפי", "מכונה"]);
    expect(updated.equipmentImages).toEqual({
      "מוט אולימפי": "https://example.com/olympic-bar.jpg",
    });
  });

  test("renames a grip and keeps cable image metadata aligned", () => {
    const updated = renameExerciseLibraryOption(
      {
        ...cableExercise,
        cableGripImages: { "מאחז משולש": "https://example.com/triangle.jpg" },
      },
      "grip",
      "מאחז משולש",
      "מאחז V",
      "",
    );

    expect(updated.cableGripOptions).toEqual(["מאחז V"]);
    expect(updated.cableGripImages).toEqual({
      "מאחז V": "https://example.com/triangle.jpg",
    });
  });
});