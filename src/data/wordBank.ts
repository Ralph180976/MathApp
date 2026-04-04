// ─── Word Bank ───
// Level 1-20: words increase in length and complexity
// Complex words (level 8+) include simple definitions

export interface WordEntry {
  word: string;
  definition?: string; // simple child-friendly definition for harder words
}

// Level 1: 3-letter words (CVC and simple)
const level1: WordEntry[] = [
  { word: 'CAT' }, { word: 'DOG' }, { word: 'SUN' }, { word: 'HAT' },
  { word: 'BED' }, { word: 'PEN' }, { word: 'CUP' }, { word: 'BUS' },
  { word: 'RUN' }, { word: 'SIT' }, { word: 'MOP' }, { word: 'JAM' },
  { word: 'NET' }, { word: 'DIG' }, { word: 'HOP' }, { word: 'FUN' },
  { word: 'BAG' }, { word: 'LOG' }, { word: 'RAT' }, { word: 'ZIP' },
];

// Level 2: 4-letter words
const level2: WordEntry[] = [
  { word: 'TREE' }, { word: 'BIRD' }, { word: 'FISH' }, { word: 'STAR' },
  { word: 'FROG' }, { word: 'SHIP' }, { word: 'LAMP' }, { word: 'DRUM' },
  { word: 'KING' }, { word: 'RING' }, { word: 'MOON' }, { word: 'BOOK' },
  { word: 'DUCK' }, { word: 'LAKE' }, { word: 'GATE' }, { word: 'RAIN' },
  { word: 'JUMP' }, { word: 'HELP' }, { word: 'SNOW' }, { word: 'PLAY' },
];

// Level 3: 5-letter words
const level3: WordEntry[] = [
  { word: 'APPLE' }, { word: 'HOUSE' }, { word: 'WATER' }, { word: 'CHAIR' },
  { word: 'BEACH' }, { word: 'CLOUD' }, { word: 'GRASS' }, { word: 'SMILE' },
  { word: 'TRAIN' }, { word: 'CLOCK' }, { word: 'SLEEP' }, { word: 'PLANT' },
  { word: 'BRUSH' }, { word: 'FLAME' }, { word: 'BREAD' }, { word: 'STONE' },
  { word: 'SUNNY' }, { word: 'PARTY' }, { word: 'TIGER' }, { word: 'QUEEN' },
];

// Level 4: 6-letter words
const level4: WordEntry[] = [
  { word: 'SCHOOL' }, { word: 'FRIEND' }, { word: 'MOTHER' }, { word: 'FATHER' },
  { word: 'GARDEN' }, { word: 'BRIDGE' }, { word: 'CASTLE' }, { word: 'WINDOW' },
  { word: 'FOREST' }, { word: 'PLANET' }, { word: 'SUMMER' }, { word: 'WINTER' },
  { word: 'SILVER' }, { word: 'ORANGE' }, { word: 'MONKEY' }, { word: 'DINNER' },
  { word: 'SISTER' }, { word: 'PRINCE' }, { word: 'BATTLE' }, { word: 'DRAGON' },
];

// Level 5: 7-letter words
const level5: WordEntry[] = [
  { word: 'KITCHEN' }, { word: 'TEACHER' }, { word: 'PENGUIN' }, { word: 'WEATHER' },
  { word: 'BEDROOM' }, { word: 'DOLPHIN' }, { word: 'BROTHER' }, { word: 'HUNDRED' },
  { word: 'BLANKET' }, { word: 'RAINBOW' }, { word: 'FEATHER' }, { word: 'CHICKEN' },
  { word: 'MORNING' }, { word: 'EVENING' }, { word: 'JOURNEY' }, { word: 'HOLIDAY' },
  { word: 'FREEDOM' }, { word: 'PROBLEM' }, { word: 'KINGDOM' }, { word: 'CAPTAIN' },
];

