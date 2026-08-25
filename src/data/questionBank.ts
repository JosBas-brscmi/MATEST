import type { Question as LibQuestion, QuestionType as LibQuestionType } from '../lib';

// ─── Internal question type (our rich bank format) ───────────────────────────
export type QuestionCategory = 'pattern' | 'sequence' | 'matrix';

export interface BankQuestion {
  id: string;
  type: QuestionCategory;
  question: string;
  options: string[];
  answer: number; // index of correct option
  explanation?: string;
}

// ─── PATTERN RECOGNITION (50 questions) ──────────────────────────────────────
const patternQuestions: BankQuestion[] = [
  { id: 'p01', type: 'pattern', question: 'Which shape completes the pattern?\n◆ ◆ ◆ | ○ ○ ○ | △ △ ?', options: ['◆', '○', '△', '□'], answer: 2 },
  { id: 'p02', type: 'pattern', question: 'What comes next in the series?\n▲ ▲▲ ▲▲▲ ▲▲▲▲ ?', options: ['▲▲▲▲▲', '▲▲▲', '▲▲', '▲▲▲▲▲▲'], answer: 0 },
  { id: 'p03', type: 'pattern', question: 'Identify the odd one out:\n[16] [25] [36] [44] [49]', options: ['16', '25', '44', '49'], answer: 2 },
  { id: 'p04', type: 'pattern', question: 'Which figure completes the set?\nLarge Circle : Small Circle :: Large Square : ?', options: ['Large Triangle', 'Small Square', 'Large Circle', 'Small Triangle'], answer: 1 },
  { id: 'p05', type: 'pattern', question: 'Complete the analogy:\nFish : Water :: Bird : ?', options: ['Wings', 'Sky', 'Fly', 'Nest'], answer: 1 },
  { id: 'p06', type: 'pattern', question: 'Find the missing piece:\n■ □ ■ □ ■ □ ?', options: ['■', '□', '▲', '●'], answer: 0 },
  { id: 'p07', type: 'pattern', question: 'Which number does NOT belong?\n3, 6, 9, 14, 15, 18', options: ['3', '9', '14', '18'], answer: 2 },
  { id: 'p08', type: 'pattern', question: 'What is the relationship?\nDoctor : Hospital :: Teacher : ?', options: ['Book', 'School', 'Study', 'Lesson'], answer: 1 },
  { id: 'p09', type: 'pattern', question: 'Which shape has the most lines of symmetry?\n(A) Rectangle (B) Square (C) Circle (D) Equilateral Triangle', options: ['Rectangle', 'Square', 'Circle', 'Equilateral Triangle'], answer: 2 },
  { id: 'p10', type: 'pattern', question: 'Complete the pattern:\nAB, CD, EF, GH, ?', options: ['HI', 'IJ', 'JK', 'KL'], answer: 1 },
  { id: 'p11', type: 'pattern', question: 'Odd one out:\nApple, Orange, Banana, Carrot, Mango', options: ['Apple', 'Orange', 'Carrot', 'Mango'], answer: 2 },
  { id: 'p12', type: 'pattern', question: 'Which pair is different?\n(A) 8-64 (B) 3-9 (C) 5-25 (D) 7-49', options: ['8-64', '3-9', '5-25', '7-49'], answer: 0 },
  { id: 'p13', type: 'pattern', question: 'Complete the analogy:\nPen : Writer :: Brush : ?', options: ['Canvas', 'Painter', 'Color', 'Art'], answer: 1 },
  { id: 'p14', type: 'pattern', question: 'Find the next in sequence:\nZ, Y, X, W, V, ?', options: ['T', 'U', 'S', 'R'], answer: 1 },
  { id: 'p15', type: 'pattern', question: 'Which number is the outlier?\n121, 144, 169, 182, 196', options: ['121', '144', '182', '196'], answer: 2 },
  { id: 'p16', type: 'pattern', question: 'Analogy: Clock : Time :: Thermometer : ?', options: ['Heat', 'Temperature', 'Mercury', 'Weather'], answer: 1 },
  { id: 'p17', type: 'pattern', question: 'Continue the pattern:\n2, 4, 8, 16, ?', options: ['18', '24', '32', '64'], answer: 2 },
  { id: 'p18', type: 'pattern', question: 'Odd one out:\nSunday, Monday, January, Friday', options: ['Sunday', 'Monday', 'January', 'Friday'], answer: 2 },
  { id: 'p19', type: 'pattern', question: 'Which is the mirror image of the letter "b"?\n(A) b (B) d (C) p (D) q', options: ['b', 'd', 'p', 'q'], answer: 1 },
  { id: 'p20', type: 'pattern', question: 'Find the relationship:\nMoon : Satellite :: Earth : ?', options: ['Sun', 'Planet', 'Star', 'Galaxy'], answer: 1 },
  { id: 'p21', type: 'pattern', question: 'Complete the series:\nACE, BDF, CEG, ?', options: ['DFH', 'EGI', 'DGH', 'CFH'], answer: 0 },
  { id: 'p22', type: 'pattern', question: 'Odd one out:\n2, 3, 5, 7, 9, 11', options: ['2', '5', '9', '11'], answer: 2 },
  { id: 'p23', type: 'pattern', question: 'Which word is the analogy?\nHot : Cold :: Fast : ?', options: ['Quick', 'Speed', 'Slow', 'Run'], answer: 2 },
  { id: 'p24', type: 'pattern', question: 'Shape pattern — what comes next?\n○ ● ○○ ●● ○○○ ?', options: ['○○○', '●●●', '●●', '○●'], answer: 1 },
  { id: 'p25', type: 'pattern', question: 'Analogy: Finger : Hand :: Toe : ?', options: ['Leg', 'Shoe', 'Foot', 'Walk'], answer: 2 },
  { id: 'p26', type: 'pattern', question: 'Which does NOT belong?\n36, 49, 64, 72, 81', options: ['36', '49', '72', '81'], answer: 2 },
  { id: 'p27', type: 'pattern', question: 'Continue:\nAZ, BY, CX, DW, ?', options: ['EU', 'EV', 'FV', 'FU'], answer: 1 },
  { id: 'p28', type: 'pattern', question: 'Analogy: Sword : Warrior :: Pen : ?', options: ['Student', 'Writer', 'Ink', 'Paper'], answer: 1 },
  { id: 'p29', type: 'pattern', question: 'Which has the greatest number of sides?\n(A) Pentagon (B) Hexagon (C) Heptagon (D) Octagon', options: ['Pentagon', 'Hexagon', 'Heptagon', 'Octagon'], answer: 3 },
  { id: 'p30', type: 'pattern', question: 'Find the odd one out:\nRose, Lotus, Tulip, Oak, Lily', options: ['Rose', 'Lotus', 'Oak', 'Lily'], answer: 2 },
  { id: 'p31', type: 'pattern', question: 'Analogy: Light : Dark :: Joy : ?', options: ['Happy', 'Sorrow', 'Laugh', 'Smile'], answer: 1 },
  { id: 'p32', type: 'pattern', question: 'Next in the pattern:\n1, 4, 9, 16, 25, ?', options: ['30', '35', '36', '49'], answer: 2 },
  { id: 'p33', type: 'pattern', question: 'Which letter completes the pattern?\nB, D, F, H, ?', options: ['I', 'J', 'K', 'L'], answer: 1 },
  { id: 'p34', type: 'pattern', question: 'Odd one out:\nPiano, Guitar, Violin, Trumpet, Paintbrush', options: ['Piano', 'Guitar', 'Trumpet', 'Paintbrush'], answer: 3 },
  { id: 'p35', type: 'pattern', question: 'Analogy: Cow : Herd :: Fish : ?', options: ['Ocean', 'School', 'Pack', 'Flock'], answer: 1 },
  { id: 'p36', type: 'pattern', question: 'Which set follows the same rule as 2→8→32?\n(A) 3→9→27 (B) 3→12→48 (C) 3→6→12 (D) 2→6→18', options: ['3→9→27', '3→12→48', '3→6→12', '2→6→18'], answer: 1 },
  { id: 'p37', type: 'pattern', question: 'Complete the series:\nM, N, P, S, W, ?', options: ['B', 'X', 'Z', 'A'], answer: 0 },
  { id: 'p38', type: 'pattern', question: 'Analogy: Chapter : Book :: Scene : ?', options: ['Act', 'Movie', 'Film', 'Play'], answer: 1 },
  { id: 'p39', type: 'pattern', question: 'Odd one out:\n13, 17, 23, 27, 31', options: ['13', '17', '27', '31'], answer: 2 },
  { id: 'p40', type: 'pattern', question: 'Which does NOT follow the pattern?\n(A) 5²=25 (B) 6²=36 (C) 7²=47 (D) 8²=64', options: ['5²=25', '6²=36', '7²=47', '8²=64'], answer: 2 },
  { id: 'p41', type: 'pattern', question: 'Continue:\nABC, ZYX, DEF, WVU, GHI, ?', options: ['TSR', 'UTS', 'XYZ', 'RST'], answer: 0 },
  { id: 'p42', type: 'pattern', question: 'Analogy: Marathon : Running :: Tournament : ?', options: ['Sport', 'Winner', 'Competition', 'Trophy'], answer: 2 },
  { id: 'p43', type: 'pattern', question: 'What comes next?\n1, 1, 2, 3, 5, 8, 13, ?', options: ['18', '20', '21', '24'], answer: 2 },
  { id: 'p44', type: 'pattern', question: 'Odd one out:\nNile, Amazon, Sahara, Thames, Yangtze', options: ['Nile', 'Amazon', 'Sahara', 'Thames'], answer: 2 },
  { id: 'p45', type: 'pattern', question: 'Analogy: Nucleus : Atom :: Kernel : ?', options: ['Corn', 'Cell', 'Core', 'Seed'], answer: 2 },
  { id: 'p46', type: 'pattern', question: 'Which pair does NOT match the others?\n(A) 4:16 (B) 5:25 (C) 6:36 (D) 7:42', options: ['4:16', '5:25', '6:36', '7:42'], answer: 3 },
  { id: 'p47', type: 'pattern', question: 'Continue the letter pattern:\nA, E, I, O, ?', options: ['Q', 'U', 'Y', 'W'], answer: 1 },
  { id: 'p48', type: 'pattern', question: 'Analogy: Architecture : Buildings :: Literature : ?', options: ['Words', 'Books', 'Writing', 'Stories'], answer: 1 },
  { id: 'p49', type: 'pattern', question: 'Which number is missing?\n7, 14, ?, 28, 35', options: ['18', '20', '21', '24'], answer: 2 },
  { id: 'p50', type: 'pattern', question: 'Odd one out:\nJupiter, Saturn, Earth, Sun, Neptune', options: ['Jupiter', 'Earth', 'Sun', 'Neptune'], answer: 2 },
];

