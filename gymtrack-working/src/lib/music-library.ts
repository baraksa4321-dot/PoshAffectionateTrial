export type BuiltInMusicTrack = {
  title: string;
  artist: string;
};

export type BuiltInMusicGenre = {
  style: string;
  className: string;
  tracks: BuiltInMusicTrack[];
};

export const BUILT_IN_MUSIC_GENRES: BuiltInMusicGenre[] = [
  {
    style: "עברית רגועה",
    className: "bg-[#fff0f5] text-[#a23b62] hover:bg-[#ffe2ec]",
    tracks: [
      { title: "יש בי אהבה", artist: "אריק איינשטיין" },
      { title: "מישהו הולך תמיד איתי", artist: "עפרה חזה" },
      { title: "שיר לשירה", artist: "יהודית רביץ" },
    ],
  },
  {
    style: "עברית אקוסטית",
    className: "bg-[#fff6e8] text-[#99621d] hover:bg-[#ffebc9]",
    tracks: [
      { title: "עניין של זמן", artist: "גידי גוב" },
      { title: "נוף ילדות", artist: "שלמה ארצי" },
      { title: "הכל עומד במקום", artist: "דניאלה ספקטור" },
    ],
  },
  {
    style: "עברית נוסטלגית",
    className: "bg-[#f2efff] text-[#6552a4] hover:bg-[#e7e1ff]",
    tracks: [
      { title: "עטור מצחך", artist: "אריק איינשטיין" },
      { title: "אני ואתה", artist: "אריק איינשטיין" },
      { title: "הללויה", artist: "חלב ודבש" },
    ],
  },
  {
    style: "מזרחית רגועה",
    className: "bg-[#fff4df] text-[#a25b00] hover:bg-[#ffeac2]",
    tracks: [
      { title: "ים של דמעות", artist: "עופר לוי" },
      { title: "כשאת עצובה", artist: "אייל גולן" },
      { title: "שביל הבריחה", artist: "ישי לוי" },
    ],
  },
  {
    style: "מזרחית קצבית",
    className: "bg-[#fff0dc] text-[#ad4e16] hover:bg-[#ffe0c0]",
    tracks: [
      { title: "דרך השלום", artist: "פאר טסי" },
      { title: "מלכת היופי שלי", artist: "אייל גולן" },
      { title: "רק שלך", artist: "עדן חסון" },
    ],
  },
  {
    style: "פופ ישראלי",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
    tracks: [
      { title: "מיליון דולר", artist: "נועה קירל" },
      { title: "סיבת הסיבות", artist: "ישי ריבו" },
      { title: "קומי", artist: "עידן רייכל" },
    ],
  },
  {
    style: "רוק ישראלי",
    className: "bg-[#f0f0f0] text-[#333] hover:bg-[#e4e4e4]",
    tracks: [
      { title: "מחכה", artist: "ריטה" },
      { title: "היא כל כך יפה", artist: "כוורת" },
      { title: "נשל הנחש", artist: "מאיר אריאל" },
    ],
  },
  {
    style: "טופ 2000",
    className: "bg-[#e8f7ed] text-[#137333] hover:bg-[#d4f0dc]",
    tracks: [
      { title: "Crazy in Love", artist: "Beyoncé" },
      { title: "Mr. Brightside", artist: "The Killers" },
      { title: "Since U Been Gone", artist: "Kelly Clarkson" },
    ],
  },
  {
    style: "שנות ה־80",
    className: "bg-[#f7edff] text-[#7a3e9d] hover:bg-[#eedcff]",
    tracks: [
      { title: "Take on Me", artist: "a-ha" },
      { title: "Everybody Wants to Rule the World", artist: "Tears for Fears" },
      { title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper" },
    ],
  },
  {
    style: "שנות ה־90",
    className: "bg-[#edf7ff] text-[#246386] hover:bg-[#dcefff]",
    tracks: [
      { title: "Wannabe", artist: "Spice Girls" },
      { title: "No Scrubs", artist: "TLC" },
      { title: "Everybody", artist: "Backstreet Boys" },
    ],
  },
  {
    style: "להיטי שנות ה־2000",
    className: "bg-[#fff4df] text-[#8b5a10] hover:bg-[#ffeac2]",
    tracks: [
      { title: "Hips Don't Lie", artist: "Shakira" },
      { title: "The Middle", artist: "Jimmy Eat World" },
      { title: "Don't Stop the Music", artist: "Rihanna" },
    ],
  },
  {
    style: "פופ עולמי",
    className: "bg-[#eaf2ff] text-[#245ca8] hover:bg-[#dce9ff]",
    tracks: [
      { title: "As It Was", artist: "Harry Styles" },
      { title: "Levitating", artist: "Dua Lipa" },
      { title: "Anti-Hero", artist: "Taylor Swift" },
    ],
  },
  {
    style: "R&B",
    className: "bg-[#f5edff] text-[#7447a8] hover:bg-[#eae0ff]",
    tracks: [
      { title: "Best Part", artist: "Daniel Caesar & H.E.R." },
      { title: "Good Days", artist: "SZA" },
      { title: "Leave the Door Open", artist: "Silk Sonic" },
    ],
  },
  {
    style: "היפ הופ",
    className: "bg-[#f0f0f0] text-[#222] hover:bg-[#e4e4e4]",
    tracks: [
      { title: "Lose Yourself", artist: "Eminem" },
      { title: "Alright", artist: "Kendrick Lamar" },
      { title: "Empire State of Mind", artist: "JAY-Z & Alicia Keys" },
    ],
  },
  {
    style: "EDM",
    className: "bg-[#e9f8ff] text-[#16708f] hover:bg-[#d7f1fb]",
    tracks: [
      { title: "Titanium", artist: "David Guetta & Sia" },
      { title: "Levels", artist: "Avicii" },
      { title: "Don't You Worry Child", artist: "Swedish House Mafia" },
    ],
  },
  {
    style: "האוס",
    className: "bg-[#edfff7] text-[#21765a] hover:bg-[#d9f7e9]",
    tracks: [
      { title: "One More Time", artist: "Daft Punk" },
      { title: "Cola", artist: "CamelPhat & Elderbrook" },
      { title: "Music Sounds Better with You", artist: "Stardust" },
    ],
  },
  {
    style: "טכנו",
    className: "bg-[#ececf5] text-[#4c4c7a] hover:bg-[#dfdff0]",
    tracks: [
      { title: "The Age of Love", artist: "Jam & Spoon" },
      { title: "Spastik", artist: "Plastikman" },
      { title: "Your Mind", artist: "Charlotte de Witte" },
    ],
  },
  {
    style: "Deep House",
    className: "bg-[#eaf6f5] text-[#28766a] hover:bg-[#d8eeeb]",
    tracks: [
      { title: "Show Me Love", artist: "Robin S." },
      { title: "Glue", artist: "Bicep" },
      { title: "Ocean Drive", artist: "Duke Dumont" },
    ],
  },
  {
    style: "רגאטון",
    className: "bg-[#fff0e8] text-[#ae4d2e] hover:bg-[#ffe0d2]",
    tracks: [
      { title: "Despacito", artist: "Luis Fonsi & Daddy Yankee" },
      { title: "Bailando", artist: "Enrique Iglesias" },
      { title: "Dákiti", artist: "Bad Bunny & Jhay Cortez" },
    ],
  },
  {
    style: "לטיני",
    className: "bg-[#fff8dd] text-[#947014] hover:bg-[#fff0b8]",
    tracks: [
      { title: "Vivir Mi Vida", artist: "Marc Anthony" },
      { title: "La Camisa Negra", artist: "Juanes" },
      { title: "Bamboléo", artist: "Gipsy Kings" },
    ],
  },
  {
    style: "רוק קלאסי",
    className: "bg-[#f2f2f2] text-[#3b3b3b] hover:bg-[#e5e5e5]",
    tracks: [
      { title: "Don't Stop Me Now", artist: "Queen" },
      { title: "Go Your Own Way", artist: "Fleetwood Mac" },
      { title: "Back in Black", artist: "AC/DC" },
    ],
  },
  {
    style: "אינדי",
    className: "bg-[#eef5ff] text-[#3f639b] hover:bg-[#e0ebff]",
    tracks: [
      { title: "Dog Days Are Over", artist: "Florence + The Machine" },
      { title: "Electric Feel", artist: "MGMT" },
      { title: "Lisztomania", artist: "Phoenix" },
    ],
  },
  {
    style: "Lo-fi",
    className: "bg-[#f3f0ff] text-[#6855a0] hover:bg-[#e7e2ff]",
    tracks: [
      { title: "Feather", artist: "Nymano" },
      { title: "Affection", artist: "Jinsang" },
      { title: "Reflection", artist: "SwuM" },
    ],
  },
  {
    style: "לימודים וריכוז",
    className: "bg-[#eef8f5] text-[#397568] hover:bg-[#dceee9]",
    tracks: [
      { title: "Experience", artist: "Ludovico Einaudi" },
      { title: "Near Light", artist: "Ólafur Arnalds" },
      { title: "Says", artist: "Nils Frahm" },
    ],
  },
  {
    style: "קלאסי",
    className: "bg-[#faf4e8] text-[#806338] hover:bg-[#f2e8d4]",
    tracks: [
      { title: "Clair de Lune", artist: "Claude Debussy" },
      { title: "Gymnopédie No. 1", artist: "Erik Satie" },
      { title: "The Four Seasons: Spring", artist: "Antonio Vivaldi" },
    ],
  },
  {
    style: "מדיטציה",
    className: "bg-[#edf8f2] text-[#4c8061] hover:bg-[#dcefe3]",
    tracks: [
      { title: "Weightless", artist: "Marconi Union" },
      { title: "An Ending (Ascent)", artist: "Brian Eno" },
      { title: "Saman", artist: "Ólafur Arnalds" },
    ],
  },
];