// Level 6: 7-8 letter words (getting trickier)
const level6: WordEntry[] = [
  { word: 'ELEPHANT' }, { word: 'SWIMMING' }, { word: 'BIRTHDAY' }, { word: 'SANDWICH' },
  { word: 'TREASURE' }, { word: 'MOUNTAIN' }, { word: 'HOSPITAL' }, { word: 'STRENGTH' },
  { word: 'FOURTEEN' }, { word: 'THOROUGH' }, { word: 'CHILDREN' }, { word: 'PLATFORM' },
  { word: 'FIREWORK' }, { word: 'CUPBOARD' }, { word: 'SUDDENLY' }, { word: 'SHOULDER' },
  { word: 'PRINCESS' }, { word: 'MIDNIGHT' }, { word: 'FOOTBALL' }, { word: 'DINOSAUR' },
];

// Level 7: 8-9 letter words
const level7: WordEntry[] = [
  { word: 'BEAUTIFUL' }, { word: 'IMPORTANT' }, { word: 'DIFFERENT' }, { word: 'KNOWLEDGE' },
  { word: 'EDUCATION' }, { word: 'DANGEROUS' }, { word: 'INVISIBLE' }, { word: 'CHOCOLATE' },
  { word: 'CROCODILE' }, { word: 'BUTTERFLY' }, { word: 'ADVENTURE' }, { word: 'OPERATION' },
  { word: 'NIGHTMARE' }, { word: 'MOONLIGHT' }, { word: 'VEGETABLE' }, { word: 'INTRODUCE' },
  { word: 'BEGINNING' }, { word: 'DETECTIVE' }, { word: 'EXCELLENT' }, { word: 'INVENTION' },
];

// Level 8: Common tricky words (with definitions)
const level8: WordEntry[] = [
  { word: 'NECESSARY', definition: 'Something you really need' },
  { word: 'DESPERATE', definition: 'Wanting something very badly' },
  { word: 'INTERRUPT', definition: 'To stop someone while they are talking' },
  { word: 'MACHINERY', definition: 'Big machines that do work' },
  { word: 'PREJUDICE', definition: 'Judging someone unfairly before you know them' },
  { word: 'CONSCIOUS', definition: 'Being awake and aware of things around you' },
  { word: 'CELEBRATE', definition: 'To do something special for a happy occasion' },
  { word: 'ELABORATE', definition: 'Something with lots of detail' },
  { word: 'GUARANTEE', definition: 'A promise that something will happen' },
  { word: 'CURIOSITY', definition: 'Wanting to know about things' },
  { word: 'LIGHTNING', definition: 'A bright flash in the sky during a storm' },
  { word: 'EXHAUSTED', definition: 'Being very, very tired' },
  { word: 'PARAGRAPH', definition: 'A group of sentences about one idea' },
  { word: 'CONQUEROR', definition: 'Someone who wins and takes over' },
  { word: 'GEOGRAPHY', definition: 'Learning about places and maps' },
];

// Level 9: 10-letter words with definitions
const level9: WordEntry[] = [
  { word: 'ENDANGERED', definition: 'An animal that might disappear forever' },
  { word: 'ATMOSPHERE', definition: 'The air all around the Earth' },
  { word: 'EXPERIMENT', definition: 'A test to find out if something is true' },
  { word: 'APPRECIATE', definition: 'Being thankful for something' },
  { word: 'GOVERNMENT', definition: 'The group of people who run a country' },
  { word: 'TRAMPOLINE', definition: 'A bouncy mat you can jump on' },
  { word: 'EXAGGERATE', definition: 'Making something sound bigger than it really is' },
  { word: 'UNDERSTAND', definition: 'To know what something means' },
  { word: 'RESTAURANT', definition: 'A place where you go to eat food' },
  { word: 'INSTRUMENT', definition: 'Something you play to make music' },
  { word: 'ACCOMPLISH', definition: 'To finish something you set out to do' },
  { word: 'DISAPPOINT', definition: 'When something does not go as you hoped' },
  { word: 'HELICOPTER', definition: 'A flying machine with spinning blades on top' },
  { word: 'WATERMELON', definition: 'A big fruit that is green outside and red inside' },
  { word: 'SKATEBOARD', definition: 'A board with wheels you can ride on' },
];

