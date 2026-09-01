import { CABLE_GRIPS, type Exercise } from "./gym-types";

type SeedNameMigration = { from: string; to: string };

/** Canonical Hebrew labels paired with the stable seed IDs. */
const SEED_HEBREW_NAMES: Record<string, string> = {
  "ex-bench": "לחיצת חזה כנגד מוט",
  "ex-squat": "סקוואט כנגד מוט",
  "ex-row": "חתירה בכבלים בישיבה",
  "ex-curl": "כפיפת מרפקים עם משקוליות",
  "ex-hipthrust": "דחיקת אגן כנגד מוט",
  "ex-plank": "פלאנק",
  "ex-ohp": "לחיצת כתפיים בעמידה כנגד מוט",
  "ex-rdl": "דדליפט רומני",
  "ex-incline-bench": "לחיצת חזה בשיפוע כנגד מוט",
  "ex-db-press": "לחיצת חזה כנגד משקוליות",
  "ex-cable-fly": "קרוס אובר בכבלים",
  "ex-chest-press": "לחיצת חזה במכונה",
  "ex-pullup": "מתח",
  "ex-lat-pulldown": "משיכת פולי עליון",
  "ex-db-row": "חתירה ביד אחת כנגד משקולית",
  "ex-face-pull": "משיכת חבל לפנים",
  "ex-lateral-raise": "הרחקת כתפיים לצדדים",
  "ex-rear-delt-machine": "פשיטת כתף אחורית במכונה",
  "ex-triceps-pushdown": "פשיטת מרפקים בפולי",
  "ex-triceps-extension": "פשיטת מרפקים מעל הראש",
  "ex-leg-press": "לחיצת רגליים במכונה",
  "ex-leg-extension": "פשיטת ברך במכונה",
  "ex-leg-curl": "כפיפת ברך במכונה",
  "ex-bulgarian-split": "סקוואט בולגרי",
  "ex-glute-kickback": "בעיטת ישבן בכבל",
  "ex-calf-raise": "עליות תאומים בעמידה",
  "ex-hanging-knee-raise": "הרמת ברכיים בתלייה",
  "ex-dead-bug": "דד באג",
  "ex-wrist-curl": "כפיפת שורש כף היד",
  "ex-shrug": "משיכת כתפיים כנגד משקוליות",
  "ex-back-extension": "פשיטת גב על ספסל",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  Barbell: "מוט",
  Dumbbells: "משקוליות יד",
  Cable: "פולי / כבלים",
  Machine: "מכונה",
  Bodyweight: "משקל גוף",
};