// ─── NUMBER SEQUENCES (50 questions) ─────────────────────────────────────────
const sequenceQuestions: BankQuestion[] = [
  { id: 's01', type: 'sequence', question: 'What is the next number?\n2, 5, 10, 17, 26, ?', options: ['33', '35', '37', '39'], answer: 2 },
  { id: 's02', type: 'sequence', question: 'Find the missing number:\n3, 6, 12, 24, ?, 96', options: ['36', '42', '48', '54'], answer: 2 },
  { id: 's03', type: 'sequence', question: 'What comes next?\n100, 96, 88, 76, 60, ?', options: ['40', '42', '44', '46'], answer: 0 },
  { id: 's04', type: 'sequence', question: 'Find the next term:\n1, 3, 7, 13, 21, ?', options: ['29', '31', '33', '35'], answer: 1 },
  { id: 's05', type: 'sequence', question: 'What is the missing number?\n5, 10, 20, ?, 80', options: ['30', '35', '40', '45'], answer: 2 },
  { id: 's06', type: 'sequence', question: 'Next in sequence:\n11, 13, 17, 19, 23, ?', options: ['25', '27', '29', '31'], answer: 2 },
  { id: 's07', type: 'sequence', question: 'Find the missing term:\n2, 6, 18, 54, ?', options: ['108', '144', '162', '216'], answer: 2 },
  { id: 's08', type: 'sequence', question: 'What comes next?\n0.5, 1.5, 4.5, 13.5, ?', options: ['27', '40.5', '54', '81'], answer: 1 },
  { id: 's09', type: 'sequence', question: 'Find the next number:\n1, 8, 27, 64, ?', options: ['100', '125', '144', '216'], answer: 1 },
  { id: 's10', type: 'sequence', question: 'What is missing?\n15, 13, 16, 12, 17, ?', options: ['9', '10', '11', '18'], answer: 2 },
  { id: 's11', type: 'sequence', question: 'Next term:\n2, 3, 5, 7, 11, 13, ?', options: ['14', '15', '17', '19'], answer: 2 },
  { id: 's12', type: 'sequence', question: 'What comes next?\n1, 2, 4, 7, 11, 16, ?', options: ['20', '21', '22', '23'], answer: 2 },
  { id: 's13', type: 'sequence', question: 'Find the missing number:\n80, 40, 20, ?, 5', options: ['8', '10', '12', '15'], answer: 1 },
  { id: 's14', type: 'sequence', question: 'Next in series:\n3, 9, 27, 81, ?', options: ['162', '243', '324', '486'], answer: 1 },
  { id: 's15', type: 'sequence', question: 'What is the next value?\n100, 99, 97, 94, 90, ?', options: ['84', '85', '86', '87'], answer: 1 },
  { id: 's16', type: 'sequence', question: 'Find the next number:\n7, 11, 16, 22, 29, ?', options: ['35', '36', '37', '38'], answer: 2 },
  { id: 's17', type: 'sequence', question: 'What comes next?\n2, 5, 11, 23, 47, ?', options: ['85', '93', '95', '97'], answer: 2 },
  { id: 's18', type: 'sequence', question: 'Missing number:\n4, 9, 25, 49, ?, 169', options: ['81', '100', '121', '144'], answer: 2 },
  { id: 's19', type: 'sequence', question: 'Next in sequence:\n1, 4, 10, 20, 35, ?', options: ['46', '52', '56', '60'], answer: 2 },
  { id: 's20', type: 'sequence', question: 'Find the next term:\n1000, 500, 250, 125, ?', options: ['50', '62.5', '65', '75'], answer: 1 },
  { id: 's21', type: 'sequence', question: 'What is missing?\n17, 19, 23, 29, ?, 41', options: ['31', '33', '35', '37'], answer: 2 },
  { id: 's22', type: 'sequence', question: 'Next number:\n3, 4, 7, 11, 18, 29, ?', options: ['40', '45', '47', '51'], answer: 2 },
  { id: 's23', type: 'sequence', question: 'What comes next?\n6, 12, 24, 48, 96, ?', options: ['144', '172', '192', '200'], answer: 2 },
  { id: 's24', type: 'sequence', question: 'Find the missing number:\n10, 9, 7, ?, 2, -2', options: ['4', '5', '6', '3'], answer: 0 },
  { id: 's25', type: 'sequence', question: 'Next term:\n2, 4, 12, 48, 240, ?', options: ['720', '1200', '1440', '2400'], answer: 2 },
  { id: 's26', type: 'sequence', question: 'What is next?\n5, 6, 8, 11, 15, 20, ?', options: ['24', '25', '26', '27'], answer: 2 },
  { id: 's27', type: 'sequence', question: 'Find the next number:\n1, 2, 6, 24, 120, ?', options: ['360', '480', '620', '720'], answer: 3 },
  { id: 's28', type: 'sequence', question: 'Missing number:\n4, 5, 8, 13, 20, 29, ?', options: ['38', '40', '42', '44'], answer: 1 },
  { id: 's29', type: 'sequence', question: 'What comes next?\n0, 1, 1, 2, 3, 5, 8, 13, ?', options: ['18', '20', '21', '22'], answer: 2 },
  { id: 's30', type: 'sequence', question: 'Next in series:\n32, 16, 8, 4, 2, ?', options: ['0', '0.5', '1', '1.5'], answer: 2 },
  { id: 's31', type: 'sequence', question: 'Find the missing term:\n1, 5, 14, 30, 55, ?', options: ['77', '88', '91', '95'], answer: 2 },
  { id: 's32', type: 'sequence', question: 'Next number:\n19, 16, 13, 10, ?', options: ['5', '6', '7', '8'], answer: 2 },
  { id: 's33', type: 'sequence', question: 'What is missing?\n2, 3, 5, 8, 13, 21, ?', options: ['29', '32', '34', '37'], answer: 2 },
  { id: 's34', type: 'sequence', question: 'Find the next term:\n256, 128, 64, 32, ?', options: ['8', '12', '16', '20'], answer: 2 },
  { id: 's35', type: 'sequence', question: 'What comes next?\n3, 5, 9, 17, 33, ?', options: ['55', '60', '65', '66'], answer: 2 },
  { id: 's36', type: 'sequence', question: 'Next number:\n2, 7, 17, 37, 77, ?', options: ['137', '147', '152', '157'], answer: 3 },
  { id: 's37', type: 'sequence', question: 'Missing number:\n36, 31, 26, ?, 16, 11', options: ['18', '19', '21', '22'], answer: 2 },
  { id: 's38', type: 'sequence', question: 'Find the next term:\n0, 7, 26, 63, 124, ?', options: ['175', '195', '205', '215'], answer: 3 },
  { id: 's39', type: 'sequence', question: 'What comes next?\n4, 7, 13, 25, 49, ?', options: ['87', '95', '97', '99'], answer: 2 },
  { id: 's40', type: 'sequence', question: 'Next in sequence:\n2, 8, 18, 32, 50, ?', options: ['68', '72', '76', '80'], answer: 1 },
  { id: 's41', type: 'sequence', question: 'Find the missing number:\n1, 3, 4, 7, 11, 18, ?', options: ['25', '27', '29', '31'], answer: 2 },
  { id: 's42', type: 'sequence', question: 'What is next?\n10, 30, 90, 270, ?', options: ['540', '720', '810', '900'], answer: 2 },
  { id: 's43', type: 'sequence', question: 'Next number:\n45, 43, 39, 33, 25, ?', options: ['13', '14', '15', '16'], answer: 0 },
  { id: 's44', type: 'sequence', question: 'Missing term:\n3, 7, 15, 31, 63, ?', options: ['121', '125', '127', '130'], answer: 2 },
  { id: 's45', type: 'sequence', question: 'What comes next?\n1, 6, 15, 28, 45, ?', options: ['62', '64', '66', '68'], answer: 2 },
  { id: 's46', type: 'sequence', question: 'Find the next term:\n5, 10, 13, 26, 29, 58, ?', options: ['59', '60', '61', '62'], answer: 2 },
  { id: 's47', type: 'sequence', question: 'What is missing?\n7, 10, 8, 11, 9, 12, ?', options: ['9', '10', '11', '12'], answer: 1 },
  { id: 's48', type: 'sequence', question: 'Next in sequence:\n1, 4, 9, 16, 25, 36, ?', options: ['42', '45', '49', '54'], answer: 2 },
  { id: 's49', type: 'sequence', question: 'Find the missing number:\n9, 18, 36, ?, 144', options: ['54', '62', '72', '80'], answer: 2 },
  { id: 's50', type: 'sequence', question: 'What comes next?\n3, 6, 11, 18, 27, 38, ?', options: ['49', '51', '53', '55'], answer: 1 },
];