// Level 10: 10-11 letter interesting words
const level10: WordEntry[] = [
  { word: 'COMFORTABLE', definition: 'Feeling cosy and relaxed' },
  { word: 'ENVIRONMENT', definition: 'Everything around us — nature, air, water' },
  { word: 'TEMPERATURE', definition: 'How hot or cold something is' },
  { word: 'COMMUNICATE', definition: 'To share ideas with other people' },
  { word: 'INDEPENDENT', definition: 'Doing things by yourself without help' },
  { word: 'ANNIVERSARY', definition: 'The same date each year when something special happened' },
  { word: 'CATERPILLAR', definition: 'A fuzzy bug that turns into a butterfly' },
  { word: 'DEMONSTRATE', definition: 'To show how something works' },
  { word: 'OPPORTUNITY', definition: 'A chance to do something good' },
  { word: 'TRANSPARENT', definition: 'Something you can see through, like glass' },
  { word: 'THERMOMETER', definition: 'A tool that measures how hot or cold it is' },
  { word: 'TRICERATOPS', definition: 'A dinosaur with three horns on its head' },
  { word: 'UNBREAKABLE', definition: 'Something so strong it cannot be broken' },
  { word: 'MAGNIFICENT', definition: 'Extremely beautiful and impressive' },
  { word: 'HIBERNATION', definition: 'When animals sleep through the whole winter' },
];

// Level 11: 11-12 letter words
const level11: WordEntry[] = [
  { word: 'ACCIDENTALLY', definition: 'When something happens by mistake' },
  { word: 'DISAPPOINTED', definition: 'Feeling sad because something was not as good as you hoped' },
  { word: 'CONSTRUCTION', definition: 'Building something big like a house' },
  { word: 'RELATIONSHIP', definition: 'How people are connected to each other' },
  { word: 'INTRODUCTION', definition: 'When you meet someone for the first time' },
  { word: 'PROFESSIONAL', definition: 'Someone who is very skilled at their job' },
  { word: 'THUNDERSTORM', definition: 'A big storm with thunder and lightning' },
  { word: 'ROLLERCOASTER', definition: 'A fast ride at a theme park with big twists' },
  { word: 'ENCYCLOPAEDIA', definition: 'A big book full of information about everything' },
  { word: 'CONSTELLATION', definition: 'A group of stars that makes a pattern in the sky' },
  { word: 'ANNOUNCEMENT', definition: 'Telling everyone some important news' },
  { word: 'SUPERMARKET', definition: 'A big shop where you buy food and things' },
  { word: 'EXTRAORDINARY', definition: 'Something really amazing and unusual' },
  { word: 'ENTERTAINMENT', definition: 'Things that are fun to watch or do' },
  { word: 'CHAMPIONSHIP', definition: 'The final big competition to find the best' },
];

// Level 12: Interesting complex words
const level12: WordEntry[] = [
  { word: 'VOCABULARY', definition: 'All the words a person knows' },
  { word: 'MISCHIEVOUS', definition: 'Being a little bit naughty in a funny way' },
  { word: 'ARCHITECTURE', definition: 'Designing buildings and how they look' },
  { word: 'CIRCUMFERENCE', definition: 'The distance all the way around a circle' },
  { word: 'APPROXIMATELY', definition: 'Almost, but not exactly right' },
  { word: 'ACCOMPLISHMENT', definition: 'Something great you have done' },
  { word: 'COMMUNICATION', definition: 'Sharing ideas with others by talking or writing' },
  { word: 'CONCENTRATION', definition: 'Focusing your mind on one thing' },
  { word: 'DETERMINATION', definition: 'Trying really hard and not giving up' },
  { word: 'HALLUCINATION', definition: 'Seeing something that is not really there' },
  { word: 'INVESTIGATION', definition: 'Looking into something carefully to find the truth' },
  { word: 'COLLABORATION', definition: 'Working together with other people' },
  { word: 'DEFORESTATION', definition: 'Cutting down lots of trees in a forest' },
  { word: 'PHOTOSYNTHESIS', definition: 'How plants use sunlight to make their food' },
  { word: 'MATHEMATICIAN', definition: 'Someone who is really good at maths' },
];

