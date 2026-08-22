import type { FoodItem } from "./gym-types";

/**
 * 512 generic foods sourced from USDA FoodData Central SR Legacy Release 1 (2018-04).
 * Each line holds FDC ID, category code, English source description, and nutrition values per 100 g.
 */
const CATEGORIES: Record<string, string> = {
  "0": "אגוזים וגרעינים",
  "1": "בקר",
  "2": "דגים",
  "3": "דגני בוקר",
  "4": "דגנים ופחמימות",
  "5": "חטיפים",
  "6": "ירקות",
  "7": "לחמים",
  "8": "מוצרי חלב",
  "9": "מזון מוכן",
  "10": "משקאות",
  "11": "מתוקים",
  "12": "נקניקים",
  "13": "עוף ובשר",
  "14": "פירות",
  "15": "קטניות",
  "16": "רוטבים",
  "17": "שמנים",
};
const SOURCE_ROWS = `172226~8~Ice cream sandwich~237~4.29~37.14~8.57~0
171306~8~Ice cream sundae cone~254~3~28.89~14~1
172227~8~Ice cream cookie sandwich~240~3.7~39.6~7.4~1.2
172175~8~Cheese, blue~353~21.4~2.34~28.74~0
172177~8~Cheese, brie~334~20.75~0.45~27.68~0
173419~8~Cheese, edam~357~24.99~1.43~28.57~0
173420~8~Cheese, feta~265~14.21~3.88~21.49~0
172176~8~Cheese, brick~371~23.24~2.79~29.68~0
173416~8~Cheese, colby~394~23.76~2.57~32.11~0
173418~8~Cheese, cream~350~6.15~5.52~34.44~0
171241~8~Cheese, gouda~356~24.94~2.22~27.44~0
171251~8~Cheese, swiss~393~26.96~1.44~30.99~0
173410~8~Butter, salted~717~0.85~0.06~81.11~0
171249~8~Cheese, romano~387~31.8~3.63~26.94~0
173413~8~Cheese, caraway~376~25.18~3.06~29.2~0
170844~8~Cheese, monterey~373~24.48~0.68~30.28~0
171245~8~Cheese, muenster~368~23.41~1.12~30.04~0
172178~8~Cheese, camembert~300~19.8~0.46~24.26~0
170850~8~Cheese, provolone~351~25.58~2.14~26.62~0
171250~8~Cheese, roquefort~369~21.54~2~30.64~0
173443~8~Sour cream, light~136~3.5~7.1~10.6~0
171246~8~Cheese, neufchatel~253~9.15~3.59~22.78~0
173430~8~Butter, without salt~717~0.85~0.06~81.11~0
173444~8~Sour cream, fat free~74~3.1~15.6~0~0
173412~8~Butter oil, anhydrous~876~0.28~0~99.48~0
171288~8~Cheese, Mexican blend~384~23.54~0.13~32.14~0
170849~8~Cheese, port de salut~352~23.78~0.57~28.2~0
173442~8~Sour cream, reduced fat~181~7~7~14.1~0
171263~8~Cream substitute, powdered~529~2.48~59.29~32.92~0
170884~8~Milk shakes, thick vanilla~112~3.86~17.75~3.03~0
173576~17~Oil, oat~884~0~0~100~0
171015~17~Oil, palm~884~0~0~100~0
171031~17~Oil, almond~884~0~0~100~0
172336~17~Oil, canola~884~0~0~100~0
171030~17~Oil, walnut~884~0~0~100~0
173573~17~Oil, avocado~884~0~0~100~0
171428~17~Oil, babassu~884~0~0~100~0
171412~17~Oil, coconut~892~0~0~99.06~0
172337~17~Oil, mustard~884~0~0~100~0
171429~17~Oil, sheanut~884~0~0~100~0
171505~13~Turkey, Ground, raw~148~19.66~0~7.66~0
171116~13~Chicken, ground, raw~143~17.44~0.04~8.1~0
171506~13~Turkey, Ground, cooked~203~27.37~0~10.4~0
171515~13~Chicken breast tenders, breaded, uncooked~263~14.73~15.01~15.75~1.1
172847~13~Turkey, ground, fat free, raw~112~23.57~0~1.95~0
171480~13~Turkey, whole, meat only, raw~115~22.64~0.14~1.93~0
171490~13~Turkey, whole, light meat, raw~114~23.66~0.14~1.48~0
172402~13~Chicken, stewing, meat only, raw~148~21.26~0~6.32~0
173636~13~Chicken, roasting, meat only, raw~111~20.33~0~2.7~0
171110~13~Chicken, canned, no broth~185~25.3~0.9~8.1~0
171052~13~Chicken, broilers or fryers, meat only, raw~119~21.39~0~3.08~0
171102~13~Turkey, diced, light and dark meat, seasoned~138~18.7~1~6~0
172848~13~Turkey, ground, fat free, pan-broiled crumbles~151~31.69~0~2.71~0
171468~13~Chicken, broilers or fryers, separable fat, raw~629~3.73~0~67.95~0
171096~13~Turkey, whole, back, meat only, raw~113~21.28~0.15~2.5~0
171606~16~Fish broth~16~2~0.4~0.6~0
174523~16~Sauce, barbecue~172~0.82~40.77~0.63~0.9
171833~16~Sauce, horseradish~503~1.09~10.05~50.89~1
171610~16~Sauce, worcestershire~77~0~19.17~0~0
171832~16~Dip, bean, original flavor~119~5.44~15.89~3.7~4.9
171186~16~Sauce, hot chile, sriracha~93~1.93~19.16~0.93~2.2
171825~16~Sauce, steak, tomato based~95~1.25~22.04~0.23~1.5
171180~16~Soup, SWANSON, vegetable broth~6~0.23~1.02~0.07~0
174602~12~Bacon and beef sticks~517~29.1~0.8~44.2~0
172012~12~Bologna, beef~299~10.91~4.29~26.13~0
173856~12~Bologna, pork~247~15.3~0.73~19.87~0
173857~12~Bologna, turkey~209~11.42~4.68~16.05~0.5
172927~12~Pastrami, turkey~139~16.3~3.34~6.21~0.1
171625~12~Frankfurter, turkey~223~12.23~3.81~17.29~0
173900~3~Cereals, CREAM OF RICE, dry~370~6.3~82.4~0.5~0.7
171646~3~Cereals ready-to-eat, granola, homemade~489~13.67~53.88~24.31~8.9
167792~14~Orange Pineapple Juice Blend~51~0.41~12.2~0.08~0.2
167749~14~Lemon peel, raw~47~1.5~16~0.3~10.6
168156~14~Lime juice, raw~25~0.42~8.42~0.07~0.4
167765~14~Watermelon, raw~30~0.61~7.55~0.15~0.4
167747~14~Lemon juice, raw~22~0.35~6.9~0.24~0.3
169103~14~Orange peel, raw~97~1.5~25~0.2~10.6
169925~14~Tangerine juice, raw~43~0.5~10.1~0.2~0.2
168117~14~Cranberry juice, unsweetened~46~0.39~12.2~0.13~0.1
169091~14~Mango, dried, sweetened~319~2.45~78.58~1.18~2.4
173039~14~Grapefruit juice, white, raw~39~0.5~9.2~0.1~0.1
169124~14~Pineapple, raw, all varieties~50~0.54~13.12~0.12~1.4
167785~14~Mango nectar, canned~51~0.11~13.12~0.06~0.3
169107~14~Papaya nectar, canned~57~0.17~14.51~0.15~0.6
168194~14~Pineapple, raw, extra sweet variety~51~0.53~13.5~0.11~1.4
167787~14~Pomegranate juice, bottled~54~0.15~13.13~0.29~0.1
173962~14~Cranberry-orange relish, canned~178~0.3~46.2~0.1~0
174676~14~Grapefruit, raw, white, all areas~33~0.69~8.41~0.1~1.1
167795~14~Fruit juice smoothie, NAKED JUICE, MIGHTY MANGO~63~0.42~15~0~0
168213~14~Fruit juice smoothie, ODWALLA, strawberry banana~48~0.5~11.05~0.32~0.6
174675~14~Grapefruit, raw, pink and red, Florida~30~0.55~7.5~0.1~1.1
168214~14~Fruit juice smoothie, NAKED JUICE, strawberry banana~50~0.48~11.66~0.27~0.6
174673~14~Grapefruit, raw, pink and red, all areas~42~0.77~10.66~0.14~1.6
167799~14~Fruit juice smoothie, BOLTHOUSE FARMS, strawberry banana~52~0.44~12.37~0.3~0.6
169098~14~Orange juice, raw (Includes foods for USDA's Food Distribution Program)~45~0.7~10.4~0.2~0.2
169099~14~Orange juice, canned, unsweetened~47~0.68~11.01~0.15~0.3
173961~14~Cranberry sauce, canned, sweetened~159~0.9~40.4~0.15~1.1
173033~14~Grapefruit, raw, pink and red and white, all areas~32~0.63~8.08~0.1~1.1
168157~14~Lime juice, canned or bottled, unsweetened~21~0.25~6.69~0.23~0.4
169940~14~Pear nectar, canned, without added ascorbic acid~60~0.11~15.76~0.01~0.6
169927~14~Papaya, canned, heavy syrup, drained~206~0.14~55.83~0.55~1.5
167767~14~Pineapple, canned, juice pack, drained~60~0.51~15.56~0.11~1.3
169104~14~Orange-grapefruit juice, canned or bottled, unsweetened~43~0.6~10.28~0.1~0.1
174679~14~Grapefruit juice, white, canned, sweetened~46~0.58~11.13~0.09~0.1
167803~14~Cranberry sauce, whole, canned, OCEAN SPRAY~158~0.75~40.4~0.05~1.2
167804~14~Cranberry sauce, jellied, canned, OCEAN SPRAY~160~1.05~40.61~0.04~1
169126~14~Pineapple, canned, juice pack, solids and liquids~60~0.42~15.7~0.08~0.8
169125~14~Pineapple, canned, water pack, solids and liquids~32~0.43~8.3~0.09~0.8
174678~14~Grapefruit juice, white, canned or bottled, unsweetened~37~0.55~7.54~0.66~0.6
169944~14~Pineapple, canned, heavy syrup pack, solids and liquids~78~0.35~20.2~0.11~0.8
169127~14~Pineapple, canned, light syrup pack, solids and liquids~52~0.36~13.45~0.12~0.8
169945~14~Pineapple, canned, extra heavy syrup pack, solids and liquids~83~0.34~21.5~0.11~0.8
169117~14~Peach nectar, canned, with sucralose, without added ascorbic acid~49~0.1~11.61~0.57~0.1
168189~14~Grapefruit juice, white, bottled, unsweetened, OCEAN SPRAY~37~0.54~7.51~0.64~0.6
173933~14~Apple juice, canned or bottled, unsweetened, without added ascorbic acid~46~0.1~11.3~0.13~0.2
173042~14~Grape juice, canned or bottled, unsweetened, without added ascorbic acid~60~0.37~14.77~0.13~0.2
173036~14~Grapefruit, sections, canned, juice pack, solids and liquids~37~0.7~9.21~0.09~0.4
173035~14~Grapefruit, sections, canned, water pack, solids and liquids~36~0.58~9.15~0.1~0.4
169947~14~Pineapple juice, canned or bottled, unsweetened, without added ascorbic acid~53~0.36~12.87~0.12~0.2
173037~14~Grapefruit, sections, canned, light syrup pack, solids and liquids~60~0.56~15.44~0.1~0.4
169912~14~Melon balls, frozen~33~0.84~7.94~0.25~0.7
174670~14~Fruit salad, (peach and pear and apricot and pineapple and cherry), canned, juice pack, solids and liquids~50~0.51~13.05~0.03~1
174669~14~Fruit salad, (peach and pear and apricot and pineapple and cherry), canned, water pack, solids and liquids~30~0.35~7.87~0.07~1
174668~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, juice pack, solids and liquids~46~0.46~11.86~0.01~1
174667~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, water pack, solids and liquids~32~0.42~8.51~0.05~1
174671~14~Fruit salad, (peach and pear and apricot and pineapple and cherry), canned, light syrup, solids and liquids~58~0.34~15.14~0.07~1
173028~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, heavy syrup, solids and liquids~73~0.39~18.91~0.07~1
173027~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, light syrup, solids and liquids~57~0.4~14.93~0.07~1
174672~14~Fruit salad, (peach and pear and apricot and pineapple and cherry), canned, extra heavy syrup, solids and liquids~88~0.33~22.77~0.06~1
173029~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, extra heavy syrup, solids and liquids~88~0.39~22.89~0.07~1.1
173026~14~Fruit cocktail, (peach and pineapple and pear and grape and cherry), canned, extra light syrup, solids and liquids~45~0.4~11.63~0.07~1.1
173945~14~Bananas, dehydrated, or banana powder~346~3.89~88.28~1.81~9.9
167764~14~Fruit salad, (pineapple and papaya and banana and guava), tropical, canned, heavy syrup, solids and liquids~86~0.41~22.36~0.1~1.3
169100~14~Orange juice, chilled, includes from concentrate~49~0.68~11.54~0.12~0.3
173038~14~Grapefruit juice, pink or red, with added calcium~39~0.51~7.74~0.68~0.3
169946~14~Pineapple, frozen, chunks, sweetened~86~0.4~22.2~0.1~1.1
168197~14~Juice, apple and grape blend, with added ascorbic acid~50~0.16~12.46~0.12~0.2
167748~14~Lemon juice from concentrate, canned or bottled~17~0.45~5.62~0.07~0.7
169923~14~Orange juice, frozen concentrate, unsweetened, undiluted~148~2.4~35.19~0.25~1
168186~14~Pear nectar, canned, with added ascorbic acid~60~0.11~15.76~0.01~0.6
169948~14~Pineapple juice, frozen concentrate, unsweetened, undiluted~179~1.3~44.3~0.1~0.7
168446~6~Potato flour~357~6.9~83.1~0.34~5.9
170092~6~Potato pancakes~268~6.08~27.81~14.76~3.3
170494~6~Spinach souffle~172~7.89~5.9~12.95~0.7
170071~6~Yam, raw~118~1.53~27.88~0.17~4.1
168421~6~Kale, raw~35~2.92~4.42~1.49~4.1
169260~6~Okra, raw~33~1.93~7.45~0.19~3.2
169988~6~Celery, raw~14~0.69~2.97~0.17~1.6
168412~6~Endive, raw~17~1.25~3.35~0.2~3.1
169230~6~Garlic, raw~149~6.36~33.06~0.5~2.1
169387~6~Arugula, raw~25~2.58~3.65~0.66~1.6
169975~6~Cabbage, raw~25~1.28~5.8~0.1~2.5
168448~6~Pumpkin, raw~26~1~6.5~0.1~0.5
168462~6~Spinach, raw~23~2.86~3.63~0.39~2.2
170379~6~Broccoli, raw~34~2.82~6.64~0.37~2.6
169228~6~Eggplant, raw~25~0.98~5.88~0.18~3
168424~6~Kohlrabi, raw~27~1.7~6.2~0.1~3.6
168389~6~Asparagus, raw~20~2.2~3.88~0.12~2.1
170416~6~Parsley, fresh~36~2.97~6.33~0.79~3.3
170392~6~Cabbage, kimchi~15~1.1~2.4~0.5~1.6
170375~6~Beet greens, raw~22~2.2~4.33~0.13~3.7
169986~6~Cauliflower, raw~25~1.92~4.97~0.28~2
169892~6~Eggplant, pickled~49~0.9~9.77~0.7~2.5
170381~6~Broccoli raab, raw~22~3.17~2.85~0.49~2.7
170061~6~Turnip greens, raw~32~1.5~7.13~0.3~3.2
170382~6~Broccoli raab, cooked~25~3.83~3.12~0.52~2.8
170383~6~Brussels sprouts, raw~43~3.38~8.95~0.3~3.8
168440~6~New Zealand spinach, raw~14~1.5~2.5~0.2~1.5
169303~6~Sweet potato leaves, raw~42~2.49~8.82~0.51~5.3
169977~6~Cabbage, red, raw~31~1.43~7.37~0.16~2.1
169991~6~Chard, swiss, raw~19~1.8~3.74~0.2~1.6
169385~6~Fennel, bulb, raw~31~1.24~7.3~0.2~3.1
170388~6~Cabbage, savoy, raw~27~2~6.1~0.1~3.1
169394~6~Pepper, banana, raw~27~1.66~5.35~0.45~3.4
169329~6~Broccoli, leaves, raw~28~2.98~5.06~0.35~2.3
169225~6~Cucumber, peeled, raw~10~0.59~2.16~0.16~0.7
169404~6~Broccoli, chinese, raw~26~1.2~4.67~0.76~2.6
168431~6~Lettuce, red leaf, raw~13~1.33~2.26~0.22~0.9
169389~6~Cauliflower, green, raw~31~2.95~6.09~0.3~3.2
169379~6~Pickles, cucumber, sour~11~0.33~2.26~0.2~1.2
169891~6~Cabbage, mustard, salted~28~1.1~5.63~0.1~3.1
168409~6~Cucumber, with peel, raw~15~0.65~3.63~0.11~0.5
169249~6~Lettuce, green leaf, raw~15~1.36~2.87~0.15~1.3
169392~6~Broccoli, chinese, cooked~22~1.14~3.81~0.72~2.5
168432~6~Mountain yam, hawaii, raw~67~1.34~16.3~0.1~2.5
169247~6~Lettuce, cos or romaine, raw~17~1.23~3.29~0.3~2.1
169330~6~Broccoli, flower clusters, raw~28~2.98~5.06~0.35~2.3
169979~6~Cabbage, chinese (pe-tsai), raw~16~1.2~3.23~0.2~1.2
170390~6~Cabbage, chinese (pak-choi), raw~13~1.5~2.18~0.2~1
169300~6~Succotash, (corn and limas), raw~99~5.03~19.59~1.02~3.8
170491~6~Carrot juice, canned~40~0.95~9.28~0.15~0.8
168438~6~Mustard spinach, (tendergreen), raw~22~2.2~3.9~0.3~2.8
168538~6~Corn, sweet, white, raw~86~3.22~19.02~1.18~2.7
169998~6~Corn, sweet, yellow, raw~86~3.27~18.7~1.35~2
168558~6~Pickles, cucumber, dill or kosher dill~12~0.5~2.41~0.3~1
168472~6~Squash, winter, acorn, raw~40~0.8~10.42~0.1~1.5
169289~6~Squash, summer, scallop, raw~18~1.2~3.84~0.2~1.2
168475~6~Squash, winter, hubbard, raw~40~2~8.7~0.5~3.9
169295~6~Squash, winter, butternut, raw~45~1~11.69~0.1~2
169298~6~Squash, winter, spaghetti, raw~31~0.64~6.91~0.57~1.5
168390~6~Asparagus, cooked, boiled, drained~22~2.4~4.11~0.22~2
170487~6~Squash, summer, all varieties, raw~16~1.21~3.35~0.18~1.1
170489~6~Squash, winter, all varieties, raw~34~0.95~8.59~0.13~1.5
169248~6~Lettuce, iceberg (includes crisphead types), raw~14~0.9~2.97~0.14~1.2
169391~6~Cauliflower, green, cooked, with salt~32~3.04~6.28~0.31~3.3
169890~6~Cabbage, japanese style, fresh, pickled~30~1.6~5.67~0.1~3.1
168563~6~Pickles, cucumber, dill, reduced sodium~12~0.5~2.41~0.3~1
170527~6~Pumpkin, canned, with salt~34~1.1~8.09~0.28~2.9
169390~6~Cauliflower, green, cooked, no salt added~32~3.04~6.28~0.31~3.3
169305~6~Sweet potato, canned, mashed~101~1.98~23.19~0.2~1.7
168450~6~Pumpkin, canned, without salt~34~1.1~8.09~0.28~2.9
168429~6~Lettuce, butterhead (includes boston and bibb types), raw~13~1.35~2.23~0.22~1.1
170054~6~Tomato products, canned, sauce~24~1.2~5.31~0.3~1.5
169207~6~Asparagus, canned, drained solids~19~2.14~2.46~0.65~1.6
168485~6~Sweet potato, canned, vacuum pack~91~1.65~21.12~0.2~1.8
169378~6~Pickles, cucumber, sweet (includes bread and butter pickles)~91~0.58~21.15~0.41~1
168464~6~Squash, summer, crookneck and straightneck, raw~19~1.01~3.88~0.27~1
170133~6~Sweet potato leaves, cooked, steamed, with salt~35~2.18~7.38~0.34~1.9
169074~6~Tomato sauce, canned, no salt added~24~1.2~5.31~0.3~1.5
168119~6~Turnip greens, canned, no salt added~19~1.36~2.81~0.3~1.3
169376~6~Mushroom, white, exposed to ultraviolet light, raw~22~3.09~3.26~0.34~1
169304~6~Sweet potato leaves, cooked, steamed, without salt~35~2.18~7.38~0.34~1.9
170458~6~Tomato juice, canned, with salt added~17~0.85~3.53~0.29~0.4
169355~6~Kale, cooked, boiled, drained, with salt~44~2.94~5.3~1.21~2.3
170098~6~Okra, cooked, boiled, drained, with salt~22~1.87~4.51~0.21~2.5
170545~6~Tomato juice, canned, without salt added~17~0.85~3.53~0.29~0.4
170537~6~Squash, winter, hubbard, baked, with salt~50~2.48~10.81~0.62~4.9
170467~6~Turnip greens, canned, solids and liquids~14~1.36~2.42~0.3~1.7
169342~6~Celery, cooked, boiled, drained, with salt~18~0.83~4~0.16~1.6
169397~6~Pickles, chowchow, with cauliflower onion mustard, sweet~121~1.5~26.64~0.9~1.5
169238~6~Kale, cooked, boiled, drained, without salt~36~2.94~5.3~1.21~4
169261~6~Okra, cooked, boiled, drained, without salt~22~1.87~4.51~0.21~2.5
170526~6~Pumpkin, cooked, boiled, drained, with salt~18~0.72~4.31~0.07~1.1
170531~6~Spinach, cooked, boiled, drained, with salt~23~2.97~3.75~0.26~2.4
168510~6~Broccoli, cooked, boiled, drained, with salt~35~2.38~7.18~0.41~3.3
169352~6~Eggplant, cooked, boiled, drained, with salt~33~0.83~8.14~0.23~2.5
169357~6~Kohlrabi, cooked, boiled, drained, with salt~29~1.8~6.69~0.11~1.1
168476~6~Squash, winter, hubbard, baked, without salt~50~2.48~10.81~0.62~4.9
169313~6~Asparagus, cooked, boiled, drained, with salt~22~2.4~4.11~0.22~2
169989~6~Celery, cooked, boiled, drained, without salt~18~0.83~4~0.16~1.6
169976~6~Cabbage, cooked, boiled, drained, without salt~23~1.27~5.51~0.06~1.9
168449~6~Pumpkin, cooked, boiled, drained, without salt~20~0.72~4.9~0.07~1.1
168463~6~Spinach, cooked, boiled, drained, without salt~23~2.97~3.75~0.26~2.4
168508~6~Beet greens, cooked, boiled, drained, with salt~27~2.57~5.46~0.2~2.9
169967~6~Broccoli, cooked, boiled, drained, without salt~35~2.38~7.18~0.41~3.3
168520~6~Cauliflower, cooked, boiled, drained, with salt~23~1.84~4.11~0.45~2.3
169229~6~Eggplant, cooked, boiled, drained, without salt~35~0.83~8.73~0.23~2.5
168425~6~Kohlrabi, cooked, boiled, drained, without salt~29~1.8~6.69~0.11~1.1
170139~6~Turnip greens, cooked, boiled, drained, with salt~20~1.14~4.36~0.23~3.5
170376~6~Beet greens, cooked, boiled, drained, without salt~27~2.57~5.46~0.2~2.9
170397~6~Cauliflower, cooked, boiled, drained, without salt~23~1.84~4.11~0.45~2.3
170120~6~Pumpkin leaves, cooked, boiled, drained, with salt~21~2.72~3.39~0.22~2.7
168513~6~Brussels sprouts, cooked, boiled, drained, with salt~36~2.55~7.1~0.5~2.6
170466~6~Turnip greens, cooked, boiled, drained, without salt~20~1.14~4.36~0.23~3.5
168447~6~Pumpkin leaves, cooked, boiled, drained, without salt~21~2.72~3.39~0.22~2.7
169271~6~Pumpkin flowers, cooked, boiled, drained, without salt~15~1.09~3.3~0.08~0.9
169971~6~Brussels sprouts, cooked, boiled, drained, without salt~36~2.55~7.1~0.5~2.6
170506~6~New zealand spinach, cooked, boiled, drained, with salt~12~1.3~2.13~0.17~1.4
168482~6~Sweet potato, raw, unprepared (Includes foods for USDA's Food Distribution Program)~86~1.57~20.12~0.05~3
170056~6~Tomato products, canned, sauce, with onions~42~1.56~9.94~0.19~1.8
168441~6~New Zealand spinach, cooked, boiled, drained, without salt~12~1.3~2.13~0.17~1.4
169286~6~Spinach, canned, regular pack, drained solids~23~2.81~3.4~0.5~2.4
170085~6~Tomato products, canned, sauce, spanish style~33~1.44~7.24~0.27~1.4
170055~6~Tomato products, canned, sauce, with mushrooms~35~1.45~8.43~0.13~1.5
170128~6~Squash, winter, acorn, cooked, baked, with salt~56~1.12~14.58~0.14~4.4
170546~6~Tomato products, canned, puree, with salt added~38~1.65~8.98~0.21~1.9
168515~6~Cabbage, red, cooked, boiled, drained, with salt~29~1.51~6.94~0.09~2.6
169343~6~Chard, swiss, cooked, boiled, drained, with salt~20~1.88~4.13~0.08~2.1
170084~6~Sweet potato, canned, syrup pack, drained solids~108~1.28~25.36~0.32~3
169285~6~Spinach, canned, regular pack, solids and liquids~19~2.11~2.92~0.37~1.6
170551~6~Yam, cooked, boiled, drained, or baked, with salt~114~1.49~26.99~0.14~3.9
168516~6~Cabbage, savoy, cooked, boiled, drained, with salt~24~1.8~5.41~0.09~2.8
170123~6~Spinach, canned, no salt added, solids and liquids~19~2.11~2.92~0.37~2.2
169293~6~Squash, winter, acorn, cooked, baked, without salt~56~1.12~14.58~0.14~4.4
170460~6~Tomato products, canned, puree, without salt added~38~1.65~8.98~0.21~1.9
169206~6~Asparagus, canned, regular pack, solids and liquids~15~1.8~2.48~0.18~1
168514~6~Cabbage, common, cooked, boiled, drained, with salt~23~1.27~5.51~0.06~1.9
169978~6~Cabbage, red, cooked, boiled, drained, without salt~29~1.51~6.94~0.09~2.6
170401~6~Chard, swiss, cooked, boiled, drained, without salt~20~1.88~4.13~0.08~2.1
170130~6~Squash, winter, butternut, cooked, baked, with salt~40~0.9~10.49~0.09~3.2
170160~0~Nuts, almond paste~458~9~47.81~27.74~4.8
170162~0~Nuts, cashew nuts, raw~553~18.22~30.19~43.85~3.3
170554~0~Seeds, chia seeds, dried~486~16.54~42.12~30.74~34.4
170148~0~Seeds, hemp seed, hulled~553~31.56~8.67~48.75~4
170178~0~Nuts, macadamia nuts, raw~718~7.91~13.82~75.77~8.6
170184~0~Nuts, pistachio nuts, raw~560~20.16~27.17~45.32~10.6
170191~0~Seeds, sesame butter, paste~586~18.08~24.05~50.87~5.5
170562~0~Seeds, sunflower seed kernels, dried~584~20.78~20~51.46~8.6
170155~0~Seeds, sunflower seed butter, without salt~617~17.28~23.32~55.2~5.7
170556~0~Seeds, pumpkin and squash seed kernels, dried~559~30.23~10.71~49.05~6
170150~0~Seeds, sesame seeds, whole, dried~573~17.73~23.45~49.67~11.8
170156~0~Seeds, sunflower seed flour, partially defatted~326~48.06~35.83~1.61~5.2
169412~0~Seeds, sesame seed kernels, dried (decorticated)~631~20.45~11.73~61.21~11.6
168603~0~Nuts, almond butter, plain, with salt added~614~20.96~18.82~55.5~10.3
168597~0~Nuts, cashew butter, plain, with salt added~609~12.12~30.3~53.03~3
168588~0~Nuts, almond butter, plain, without salt added~614~20.96~18.82~55.5~10.3
170163~0~Nuts, cashew butter, plain, without salt added~587~17.56~27.57~49.41~2
169421~0~Nuts, cashew nuts, dry roasted, with salt added~574~15.31~32.69~46.35~3
169422~0~Nuts, cashew nuts, oil roasted, with salt added~581~16.84~30.16~47.77~3.3
170151~0~Seeds, sesame seeds, whole, roasted and toasted~565~16.96~25.74~48~14
170571~0~Nuts, cashew nuts, dry roasted, without salt added~574~15.31~32.69~46.35~3
170572~0~Nuts, cashew nuts, oil roasted, without salt added~580~16.84~29.87~47.77~3.3
168598~0~Nuts, macadamia nuts, dry roasted, with salt added~716~7.79~12.83~76.08~8
169426~0~Nuts, pistachio nuts, dry roasted, with salt added~569~21.05~27.55~45.82~10.3
170154~0~Seeds, sunflower seed kernels, toasted, without salt~619~17.21~20.59~56.8~11.5
168608~1~Beef, grass-fed, ground, raw~198~19.42~0~12.73~0
170198~1~Beef, cured, breakfast strips, cooked~449~31.3~1.4~34.4~0
168605~1~Beef, retail cuts, separable fat, raw~674~8.21~0~70.89~0
168606~1~Beef, retail cuts, separable fat, cooked~680~10.65~0~70.33~0
173110~1~Beef, ground, 93% lean meat / 7% fat, raw~152~20.85~0~7~0
171790~1~Beef, ground, 95% lean meat / 5% fat, raw~137~21.41~0~5~0
173111~1~Beef, ground, 97% lean meat / 3% fat, raw~121~21.98~0~3~0
168652~1~Beef, ground, 70% lean meat / 30% fat, raw~332~14.35~0~30~0
174037~1~Beef, ground, 75% lean meat / 25% fat, raw~293~15.76~0~25~0
174036~1~Beef, ground, 80% lean meat / 20% fat, raw~254~17.17~0~20~0
174030~1~Beef, ground, 90% lean meat / 10% fat, raw~176~20~0~10~0
172161~1~Beef, ground, unspecified fat content, cooked~240~25.07~0.62~14.53~0
170197~1~Beef, cured, breakfast strips, raw or unheated~406~12.5~0.7~38.8~0
170193~1~Beef, variety meats and by-products, suet, raw~854~1.5~0~94~0
168622~1~Beef, variety meats and by-products, brain, raw~143~10.86~1.05~10.3~0
168628~1~Beef, variety meats and by-products, lungs, raw~92~16.2~0~2.5~0
170599~1~Beef, variety meats and by-products, tripe, raw~85~12.07~0~3.69~0
169454~1~Beef, variety meats and by-products, spleen, raw~105~18.3~0~3~0
170194~1~Beef, variety meats and by-products, thymus, raw~236~12.18~0~20.35~0
169449~1~Beef, variety meats and by-products, kidneys, raw~99~17.4~0.29~3.09~0
169044~10~Beverages, Orange juice drink~54~0.2~13.41~0~0.2
174111~10~Beverages, Kiwi Strawberry Juice Drink~47~0~12.26~0~0
171869~10~Beverages, carbonated, tonic water~34~0~8.8~0~0
171900~10~Beverages, OCEAN SPRAY, Cran Lemonade~45~0.07~11.12~0~0.6
175096~10~Beverages, water, tap, well~0~0~0~0~0
174120~10~Beverages, tea, Oolong, brewed~1~0~0.15~0~0
171896~10~Beverages, OCEAN SPRAY, Diet Cranberry Juice~4~0.07~0.8~0~0.6
173647~10~Beverages, water, tap, drinking~0~0~0~0~0
171946~10~Beverages, tea, hibiscus, brewed~0~0~0~0~0
175103~10~Beverages, water, tap, municipal~0~0~0~0~0
173702~2~Fish, surimi~99~15.18~6.85~0.9~0
175160~2~Fish, tuna salad~187~16.04~9.41~9.26~0
171952~2~Fish, carp, raw~127~17.83~0~5.6~0
171958~2~Fish, cusk, raw~87~18.99~0~0.69~0
173670~2~Fish, ling, raw~87~18.99~0~0.64~0
175141~2~Fish, scup, raw~105~18.88~0~2.73~0
173700~2~Fish, spot, raw~123~18.51~0~4.9~0
171953~2~Fish, cisco, raw~98~18.99~0~1.91~0
171950~2~Fish, burbot, raw~90~19.31~0~0.81~0
171964~2~Fish, haddock, raw~74~16.32~0~0.45~0
173671~2~Fish, lingcod, raw~85~17.66~0~1.06~0
175176~2~Fish, tilapia, raw~96~20.08~0~1.7~0
171949~2~Fish, bluefish, raw~124~20.04~0~4.24~0
171954~2~Fish, cisco, smoked~177~16.36~0~11.9~0
171959~2~Fish, mahimahi, raw~85~18.5~0~0.7~0
173675~2~Fish, milkfish, raw~148~20.53~0~6.73~0
173676~2~Fish, monkfish, raw~76~14.48~0~1.52~0
173705~2~Fish, tilefish, raw~96~17.5~0~2.31~0
175134~2~Fish, sablefish, raw~195~13.41~0~15.3~0
173703~2~Fish, swordfish, raw~144~19.66~0~6.65~0
167722~15~Tofu yogurt~94~3.5~15.96~1.8~0.2
174276~15~Soy protein isolate~335~88.32~0~3.39~0
174288~15~Chickpea flour (besan)~387~22.39~57.82~6.69~10.8
172451~15~Tofu, fried~270~18.82~8.86~20.18~3.9
173788~15~HOUSE FOODS Premium Firm Tofu~85~10.92~0.97~4.19~0.9
173787~15~HOUSE FOODS Premium Soft Tofu~59~6.38~2.19~2.71~0.8
174289~15~Hummus, commercial~237~7.78~15~17.82~5.5
172444~15~Soy flour, low-fat~372~49.81~30.63~8.9~16
174278~15~Soy sauce made from soy (tamari)~60~10.51~5.57~0.1~0.8
174275~15~Soy flour, defatted~327~51.46~33.92~1.22~17.5
169884~15~Vermicelli, made from soy~331~0.1~82.32~0.1~3.9
174277~15~Soy sauce made from soy and wheat (shoyu)~53~8.14~4.93~0.57~0.8
174279~15~Soy sauce made from hydrolyzed vegetable protein~60~7~7.84~0.51~0.5
174302~15~Soy protein isolate, potassium type~321~88.32~2.59~0.53~0
174273~15~Soy flour, full-fat, raw~434~37.81~31.92~20.65~9.6
174274~15~Soy flour, full-fat, roasted~439~38.09~30.38~21.86~9.7
172461~15~MORI-NU, Tofu, silken, firm~62~6.9~2.4~2.7~0.1
174292~15~MORI-NU, Tofu, silken, soft~55~4.8~2.9~2.7~0.1
172463~15~MORI-NU, Tofu, silken, lite firm~37~6.3~1.1~0.8~0
172462~15~MORI-NU, Tofu, silken, extra firm~55~7.4~2~1.9~0.1
172464~15~MORI-NU, Tofu, silken, lite extra firm~38~7~1~0.7~0
172474~15~Soy sauce, reduced sodium, made from hydrolyzed vegetable protein~90~8.19~14.44~0.31~0.3
172454~15~Hummus, home prepared~177~4.86~20.12~8.59~4
172450~15~Tofu, dried-frozen (koyadofu)~477~52.47~10.03~30.34~7.2
174291~15~Tofu, hard, prepared with nigari~145~12.68~4.39~9.99~0.6
174301~15~Soy protein concentrate, produced by acid wash~328~63.63~25.41~0.46~5.5
174290~15~Tofu, extra firm, prepared with nigari~83~9.98~1.18~5.26~1
172473~15~Soy sauce made from soy and wheat (shoyu), low sodium~57~9.05~5.59~0.3~0.7
174304~15~Tofu, fried, prepared with calcium sulfate~270~18.82~8.86~20.18~3.9
172475~15~Tofu, raw, firm, prepared with calcium sulfate~144~17.27~2.78~8.72~2.3
174303~15~Tofu, dried-frozen (koyadofu), prepared with calcium sulfate~470~52.43~8.3~30.34~1.2
172476~15~Tofu, raw, regular, prepared with calcium sulfate~76~8.08~1.87~4.78~0.3
172448~15~Tofu, firm, prepared with calcium sulfate and magnesium chloride (nigari)~78~9.04~2.85~4.17~0.9
172449~15~Tofu, soft, prepared with calcium sulfate and magnesium chloride (nigari)~61~7.17~1.18~3.69~0.2
174370~13~Lamb, ground, raw~282~16.56~0~23.41~0
175290~13~Veal, ground, raw~197~18.58~0~13.06~0
172544~13~Lamb, ground, cooked, broiled~283~24.75~0~19.65~0
175291~13~Veal, ground, cooked, broiled~172~24.38~0~7.56~0
174879~13~Veal, ground, cooked, pan-fried~215~25.83~1.51~11.78~0
172567~13~Veal, breast, separable fat, cooked~521~9.4~0~53.35~0
172673~7~Bread, egg~287~9.5~47.8~6~2.3
172684~7~Bread, rye~259~8.5~48.3~3.3~5.8
172686~7~Bread, wheat~274~10.67~47.54~4.53~4
167944~7~Bread, cheese~408~10.42~44.83~20.83~2.1
167943~7~Bread, potato~266~12.5~47.07~3.13~6.3
172750~7~Cracker, meal~383~9.3~80.9~1.7~2.6
174913~7~Bread, Italian~259~9.49~48.11~2.73~2.1
172678~7~Bread, oatmeal~269~8.4~48.5~4.4~4
171849~7~Bread, cinnamon~253~7.05~44.38~5.29~3.5
172676~7~Bread, oat bran~236~10.4~39.8~4.4~4.5
174923~7~Bread, rice bran~243~8.9~43.5~4.6~4.9
167532~7~Bread, white wheat~238~10.66~43.91~2.15~9.2
174918~7~Bread, pumpernickel~250~8.7~47.5~3.1~6.5
172672~7~Bread, cracked-wheat~260~8.7~49.5~3.9~5.5
172754~7~Danish pastry, cheese~374~8~37.2~21.9~1
171867~7~Cookies, Marie biscuit~406~7.05~70.54~10.58~3.5
172802~7~Wonton wrappers (includes egg roll wrappers)~291~9.8~57.9~1.5~1.8
174917~7~Bread, protein (includes gluten)~245~12.1~43.8~2.2~3
172674~7~Bread, egg, toasted~315~10.5~52.6~6.6~2.5
172685~7~Bread, rye, toasted~284~9.4~53.1~3.6~6.4
174929~7~Bread, sticks, plain~412~12~68.4~9.5~3
172687~7~Bread, wheat, toasted~313~12.96~55.77~4.27~4.7
175000~7~Ice cream cones, cake or wafer-type~417~8.1~79~6.9~3
171850~7~Bread, wheat, sprouted~188~13.16~33.88~0~5.3
172679~7~Bread, oatmeal, toasted~292~9.2~52.7~4.8~4.3
172680~7~Bread, raisin, enriched~274~7.9~52.3~4.4~4.3
174937~7~Cake, coffeecake, fruit~311~5.2~51.5~10.2~2.5
172677~7~Bread, oat bran, toasted~259~11.4~43.7~4.8~4.9
174916~7~Bread, pita, whole-wheat~262~9.8~55.89~1.71~6.1
172699~7~Cake, coffeecake, cheese~339~7~44.3~15.2~1
167590~7~Andrea's, Gluten Free Soft Dinner Roll~257~5.65~40.24~8.2~2.9
172817~7~Bread, raisin, unenriched~274~7.9~52.3~4.4~4.3
175044~7~Bread, rice bran, toasted~264~9.7~47.3~5~5.3
174920~7~Bread, reduced-calorie, rye~203~9.1~40.5~2.9~12
168013~7~Bread, multi-grain (includes whole-grain)~265~13.36~43.34~4.23~7.4
174933~7~Cake, cherry fudge with chocolate frosting~264~2.4~38~12.5~0.5
174921~7~Bread, reduced-calorie, wheat~217~13.32~42.47~2.92~11.1
174922~7~Bread, reduced-calorie, white~207~8.7~44.3~2.5~9.7
172675~7~Bread, french or vienna (includes sourdough)~272~10.75~51.88~2.42~2.2
167528~7~Pastry, Pastelitos de Guava (guava pastries)~379~5.48~47.76~18.5~2.2
172682~7~Bread, reduced-calorie, oat bran~201~8~41.3~3.2~12
172827~7~Danish pastry, lemon, unenriched~371~5.4~47.8~18.5~1.9
172753~7~Danish pastry, cinnamon, enriched~403~7~44.6~22.4~1.3
171866~7~Cookies, chocolate cream covered biscuit sticks~447~10~51.08~22.5~5
167935~7~Bread, pan dulce, sweet yeast bread~367~9.42~56.38~11.58~2.3
172824~7~Danish pastry, cinnamon, unenriched~403~7~44.6~22.4~1.2
174091~7~Bread, french or vienna, whole wheat~239~8.33~49.1~1.04~4.2
175061~7~Danish pastry, raspberry, unenriched~371~5.4~47.8~18.5~1.9
174080~7~Cookie, chocolate, with icing or coating~507~4.5~67.87~24.2~2.3
174915~7~Bread, pita, white, enriched~275~9.1~55.7~1.2~2.2
169640~11~Honey~304~0.3~82.4~0~0.2
168771~11~Chewing gum~360~0~96.7~0.3~2.4
167953~11~Fruit syrup~341~0~85.13~0~0.1
167743~11~Syrup, Cane~269~0~73.14~0~0
168809~11~Ice creams, chocolate~216~3.8~28.2~11~1.2
167957~11~Syrup, fruit flavored~261~0~65.1~0.02~0
169882~11~Chewing gum, sugarless~268~0~94.8~0.4~2.4
167587~11~Candies, milk chocolate~535~7.65~59.4~29.66~3.4
169666~11~Toppings, nuts in syrup~448~4.5~58.08~22~2.3
167977~11~Candies, sweet chocolate~507~3.9~60.4~34.2~5.5
167571~11~Candies, white chocolate~539~5.87~59.24~32.09~0.2
168759~11~Candies, MOUNDS Candy Bar~493~4.6~58.88~26.6~3.7
170286~4~Buckwheat~343~13.25~71.5~3.4~10
168884~4~Rye grain~338~10.34~75.86~1.63~15.1
172023~4~Millet flour~382~10.75~75.12~4.25~3.5
169716~4~Sorghum grain~329~10.62~72.09~3.46~6.7
169740~4~Barley malt flour~361~10.28~78.3~1.84~7.1
168147~4~Vital wheat gluten~370~75.16~13.79~1.85~0.6
169739~4~Barley flour or meal~345~10.5~74.52~1.6~10.1
170688~4~Bulgur, dry~342~12.29~75.87~1.33~12.5
169702~4~Millet, raw~378~11.02~72.85~4.22~8.5
169699~4~Couscous, dry~376~12.76~77.43~0.64~5
168872~4~Oat bran, raw~246~17.3~66.22~7.03~15.4
169746~4~Spelt, cooked~127~5.5~26.44~0.85~3.9
170283~4~Barley, hulled~354~12.48~73.48~2.3~17.3
170287~4~Bulgur, cooked~83~3.08~18.58~0.24~4.5
168871~4~Millet, cooked~119~3.51~23.67~1~1.3
168917~4~Quinoa, cooked~120~4.4~21.3~1.92~2.8
168885~4~Rye flour, dark~325~15.91~68.63~2.22~23.8
169745~4~Spelt, uncooked~338~14.57~70.19~2.43~10.7
169725~4~Wheat, sprouted~198~7.49~42.53~1.27~1.1
169700~4~Couscous, cooked~112~3.79~23.22~0.16~1.4
168873~4~Oat bran, cooked~40~3.21~11.44~0.86~2.6
168874~4~Quinoa, uncooked~368~14.12~64.16~6.07~7
169713~4~Rice bran, crude~316~13.35~49.69~20.85~21
168887~4~Rye flour, light~357~9.82~76.68~1.33~8
168898~4~Rice flour, brown~363~7.23~76.48~2.78~4.6
169742~4~Rice noodles, dry~364~5.95~80.18~0.56~1.6
168886~4~Rye flour, medium~349~10.88~75.43~1.52~11.8
169722~4~Wheat bran, crude~216~15.55~64.51~4.25~42.8
168892~4~Wheat germ, crude~360~23.15~51.8~9.72~13.2
169719~4~Wheat, hard white~342~11.31~75.9~1.71~12.2
169720~4~Wheat, soft white~340~10.69~75.36~1.99~12.7
170288~4~Corn grain, yellow~365~9.42~74.26~4.74~7.3
168914~4~Rice noodles, cooked~108~1.79~24.01~0.2~1
170683~4~Amaranth grain, cooked~102~3.8~18.69~1.58~2.1
168889~4~Wheat, hard red spring~329~15.4~68.03~1.92~12.2
168890~4~Wheat, hard red winter~327~12.61~71.18~1.54~12.2
168891~4~Wheat, soft red winter~331~10.35~74.24~1.56~12.5
170682~4~Amaranth grain, uncooked~371~13.56~65.25~7.02~6.7
168943~4~Sorghum flour, whole-grain~359~8.43~76.64~3.34~6.6
170687~4~Buckwheat flour, whole-groat~335~12.62~70.59~3.1~10
168888~4~Triticale flour, whole-grain~338~13.18~73.14~1.81~14.6
169741~4~Oat flour, partially debranned~404~14.66~65.7~9.12~6.5
170284~4~Barley, pearled, raw~352~9.91~77.72~1.16~15.6
169736~4~Pasta, dry, enriched~371~13.04~74.67~1.51~3.2
168927~4~Pasta, dry, unenriched~371~13.04~74.67~1.51~3.2
170285~4~Barley, pearled, cooked~123~2.26~28.22~0.44~3.8
169750~4~Cornmeal, whole-grain, white~362~8.12~76.89~3.59~7.3
169697~4~Cornmeal, whole-grain, yellow~362~8.12~76.89~3.59~7.3
169714~4~Rice flour, white, unenriched~366~5.95~80.13~1.42~2.4
169744~4~Wheat, KAMUT khorasan, cooked~132~5.71~27.6~0.83~4.3
173343~9~Potato salad with egg~157~1.96~16.18~9.4~1.3
173330~9~Beef stew, canned entree~99~4.41~7.85~5.53~0.9
174803~5~Snack, Mixed Berry Bar~383~13.16~58.84~10.53~7.9
173160~5~Snacks, shrimp cracker~426~7.14~59.09~17.86~5.6
167550~5~Snacks, popcorn, cakes~384~9.7~80.1~3.1~2.9`;

export const USDA_FOOD_EXPANSION: FoodItem[] = SOURCE_ROWS.split("\n").map((row) => {
  const [fdcId, categoryCode, name, calories, protein, carbs, fat, fiber] = row.split("~");
  const category = categoryCode ? CATEGORIES[categoryCode] : undefined;
  if (!fdcId || !name || !category || !calories || !protein || !carbs || !fat || !fiber) {
    throw new Error(`Invalid USDA food expansion row: ${row}`);
  }

  return {
    id: `f-usda-sr-${fdcId}`,
    name,
    englishName: name,
    category,
    servingSize: "100 גרם",
    calories: Number(calories),
    protein: Number(protein),
    carbs: Number(carbs),
    fat: Number(fat),
    fiber: Number(fiber),
    notes: `USDA FoodData Central SR Legacy Release 1 (2018-04), FDC ID ${fdcId}; values per 100 g.`,
    searchTerms: [name.toLocaleLowerCase()],
  };
});