// ─── MATRIX REASONING (50 questions) ─────────────────────────────────────────
const matrixQuestions: BankQuestion[] = [
  { id: 'm01', type: 'matrix', question: 'In a 3×3 grid, the top row contains 2, 4, 6. The middle row contains 3, 6, 9. What should be the last number in the bottom row if it starts with 4, 8, ?', options: ['10', '12', '14', '16'], answer: 1 },
  { id: 'm02', type: 'matrix', question: 'A 3×3 matrix has rows: [1,2,3], [4,5,6], [7,8,?]. Each row increases by the same pattern. Find ?', options: ['7', '8', '9', '10'], answer: 2 },
  { id: 'm03', type: 'matrix', question: 'Matrix rows: [2,4,8], [3,6,12], [5,10,?]. Each row multiplies by a constant. Find ?', options: ['15', '20', '25', '30'], answer: 1 },
  { id: 'm04', type: 'matrix', question: 'Grid pattern: Row1=[1,4,9], Row2=[4,9,16], Row3=[9,16,?]. Each element is a perfect square. Find ?', options: ['20', '23', '25', '27'], answer: 2 },
  { id: 'm05', type: 'matrix', question: 'Table: [3,6,9], [6,12,18], [9,18,?]. Find the missing value.', options: ['24', '27', '30', '36'], answer: 1 },
  { id: 'm06', type: 'matrix', question: 'In a 3×3 grid: [5,10,15], [10,20,30], [15,30,?]. Find ?', options: ['35', '40', '45', '50'], answer: 2 },
  { id: 'm07', type: 'matrix', question: 'Matrix: [2,3,5], [4,6,10], [6,9,?]. Columns follow the same ratio. Find ?', options: ['12', '14', '15', '18'], answer: 2 },
  { id: 'm08', type: 'matrix', question: 'Grid: [1,2,4], [2,4,8], [4,8,?]. Doubling pattern. Find ?', options: ['12', '14', '16', '18'], answer: 2 },
  { id: 'm09', type: 'matrix', question: 'The sum of each row in the matrix is the same:\n[8,5,?], [6,7,5], [3,9,6]. Find ?', options: ['3', '4', '5', '6'], answer: 0 },
  { id: 'm10', type: 'matrix', question: 'Matrix rows: [10,5,25], [8,4,20], [6,3,?]. Each row follows the same formula. Find ?', options: ['12', '15', '18', '20'], answer: 1 },
  { id: 'm11', type: 'matrix', question: 'Grid: [2,6,18], [3,9,27], [4,12,?]. Geometric pattern in rows. Find ?', options: ['30', '36', '42', '48'], answer: 1 },
  { id: 'm12', type: 'matrix', question: 'Matrix: [7,3,4], [6,2,4], [8,5,?]. Each row: Col1 - Col2 = Col3. Find ?', options: ['2', '3', '4', '5'], answer: 1 },
  { id: 'm13', type: 'matrix', question: 'Rows: [1,3,9], [2,6,18], [3,9,?]. Each row multiplies by 3. Find ?', options: ['18', '27', '36', '45'], answer: 1 },
  { id: 'm14', type: 'matrix', question: 'Grid: [4,8,12], [5,10,15], [6,12,?]. Find ?', options: ['16', '17', '18', '20'], answer: 2 },
  { id: 'm15', type: 'matrix', question: 'Matrix: Diagonal from top-left to bottom-right contains 2, 5, ?. The values increase by odd numbers. Find ?', options: ['8', '9', '10', '11'], answer: 2 },
  { id: 'm16', type: 'matrix', question: 'In a 2×2 grid: [3,7; 5,?]. Row 1 sums to 10. Row 2 also sums to 10. Find ?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm17', type: 'matrix', question: 'Matrix rows: [1,1,2], [2,3,5], [3,5,8]. Each row: Col1+Col2=Col3. What is 5+8?', options: ['11', '12', '13', '14'], answer: 2 },
  { id: 'm18', type: 'matrix', question: 'Grid: [9,3,27], [4,2,8], [5,?,125]. Each row: Col1^Col2=Col3. Find ?', options: ['2', '3', '4', '5'], answer: 1 },
  { id: 'm19', type: 'matrix', question: 'Matrix: Row sums are 12, 12, 12.\n[3,4,5], [2,6,4], [?,3,6]. Find ?', options: ['1', '2', '3', '4'], answer: 2 },
  { id: 'm20', type: 'matrix', question: 'Grid: [2,4,6], [3,6,9], [?,8,12]. Column pattern: 2,3,?', options: ['3', '4', '5', '6'], answer: 1 },
  { id: 'm21', type: 'matrix', question: 'Matrix: [16,4,2], [81,9,3], [25,5,?]. Pattern: √Col1=Col2, √Col2=Col3. Find ?', options: ['√5', '2', '2.24', '3'], answer: 0 },
  { id: 'm22', type: 'matrix', question: 'Grid: [5,7,9], [10,14,18], [15,21,?]. Each row is a multiple of the first. Find ?', options: ['24', '27', '28', '30'], answer: 1 },
  { id: 'm23', type: 'matrix', question: 'Columns sum to same value in this matrix: [1,5,?], [2,4,6], [3,3,6]. Each column sums to 6. Find ?', options: ['0', '1', '2', '3'], answer: 0 },
  { id: 'm24', type: 'matrix', question: 'Matrix: [4,2,16], [3,3,27], [2,4,?]. Pattern: Col1^Col2=Col3. Find ?', options: ['8', '12', '16', '24'], answer: 2 },
  { id: 'm25', type: 'matrix', question: 'Grid: [3,5,8], [5,8,13], [8,13,?]. Fibonacci-like addition. Find ?', options: ['18', '20', '21', '22'], answer: 2 },
  { id: 'm26', type: 'matrix', question: 'Matrix columns each sum to 15:\n[1,5,9], [5,5,5], [9,5,1]. What is the missing value if the middle column is replaced by [?,5,5] and must still sum to 15?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm27', type: 'matrix', question: 'Grid: [6,2,3], [8,2,4], [10,2,?]. Col3=Col1÷Col2. Find ?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm28', type: 'matrix', question: 'Matrix: [2,5,7], [3,8,11], [4,?,15]. Col1+Col2=Col3. Find ?', options: ['9', '10', '11', '12'], answer: 2 },
  { id: 'm29', type: 'matrix', question: 'Grid: [1,2,3], [10,20,30], [?,200,300]. Same column ratio. Find ?', options: ['50', '75', '100', '150'], answer: 2 },
  { id: 'm30', type: 'matrix', question: 'Matrix: Row totals are 9, 18, 27.\n[1,3,5], [2,6,10], [3,9,?]. Find ?', options: ['12', '14', '15', '18'], answer: 2 },
  { id: 'm31', type: 'matrix', question: 'Grid: [8,6,48], [7,5,35], [9,4,?]. Col1×Col2=Col3. Find ?', options: ['32', '34', '36', '40'], answer: 2 },
  { id: 'm32', type: 'matrix', question: 'Matrix diagonal (top-left to bottom-right): 1, 4, 9, 16, ?. Perfect squares. Find ?', options: ['20', '24', '25', '30'], answer: 2 },
  { id: 'm33', type: 'matrix', question: 'Grid: [3,6,2], [4,8,2], [5,10,?]. Col2=Col1×2, Col3=constant. Find ?', options: ['1', '2', '3', '4'], answer: 1 },
  { id: 'm34', type: 'matrix', question: 'Matrix: [1,2,4,8], [2,4,8,16], [3,6,12,?]. Rows double. Find ?', options: ['18', '20', '24', '30'], answer: 2 },
  { id: 'm35', type: 'matrix', question: 'Grid 3×3: Each cell = row number × column number.\n[1,2,3], [2,4,6], [3,6,?]. Find ?', options: ['7', '8', '9', '10'], answer: 2 },
  { id: 'm36', type: 'matrix', question: 'Grid: [7,14,21], [8,16,24], [9,18,?]. Col2=Col1×2, Col3=Col1×3. Find ?', options: ['24', '25', '26', '27'], answer: 3 },
  { id: 'm37', type: 'matrix', question: 'Grid: [10,2,5], [12,3,4], [?,4,3]. Col3=Col1÷Col2. Find ?', options: ['8', '10', '12', '14'], answer: 2 },
  { id: 'm38', type: 'matrix', question: 'Each row sums to 20:\n[4,6,10], [5,5,10], [3,7,?]. Find ?', options: ['8', '9', '10', '11'], answer: 2 },
  { id: 'm39', type: 'matrix', question: 'Grid: [6,3,18], [7,3,21], [8,3,?]. Col3=Col1×Col2. Find ?', options: ['22', '23', '24', '25'], answer: 2 },
  { id: 'm40', type: 'matrix', question: 'Matrix: [9,3,12], [7,4,11], [8,?,13]. Col3=Col1+Col2. Find ?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm41', type: 'matrix', question: 'Grid: [5,5,0], [9,6,3], [8,3,?]. Col3=Col1-Col2. Find ?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm42', type: 'matrix', question: 'Matrix rows each sum to 10:\n[1,2,3,4], [2,?,3,1]. Find ?', options: ['3', '4', '5', '6'], answer: 1 },
  { id: 'm43', type: 'matrix', question: 'Grid: [11,4,7], [13,6,7], [15,?,7]. Col1-Col2=Col3. Find ?', options: ['6', '7', '8', '9'], answer: 2 },
  { id: 'm44', type: 'matrix', question: 'Matrix: [2,3,5], [3,5,8], [5,8,?]. Fibonacci addition. Find ?', options: ['11', '13', '15', '17'], answer: 1 },
  { id: 'm45', type: 'matrix', question: 'Grid: [6,12,4], [9,18,6], [12,24,?]. Col3=Col2÷3. Find ?', options: ['6', '7', '8', '9'], answer: 2 },
  { id: 'm46', type: 'matrix', question: 'Matrix: [100,10,90], [50,5,45], [20,2,?]. Col1-Col2=Col3. Find ?', options: ['14', '16', '18', '20'], answer: 2 },
  { id: 'm47', type: 'matrix', question: 'Grid: [3,4,5], [6,8,10], [9,12,?]. Pythagorean triples scaled. Find ?', options: ['13', '14', '15', '16'], answer: 2 },
  { id: 'm48', type: 'matrix', question: 'Matrix: [64,8,8], [27,3,9], [16,4,?]. Col1÷Col2=Col3. Find ?', options: ['2', '3', '4', '5'], answer: 2 },
  { id: 'm49', type: 'matrix', question: 'Grid row totals: 15, 15, 15.\n[3,6,6], [7,2,6], [?,4,6]. Find ?', options: ['3', '4', '5', '6'], answer: 2 },
  { id: 'm50', type: 'matrix', question: 'Matrix: [2,4,6,8], [3,6,9,12], [4,8,?,16]. Each row multiples. Find ?', options: ['10', '11', '12', '14'], answer: 2 },
];