// Level 13: SATs-style challenging words
const level13: WordEntry[] = [
  { word: 'ONOMATOPOEIA', definition: 'A word that sounds like what it describes, like "buzz" or "splash"' },
  { word: 'METAMORPHOSIS', definition: 'When something completely changes its shape, like a caterpillar becoming a butterfly' },
  { word: 'ARCHAEOLOGICAL', definition: 'To do with digging up old things to learn about the past' },
  { word: 'PERPENDICULAR', definition: 'Two lines that cross at a perfect right angle' },
  { word: 'PNEUMONIA', definition: 'A serious illness that affects your lungs' },
  { word: 'RHYTHM', definition: 'A regular pattern of beats in music' },
  { word: 'PHENOMENON', definition: 'Something amazing that happens in nature' },
  { word: 'SILHOUETTE', definition: 'A dark shadow shape of something' },
  { word: 'CAMOUFLAGE', definition: 'Hiding by blending in with the background' },
  { word: 'FLUORESCENT', definition: 'Very bright and glowing' },
  { word: 'CATASTROPHE', definition: 'A really terrible disaster' },
  { word: 'QUESTIONNAIRE', definition: 'A list of questions to find out what people think' },
  { word: 'SURVEILLANCE', definition: 'Watching people or places carefully' },
  { word: 'CONSCIENCE', definition: 'The voice in your head that tells you right from wrong' },
  { word: 'PARLIAMENT', definition: 'Where the leaders of a country meet to make laws' },
];

// Level 14: Science & academic words
const level14: WordEntry[] = [
  { word: 'HYPOTHESIS', definition: 'A clever guess about why something happens' },
  { word: 'BIODIVERSITY', definition: 'All the different types of plants and animals in a place' },
  { word: 'EVAPORATION', definition: 'When water turns into steam' },
  { word: 'CONDENSATION', definition: 'When steam turns back into water drops' },
  { word: 'GRAVITATIONAL', definition: 'To do with the force that pulls things down to Earth' },
  { word: 'ELECTRICITY', definition: 'The power that makes lights and gadgets work' },
  { word: 'ACCELERATION', definition: 'Going faster and faster' },
  { word: 'CONSTELLATION', definition: 'A group of stars in the sky forming a pattern' },
  { word: 'CIVILISATION', definition: 'A big group of people living together with shared rules' },
  { word: 'EXHILARATING', definition: 'Something that makes you feel really excited and happy' },
  { word: 'CHRONOLOGICAL', definition: 'In the order that things happened' },
  { word: 'KALEIDOSCOPE', definition: 'A tube you look through to see beautiful changing patterns' },
  { word: 'MICROSCOPIC', definition: 'So tiny you need a microscope to see it' },
  { word: 'MAGNIFICENT', definition: 'Grand and beautiful, really impressive' },
  { word: 'DOCUMENTARY', definition: 'A film or show about real things that happened' },
];

// Level 15: Challenging everyday words
const level15: WordEntry[] = [
  { word: 'SIMULTANEOUS', definition: 'Things happening at exactly the same time' },
  { word: 'ACQUAINTANCE', definition: 'Someone you know a little bit, but not a close friend' },
  { word: 'ENTREPRENEUR', definition: 'Someone who starts their own business' },
  { word: 'REMINISCENCE', definition: 'Thinking about happy memories from the past' },
  { word: 'PERSEVERANCE', definition: 'Keeping going even when things are tough' },
  { word: 'ACCOMMODATE', definition: 'To make space for someone or something' },
  { word: 'ABBREVIATION', definition: 'A short way of writing a word' },
  { word: 'DISOBEDIENCE', definition: 'Not doing what you are told' },
  { word: 'EMBARRASSMENT', definition: 'Feeling awkward when something silly happens to you' },
  { word: 'EXASPERATION', definition: 'Being really fed up and annoyed' },
  { word: 'INDEPENDENCE', definition: 'Being free to make your own choices' },
  { word: 'OCCASIONALLY', definition: 'Something that happens sometimes but not often' },
  { word: 'UNFORTUNATELY', definition: 'Sadly, not the way you wanted' },
  { word: 'SOPHISTICATED', definition: 'Very clever and grown-up' },
  { word: 'DISTINGUISHED', definition: 'Very important and well-respected' },
];