export const SEED_EXERCISE_NAME_MIGRATIONS: Record<string, SeedNameMigration> = {
  "ex-bench": { from: "לחיצת חזה כנגד מוט", to: "Barbell Bench Press" },
  "ex-squat": { from: "סקואט כנגד מוט (Back Squat)", to: "Barbell Back Squat" },
  "ex-row": { from: "חתירה בכבלים בישיבה", to: "Seated Cable Row" },
  "ex-curl": { from: "כפילת מרפקים עם משקוליות", to: "Dumbbell Biceps Curl" },
  "ex-hipthrust": { from: "דחיקת אגן כנגד מוט (Hip Thrust)", to: "Barbell Hip Thrust" },
  "ex-plank": { from: "פלאנק (Plank)", to: "Front Plank" },
  "ex-ohp": { from: "לחיצת כתפיים בעמידה כנגד מוט", to: "Standing Barbell Overhead Press" },
  "ex-rdl": { from: "דדליפט רומני (RDL)", to: "Romanian Deadlift" },
  "ex-incline-bench": { from: "לחיצת חזה בשיפוע כנגד מוט", to: "Incline Barbell Bench Press" },
  "ex-db-press": { from: "לחיצת חזה כנגד משקוליות", to: "Dumbbell Bench Press" },
  "ex-cable-fly": { from: "קרוס אובר בכבלים", to: "Cable Chest Fly" },
  "ex-chest-press": { from: "לחיצת חזה במכונה", to: "Machine Chest Press" },
  "ex-pullup": { from: "מתח כנגד משקל גוף", to: "Pull-Up" },
  "ex-lat-pulldown": { from: "משיכת פולי עליון", to: "Lat Pulldown" },
  "ex-db-row": { from: "חתירה ביד אחת כנגד משקולית", to: "Single-Arm Dumbbell Row" },
  "ex-face-pull": { from: "משיכת חבל לפנים", to: "Cable Face Pull" },
  "ex-lateral-raise": { from: "הרחקת כתפיים לצדדים", to: "Dumbbell Lateral Raise" },
  "ex-rear-delt-machine": { from: "פשיטת כתף אחורית במכונה", to: "Reverse Pec Deck" },
  "ex-triceps-pushdown": { from: "פשיטת מרפקים בפולי", to: "Cable Triceps Pushdown" },
  "ex-triceps-extension": {
    from: "פשיטת מרפקים מעל הראש",
    to: "Overhead Dumbbell Triceps Extension",
  },
  "ex-leg-press": { from: "לחיצת רגליים במכונה", to: "Leg Press" },
  "ex-leg-extension": { from: "פשיטת ברך במכונה", to: "Leg Extension" },
  "ex-leg-curl": { from: "כפיפת ברך במכונה", to: "Seated Leg Curl" },
  "ex-bulgarian-split": { from: "סקוואט בולגרי", to: "Bulgarian Split Squat" },
  "ex-glute-kickback": { from: "בעיטת ישבן בכבל", to: "Cable Glute Kickback" },
  "ex-calf-raise": { from: "עליות תאומים בעמידה", to: "Standing Calf Raise" },
  "ex-hanging-knee-raise": { from: "הרמת ברכיים בתלייה", to: "Hanging Knee Raise" },
  "ex-dead-bug": { from: "דד באג", to: "Dead Bug" },
  "ex-wrist-curl": { from: "כפיפת שורש כף היד", to: "Dumbbell Wrist Curl" },
  "ex-shrug": { from: "משיכת כתפיים כנגד משקוליות", to: "Dumbbell Shrug" },
  "ex-back-extension": { from: "פשיטת גב על ספסל", to: "Back Extension" },
};

export function renameSeedExercise(exercise: Exercise): Exercise {
  const migration = SEED_EXERCISE_NAME_MIGRATIONS[exercise.id];
  const nameEn = migration?.to ?? exercise.nameEn ?? exercise.name;
  const nameHe = SEED_HEBREW_NAMES[exercise.id] ?? exercise.nameHe;
  return migration || nameHe
    ? { ...exercise, name: nameEn, nameEn, ...(nameHe ? { nameHe } : {}) }
    : exercise;
}

export function exerciseDisplayName(
  exercise: Pick<
    Exercise,
    "name" | "nameHe" | "nameEn" | "canonicalName" | "canonicalNameHe"
  >,
): string {
  const hebrew = exercise.canonicalNameHe?.trim() || exercise.nameHe?.trim();
  const english = exercise.canonicalName?.trim() || exercise.nameEn?.trim() || exercise.name?.trim();
  if (hebrew && english && hebrew !== english) return `${hebrew} (${english})`;
  return hebrew || english || "תרגיל";
}

const EQUIPMENT_NAME_WORDS = [
  "barbell",
  "dumbbell",
  "dumbbells",
  "cable",
  "machine",
  "bodyweight",
  "kettlebell",
  "ez bar",
  "ez-bar",
  "parallel bar",
];

const CANONICAL_FAMILY_ALIASES: Record<string, string> = {
  "back squat": "squat",
  "barbell back squat": "squat",
  "barbell hip thrust": "hip thrust",
  "front plank": "plank",
  "seated leg curl": "leg curl",
  "standing calf raise": "calf raise",
  "cable chest fly": "chest fly",
};

function stripEquipmentFromName(value: string): string {
  let result = value.trim();
  for (const word of EQUIPMENT_NAME_WORDS) {
    result = result.replace(new RegExp(`\\b${word}\\b`, "gi"), " ");
  }
  return result.replace(/\s+/g, " ").replace(/^[\s-]+|[\s-]+$/g, "").trim();
}