// ─── Category → lib QuestionType mapping ─────────────────────────────────────
const typeMap: Record<QuestionCategory, LibQuestionType> = {
  pattern:  'logical_reasoning',
  sequence: 'number_series',
  matrix:   'figure_reasoning',
};

// ─── Adapter: convert BankQuestion → lib Question ────────────────────────────
function toLibQuestion(q: BankQuestion): LibQuestion {
  return {
    id:          q.id,
    type:        typeMap[q.type],
    prompt:      q.question,
    choices:     q.options,
    answerIndex: q.answer,
    explanation: q.explanation,
  };
}

// ─── Random selection: 25 questions (8 pattern + 8 sequence + 9 matrix) ──────
export function getRandomIQQuestions(): LibQuestion[] {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  const selected: BankQuestion[] = [
    ...shuffle(patternQuestions).slice(0, 8),
    ...shuffle(sequenceQuestions).slice(0, 8),
    ...shuffle(matrixQuestions).slice(0, 9),
  ];

  return shuffle(selected).map(toLibQuestion);
}

// ─── Score label helper ───────────────────────────────────────────────────────
export function getScoreLabel(percent: number): {
  label: string;
  color: string;
  description: string;
} {
  if (percent >= 90) return { label: 'Exceptional',    color: '#4ade80', description: 'Outstanding performance — Top 10%' };
  if (percent >= 75) return { label: 'Above Average',  color: '#60a5fa', description: 'Strong performance — Top 25%' };
  if (percent >= 60) return { label: 'Average',        color: '#fbbf24', description: 'Good performance — Within normal range' };
  if (percent >= 40) return { label: 'Below Average',  color: '#f97316', description: 'Fair performance — Room for improvement' };
  return               { label: 'Developing',         color: '#f87171', description: 'Additional preparation recommended' };
}
