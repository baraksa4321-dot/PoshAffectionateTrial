-- ===================================================
-- 03_seed.sql: Built-in Exercises & Israeli Foods Seed
-- ===================================================

-- 1. Seed Built-in Exercises
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-bench', 'לחיצת חזה כנגד מוט', NULL, 'חזה', 'מוט', 'מורכב', 'שכב על ספה שטוחה, אחוז במוט ברוחב מעט רחב מהכתפיים, הורד אל מרכז החזה ולחץ כלפי מעלה.', 'שמור על שכמות צמודות, כפות רגליים יציבות על הרצפה וקשת קלה בגב התחתון.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-squat', 'סקואט כנגד מוט (Back Squat)', NULL, 'ארבע ראשי', 'מוט', 'מורכב', 'הנח את המוט על הגב העליון, רד עם האגן אחורה ולמטה עד זווית 90 מעלות לפחות ולחץ חזרה מעלה.', 'שמור על חזה מורם וברכיים בקו אחד עם כפות הרגליים.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-row', 'חתירה בכבלים בישיבה', NULL, 'גב', 'פולי / כבלים', 'מורכב', 'שב מול הכבל, משוך את הידית לכיוון הטבור והדק את השכמות בסוף התנועה.', 'גב זקוף, מתיחה מלאה קדימה וכיווץ חזק בגב לאחור.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-curl', 'כפילת מרפקים עם משקוליות', NULL, 'ביצפס (יד קדמית)', 'משקוליות יד', 'בידוד', 'עמוד יציב, כפוף את המרפקים והרם את המשקוליות תוך סיבוב קל של כף היד, והורד באיטיות.', 'מרפקים צמודים לצדי הגוף, ללא הנדנוד של הגב.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-hipthrust', 'דחיקת אגן כנגד מוט (Hip Thrust)', NULL, 'ישבן', 'מוט', 'מורכב', 'הנח גב עליון על ספסל, מוט על האגן, הרם את האגן מעלה וכווץ את הישבן בשיא התנועה.', 'מבט קדימה, כיווץ מלא של הישבן בשיא הגובה לשנייה אחת.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-plank', 'פלאנק (Plank)', NULL, 'בטן', 'משקל גוף', 'בידוד', 'החזק גוף ישר על האמות וקצות האצבעות תוך כיווץ חזק של הבטן והישבן.', 'גוף בקו ישר אחד מהראש ועד העקבים.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-ohp', 'לחיצת כתפיים בעמידה כנגד מוט', NULL, 'כתפיים', 'מוט', 'מורכב', 'עמוד יציב, לחץ את המוט מגובה החזה העליון מעלה מעל הראש עד נעילה.', 'בטן מהודקת וישבן מכווץ לשמירה על הגב.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.exercises (id, name, english_name, muscle_group, equipment, category, description, instructions, search_aliases)
VALUES ('ex-rdl', 'דדליפט רומני (RDL)', NULL, 'המסטרינג', 'מוט', 'מורכב', 'אחוז במוט, קח את האגן אחורנית תוך כפיפה קלה בברכיים והורד את המוט לאורך הרגליים.', 'גב ישר לחלוטין, מתיחה חזקה בחלק האחורי של הירכיים.', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  search_aliases = EXCLUDED.search_aliases;

-- 2. Seed Built-in Israeli Foods
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-1', 'חלב 3% - תנובה / שטראוס', NULL, 'חלב', NULL, NULL, NULL, 60, 3.2, 4.7, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-2', 'חלב 1% - תנובה', NULL, 'חלב', NULL, NULL, NULL, 42, 3.3, 4.8, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-3', 'חלב דל לקטוז 2%', NULL, 'חלב', NULL, NULL, NULL, 50, 3.3, 4.7, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-4', 'חלב סויה ללא סוכר - אלפרו', NULL, 'תחליפי חלב', NULL, NULL, NULL, 33, 3.3, 0.2, 1.8, 0.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-5', 'חלב שקדים ללא סוכר', NULL, 'תחליפי חלב', NULL, NULL, NULL, 15, 0.5, 0.2, 1.2, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-6', 'חלב שיבולת שועל - אלפרו', NULL, 'תחליפי חלב', NULL, NULL, NULL, 45, 1, 6.8, 1.5, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-7', 'קוטג'' 5% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 95, 11, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-8', 'קוטג'' 3% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 78, 11.5, 1.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-9', 'קוטג'' 9% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 124, 10.5, 1.5, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-10', 'קוטג'' פרו 12g חלבון', NULL, 'גבינות', NULL, NULL, NULL, 105, 12, 2, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-11', 'גבינה לבנה 5% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 90, 10, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-12', 'גבינה לבנה 3% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 73, 10.2, 1.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-13', 'גבינה לבנה 9% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 120, 9.5, 1.5, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-14', 'גבינה צהובה עמק 28% - תנובה', NULL, 'גבינות קשות', NULL, NULL, NULL, 98, 7, 0.1, 7.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-15', 'גבינה צהובה עמק 15% - תנובה', NULL, 'גבינות קשות', NULL, NULL, NULL, 73, 8.1, 0.1, 4.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-16', 'גבינה צהובה עמק 9% - תנובה', NULL, 'גבינות קשות', NULL, NULL, NULL, 58, 8.8, 0.1, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-17', 'גבינה צהובה גלבוע 22%', NULL, 'גבינות קשות', NULL, NULL, NULL, 85, 7.5, 0.1, 6.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-18', 'גבינת מותרת 5% שומן', NULL, 'גבינות קשות', NULL, NULL, NULL, 50, 9, 0.2, 1.4, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-19', 'גבינת מוצרלה מגוררת', NULL, 'גבינות', NULL, NULL, NULL, 280, 22, 2, 20, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-20', 'גבינת מוצרלה לייט 15%', NULL, 'גבינות', NULL, NULL, NULL, 210, 24, 2, 12, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-21', 'גבינת בולגרית 5% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 110, 15, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-22', 'גבינת בולגרית 16% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 200, 14, 1.5, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-23', 'גבינת פטה עיזים 20%', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 240, 14, 1, 20, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-24', 'גבינת צפתית 5% - תנובה', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 115, 16, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-25', 'לאבנה 9% - פיראוס', NULL, 'גבינות', NULL, NULL, NULL, 130, 9, 3, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-26', 'לאבנה 5%', NULL, 'גבינות', NULL, NULL, NULL, 95, 9.5, 3, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-27', 'גבינת שמנת נפוליאון 25%', NULL, 'גבינות', NULL, NULL, NULL, 260, 6, 3, 25, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-28', 'גבינת שמנת נפוליאון 16%', NULL, 'גבינות', NULL, NULL, NULL, 185, 7, 3.5, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-29', 'יוגורט דנונה 3% ביו', NULL, 'יוגורט', NULL, NULL, NULL, 124, 8, 9.2, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-30', 'יוגורט דנונה 1.5% ביו', NULL, 'יוגורט', NULL, NULL, NULL, 96, 8.4, 9.6, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-31', 'יוגורט דנונה פרו 20g חלבון נקי', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 120, 20, 9, 0.4, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-32', 'יוגורט דנונה פרו 20g תות', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 150, 20, 16, 0.4, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-33', 'יוגורט דנונה פרו 20g וניל', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 148, 20, 15, 0.4, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-34', 'יוגורט דנונה פרו 20g אפרסק', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 152, 20, 16.5, 0.4, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-35', 'יוגורט יווני 7% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 100, 6, 3.5, 7, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-36', 'יוגורט יווני 2% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 62, 8.5, 3.8, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-37', 'יוגורט סקיר Yoplait טבעי', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 65, 11, 4, 0.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-38', 'יוגורט Yoplait Pro 15g', NULL, 'יוגורט חלבון', NULL, NULL, NULL, 110, 15, 11, 0.3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-39', 'מעדן GO 20g חלבון שוקולד', NULL, 'מעדני חלבון', NULL, NULL, NULL, 156, 20, 14, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-40', 'מעדן GO 20g חלבון וניל', NULL, 'מעדני חלבון', NULL, NULL, NULL, 150, 20, 13, 1.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-41', 'מעדן GO 20g חלבון קפה', NULL, 'מעדני חלבון', NULL, NULL, NULL, 152, 20, 13.5, 1.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-42', 'מעדן מילקי שוקולד', NULL, 'מעדנים', NULL, NULL, NULL, 210, 3.2, 24, 11.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-43', 'מעדן מילקי לייט 1%', NULL, 'מעדנים', NULL, NULL, NULL, 115, 4, 18, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-44', 'מעדן דני שוקולד', NULL, 'מעדנים', NULL, NULL, NULL, 135, 3.5, 23, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-45', 'גיל 3% - תנובה', NULL, 'מוצרי חלב', NULL, NULL, NULL, 100, 5.5, 7, 5.1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-46', 'אשל 4.5% - תנובה', NULL, 'מוצרי חלב', NULL, NULL, NULL, 136, 6.2, 8, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-47', 'שמנת חמוצה 15% - תנובה', NULL, 'שמנת', NULL, NULL, NULL, 160, 2.8, 3.5, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-48', 'שמנת חמוצה 9% - תנובה', NULL, 'שמנת', NULL, NULL, NULL, 108, 3.2, 3.8, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-49', 'שמנת מתוקה 38% להקצפה', NULL, 'שמנת', NULL, NULL, NULL, 360, 2, 3, 38, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-50', 'שמנת לבישול 15% - השף הלבן', NULL, 'שמנת', NULL, NULL, NULL, 160, 3, 4, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-51', 'שמנת לבישול 10% - השף הלבן', NULL, 'שמנת', NULL, NULL, NULL, 118, 3.2, 4.2, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-52', 'חמאה שופרסל / תנובה', NULL, 'שומנים', NULL, NULL, NULL, 74, 0.1, 0.1, 8.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-53', 'ריקוטה 5% - גד', NULL, 'גבינות', NULL, NULL, NULL, 100, 11, 3.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-54', 'גבינת חלומי 24%', NULL, 'גבינות', NULL, NULL, NULL, 320, 20, 2, 24, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-55', 'גבינת פרמזן מגוררת', NULL, 'גבינות קשות', NULL, NULL, NULL, 40, 3.8, 0.4, 2.6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-56', 'ביצה S (קטנה)', NULL, 'ביצים', NULL, NULL, NULL, 60, 5.2, 0.4, 4.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-57', 'ביצה M (בינונית)', NULL, 'ביצים', NULL, NULL, NULL, 72, 6.3, 0.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-58', 'ביצה L (גדולה)', NULL, 'ביצים', NULL, NULL, NULL, 85, 7.5, 0.6, 5.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-59', 'ביצה XL (ענקית)', NULL, 'ביצים', NULL, NULL, NULL, 98, 8.7, 0.7, 6.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-60', 'חלבון ביצה (חלבון בלבד)', NULL, 'ביצים', NULL, NULL, NULL, 52, 11, 0.7, 0.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-61', 'חלמון ביצה (חלמון בלבד)', NULL, 'ביצים', NULL, NULL, NULL, 55, 2.7, 0.6, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-62', 'ביצה קשה M', NULL, 'ביצים', NULL, NULL, NULL, 72, 6.3, 0.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-63', 'חזה עוף טרי (נא)', NULL, 'עוף ובשר', NULL, NULL, NULL, 110, 23.5, 0, 1.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-64', 'חזה עוף מבושל / בגריל', NULL, 'עוף ובשר', NULL, NULL, NULL, 165, 31, 0, 3.6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-65', 'פרגית עוף (ירך ללא עור)', NULL, 'עוף ובשר', NULL, NULL, NULL, 175, 24, 0, 8.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-66', 'כרעי עוף עם עור (מבושל)', NULL, 'עוף ובשר', NULL, NULL, NULL, 235, 24, 0, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-67', 'כנפי עוף בגריל', NULL, 'עוף ובשר', NULL, NULL, NULL, 220, 22, 0, 14.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-68', 'שוקי עוף ללא עור', NULL, 'עוף ובשר', NULL, NULL, NULL, 160, 26, 0, 5.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-69', 'כבד עוף צלוי', NULL, 'עוף ובשר', NULL, NULL, NULL, 165, 24.5, 1, 6.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-70', 'בשר בקר טחון רזה 5% שומן', NULL, 'בקר', NULL, NULL, NULL, 135, 21, 0, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-71', 'בשר בקר טחון 12% שומן', NULL, 'בקר', NULL, NULL, NULL, 185, 19.5, 0, 12, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-72', 'בשר בקר טחון קלאסי 20%', NULL, 'בקר', NULL, NULL, NULL, 250, 17.5, 0, 20, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-73', 'סטייק אנטרקוט בגריל', NULL, 'בקר', NULL, NULL, NULL, 270, 25, 0, 19, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-74', 'סטייק סינטה בקר', NULL, 'בקר', NULL, NULL, NULL, 170, 27, 0, 6.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-75', 'סטייק שייטל בקר', NULL, 'בקר', NULL, NULL, NULL, 155, 28, 0, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-76', 'כתף בקר מס'' 5 מבושל', NULL, 'בקר', NULL, NULL, NULL, 180, 26, 0, 8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-77', 'צלי כתף מס'' 4', NULL, 'בקר', NULL, NULL, NULL, 195, 25, 0, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-78', 'חזה הודו טרי', NULL, 'הודו', NULL, NULL, NULL, 105, 24, 0, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-79', 'חזה הודו מבושל', NULL, 'הודו', NULL, NULL, NULL, 145, 30, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-80', 'שווארמה הודו נקבה', NULL, 'הודו', NULL, NULL, NULL, 160, 25, 0, 6.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-81', 'פסטרמה חזה הודו דלת שומן 1%', NULL, 'נקניקים', NULL, NULL, NULL, 95, 18, 2, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-82', 'פסטרמה בדבש 2%', NULL, 'נקניקים', NULL, NULL, NULL, 105, 17, 4, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-83', 'פסטרמה מעושנת 3%', NULL, 'נקניקים', NULL, NULL, NULL, 110, 17, 2.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-84', 'נקניק סלמי איטלקי', NULL, 'נקניקים', NULL, NULL, NULL, 380, 16, 1.5, 34, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-85', 'נקניקיות עוף - זוגלובק', NULL, 'נקניקיות', NULL, NULL, NULL, 95, 4.5, 2.5, 7.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-86', 'נקניקיות ביס עוף', NULL, 'נקניקיות', NULL, NULL, NULL, 240, 11, 6, 19, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-87', 'המבורגר בקר קפוא (שמיר/טיבון)', NULL, 'מוצרים קפואים', NULL, NULL, NULL, 240, 16, 2, 19, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-88', 'שניצל עוף ביתי מצופה פירורים', NULL, 'עוף ובשר', NULL, NULL, NULL, 260, 22, 18, 11, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-89', 'שניצל עוף מוכן קפוא (מאמא עוף)', NULL, 'מוצרים קפואים', NULL, NULL, NULL, 220, 14, 16, 11, 0.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-90', 'קופסת טונה במים (מסונן)', NULL, 'דגים', NULL, NULL, NULL, 120, 26, 0, 1.2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-91', 'קופסת טונה בשמן צמחי (מסונן)', NULL, 'דגים', NULL, NULL, NULL, 190, 25, 0, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-92', 'טונה בשמן זית (מסונן)', NULL, 'דגים', NULL, NULL, NULL, 200, 25, 0, 11, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-93', 'פילה סלמון טרי (נא)', NULL, 'דגים', NULL, NULL, NULL, 208, 20, 0, 13, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-94', 'פילה סלמון בתנור', NULL, 'דגים', NULL, NULL, NULL, 230, 23, 0, 14.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-95', 'סלמון מעושן (סלמון מעושן פרוס)', NULL, 'דגים', NULL, NULL, NULL, 180, 22, 0, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-96', 'פילה אמנון (מושט) בתנור', NULL, 'דגים', NULL, NULL, NULL, 128, 23, 0, 3.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-97', 'פילה דניס בתנור', NULL, 'דגים', NULL, NULL, NULL, 160, 20, 0, 8.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-98', 'פילה לברק בתנור', NULL, 'דגים', NULL, NULL, NULL, 145, 21, 0, 6.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-99', 'סרדינים בשמן (מקופסה)', NULL, 'דגים', NULL, NULL, NULL, 210, 24, 0, 12, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-100', 'מקרל מעושן', NULL, 'דגים', NULL, NULL, NULL, 260, 20, 0, 20, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-101', 'פילה נסיכת הנילוס', NULL, 'דגים', NULL, NULL, NULL, 95, 19, 0, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-102', 'קוד / סול אפוי', NULL, 'דגים', NULL, NULL, NULL, 90, 19, 0, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-103', 'אצבעות דג מצופות (דגיתון)', NULL, 'דגים', NULL, NULL, NULL, 210, 12, 18, 10, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-104', 'אדממה / Edamame (תרמילי סויה)', NULL, 'קטניות', NULL, NULL, NULL, 121, 11.9, 8.9, 5.2, 5.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-105', 'אדממה קלוף קפוא', NULL, 'קטניות', NULL, NULL, NULL, 130, 12.5, 9.5, 5.5, 5.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-106', 'טופו קלאסי - תנובה / אדמה', NULL, 'תחליפי בשר', NULL, NULL, NULL, 140, 14, 2.5, 8.5, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-107', 'טופו במרקם רך (סילקן)', NULL, 'תחליפי בשר', NULL, NULL, NULL, 60, 6.5, 1.8, 2.8, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-108', 'שבבי סויה יבשים (בונזואל)', NULL, 'תחליפי בשר', NULL, NULL, NULL, 330, 50, 30, 1.2, 18, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-109', 'טבעול שניצל תירס', NULL, 'תחליפי בשר', NULL, NULL, NULL, 210, 7.5, 24, 9.5, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-110', 'טבעול שניצל צמחוני קלאסי', NULL, 'תחליפי בשר', NULL, NULL, NULL, 190, 13, 14, 9, 4.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-111', 'בורגר סויה Sensational / Beyond', NULL, 'תחליפי בשר', NULL, NULL, NULL, 250, 19, 5, 17, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-112', 'אורז לבן מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 2.5, 28, 0.3, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-113', 'אורז בסמטי מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 125, 2.6, 27, 0.4, 0.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-114', 'אורז יסמין מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 2.4, 28.5, 0.3, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-115', 'אורז מלא מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 112, 2.6, 23.5, 0.9, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-116', 'אורז אדום / שחור מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 115, 2.8, 24, 0.8, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-117', 'פסטה לבנה מבושלת', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 158, 5.8, 31, 0.9, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-118', 'פסטה מקמח מלא מבושלת', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 140, 6.2, 27, 1.2, 4.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-119', 'פסטה כוסמין מבושלת', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 145, 6, 28, 1.1, 3.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-120', 'קוסקוס מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 112, 3.8, 23, 0.2, 1.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-121', 'קוסקוס מלא מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 118, 4.2, 23.5, 0.6, 3.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-122', 'בורגול מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 83, 3.1, 18.5, 0.2, 4.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-123', 'קינואה מבושלת', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 120, 4.4, 21, 1.9, 2.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-124', 'כוסמת ירוקה / קלויה מבושלת', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 92, 3.4, 19.8, 0.6, 2.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-125', 'שיבולת שועל להכנה מהירה (קוואקר)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 389, 17, 66, 7, 10, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-126', 'קוואקר - מנה מדודה', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 58, 2.5, 9.9, 1, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-127', 'פתיתים אפויים מבושלים', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 150, 5, 30, 0.8, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-128', 'תפוחי אדמה אפויים / מבושלים', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 87, 1.9, 20, 0.1, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-129', 'פירה תפוחי אדמה עם חלב וחמאה', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 110, 2, 17, 4.2, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-130', 'בטטה אפויה בתנור', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 90, 2, 21, 0.2, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-131', 'תירס מתוק מקופסה (מסונן)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 80, 2.8, 16, 1.2, 2.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-132', 'קלח תירס מבושל', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 96, 3.4, 21, 1.5, 2.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-133', 'לחם אחיד פרוס (אנג''ל / ברמן)', NULL, 'לחמים', NULL, NULL, NULL, 82, 3, 15.5, 0.7, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-134', 'לחם מקמח חיטה מלאה 100%', NULL, 'לחמים', NULL, NULL, NULL, 75, 3.8, 13, 0.8, 2.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-135', 'לחם כוסמין 100%', NULL, 'לחמים', NULL, NULL, NULL, 78, 3.9, 13.5, 0.9, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-136', 'לחם קל (אנג''ל/ברמן)', NULL, 'לחמים', NULL, NULL, NULL, 45, 2.2, 8, 0.4, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-137', 'לחם מחמצת כפרי', NULL, 'לחמים', NULL, NULL, NULL, 100, 3.8, 19, 0.8, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-138', 'פיתה קלאסית מקמח לבן', NULL, 'לחמים', NULL, NULL, NULL, 260, 9, 53, 1.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-139', 'פיתה מקמח מלא', NULL, 'לחמים', NULL, NULL, NULL, 235, 10, 46, 1.5, 6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-140', 'פיתה כוסמין קלה', NULL, 'לחמים', NULL, NULL, NULL, 125, 6.5, 22, 0.8, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-141', 'פיתה ביס / פיתה קטנה', NULL, 'לחמים', NULL, NULL, NULL, 130, 4.5, 26.5, 0.6, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-142', 'לחמנייה מתוקה / לחמניית המבורגר', NULL, 'לחמים', NULL, NULL, NULL, 230, 7, 43, 3.5, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-143', 'לחמנייה קלה מקמח מלא', NULL, 'לחמים', NULL, NULL, NULL, 115, 6, 20, 1, 5.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-144', 'טורטייה חיטה (מאסטר שף / שופרסל)', NULL, 'לחמים', NULL, NULL, NULL, 135, 3.6, 23, 3, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-145', 'טורטייה מקמח מלא', NULL, 'לחמים', NULL, NULL, NULL, 125, 4, 21, 2.8, 3.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-146', 'פריכיות אורז חום קלאסיות', NULL, 'תחליפי לחם', NULL, NULL, NULL, 30, 0.7, 6.3, 0.2, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-147', 'פריכיות אורז עם מלח ים', NULL, 'תחליפי לחם', NULL, NULL, NULL, 30, 0.7, 6.3, 0.2, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-148', 'פריכיות תירס קראנצ''', NULL, 'תחליפי לחם', NULL, NULL, NULL, 26, 0.6, 5.6, 0.2, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-149', 'פריכיות כוסמין מלא', NULL, 'תחליפי לחם', NULL, NULL, NULL, 29, 0.9, 5.8, 0.2, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-150', 'פריכיות דקות / מיני פריכיות', NULL, 'תחליפי לחם', NULL, NULL, NULL, 11, 0.3, 2.3, 0.1, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-151', 'פתית זהב קלאסי (מאסטר שף)', NULL, 'תחליפי לחם', NULL, NULL, NULL, 26, 0.8, 5.2, 0.2, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-152', 'קרקר זהב / קרקר דגנים', NULL, 'תחליפי לחם', NULL, NULL, NULL, 42, 1, 6.5, 1.3, 0.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-153', 'בייגלה שמיניות (אסם)', NULL, 'חטיפים', NULL, NULL, NULL, 380, 10, 75, 3.5, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-154', 'בייגלה שטוחים (אסם)', NULL, 'חטיפים', NULL, NULL, NULL, 390, 10.5, 76, 4, 3.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-155', 'דגני בוקר קורנפלקס תלמה', NULL, 'דגני בוקר', NULL, NULL, NULL, 370, 7.5, 84, 0.8, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-156', 'דגני בוקר כריות שוקולד (תלמה)', NULL, 'דגני בוקר', NULL, NULL, NULL, 450, 6, 72, 15, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-157', 'דגני בוקר צ''יריוס דבש ואגוזים', NULL, 'דגני בוקר', NULL, NULL, NULL, 385, 7, 78, 4.5, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-158', 'דגני בוקר פיטנס טבעי (נסטלה)', NULL, 'דגני בוקר', NULL, NULL, NULL, 365, 9, 74, 2, 7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-159', 'גרנולה ביתית / דגנים מלאים עם אגוזים', NULL, 'דגני בוקר', NULL, NULL, NULL, 440, 11, 58, 17, 8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-160', 'גרנולה ללא תוספת סוכר', NULL, 'דגני בוקר', NULL, NULL, NULL, 390, 13, 52, 14, 10, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-161', 'עדשים ירוקות / חומות מבושלות', NULL, 'קטניות', NULL, NULL, NULL, 116, 9, 20, 0.4, 7.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-162', 'עדשים אדומות מבושלות', NULL, 'קטניות', NULL, NULL, NULL, 115, 8.8, 19.5, 0.4, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-163', 'גרגירי חומוס מבושלים', NULL, 'קטניות', NULL, NULL, NULL, 164, 8.9, 27, 2.6, 7.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-164', 'גרגירי חומוס מוקפאים (סנפרוסט)', NULL, 'קטניות', NULL, NULL, NULL, 150, 8.2, 24, 2.2, 7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-165', 'שעועית לבנה מבושלת', NULL, 'קטניות', NULL, NULL, NULL, 127, 8.7, 22.8, 0.5, 6.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-166', 'שעועית אדומה מבושלת', NULL, 'קטניות', NULL, NULL, NULL, 125, 8.5, 22.5, 0.5, 6.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-167', 'אפונה ירוקה מבושלת (סנפרוסט)', NULL, 'קטניות', NULL, NULL, NULL, 81, 5.4, 14.5, 0.4, 5.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-168', 'תורמוס מבושל', NULL, 'קטניות', NULL, NULL, NULL, 119, 15.5, 10, 2.8, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-169', 'פול מבושל', NULL, 'קטניות', NULL, NULL, NULL, 110, 7.6, 19.5, 0.4, 5.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-170', 'עדשים שחורות (בלוגה) מבושלות', NULL, 'קטניות', NULL, NULL, NULL, 120, 9.2, 20, 0.5, 8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-171', 'תפוח עץ בינוני (עם קליפה)', NULL, 'פירות', NULL, NULL, NULL, 80, 0.4, 21, 0.3, 3.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-172', 'בננה בינונית', NULL, 'פירות', NULL, NULL, NULL, 105, 1.3, 27, 0.3, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-173', 'תפוז בינוני', NULL, 'פירות', NULL, NULL, NULL, 65, 1.3, 16, 0.2, 3.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-174', 'קלמנטינה', NULL, 'פירות', NULL, NULL, NULL, 40, 0.7, 10, 0.1, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-175', 'אשכולית אדומה', NULL, 'פירות', NULL, NULL, NULL, 50, 0.9, 12, 0.1, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-176', 'תות שדה טרי', NULL, 'פירות', NULL, NULL, NULL, 32, 0.7, 7.7, 0.3, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-177', 'ענבים ירוקים / אדומים', NULL, 'פירות', NULL, NULL, NULL, 69, 0.7, 18, 0.2, 0.9, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-178', 'אבטיח מתוק', NULL, 'פירות', NULL, NULL, NULL, 30, 0.6, 7.5, 0.1, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-179', 'מלון צהוב', NULL, 'פירות', NULL, NULL, NULL, 34, 0.8, 8.2, 0.2, 0.9, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-180', 'אפרסק טרי', NULL, 'פירות', NULL, NULL, NULL, 50, 1.2, 12, 0.3, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-181', 'נקטרינה', NULL, 'פירות', NULL, NULL, NULL, 55, 1.4, 13, 0.4, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-182', 'שזיף אדום / צהוב', NULL, 'פירות', NULL, NULL, NULL, 30, 0.4, 7.5, 0.2, 0.9, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-183', 'אגס בינוני', NULL, 'פירות', NULL, NULL, NULL, 85, 0.6, 23, 0.2, 4.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-184', 'תמר מג''הול עסיסי', NULL, 'פירות יבשים', NULL, NULL, NULL, 66, 0.4, 18, 0.1, 1.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-185', 'תמר דקל נור', NULL, 'פירות יבשים', NULL, NULL, NULL, 28, 0.2, 7.5, 0, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-186', 'מנגו מתוק', NULL, 'פירות', NULL, NULL, NULL, 60, 0.8, 15, 0.4, 1.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-187', 'אננס טרי', NULL, 'פירות', NULL, NULL, NULL, 50, 0.5, 13, 0.1, 1.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-188', 'קיווי', NULL, 'פירות', NULL, NULL, NULL, 42, 0.8, 10, 0.4, 2.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-189', 'דובדבנים מתוקים', NULL, 'פירות', NULL, NULL, NULL, 63, 1.1, 16, 0.2, 2.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-190', 'אבוקדו היל / חס', NULL, 'פירות / שומנים', NULL, NULL, NULL, 120, 1.5, 6, 11, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-191', 'רימון (גרגרים)', NULL, 'פירות', NULL, NULL, NULL, 83, 1.7, 18.7, 1.2, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-192', 'תאנה טרייה', NULL, 'פירות', NULL, NULL, NULL, 37, 0.4, 9.5, 0.1, 1.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-193', 'אפרסמון', NULL, 'פירות', NULL, NULL, NULL, 84, 0.7, 21, 0.2, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-194', 'משמש טרי', NULL, 'פירות', NULL, NULL, NULL, 17, 0.5, 3.9, 0.1, 0.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-195', 'חמוציות מיובשות ללא סוכר', NULL, 'פירות יבשים', NULL, NULL, NULL, 92, 0.1, 24, 0.4, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-196', 'צימוקים כהים / בהירים', NULL, 'פירות יבשים', NULL, NULL, NULL, 90, 0.9, 23, 0.1, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-197', 'שזיפים מיובשים', NULL, 'פירות יבשים', NULL, NULL, NULL, 24, 0.2, 6.3, 0, 0.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-198', 'משמש מיובש', NULL, 'פירות יבשים', NULL, NULL, NULL, 20, 0.3, 5, 0, 0.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-199', 'מלפפון טרי עם קליפה', NULL, 'ירקות', NULL, NULL, NULL, 15, 0.7, 3.6, 0.1, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-200', 'עגבנייה טרייה', NULL, 'ירקות', NULL, NULL, NULL, 22, 1.1, 4.8, 0.2, 1.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-201', 'עגבניות שרי', NULL, 'ירקות', NULL, NULL, NULL, 18, 0.9, 3.9, 0.2, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-202', 'גזר טרי', NULL, 'ירקות', NULL, NULL, NULL, 33, 0.7, 7.6, 0.2, 2.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-203', 'פלפל אדום (גמבה)', NULL, 'ירקות', NULL, NULL, NULL, 40, 1.5, 9, 0.3, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-204', 'פלפל ירוק / צהוב', NULL, 'ירקות', NULL, NULL, NULL, 30, 1.2, 7, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-205', 'קישוא טרי / מבושל', NULL, 'ירקות', NULL, NULL, NULL, 20, 1.4, 3.8, 0.4, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-206', 'חציל קלוי / אפוי ללא שמן', NULL, 'ירקות', NULL, NULL, NULL, 25, 1, 5.8, 0.2, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-207', 'כרוב לבן קצוץ', NULL, 'ירקות', NULL, NULL, NULL, 25, 1.3, 5.8, 0.1, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-208', 'כרוב אדום קצוץ', NULL, 'ירקות', NULL, NULL, NULL, 31, 1.4, 7.4, 0.2, 2.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-209', 'חסה ערבית / מסולסלת', NULL, 'ירקות', NULL, NULL, NULL, 15, 1.4, 2.9, 0.2, 1.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-210', 'עלי תרד טריים', NULL, 'ירקות', NULL, NULL, NULL, 23, 2.9, 3.6, 0.4, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-211', 'ברוקולי מבושל / בקיטור', NULL, 'ירקות', NULL, NULL, NULL, 35, 2.4, 7, 0.4, 3.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-212', 'כרובית אפויה / מבושלת', NULL, 'ירקות', NULL, NULL, NULL, 25, 1.9, 5, 0.3, 2.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-213', 'בצל צהוב / סגול', NULL, 'ירקות', NULL, NULL, NULL, 40, 1.1, 9.3, 0.1, 1.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-214', 'בצל ירוק', NULL, 'ירקות', NULL, NULL, NULL, 32, 1.8, 7.3, 0.2, 2.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-215', 'שום טרי', NULL, 'ירקות', NULL, NULL, NULL, 4, 0.2, 1, 0, 0.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-216', 'פטריות שמפיניון טריות', NULL, 'ירקות', NULL, NULL, NULL, 22, 3.1, 3.3, 0.3, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-217', 'פטריות פורטבלו בגריל', NULL, 'ירקות', NULL, NULL, NULL, 28, 2.5, 4.5, 0.5, 1.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-218', 'צנונית טרייה', NULL, 'ירקות', NULL, NULL, NULL, 16, 0.7, 3.4, 0.1, 1.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-219', 'דלעת אפויה', NULL, 'ירקות', NULL, NULL, NULL, 26, 1, 6.5, 0.1, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-220', 'דלורית אפויה בתנור', NULL, 'ירקות', NULL, NULL, NULL, 45, 1, 11.5, 0.1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-221', 'סלק אדום מבושל', NULL, 'ירקות', NULL, NULL, NULL, 43, 1.6, 9.6, 0.2, 2.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-222', 'עשבי תיבול (פטרוזיליה/כוסברה/שמיר)', NULL, 'ירקות', NULL, NULL, NULL, 36, 3, 6.3, 0.8, 3.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-223', 'נבטים סיניים', NULL, 'ירקות', NULL, NULL, NULL, 30, 3, 5.9, 0.2, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-224', 'סלרי (גבעולים)', NULL, 'ירקות', NULL, NULL, NULL, 14, 0.7, 3, 0.2, 1.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-225', 'שעועית ירוקה מבושלת (סנפרוסט)', NULL, 'ירקות', NULL, NULL, NULL, 31, 1.8, 7, 0.2, 3.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-226', 'שעועית צהובה מבושלת', NULL, 'ירקות', NULL, NULL, NULL, 31, 1.8, 7, 0.2, 3.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-227', 'לקט ירקות לנורמנדי (סנפרוסט)', NULL, 'ירקות', NULL, NULL, NULL, 30, 2, 5.5, 0.3, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-228', 'לקט ירקות מוקפצים', NULL, 'ירקות', NULL, NULL, NULL, 35, 1.8, 6.5, 0.3, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-229', 'שקדים טבעיים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 175, 6.3, 6, 15, 3.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-230', 'שקדים מולבנים / פרוסים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 175, 6.3, 6, 15, 3.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-231', 'אגוזי מלך קלופים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 195, 4.5, 4, 19.5, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-232', 'אגוזי קשיו טבעיים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 165, 5.5, 9, 13, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-233', 'בוטנים קלויים / טבעיים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 170, 7.5, 5, 14, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-234', 'פיסטוקים קלויים ומומלחים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 168, 6, 8, 13.5, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-235', 'אגוזי לוז (בונדוק)', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 188, 4.2, 5, 18, 2.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-236', 'אגוזי פקאן טבעיים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 205, 2.7, 4, 21, 2.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-237', 'אגוזי ברזיל', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 200, 4.3, 3.5, 20, 2.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-238', 'גרעיני חמנייה קלופים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 175, 6.2, 6, 15, 2.6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-239', 'גרעיני דלעת קלופים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 168, 9, 4.5, 14, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-240', 'שומשום מלא / לבן', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 57, 1.8, 2.3, 5, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-241', 'זרעי צ''יה', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 58, 2, 5, 3.7, 4.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-242', 'זרעי פשתן טחונים', NULL, 'אגוזים וגרעינים', NULL, NULL, NULL, 53, 1.8, 3, 4.2, 2.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-243', 'חמאת בוטנים טבעית 100%', NULL, 'ממרחים', NULL, NULL, NULL, 95, 4, 3, 8, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-244', 'חמאת בוטנים סקיפי עם שבבים', NULL, 'ממרחים', NULL, NULL, NULL, 98, 3.5, 4, 8, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-245', 'טחינה גולמית משומשום מלא (הנסיך/אל ארז)', NULL, 'ממרחים', NULL, NULL, NULL, 98, 3.8, 1.8, 8.8, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-246', 'טחינה גולמית קלאסית', NULL, 'ממרחים', NULL, NULL, NULL, 100, 3.5, 2, 9, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-247', 'טחינה מוכנה למאכל (צבר / אחלה)', NULL, 'ממרחים', NULL, NULL, NULL, 45, 1.2, 1, 4.2, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-248', 'חומוס אחלה / צבר קלאסי', NULL, 'ממרחים', NULL, NULL, NULL, 70, 2.1, 4.2, 5, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-249', 'חומוס דל שומן 9%', NULL, 'ממרחים', NULL, NULL, NULL, 48, 2.2, 4.5, 2.7, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-250', 'ממרח אבוקדו מוכן', NULL, 'ממרחים', NULL, NULL, NULL, 32, 0.4, 1.6, 2.8, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-251', 'שמן זית כתית מעולה', NULL, 'שמנים', NULL, NULL, NULL, 88, 0, 0, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-252', 'שמן קנולה / חמניות', NULL, 'שמנים', NULL, NULL, NULL, 88, 0, 0, 10, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-253', 'תרסיס שמן קנולה / זית', NULL, 'שמנים', NULL, NULL, NULL, 9, 0, 0, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-254', 'מיונז קלאסי (הלמנס / תלמה)', NULL, 'רוטבים', NULL, NULL, NULL, 100, 0.2, 0.5, 11, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-255', 'מיונז הלמנס לייטאקטיב 5% / 9%', NULL, 'רוטבים', NULL, NULL, NULL, 25, 0.2, 1.5, 2, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-256', 'קטשופ אסם קלאסי', NULL, 'רוטבים', NULL, NULL, NULL, 17, 0.2, 4, 0, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-257', 'קטשופ אסם ללא תוספת סוכר', NULL, 'רוטבים', NULL, NULL, NULL, 8, 0.2, 1.8, 0, 0.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-258', 'חרדל דיז''ון / צהוב', NULL, 'רוטבים', NULL, NULL, NULL, 5, 0.3, 0.3, 0.3, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-259', 'רוטב סויה דל נתרן (קיקומן)', NULL, 'רוטבים', NULL, NULL, NULL, 10, 1.2, 1, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-260', 'רוטב צ''ילי מתוק', NULL, 'רוטבים', NULL, NULL, NULL, 32, 0.1, 8, 0, 0.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-261', 'רוטב ברבקיו', NULL, 'רוטבים', NULL, NULL, NULL, 25, 0.2, 6, 0.1, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-262', 'רוטב אלף האיים לייט', NULL, 'רוטבים', NULL, NULL, NULL, 30, 0.2, 3, 2, 0.1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-263', 'סילאן טבעי 100% תמרים', NULL, 'ממתיקים', NULL, NULL, NULL, 60, 0.4, 14.5, 0, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-264', 'דבש טבעי (יד מרדכי)', NULL, 'ממתיקים', NULL, NULL, NULL, 64, 0.1, 16, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-265', 'ממרח השחר העולה', NULL, 'ממרחים', NULL, NULL, NULL, 110, 0.6, 12.5, 6.5, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-266', 'ממרח נוטלה', NULL, 'ממרחים', NULL, NULL, NULL, 108, 1.2, 11.5, 6.2, 0.7, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-267', 'ממרח לוטוס', NULL, 'ממרחים', NULL, NULL, NULL, 115, 0.6, 11.5, 7.5, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-268', 'אבקת חלבון מי גבינה WHEY', NULL, 'תוספי תזונה', NULL, NULL, NULL, 120, 24, 2, 1.8, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-269', 'אבקת חלבון איסולייט ISO', NULL, 'תוספי תזונה', NULL, NULL, NULL, 110, 27, 0.5, 0.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-270', 'אבקת חלבון טבעונית (סויה/אפונה)', NULL, 'תוספי תזונה', NULL, NULL, NULL, 115, 23, 2.5, 1.5, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-271', 'חטיף חלבון Allin קראנצ'' 20g', NULL, 'חטיפי חלבון', NULL, NULL, NULL, 210, 20, 18, 7, 8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-272', 'חטיף חלבון Barebells 20g', NULL, 'חטיפי חלבון', NULL, NULL, NULL, 200, 20, 16, 8, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-273', 'חטיף חלבון Ninja 20g', NULL, 'חטיפי חלבון', NULL, NULL, NULL, 215, 20, 19, 7.5, 6, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-274', 'חטיף חלבון Pro 20g - שטראוס', NULL, 'חטיפי חלבון', NULL, NULL, NULL, 205, 20, 17, 6.8, 5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-275', 'חטיף חלבון Quest Bar', NULL, 'חטיפי חלבון', NULL, NULL, NULL, 190, 21, 21, 7, 14, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-276', 'חטיף אנרגיה Nature Valley', NULL, 'חטיפים', NULL, NULL, NULL, 95, 2, 14, 3.5, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-277', 'חטיף אנרגיה FITFREE ללא סוכר', NULL, 'חטיפים', NULL, NULL, NULL, 85, 1.8, 15, 2.2, 3.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-278', 'במבה קלאסית (אסם)', NULL, 'חטיפים', NULL, NULL, NULL, 133, 3.5, 10, 8.8, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-279', 'במבה פרו 12g חלבון', NULL, 'חטיפים', NULL, NULL, NULL, 280, 12, 22, 16, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-280', 'ביסלי גריל / ברבקיו (אסם)', NULL, 'חטיפים', NULL, NULL, NULL, 170, 3.2, 22, 7.8, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-281', 'תפוצ''יפס קלאסי (שטראוס)', NULL, 'חטיפים', NULL, NULL, NULL, 265, 3, 26, 16.5, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-282', 'תפוצ''יפס Crunch', NULL, 'חטיפים', NULL, NULL, NULL, 270, 3, 25.5, 17, 2.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-283', 'דורטוס חמוץ חריף', NULL, 'חטיפים', NULL, NULL, NULL, 275, 3.5, 32, 14.5, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-284', 'פופקורן ביתי ללא שמן / באוויר חם', NULL, 'חטיפים', NULL, NULL, NULL, 380, 12, 72, 4, 14, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-285', 'פופקורן למיקרוגל במלח', NULL, 'חטיפים', NULL, NULL, NULL, 450, 8, 58, 22, 9, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-286', 'שוקולד מריר 70% מוצקי קקאו', NULL, 'מתוקים', NULL, NULL, NULL, 55, 0.8, 3.5, 4, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-287', 'שוקולד מריר 85%', NULL, 'מתוקים', NULL, NULL, NULL, 58, 1, 2.2, 4.8, 1.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-288', 'שוקולד חלב פרות (עלית)', NULL, 'מתוקים', NULL, NULL, NULL, 53, 0.7, 5.8, 3, 0.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-289', 'חטיף פסק זמן', NULL, 'מתוקים', NULL, NULL, NULL, 245, 3.2, 26, 14, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-290', 'חטיף כיף כף', NULL, 'מתוקים', NULL, NULL, NULL, 235, 3, 28, 12.5, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-291', 'חטיף אגוזי', NULL, 'מתוקים', NULL, NULL, NULL, 220, 2.5, 27, 11.5, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-292', 'חטיף טוויסט', NULL, 'מתוקים', NULL, NULL, NULL, 130, 1.2, 20, 5, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-293', 'חטיף טורטית', NULL, 'מתוקים', NULL, NULL, NULL, 210, 2, 24, 12, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-294', 'עוגיות אוראו', NULL, 'מתוקים', NULL, NULL, NULL, 52, 0.5, 7.8, 2.2, 0.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-295', 'עוגיות מזרחיות / עוגיות עבאדי', NULL, 'מתוקים', NULL, NULL, NULL, 460, 10, 62, 18, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-296', 'גלידת נוקאאוט / מגנום', NULL, 'גלידות', NULL, NULL, NULL, 260, 3.2, 24, 17, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-297', 'ארטיק קרח לימון/דובדבן', NULL, 'גלידות', NULL, NULL, NULL, 60, 0, 15, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-298', 'שלגון פלדמן לייט (40 קלוריות)', NULL, 'גלידות', NULL, NULL, NULL, 40, 1.5, 7, 0.5, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-299', 'רסק עגבניות 28-30% (טל)', NULL, 'שימורים', NULL, NULL, NULL, 24, 1, 5, 0.1, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-300', 'עגבניות מרוסקות מקולפות (מוטי Mutti)', NULL, 'שימורים', NULL, NULL, NULL, 26, 1.2, 4.5, 0.2, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-301', 'זיתים ירוקים מבוקעים (בית השיטה)', NULL, 'שימורים', NULL, NULL, NULL, 42, 0.4, 0.5, 4.2, 1, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-302', 'זיתים שחורים מושחזים', NULL, 'שימורים', NULL, NULL, NULL, 38, 0.3, 1, 3.6, 0.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-303', 'מלפפון חמוץ במלח / בחומץ (יבנה)', NULL, 'שימורים', NULL, NULL, NULL, 5, 0.3, 0.8, 0.1, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-304', 'טחינה משומשום מלא מוכנה בקופסה', NULL, 'שימורים', NULL, NULL, NULL, 280, 8, 8, 25, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-305', 'חלב קוקוס לקארי 17% שומן', NULL, 'שימורים', NULL, NULL, NULL, 165, 1.5, 2.8, 17, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-306', 'קרם קוקוס 20%-22%', NULL, 'שימורים', NULL, NULL, NULL, 215, 2, 3.2, 22, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-307', 'נודלס להקפצה (מאסטר שף)', NULL, 'מזון מוכן', NULL, NULL, NULL, 140, 4.5, 28, 1, 1.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-308', 'דפי אורז לספרינג רול', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 33, 0.6, 7.8, 0.1, 0.2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-309', 'שקדי מרק (אסם)', NULL, 'תוספות', NULL, NULL, NULL, 53, 1, 5.2, 3.2, 0.3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-310', 'סלט כרוב אדום במיונז מוכן', NULL, 'סלטים מוכנים', NULL, NULL, NULL, 160, 1.2, 8, 14, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-311', 'סלט טורקי מוכן (צבר)', NULL, 'סלטים מוכנים', NULL, NULL, NULL, 90, 1.5, 10, 5, 1.8, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-312', 'סלט חצילים בטחינה מוכן', NULL, 'סלטים מוכנים', NULL, NULL, NULL, 140, 2.5, 6, 12, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-313', 'סלט מטבוחה אסלית (אחלה)', NULL, 'סלטים מוכנים', NULL, NULL, NULL, 75, 1.4, 8.5, 4, 1.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-314', 'קפה שחור / נס קפה ללא חלב וללא סוכר', NULL, 'משקאות', NULL, NULL, NULL, 2, 0.2, 0.3, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-315', 'מיץ תפוזים טבעי סחוט (פריגת)', NULL, 'משקאות', NULL, NULL, NULL, 90, 1.4, 20, 0.2, 0.4, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-316', 'משקה קולה קלה / זירו Coca Cola Zero', NULL, 'משקאות', NULL, NULL, NULL, 0, 0, 0, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-317', 'משקה ספרייט זירו / פאנטה זירו', NULL, 'משקאות', NULL, NULL, NULL, 0, 0, 0, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-318', 'מיץ ענבים תירוש לקידוש', NULL, 'משקאות', NULL, NULL, NULL, 70, 0.3, 17, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-319', 'משקה אלוורה עם חתיכות', NULL, 'משקאות', NULL, NULL, NULL, 76, 0, 19, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-320', 'בירה שחורה נשר מאלט', NULL, 'משקאות', NULL, NULL, NULL, 115, 0.8, 28, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-321', 'בירה לבנה 5% אלכוהול (גולדסטאר/מכבי)', NULL, 'משקאות', NULL, NULL, NULL, 140, 1.2, 11, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-322', 'יין אדום יבש', NULL, 'משקאות', NULL, NULL, NULL, 125, 0.1, 3.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-323', 'גבינה לבנה 0% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 60, 10, 1.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-324', 'גבינה לבנה 1% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 68, 10, 1.8, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-325', 'גבינה לבנה 3% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 84, 10, 1.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-326', 'גבינה לבנה 15% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 180, 8.5, 1.8, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-327', 'גבינה לבנה 28% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 284, 8.5, 1.8, 28, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-328', 'גבינה לבנה 0% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 60, 10, 1.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-329', 'גבינה לבנה 1% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 68, 10, 1.8, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-330', 'גבינה לבנה 5% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 100, 10, 1.8, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-331', 'גבינה לבנה 9% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 132, 10, 1.8, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-332', 'גבינה לבנה 15% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 180, 8.5, 1.8, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-333', 'גבינה לבנה 28% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 284, 8.5, 1.8, 28, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-334', 'גבינה לבנה 0% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 60, 10, 1.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-335', 'גבינה לבנה 1% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 68, 10, 1.8, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-336', 'גבינה לבנה 3% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 84, 10, 1.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-337', 'גבינה לבנה 5% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 100, 10, 1.8, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-338', 'גבינה לבנה 9% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 132, 10, 1.8, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-339', 'גבינה לבנה 15% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 180, 8.5, 1.8, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-340', 'גבינה לבנה 28% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 284, 8.5, 1.8, 28, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-341', 'גבינה לבנה 0% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 60, 10, 1.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-342', 'גבינה לבנה 1% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 68, 10, 1.8, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-343', 'גבינה לבנה 3% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 84, 10, 1.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-344', 'גבינה לבנה 5% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 100, 10, 1.8, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-345', 'גבינה לבנה 9% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 132, 10, 1.8, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-346', 'גבינה לבנה 15% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 180, 8.5, 1.8, 15, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-347', 'גבינה לבנה 28% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 284, 8.5, 1.8, 28, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-348', 'קוטג'' 1% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 75, 11.2, 1.5, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-349', 'קוטג'' 9% - תנובה', NULL, 'גבינות', NULL, NULL, NULL, 131, 10, 1.5, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-350', 'קוטג'' 1% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 75, 11.2, 1.5, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-351', 'קוטג'' 3% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 89, 11.2, 1.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-352', 'קוטג'' 5% - שטראוס', NULL, 'גבינות', NULL, NULL, NULL, 103, 11.2, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-353', 'קוטג'' 1% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 75, 11.2, 1.5, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-354', 'קוטג'' 3% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 89, 11.2, 1.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-355', 'קוטג'' 5% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 103, 11.2, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-356', 'קוטג'' 9% - טרה', NULL, 'גבינות', NULL, NULL, NULL, 131, 10, 1.5, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-357', 'קוטג'' 1% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 75, 11.2, 1.5, 1, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-358', 'קוטג'' 3% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 89, 11.2, 1.5, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-359', 'קוטג'' 5% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 103, 11.2, 1.5, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-360', 'קוטג'' 9% - שופרסל', NULL, 'גבינות', NULL, NULL, NULL, 131, 10, 1.5, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-361', 'גבינה בולגרית 5% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 130, 14.5, 1.2, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-362', 'גבינה בולגרית 9% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 158, 14.5, 1.2, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-363', 'גבינה בולגרית 16% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 207, 14.5, 1.2, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-364', 'גבינה בולגרית 24% - פיראוס', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 263, 14.5, 1.2, 24, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-365', 'גבינה בולגרית 5% - צוריאל', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 130, 14.5, 1.2, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-366', 'גבינה בולגרית 9% - צוריאל', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 158, 14.5, 1.2, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-367', 'גבינה בולגרית 16% - צוריאל', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 207, 14.5, 1.2, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-368', 'גבינה בולגרית 24% - צוריאל', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 263, 14.5, 1.2, 24, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-369', 'גבינה בולגרית 5% - גד', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 130, 14.5, 1.2, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-370', 'גבינה בולגרית 9% - גד', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 158, 14.5, 1.2, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-371', 'גבינה בולגרית 16% - גד', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 207, 14.5, 1.2, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-372', 'גבינה בולגרית 24% - גד', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 263, 14.5, 1.2, 24, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-373', 'גבינה בולגרית 5% - תנובה', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 130, 14.5, 1.2, 5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-374', 'גבינה בולגרית 9% - תנובה', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 158, 14.5, 1.2, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-375', 'גבינה בולגרית 16% - תנובה', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 207, 14.5, 1.2, 16, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-376', 'גבינה בולגרית 24% - תנובה', NULL, 'גבינות מלוחות', NULL, NULL, NULL, 263, 14.5, 1.2, 24, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-377', 'יוגורט דנונה / ביו 0% - תנובה', NULL, 'יוגורט', NULL, NULL, NULL, 40, 4.5, 4.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-378', 'יוגורט דנונה / ביו 1.5% - תנובה', NULL, 'יוגורט', NULL, NULL, NULL, 67, 4.5, 4.8, 1.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-379', 'יוגורט דנונה / ביו 3% - תנובה', NULL, 'יוגורט', NULL, NULL, NULL, 94, 4.5, 4.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-380', 'יוגורט דנונה / ביו 4.5% - תנובה', NULL, 'יוגורט', NULL, NULL, NULL, 121, 4.5, 4.8, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-381', 'יוגורט דנונה / ביו 0% - שטראוס', NULL, 'יוגורט', NULL, NULL, NULL, 40, 4.5, 4.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-382', 'יוגורט דנונה / ביו 1.5% - שטראוס', NULL, 'יוגורט', NULL, NULL, NULL, 67, 4.5, 4.8, 1.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-383', 'יוגורט דנונה / ביו 3% - שטראוס', NULL, 'יוגורט', NULL, NULL, NULL, 94, 4.5, 4.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-384', 'יוגורט דנונה / ביו 4.5% - שטראוס', NULL, 'יוגורט', NULL, NULL, NULL, 121, 4.5, 4.8, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-385', 'יוגורט דנונה / ביו 0% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 40, 4.5, 4.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-386', 'יוגורט דנונה / ביו 1.5% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 67, 4.5, 4.8, 1.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-387', 'יוגורט דנונה / ביו 3% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 94, 4.5, 4.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-388', 'יוגורט דנונה / ביו 4.5% - יוטבתה', NULL, 'יוגורט', NULL, NULL, NULL, 121, 4.5, 4.8, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-389', 'יוגורט דנונה / ביו 0% - שופרסל', NULL, 'יוגורט', NULL, NULL, NULL, 40, 4.5, 4.8, 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-390', 'יוגורט דנונה / ביו 1.5% - שופרסל', NULL, 'יוגורט', NULL, NULL, NULL, 67, 4.5, 4.8, 1.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-391', 'יוגורט דנונה / ביו 3% - שופרסל', NULL, 'יוגורט', NULL, NULL, NULL, 94, 4.5, 4.8, 3, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-392', 'יוגורט דנונה / ביו 4.5% - שופרסל', NULL, 'יוגורט', NULL, NULL, NULL, 121, 4.5, 4.8, 4.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-393', 'חזה עוף אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-394', 'חזה עוף בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-395', 'חזה עוף מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-396', 'חזה עוף מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 1.5, 2.5, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-397', 'חזה עוף מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-398', 'פרגית עוף אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-399', 'פרגית עוף בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-400', 'פרגית עוף מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-401', 'פרגית עוף מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 1.5, 2.5, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-402', 'פרגית עוף מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-403', 'כרעי עוף אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-404', 'כרעי עוף בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-405', 'כרעי עוף מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-406', 'כרעי עוף מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 1.5, 2.5, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-407', 'כרעי עוף מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-408', 'בשר בקר 5% אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-409', 'בשר בקר 5% בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-410', 'בשר בקר 5% מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-411', 'בשר בקר 5% מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 1.5, 9, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-412', 'בשר בקר 5% מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-413', 'בשר בקר 12% אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-414', 'בשר בקר 12% בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-415', 'בשר בקר 12% מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-416', 'בשר בקר 12% מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 1.5, 9, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-417', 'בשר בקר 12% מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-418', 'סטייק סינטה אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-419', 'סטייק סינטה בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-420', 'סטייק סינטה מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-421', 'סטייק סינטה מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 1.5, 6, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-422', 'סטייק סינטה מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-423', 'פילה סלמון אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-424', 'פילה סלמון בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-425', 'פילה סלמון מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-426', 'פילה סלמון מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 1.5, 9, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-427', 'פילה סלמון מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 185, 26, 0, 9, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-428', 'פילה אמנון אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 26, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-429', 'פילה אמנון בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 26, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-430', 'פילה אמנון מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 26, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-431', 'פילה אמנון מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 26, 1.5, 6, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-432', 'פילה אמנון מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 26, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-433', 'חזה הודו אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-434', 'חזה הודו בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-435', 'חזה הודו מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-436', 'חזה הודו מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 1.5, 2.5, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-437', 'חזה הודו מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 125, 26, 0, 2.5, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-438', 'טופו קלאסי אפוי בתנור', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-439', 'טופו קלאסי בגריל', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-440', 'טופו קלאסי מבושל במרק', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-441', 'טופו קלאסי מוקפץ עם ירקות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 1.5, 6, 0.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-442', 'טופו קלאסי מבושל ברוטב עגבניות', NULL, 'מנות עיקריות', NULL, NULL, NULL, 115, 14, 0, 6, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-443', 'אורז לבן (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-444', 'אורז לבן (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-445', 'אורז לבן (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-446', 'אורז לבן (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-447', 'אורז בסמטי (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-448', 'אורז בסמטי (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-449', 'אורז בסמטי (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-450', 'אורז בסמטי (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-451', 'אורז מלא (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-452', 'אורז מלא (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-453', 'אורז מלא (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-454', 'אורז מלא (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-455', 'פסטה קמח מלא (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-456', 'פסטה קמח מלא (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-457', 'פסטה קמח מלא (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-458', 'פסטה קמח מלא (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-459', 'בורגול (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-460', 'בורגול (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-461', 'בורגול (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-462', 'בורגול (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-463', 'קינואה (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-464', 'קינואה (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-465', 'קינואה (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-466', 'קינואה (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-467', 'כוסמת (בישול ביתי נקי)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-468', 'כוסמת (עם מעט שמן זית)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-469', 'כוסמת (עם עשבי תיבול)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-470', 'כוסמת (עם בצל מוזהב)', NULL, 'דגנים ופחמימות', NULL, NULL, NULL, 130, 3.2, 27, 1, 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-471', 'תפוח עץ (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-472', 'תפוח עץ (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-473', 'תפוח עץ (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-474', 'אגס (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-475', 'אגס (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-476', 'אגס (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-477', 'שזיף (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-478', 'שזיף (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-479', 'שזיף (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-480', 'אפרסק (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-481', 'אפרסק (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-482', 'אפרסק (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-483', 'תמר (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-484', 'תמר (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-485', 'תמר (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-486', 'תאנה (אורגני)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-487', 'תאנה (מיובש בטבעיות)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
INSERT INTO public.foods (id, name, english_name, category, brand, serving_unit, serving_grams, calories, protein, carbs, fat, fiber, search_aliases)
VALUES ('f-israel-488', 'תאנה (טרי קטוף)', NULL, 'פירות', NULL, NULL, NULL, 65, 0.8, 16, 0.2, 2.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  english_name = EXCLUDED.english_name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  serving_unit = EXCLUDED.serving_unit,
  serving_grams = EXCLUDED.serving_grams,
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  search_aliases = EXCLUDED.search_aliases;