function stripHebrewEquipmentFromName(value: string): string {
  return value
    .trim()
    .replace(
      /(?:\s+(?:כנגד|עם|ב|ב)?\s*(?:מוט(?:\s+W)?|משקוליות(?:\s+יד)?|משקולות|כבלים?|פולי|מכונה|קטלבל|משקל גוף))+$/u,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function mergeStringLists(...lists: Array<string[] | undefined>): string[] {
  return Array.from(
    new Set(lists.flatMap((list) => list ?? []).map((value) => value.trim()).filter(Boolean)),
  );
}

function mergeText(first: string, second: string): string {
  const values = [first.trim(), second.trim()].filter(Boolean);
  return Array.from(new Set(values)).join("\n");
}

function mergeImageMaps(
  ...maps: Array<Record<string, string> | undefined>
): Record<string, string> | undefined {
  const merged: Record<string, string> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map ?? {})) {
      if (value.trim() && !merged[key]) merged[key] = value.trim();
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function exerciseFamilyKey(exercise: Pick<Exercise, "name" | "nameEn">): string {
  const source = exercise.nameEn?.trim() || exercise.name.trim();
  const stripped = stripEquipmentFromName(source).toLocaleLowerCase("en");
  return (CANONICAL_FAMILY_ALIASES[stripped] ?? stripped).replace(/[^a-z0-9]+/g, "");
}

export function exerciseEquipmentOptions(exercise: Pick<Exercise, "equipment" | "equipmentOptions">) {
  return Array.from(
    new Set(
      (exercise.equipmentOptions?.length ? exercise.equipmentOptions : [exercise.equipment])
        .map((option) => option.trim())
        .filter(Boolean),
    ),
  );
}

export function exerciseGripOptions(
  exercise: Pick<Exercise, "cableGripOptions">,
): string[] {
  return Array.from(new Set([...(exercise.cableGripOptions ?? []), ...CABLE_GRIPS]));
}

/**
 * Keep legacy IDs stable while presenting equipment variants as one movement
 * in pickers and the catalog. The first record remains the navigation target;
 * its metadata is enriched with the available equipment choices.
 */
export function uniqueCanonicalExercises(exercises: Exercise[]): Exercise[] {
  const byFamily = new Map<string, Exercise>();
  for (const exercise of exercises) {
    const key = exerciseFamilyKey(exercise);
    const existing = byFamily.get(key);
    const canonicalName =
      existing?.canonicalName ||
      stripEquipmentFromName(exercise.nameEn?.trim() || exercise.name.trim());
    const canonicalNameHe =
      existing?.canonicalNameHe ||
      (exercise.nameHe ? stripHebrewEquipmentFromName(exercise.nameHe) : undefined);
    if (!existing) {
      byFamily.set(key, {
        ...exercise,
        canonicalName,
        ...(canonicalNameHe ? { canonicalNameHe } : {}),
        equipmentOptions: exerciseEquipmentOptions(exercise),
        ...(exercise.equipmentImages ? { equipmentImages: exercise.equipmentImages } : {}),
        cableGripOptions: exercise.cableGripOptions?.length
          ? exerciseGripOptions(exercise)
          : undefined,
        ...(exercise.cableGripImages ? { cableGripImages: exercise.cableGripImages } : {}),
      });
      continue;
    }
    const mergedCableGripOptions =
      existing.cableGripOptions?.length || exercise.cableGripOptions?.length
        ? exerciseGripOptions({
            cableGripOptions: [
              ...(existing.cableGripOptions ?? []),
              ...(exercise.cableGripOptions ?? []),
            ],
          })
        : undefined;
    byFamily.set(key, {
      ...existing,
      muscleGroups: mergeStringLists(
        existing.muscleGroups ?? [existing.muscleGroup],
        exercise.muscleGroups ?? [exercise.muscleGroup],
      ),
      secondaryMuscles: mergeStringLists(existing.secondaryMuscles, exercise.secondaryMuscles),
      approvedSubstitutes: mergeStringLists(
        existing.approvedSubstitutes,
        exercise.approvedSubstitutes,
      ),
      equipmentOptions: Array.from(
        new Set([...exerciseEquipmentOptions(existing), ...exerciseEquipmentOptions(exercise)]),
      ),
      ...(mergeImageMaps(existing.equipmentImages, exercise.equipmentImages)
        ? {
            equipmentImages: mergeImageMaps(existing.equipmentImages, exercise.equipmentImages),
          }
        : {}),
      videoUrls: mergeStringLists(existing.videoUrls, exercise.videoUrls),
      images: mergeStringLists(existing.images, exercise.images),
      description: mergeText(existing.description, exercise.description),
      instructions: mergeText(existing.instructions ?? "", exercise.instructions ?? ""),
      notes: mergeText(existing.notes, exercise.notes),
      tips: mergeText(existing.tips ?? "", exercise.tips ?? ""),
      ...(existing.videoUrl || exercise.videoUrl
        ? { videoUrl: existing.videoUrl || exercise.videoUrl }
        : {}),
      ...(existing.videoMaleUrl || exercise.videoMaleUrl
        ? { videoMaleUrl: existing.videoMaleUrl || exercise.videoMaleUrl }
        : {}),
      ...(existing.videoFemaleUrl || exercise.videoFemaleUrl
        ? { videoFemaleUrl: existing.videoFemaleUrl || exercise.videoFemaleUrl }
        : {}),
      ...(mergedCableGripOptions ? { cableGripOptions: mergedCableGripOptions } : {}),
      ...(mergeImageMaps(existing.cableGripImages, exercise.cableGripImages)
        ? {
            cableGripImages: mergeImageMaps(
              existing.cableGripImages,
              exercise.cableGripImages,
            ),
          }
        : {}),
    });
  }
  return Array.from(byFamily.values());
}

/** Add canonical labels and merged equipment choices without removing legacy IDs. */
export function canonicalizeExerciseRecords(exercises: Exercise[]): Exercise[] {
  const representatives = uniqueCanonicalExercises(exercises);
  const byFamily = new Map(representatives.map((exercise) => [exerciseFamilyKey(exercise), exercise]));
  return exercises.map((exercise) => {
    const representative = byFamily.get(exerciseFamilyKey(exercise));
    return representative?.canonicalName
      ? {
          ...exercise,
          canonicalName: representative.canonicalName,
          ...(representative.canonicalNameHe
            ? { canonicalNameHe: representative.canonicalNameHe }
            : {}),
          equipmentOptions: representative.equipmentOptions,
          ...(representative.equipmentImages
            ? { equipmentImages: representative.equipmentImages }
            : {}),
          ...(representative.cableGripOptions
            ? { cableGripOptions: representative.cableGripOptions }
            : {}),
          ...(representative.cableGripImages
            ? { cableGripImages: representative.cableGripImages }
            : {}),
        }
      : exercise;
  });
}

const makeExercise = (
  id: string,
  name: string,
  muscleGroup: string,
  equipment: string,
  description: string,
  _instructions: string,
  category = "מורכב",
): Exercise => ({
  id,
  name,
  nameEn: name,
  muscleGroup,
  muscleGroups: [muscleGroup],
  secondaryMuscles: [],
  category,
  equipment: EQUIPMENT_LABELS[equipment] ?? equipment,
  description,
  instructions: _instructions,
  videoUrl: "",
  images: [],
  notes: "",
  tips: "",
});

const ADDITIONAL_HEBREW_NAMES: Record<string, string> = {
  "ex-cable-pullover": "משיכת פולי בידיים ישרות",
  "ex-chest-supported-row": "חתירה עם משקוליות בתמיכת חזה",
  "ex-tbar-row": "חתירת T",
  "ex-incline-db-press": "לחיצת חזה בשיפוע עם משקוליות",
  "ex-pushup": "שכיבות סמיכה",
  "ex-dips": "מקבילים",
  "ex-arnold-press": "לחיצת ארנולד",
  "ex-front-raise": "הרמה קדמית עם משקוליות",
  "ex-reverse-fly": "הרחקה אופקית עם משקוליות",
  "ex-hammer-curl": "כפיפת מרפקים פטיש",
  "ex-preacher-curl": "כפיפת מרפקים בכיסא כומר",
  "ex-skull-crusher": "פשיטת מרפקים בשכיבה",
  "ex-goblet-squat": "סקוואט גביע",
  "ex-front-squat": "סקוואט קדמי",
  "ex-walking-lunge": "לאנג׳ בהליכה",
  "ex-step-up": "עלייה למדרגה עם משקוליות",
  "ex-sumo-deadlift": "דדליפט סומו",
  "ex-glute-bridge": "גשר ישבן",
  "ex-seated-calf": "הרמת תאומים בישיבה",
  "ex-cable-woodchop": "חיתוך עץ בכבל",
  "ex-side-plank": "פלאנק צידי",
  "ex-bird-dog": "בירד דוג",
  "ex-mountain-climber": "טיפוס הרים",
  "ex-kettlebell-swing": "הנפת קטלבל",
  "ex-battle-rope": "גלי חבל קרב",
  "ex-jumping-jack": "קפיצות פישוק",
  "ex-hip-flexor-stretch": "מתיחת כופפי ירך בכריעה",
  "ex-worlds-greatest-stretch": "המתיחה הגדולה בעולם",
  "ex-target-hip-thrust": "דחיקת אגן",
  "ex-target-reverse-lunge": "לאנג׳ אחורי",
  "ex-target-step-up": "עלייה למדרגה",
  "ex-target-cable-pull-through": "משיכת כבל בין הרגליים",
  "ex-target-kickback": "בעיטת ישבן",
  "ex-target-sumo-squat": "סקוואט סומו",
  "ex-target-single-leg-hip-thrust": "דחיקת אגן על רגל אחת",
  "ex-target-frog-pumps": "פמפומי צפרדע",
  "ex-target-single-leg-deadlift": "דדליפט על רגל אחת",
  "ex-target-hip-abduction-medius": "הרחקת ירך",
  "ex-target-hip-abduction-minimus": "הרחקת ירך",
  "ex-target-good-morning": "בוקר טוב",
  "ex-target-leg-curl": "כפיפת ברך",
  "ex-target-squat": "סקוואט",
  "ex-target-forward-lunge": "לאנג׳ קדמי",
  "ex-target-calf-raise": "הרמת תאומים",
  "ex-target-russian-twist": "סיבוב רוסי",
  "ex-target-bicycle-crunch": "כפיפות אופניים",
  "ex-target-crunch": "כפיפת בטן",
  "ex-target-cable-crunch": "כפיפת בטן בכבל",
  "ex-target-plank": "פלאנק",
};

export const ADDITIONAL_EXERCISES: Exercise[] = [
  makeExercise(
    "ex-cable-pullover",
    "Straight-Arm Cable Pulldown",
    "גב רחב",
    "פולי / כבלים",
    "Pull the cable down in a wide arc while keeping the arms nearly straight.",
    "Brace the ribs, hinge slightly at the hips, and move from the shoulders without swinging.",
    "עזר",
  ),
  makeExercise(
    "ex-chest-supported-row",
    "Chest-Supported Dumbbell Row",
    "גב",
    "משקוליות יד",
    "Row dumbbells from a supported bench position to build the upper back.",
    "Keep the chest on the bench and pull the elbows toward the hips.",
  ),
  makeExercise(
    "ex-tbar-row",
    "T-Bar Row",
    "גב",
    "מוט",
    "Row the bar toward the torso while maintaining a strong neutral back.",
    "Hinge at the hips, keep the spine long, and pause briefly at the top.",
  ),
  makeExercise(
    "ex-incline-db-press",
    "Incline Dumbbell Press",
    "חזה עליון",
    "משקוליות יד",
    "Press dumbbells from an inclined bench to emphasize the upper chest.",
    "Set the shoulder blades, lower with control, and press without locking the elbows hard.",
  ),
  makeExercise(
    "ex-pushup",
    "Push-Up",
    "חזה",
    "משקל גוף",
    "Lower and press the body as one unit from a stable plank position.",
    "Keep the hands under the shoulders and maintain a straight line from head to heels.",
  ),
  makeExercise(
    "ex-dips",
    "Parallel Bar Dips",
    "חזה",
    "משקל גוף",
    "Lower and press the body between parallel bars using the chest and triceps.",
    "Keep the shoulders down and use a comfortable depth without forcing the range.",
  ),
  makeExercise(
    "ex-arnold-press",
    "Arnold Press",
    "כתפיים",
    "משקוליות יד",
    "Rotate dumbbells while pressing overhead through a smooth shoulder movement.",
    "Keep the ribs stacked over the pelvis and control the rotation in both directions.",
  ),
  makeExercise(
    "ex-front-raise",
    "Dumbbell Front Raise",
    "כתף קדמית",
    "משקוליות יד",
    "Raise the dumbbells in front of the body to shoulder height.",
    "Use light weight, soft elbows, and no momentum from the torso.",
    "בידוד",
  ),
  makeExercise(
    "ex-reverse-fly",
    "Dumbbell Reverse Fly",
    "כתף אחורית",
    "משקוליות יד",
    "Open the arms from a hinged position to train the rear deltoids and upper back.",
    "Keep the neck relaxed and lead the movement with the elbows.",
    "בידוד",
  ),
  makeExercise(
    "ex-hammer-curl",
    "Hammer Curl",
    "ביצפס (יד קדמית)",
    "משקוליות יד",
    "Curl dumbbells with a neutral grip to train the biceps and forearms.",
    "Keep the palms facing inward and the elbows close to the ribs.",
    "בידוד",
  ),
  makeExercise(
    "ex-preacher-curl",
    "Preacher Curl",
    "ביצפס (יד קדמית)",
    "מכונה",
    "Curl from a supported arm position with a controlled stretch at the bottom.",
    "Keep the upper arms planted and stop before the elbows lock out.",
    "בידוד",
  ),
  makeExercise(
    "ex-skull-crusher",
    "EZ-Bar Skull Crusher",
    "טריצפס (יד אחורית)",
    "מוט W / EZ",
    "Lower an EZ-bar toward the forehead and extend the elbows to train the triceps.",
    "Keep the upper arms mostly still and use a controlled range of motion.",
    "בידוד",
  ),
  makeExercise(
    "ex-goblet-squat",
    "Goblet Squat",
    "ארבע ראשי",
    "קטלבל",
    "Squat while holding a kettlebell close to the chest.",
    "Keep the chest tall, knees tracking over the toes, and feet grounded.",
  ),
  makeExercise(
    "ex-front-squat",
    "Front Squat",
    "ארבע ראשי",
    "מוט",
    "Squat with the bar in front of the shoulders to challenge the quads and core.",
    "Keep the elbows high and descend with a braced, upright torso.",
  ),
  makeExercise(
    "ex-walking-lunge",
    "Walking Lunge",
    "ישבן",
    "משקל גוף",
    "Step forward into alternating lunges while maintaining balance and control.",
    "Take a long enough step for the front knee to stay aligned with the foot.",
  ),
  makeExercise(
    "ex-step-up",
    "Dumbbell Step-Up",
    "ישבן",
    "משקוליות יד",
    "Step onto a stable platform using one leg at a time.",
    "Drive through the whole foot on the platform and avoid pushing off the trailing leg.",
  ),
  makeExercise(
    "ex-sumo-deadlift",
    "Sumo Deadlift",
    "ישבן",
    "מוט",
    "Lift the bar from a wide stance with the hips and legs working together.",
    "Keep the bar close, brace before lifting, and finish tall without leaning back.",
  ),
  makeExercise(
    "ex-glute-bridge",
    "Glute Bridge",
    "ישבן",
    "משקל גוף",
    "Raise the hips from the floor while squeezing the glutes at the top.",
    "Keep the ribs down and avoid arching the lower back.",
    "בידוד",
  ),
  makeExercise(
    "ex-seated-calf",
    "Seated Calf Raise",
    "תאומים",
    "מכונה",
    "Lift and lower the heels from a seated position to train the calf muscles.",
    "Use a full comfortable range and pause at the top.",
    "בידוד",
  ),
  makeExercise(
    "ex-cable-woodchop",
    "Cable Wood Chop",
    "אלכסונים",
    "פולי / כבלים",
    "Rotate the cable diagonally across the body with control.",
    "Move through the torso while keeping the hips stable and the spine long.",
    "עזר",
  ),
  makeExercise(
    "ex-side-plank",
    "Side Plank",
    "אלכסונים",
    "משקל גוף",
    "Hold a straight side-facing position using the obliques and lateral core.",
    "Stack the shoulders and hips, and keep the body in one long line.",
    "בידוד",
  ),
  makeExercise(
    "ex-bird-dog",
    "Bird Dog",
    "בטן",
    "משקל גוף",
    "Extend the opposite arm and leg from an all-fours position.",
    "Keep the hips level and move slowly without rotating the torso.",
    "בידוד",
  ),
  makeExercise(
    "ex-mountain-climber",
    "Mountain Climber",
    "אירובי",
    "משקל גוף",
    "Alternate driving the knees toward the chest from a strong plank.",
    "Keep the shoulders over the hands and choose a pace that preserves alignment.",
    "אירובי",
  ),
  makeExercise(
    "ex-kettlebell-swing",
    "Kettlebell Swing",
    "גוף מלא",
    "קטלבל",
    "Use a powerful hip hinge to swing the kettlebell to chest height.",
    "Snap the hips forward, keep the arms relaxed, and do not squat the swing.",
  ),
  makeExercise(
    "ex-battle-rope",
    "Battle Rope Waves",
    "גוף מלא",
    "אחר",
    "Create alternating rope waves while maintaining a stable athletic stance.",
    "Brace the core, keep the shoulders relaxed, and work at a repeatable pace.",
    "אירובי",
  ),
  makeExercise(
    "ex-jumping-jack",
    "Jumping Jack",
    "אירובי",
    "משקל גוף",
    "Jump while opening and closing the arms and legs in a steady rhythm.",
    "Land softly with knees slightly bent and select a low-impact version when needed.",
    "אירובי",
  ),
  makeExercise(
    "ex-hip-flexor-stretch",
    "Half-Kneeling Hip Flexor Stretch",
    "כופפי הירך",
    "משקל גוף",
    "Stretch the front of the hip from a half-kneeling position.",
    "Tuck the pelvis gently and shift forward without arching the lower back.",
    "גמישות / ניעות",
  ),
  makeExercise(
    "ex-worlds-greatest-stretch",
    "World's Greatest Stretch",
    "גוף מלא",
    "משקל גוף",
    "Flow through a lunge, rotation, and hamstring stretch to improve mobility.",
    "Move slowly, breathe continuously, and stay within a comfortable range.",
    "גמישות / ניעות",
  ),
  makeExercise(
    "ex-target-hip-thrust",
    "Hip Thrust",
    "GLUTEUS MAXIMUS",
    "Barbell",
    "Drive the hips upward from a supported position while squeezing the glutes.",
    "Keep the ribs down, chin tucked, and finish with the hips fully extended without arching the back.",
  ),
  makeExercise(
    "ex-target-reverse-lunge",
    "Reverse Lunge",
    "GLUTEUS MAXIMUS",
    "Dumbbells",
    "Step backward into a controlled lunge and return through the front leg.",
    "Keep the front foot grounded and lower straight down while the front knee tracks over the toes.",
  ),
  makeExercise(
    "ex-target-step-up",
    "Step Up",
    "GLUTEUS MAXIMUS",
    "Dumbbells",
    "Step onto a stable platform and stand tall using one leg at a time.",
    "Drive through the whole foot on the platform and control the step back down.",
  ),
  makeExercise(
    "ex-target-cable-pull-through",
    "Cable Pull Through",
    "GLUTEUS MAXIMUS",
    "Cable",
    "Hinge at the hips and extend them forward against the cable resistance.",
    "Keep the cable between the legs, spine neutral, and squeeze the glutes at lockout.",
    "עזר",
  ),
  makeExercise(
    "ex-target-kickback",
    "Kickback",
    "GLUTEUS MAXIMUS",
    "Cable",
    "Extend one leg backward against cable resistance to train the glutes.",
    "Keep the pelvis square and move from the hip without arching the lower back.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-sumo-squat",
    "Sumo Squat",
    "GLUTEUS MAXIMUS",
    "Dumbbell",
    "Squat from a wide stance with the toes turned slightly outward.",
    "Keep the chest tall, knees tracking with the toes, and descend only as far as control allows.",
  ),
  makeExercise(
    "ex-target-single-leg-hip-thrust",
    "Single Leg Hip Thrust",
    "GLUTEUS MAXIMUS",
    "Bodyweight",
    "Extend the hips from a supported position using one leg at a time.",
    "Keep the pelvis level and pause at the top while squeezing the working glute.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-frog-pumps",
    "Frog Pumps",
    "GLUTEUS MAXIMUS",
    "Bodyweight",
    "Press the hips upward from a frog-leg position to isolate the glutes.",
    "Keep the soles together, ribs down, and use a controlled squeeze at the top.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-single-leg-deadlift",
    "Single Leg Deadlift",
    "GLUTEUS MAXIMUS",
    "Dumbbell",
    "Hinge on one leg while reaching the free leg backward and lowering the weight.",
    "Keep the hips square, spine long, and return to standing through the grounded foot.",
  ),
  makeExercise(
    "ex-target-hip-abduction-medius",
    "Hip Abduction",
    "GLUTEUS MEDIUS",
    "Machine",
    "Move the legs outward against resistance to strengthen the side glutes.",
    "Keep the torso stable and use a controlled range without bouncing.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-hip-abduction-minimus",
    "Hip Abduction",
    "GLUTEUS MINIMUS",
    "Machine",
    "Move the legs outward against resistance with emphasis on the smaller lateral glute.",
    "Stay tall, control the return, and avoid using momentum.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-good-morning",
    "Good Morning",
    "HAMSTRINGS",
    "Barbell",
    "Hinge forward from the hips with the bar supported across the upper back.",
    "Keep a soft knee bend, neutral spine, and stop when the hamstrings reach a controlled stretch.",
  ),
  makeExercise(
    "ex-target-leg-curl",
    "Leg Curl",
    "HAMSTRINGS",
    "Machine",
    "Curl the heels toward the body against machine resistance.",
    "Keep the hips stable and lower the weight slowly through the full comfortable range.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-squat",
    "Squat",
    "QUADRICEPS",
    "Barbell",
    "Squat down and stand through the whole foot while keeping the torso braced.",
    "Track the knees with the toes and keep the spine neutral throughout the movement.",
  ),
  makeExercise(
    "ex-target-forward-lunge",
    "Forward Lunge",
    "QUADRICEPS",
    "Dumbbells",
    "Step forward into a lunge and push back to the starting stance.",
    "Keep the front knee aligned with the foot and lower under control.",
  ),
  makeExercise(
    "ex-target-calf-raise",
    "Calf Raise",
    "CALVES",
    "Machine",
    "Rise onto the balls of the feet and lower the heels with control.",
    "Pause at the top and use a full comfortable range without bouncing.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-russian-twist",
    "Russian Twist",
    "OBLIQUES",
    "Bodyweight",
    "Rotate the torso from side to side while seated with the core braced.",
    "Keep the chest lifted and rotate through the trunk rather than swinging the arms.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-bicycle-crunch",
    "Bicycle Crunch",
    "OBLIQUES",
    "Bodyweight",
    "Alternate bringing the opposite elbow and knee together in a controlled crunch.",
    "Keep the lower back supported and extend the unused leg without rushing.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-crunch",
    "Crunch",
    "UPPER ABS",
    "Bodyweight",
    "Curl the upper back from the floor using the abdominal muscles.",
    "Keep the neck relaxed, ribs moving toward the pelvis, and avoid pulling on the head.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-cable-crunch",
    "Cable Crunch",
    "UPPER ABS",
    "Cable",
    "Flex the spine downward against a cable while keeping the hips mostly still.",
    "Brace the abs, bring the ribs toward the pelvis, and return slowly.",
    "בידוד",
  ),
  makeExercise(
    "ex-target-plank",
    "Plank",
    "CORE",
    "Bodyweight",
    "Hold a strong straight-line position supported by the forearms and toes.",
    "Brace the abdomen, squeeze the glutes, and keep the hips from sinking or lifting.",
    "בידוד",
  ),
].map((exercise) => ({
  ...exercise,
  ...(ADDITIONAL_HEBREW_NAMES[exercise.id] ? { nameHe: ADDITIONAL_HEBREW_NAMES[exercise.id] } : {}),
}));
