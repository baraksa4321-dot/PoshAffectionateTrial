-- ===================================================
-- 08_demo_seed.sql: Preview Seed Data for Owner, Coach & 3 Clients
-- ===================================================

-- 1. Insert Demo Users into auth.users (if not exists)
-- Temporary passwords set to 'DemoPassword123!'
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'owner@myroutine.co.il', '$2a$10$wN36wSj04.6.1P841315..yE30f4a86b9c97d52f6760f38b2', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"בעלים ראשי"}', NOW(), NOW(), 'authenticated'),
  ('a2000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'coach@myroutine.co.il', '$2a$10$wN36wSj04.6.1P841315..yE30f4a86b9c97d52f6760f38b2', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"מאמן ראשי"}', NOW(), NOW(), 'authenticated'),
  ('a3000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'client1@myroutine.co.il', '$2a$10$wN36wSj04.6.1P841315..yE30f4a86b9c97d52f6760f38b2', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"נועה שחר (מתאמנת 1)"}', NOW(), NOW(), 'authenticated'),
  ('a4000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'client2@myroutine.co.il', '$2a$10$wN36wSj04.6.1P841315..yE30f4a86b9c97d52f6760f38b2', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"דניאל לוי (מתאמן 2)"}', NOW(), NOW(), 'authenticated'),
  ('a5000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'client3@myroutine.co.il', '$2a$10$wN36wSj04.6.1P841315..yE30f4a86b9c97d52f6760f38b2', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"מאיה כהן (מתאמנת 3)"}', NOW(), NOW(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Populate Profiles
INSERT INTO public.profiles (id, email, full_name, weight_kg, height_cm, role, coach_id)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'owner@myroutine.co.il', 'בעלים ראשי', 80.0, 180.0, 'owner', NULL),
  ('a2000000-0000-0000-0000-000000000002', 'coach@myroutine.co.il', 'מאמן ראשי', 78.0, 178.0, 'coach', NULL),
  ('a3000000-0000-0000-0000-000000000003', 'client1@myroutine.co.il', 'נועה שחר (מתאמנת 1)', 62.0, 165.0, 'client', 'a2000000-0000-0000-0000-000000000002'),
  ('a4000000-0000-0000-0000-000000000004', 'client2@myroutine.co.il', 'דניאל לוי (מתאמן 2)', 84.0, 182.0, 'client', 'a2000000-0000-0000-0000-000000000002'),
  ('a5000000-0000-0000-0000-000000000005', 'client3@myroutine.co.il', 'מאיה כהן (מתאמנת 3)', 58.0, 162.0, 'client', 'a2000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  coach_id = EXCLUDED.coach_id,
  full_name = EXCLUDED.full_name;

-- 3. Link Clients to Coach in coach_clients
INSERT INTO public.coach_clients (coach_id, client_id)
VALUES
  ('a2000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003'),
  ('a2000000-0000-0000-0000-000000000002', 'a4000000-0000-0000-0000-000000000005'),
  ('a2000000-0000-0000-0000-000000000002', 'a5000000-0000-0000-0000-000000000005')
ON CONFLICT (coach_id, client_id) DO NOTHING;

-- 4. Demo Programs for Clients
INSERT INTO public.programs (id, user_id, name, description)
VALUES
  ('p-demo-client1', 'a3000000-0000-0000-0000-000000000003', 'תוכנית חיטוב ועיצוב 4 ימים', 'תוכנית מותאמת אישית לחיטוב וחיזוק פלג גוף תחתון ועליון'),
  ('p-demo-client2', 'a4000000-0000-0000-0000-000000000004', 'תוכנית מסה והיפרטרופיה A/B/C', 'תוכנית לעלייה במסת שריר וכוח מרבי'),
  ('p-demo-client3', 'a5000000-0000-0000-0000-000000000005', 'תוכנית כושר כללי ואיזון', 'תוכנית לשמירה על חיוניות, חיזוק שרירי ליבה וסיבולת')
ON CONFLICT (id) DO NOTHING;

-- 5. Coach Messages
INSERT INTO public.coach_messages (coach_id, client_id, message)
VALUES
  ('a2000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'אלופה נועה! התקדמות מעולה בסקואט השבוע. שימי לב לשמור על חזה מורם בסט האחרון.'),
  ('a2000000-0000-0000-0000-000000000002', 'a4000000-0000-0000-0000-000000000004', 'דניאל, העלינו משקל בלחיצת חזה ל-85 ק"ג. הקפד על טכניקה וזמני מנוחה מלאים של 2 דקות.'),
  ('a2000000-0000-0000-0000-000000000002', 'a5000000-0000-0000-0000-000000000005', 'מאיה, השבוע מתמקדים בהגעה ליעד החלבון היומי (120 גרם). המשיכי כך!')
ON CONFLICT (id) DO NOTHING;