// Level 16: Unusual & interesting words
const level16: WordEntry[] = [
  { word: 'SERENDIPITY', definition: 'Finding something lovely completely by accident' },
  { word: 'FLABBERGASTED', definition: 'Being so shocked you cannot believe it' },
  { word: 'GOBSMACKED', definition: 'So surprised your mouth drops open' },
  { word: 'BAMBOOZLE', definition: 'To trick or confuse someone' },
  { word: 'SHENANIGANS', definition: 'Silly or mischievous behaviour' },
  { word: 'HULLABALOO', definition: 'A big fuss or commotion about something' },
  { word: 'PANDEMONIUM', definition: 'Total chaos where everyone is panicking' },
  { word: 'DISCOMBOBULATE', definition: 'To confuse someone completely' },
  { word: 'KERFUFFLE', definition: 'A fuss or argument about something' },
  { word: 'GOBBLEDYGOOK', definition: 'Words that make no sense at all' },
  { word: 'WHIPPERSNAPPER', definition: 'A young person who thinks they know everything' },
  { word: 'FLIBBERTIGIBBET', definition: 'A silly person who talks too much' },
  { word: 'NINCOMPOOP', definition: 'A silly or foolish person' },
  { word: 'LOLLYGAGGING', definition: 'Being lazy and wasting time' },
  { word: 'CATTYWAMPUS', definition: 'Something that is crooked or not straight' },
];

// Level 17: Literary & historical words
const level17: WordEntry[] = [
  { word: 'ONOMATOPOEIA', definition: 'A word that sounds like what it describes' },
  { word: 'AUTOBIOGRAPHY', definition: 'A book someone writes about their own life' },
  { word: 'ARCHAEOLOGICAL', definition: 'About digging up old things from the past' },
  { word: 'REVOLUTIONARY', definition: 'Something completely new that changes everything' },
  { word: 'EXTRAORDINARY', definition: 'Far beyond what is normal — truly amazing' },
  { word: 'RECONNAISSANCE', definition: 'Scouting ahead to find out information' },
  { word: 'QUINTESSENTIAL', definition: 'The most perfect example of something' },
  { word: 'CLAUSTROPHOBIA', definition: 'Being scared of very small spaces' },
  { word: 'TYRANNOSAURUS', definition: 'The famous massive meat-eating dinosaur' },
  { word: 'PTERODACTYL', definition: 'A flying reptile from the time of the dinosaurs' },
  { word: 'BRONTOSAURUS', definition: 'A huge long-necked plant-eating dinosaur' },
  { word: 'HIEROGLYPHICS', definition: 'The picture-writing used by ancient Egyptians' },
  { word: 'SUPERCALIFRAGILISTIC', definition: 'An extremely long made-up word from Mary Poppins!' },
  { word: 'PALAEONTOLOGY', definition: 'Studying fossils and ancient life' },
  { word: 'REFRIGERATOR', definition: 'The cold box in the kitchen that keeps food fresh' },
];

// Level 18: Global & cultural words
const level18: WordEntry[] = [
  { word: 'SUSTAINABILITY', definition: 'Using things carefully so they last for the future' },
  { word: 'INFRASTRUCTURE', definition: 'All the roads, bridges and buildings a country needs' },
  { word: 'TELECOMMUNICATION', definition: 'Sending messages over long distances using technology' },
  { word: 'ENTREPRENEURSHIP', definition: 'Starting and running your own business' },
  { word: 'ACCOUNTABILITY', definition: 'Taking responsibility for what you do' },
  { word: 'PROCRASTINATION', definition: 'Putting things off until later instead of doing them now' },
  { word: 'BIODEGRADABLE', definition: 'Something that breaks down naturally and does not harm the planet' },
  { word: 'REHABILITATION', definition: 'Helping someone get better after being ill or hurt' },
  { word: 'OVERWHELMING', definition: 'So much that you feel you cannot cope' },
  { word: 'PHILOSOPHICAL', definition: 'Thinking deeply about big questions in life' },
  { word: 'SUPERINTENDENT', definition: 'A person in charge who watches over others' },
  { word: 'HALLUCINATION', definition: 'Seeing or hearing things that are not really there' },
  { word: 'REPRESENTATIVE', definition: 'Someone chosen to speak or act for others' },
  { word: 'APPROXIMATELY', definition: 'About, not exactly, close enough' },
  { word: 'CHOREOGRAPHY', definition: 'Planning dance moves for a performance' },
];

// Level 19: Expert-level words
const level19: WordEntry[] = [
  { word: 'ANTIDISESTABLISHMENT', definition: 'Being against getting rid of something official' },
  { word: 'INCOMPREHENSIBLE', definition: 'Impossible to understand' },
  { word: 'DISPROPORTIONATE', definition: 'When something is unfairly unequal' },
  { word: 'CHARACTERISTICALLY', definition: 'In a way that is typical of someone' },
  { word: 'INDISTINGUISHABLE', definition: 'So alike you cannot tell them apart' },
  { word: 'ENTHUSIASTICALLY', definition: 'Doing something with lots of energy and excitement' },
  { word: 'COMPARTMENTALISE', definition: 'Keeping different thoughts or feelings separate' },
  { word: 'PERSPICACIOUS', definition: 'Being really quick at understanding things' },
  { word: 'IDIOSYNCRATIC', definition: 'Having a quirky or unusual way of doing things' },
  { word: 'BUREAUCRACY', definition: 'Lots of rules and paperwork from officials' },
  { word: 'ONOMATOPOEIA', definition: 'Words that sound like the noise they describe' },
  { word: 'SESQUIPEDALIAN', definition: 'A person who loves using really long words!' },
  { word: 'CONNOISSEUR', definition: 'An expert who knows a lot about fine things' },
  { word: 'PHANTASMAGORIA', definition: 'A dreamlike sequence of strange and wonderful images' },
  { word: 'PRESTIDIGITATION', definition: 'Magic tricks done with your hands — sleight of hand' },
];

// Level 20: Ultimate challenge
const level20: WordEntry[] = [
  { word: 'SUPERCALIFRAGILISTICEXPIALIDOCIOUS', definition: 'The famously long word from Mary Poppins — something fantastically wonderful!' },
  { word: 'PSEUDOPSEUDOHYPOPARATHYROIDISM', definition: 'An incredibly long medical word — the longest in some dictionaries!' },
  { word: 'FLOCCINAUCINIHILIPILIFICATION', definition: 'The act of deciding that something is worthless' },
  { word: 'HONORIFICABILITUDINITY', definition: 'The state of being able to receive honours' },
  { word: 'ANTIDISESTABLISHMENTARIANISM', definition: 'Being against removing an established system' },
  { word: 'ELECTROENCEPHALOGRAM', definition: 'A test that measures brain activity' },
  { word: 'UNCHARACTERISTICALLY', definition: 'In a way that is not normal for someone' },
  { word: 'OTORHINOLARYNGOLOGY', definition: 'The study of ear, nose and throat medicine' },
  { word: 'INCOMPREHENSIBILITY', definition: 'Being completely impossible to understand' },
  { word: 'TERGIVERSATION', definition: 'Changing your mind or being evasive about what you think' },
];

// All levels combined
export const WORD_BANK: Record<number, WordEntry[]> = {
  1: level1, 2: level2, 3: level3, 4: level4, 5: level5,
  6: level6, 7: level7, 8: level8, 9: level9, 10: level10,
  11: level11, 12: level12, 13: level13, 14: level14, 15: level15,
  16: level16, 17: level17, 18: level18, 19: level19, 20: level20,
};

export const MAX_SPELLING_LEVEL = 20;

export function getWordForLevel(level: number): WordEntry {
  const clampedLevel = Math.min(Math.max(1, level), MAX_SPELLING_LEVEL);
  const words = WORD_BANK[clampedLevel];
  return words[Math.floor(Math.random() * words.length)];
}

export function getSpellingLevelDescription(level: number): string {
  if (level <= 1) return '3-letter words';
  if (level <= 2) return '4-letter words';
  if (level <= 3) return '5-letter words';
  if (level <= 4) return '6-letter words';
  if (level <= 5) return '7-letter words';
  if (level <= 6) return '8-letter words';
  if (level <= 7) return 'Longer words';
  if (level <= 9) return 'Tricky words';
  if (level <= 12) return 'Complex words';
  if (level <= 15) return 'Advanced words';
  if (level <= 17) return 'Expert words';
  if (level <= 19) return 'Monster words';
  return 'Ultimate challenge!';
}
