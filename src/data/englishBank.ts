import type { Question as LibQuestion } from '../lib';
 
export interface EnglishQuestion {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'sentence_completion' | 'error_identification';
  question: string;
  options: string[];
  answer: number;
  passage?: string; // for reading comprehension
}
 
// ─── GRAMMAR (30 questions) ───────────────────────────────────────────────────
const grammarQuestions: EnglishQuestion[] = [
  { id: 'g01', type: 'grammar', question: 'Choose the correct sentence:', options: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], answer: 2 },
  { id: 'g02', type: 'grammar', question: 'Select the correct form: "By the time she arrived, we _____ dinner."', options: ['finish', 'finished', 'had finished', 'have finished'], answer: 2 },
  { id: 'g03', type: 'grammar', question: 'Which sentence uses the passive voice correctly?', options: ['The report written by John.', 'The report was written by John.', 'The report is write by John.', 'John was written the report.'], answer: 1 },
  { id: 'g04', type: 'grammar', question: 'Fill in the blank: "If I _____ you, I would accept the job offer."', options: ['am', 'was', 'were', 'be'], answer: 2 },
  { id: 'g05', type: 'grammar', question: 'Choose the correct sentence:', options: ['Neither of the candidates were qualified.', 'Neither of the candidates was qualified.', 'Neither of the candidates are qualified.', 'Neither of the candidates is been qualified.'], answer: 1 },
  { id: 'g06', type: 'grammar', question: 'Select the correct preposition: "She is responsible _____ the entire project."', options: ['of', 'for', 'to', 'with'], answer: 1 },
  { id: 'g07', type: 'grammar', question: '"The data _____ been analyzed." Choose the correct verb:', options: ['has', 'have', 'had been', 'is'], answer: 0 },
  { id: 'g08', type: 'grammar', question: 'Which sentence is grammatically correct?', options: ['He suggested to take a break.', 'He suggested taking a break.', 'He suggested take a break.', 'He suggested for taking a break.'], answer: 1 },
  { id: 'g09', type: 'grammar', question: 'Fill in the blank: "The manager, along with his team, _____ the presentation."', options: ['prepare', 'are preparing', 'prepares', 'were preparing'], answer: 2 },
  { id: 'g10', type: 'grammar', question: 'Choose the correct form: "We look forward _____ from you soon."', options: ['to hear', 'to hearing', 'hearing', 'for hearing'], answer: 1 },
  { id: 'g11', type: 'grammar', question: 'Which is correct? "There _____ a number of issues to address."', options: ['is', 'are', 'was', 'were'], answer: 0 },
  { id: 'g12', type: 'grammar', question: 'Select the correct sentence:', options: ['The staff have been informed.', 'The staff has been informed.', 'Both A and B are correct.', 'Neither A nor B is correct.'], answer: 2 },
  { id: 'g13', type: 'grammar', question: 'Fill in: "Despite _____ hard, she did not pass the exam."', options: ['study', 'studied', 'studying', 'to study'], answer: 2 },
  { id: 'g14', type: 'grammar', question: 'Which sentence is correct?', options: ['This is one of the best idea I\'ve heard.', 'This is one of the best ideas I\'ve heard.', 'This is one of the better ideas I\'ve heard.', 'This is one of the best ideas I\'d heard.'], answer: 1 },
  { id: 'g15', type: 'grammar', question: '"He _____ in this company for five years before he was promoted." Choose the correct tense:', options: ['worked', 'has worked', 'had worked', 'was working'], answer: 2 },
  { id: 'g16', type: 'grammar', question: 'Choose the correct article: "She is _____ honest employee."', options: ['a', 'an', 'the', 'no article needed'], answer: 1 },
  { id: 'g17', type: 'grammar', question: 'Select the correct sentence:', options: ['Whom did you speak with?', 'Who did you speak with?', 'Both are correct.', 'Neither is correct.'], answer: 2 },
  { id: 'g18', type: 'grammar', question: 'Fill in the blank: "The results were _____ than expected."', options: ['more better', 'much better', 'more good', 'gooder'], answer: 1 },
  { id: 'g19', type: 'grammar', question: '"You _____ submit the report by Friday." Which expresses obligation?', options: ['might', 'could', 'must', 'would'], answer: 2 },
  { id: 'g20', type: 'grammar', question: 'Which sentence is grammatically correct?', options: ['The meeting was postponing.', 'The meeting was postponed.', 'The meeting has postponed.', 'The meeting is been postponed.'], answer: 1 },
  { id: 'g21', type: 'grammar', question: 'Fill in: "Not only _____ the project late, but it was also over budget."', options: ['it was delivered', 'was it delivered', 'delivered it was', 'it delivered was'], answer: 1 },
  { id: 'g22', type: 'grammar', question: 'Choose the correct form: "I wish I _____ more time to prepare."', options: ['have', 'had', 'would have', 'will have'], answer: 1 },
  { id: 'g23', type: 'grammar', question: 'Select the correct sentence:', options: ['Each of the employees have a laptop.', 'Each of the employees has a laptop.', 'Each of the employees are given a laptop.', 'Each of the employees having a laptop.'], answer: 1 },
  { id: 'g24', type: 'grammar', question: '"The CEO asked the team _____ overtime this weekend."', options: ['work', 'working', 'to work', 'for working'], answer: 2 },
  { id: 'g25', type: 'grammar', question: 'Which is correct? "We need someone _____ can handle pressure."', options: ['whom', 'whose', 'who', 'which'], answer: 2 },
  { id: 'g26', type: 'grammar', question: 'Fill in: "The proposal _____ by the board tomorrow."', options: ['will review', 'will be reviewed', 'is reviewing', 'reviews'], answer: 1 },
  { id: 'g27', type: 'grammar', question: 'Choose the correct sentence:', options: ['Having finished the task, the office was locked.', 'Having finished the task, she locked the office.', 'She locked the office, having finished the task was.', 'Finished the task, the office was locked by her.'], answer: 1 },
  { id: 'g28', type: 'grammar', question: '"The number of applications _____ increased significantly."', options: ['have', 'has', 'are', 'were'], answer: 1 },
  { id: 'g29', type: 'grammar', question: 'Select: "He is used to _____ long hours."', options: ['work', 'worked', 'working', 'works'], answer: 2 },
  { id: 'g30', type: 'grammar', question: 'Which is grammatically correct?', options: ['Between you and I, this plan won\'t work.', 'Between you and me, this plan won\'t work.', 'Between you and myself, this plan won\'t work.', 'Amongst you and me, this plan won\'t work.'], answer: 1 },
];
 
// ─── VOCABULARY (30 questions) ────────────────────────────────────────────────
const vocabularyQuestions: EnglishQuestion[] = [
  { id: 'v01', type: 'vocabulary', question: 'What does "mitigate" mean in a business context?', options: ['To increase', 'To reduce or lessen', 'To eliminate completely', 'To transfer'], answer: 1 },
  { id: 'v02', type: 'vocabulary', question: 'Choose the best synonym for "facilitate":', options: ['Hinder', 'Make easier', 'Complicate', 'Evaluate'], answer: 1 },
  { id: 'v03', type: 'vocabulary', question: 'What is the antonym of "transparent" in business?', options: ['Clear', 'Open', 'Opaque', 'Honest'], answer: 2 },
  { id: 'v04', type: 'vocabulary', question: '"The company will _____ its operations to three new countries." Choose the correct word:', options: ['contract', 'reduce', 'expand', 'limit'], answer: 2 },
  { id: 'v05', type: 'vocabulary', question: 'What does "benchmark" mean?', options: ['A physical marker', 'A standard used for comparison', 'A financial report', 'A workplace policy'], answer: 1 },
  { id: 'v06', type: 'vocabulary', question: 'Choose the synonym for "proficient":', options: ['Beginner', 'Skilled', 'Careless', 'Temporary'], answer: 1 },
  { id: 'v07', type: 'vocabulary', question: '"The terms of the contract are _____." Which word means "open to more than one interpretation"?', options: ['Ambiguous', 'Explicit', 'Definitive', 'Transparent'], answer: 0 },
  { id: 'v08', type: 'vocabulary', question: 'What does "leverage" mean in business?', options: ['To lift heavy objects', 'To use something to its advantage', 'To reduce costs', 'To negotiate salary'], answer: 1 },
  { id: 'v09', type: 'vocabulary', question: 'Choose the antonym for "volatile":', options: ['Unstable', 'Explosive', 'Stable', 'Unpredictable'], answer: 2 },
  { id: 'v10', type: 'vocabulary', question: '"We need to _____ our resources more efficiently." Which word fits best?', options: ['waste', 'allocate', 'ignore', 'duplicate'], answer: 1 },
  { id: 'v11', type: 'vocabulary', question: 'What does "integrity" mean in a professional context?', options: ['Intelligence', 'Honesty and strong moral principles', 'Technical skills', 'Work experience'], answer: 1 },
  { id: 'v12', type: 'vocabulary', question: 'Choose the correct meaning of "synergy":', options: ['Competition between teams', 'Combined effort producing greater results', 'Individual performance', 'Cost reduction strategy'], answer: 1 },
  { id: 'v13', type: 'vocabulary', question: 'What does "unprecedented" mean?', options: ['Previously done', 'Never done before', 'Frequently occurring', 'Well documented'], answer: 1 },
  { id: 'v14', type: 'vocabulary', question: '"The company\'s revenue _____ by 20% this quarter." Which word is correct?', options: ['decreased', 'surged', 'stagnated', 'collapsed'], answer: 1 },
  { id: 'v15', type: 'vocabulary', question: 'Choose the synonym for "prudent":', options: ['Reckless', 'Wise and careful', 'Expensive', 'Rapid'], answer: 1 },
  { id: 'v16', type: 'vocabulary', question: 'What does "streamline" mean?', options: ['To make more complex', 'To make more efficient', 'To add new features', 'To delay a process'], answer: 1 },
  { id: 'v17', type: 'vocabulary', question: '"The proposal was _____ by senior management." Which word means officially approved?', options: ['rejected', 'ratified', 'delayed', 'criticized'], answer: 1 },
  { id: 'v18', type: 'vocabulary', question: 'What is the meaning of "incumbent"?', options: ['A new employee', 'The current holder of a position', 'An external consultant', 'A temporary worker'], answer: 1 },
  { id: 'v19', type: 'vocabulary', question: 'Choose the antonym for "concise":', options: ['Brief', 'Lengthy', 'Clear', 'Direct'], answer: 1 },
  { id: 'v20', type: 'vocabulary', question: '"To _____ a contract" means to make it legally void:', options: ['sign', 'nullify', 'renew', 'extend'], answer: 1 },
  { id: 'v21', type: 'vocabulary', question: 'What does "paradigm shift" refer to?', options: ['Minor adjustment', 'Fundamental change in approach', 'Budget reallocation', 'Staff reorganization'], answer: 1 },
  { id: 'v22', type: 'vocabulary', question: 'Choose the correct meaning of "defer":', options: ['To speed up', 'To postpone', 'To cancel permanently', 'To delegate'], answer: 1 },
  { id: 'v23', type: 'vocabulary', question: '"The company is _____ to customer feedback." Which word means highly responsive?', options: ['indifferent', 'resistant', 'receptive', 'hostile'], answer: 2 },
  { id: 'v24', type: 'vocabulary', question: 'What does "viable" mean?', options: ['Impossible', 'Capable of working successfully', 'Expensive', 'Temporary'], answer: 1 },
  { id: 'v25', type: 'vocabulary', question: 'Choose the synonym for "mandatory":', options: ['Optional', 'Suggested', 'Compulsory', 'Flexible'], answer: 2 },
  { id: 'v26', type: 'vocabulary', question: 'What does "escalate" mean in a workplace context?', options: ['To resolve quickly', 'To refer to a higher authority', 'To ignore the issue', 'To reduce in severity'], answer: 1 },
  { id: 'v27', type: 'vocabulary', question: '"She demonstrated _____ leadership during the crisis." Which word means exceptional?', options: ['mediocre', 'exemplary', 'adequate', 'passive'], answer: 1 },
  { id: 'v28', type: 'vocabulary', question: 'What is "due diligence"?', options: ['Being late on deadlines', 'Careful research before a decision', 'Paying taxes on time', 'Following company dress code'], answer: 1 },
  { id: 'v29', type: 'vocabulary', question: 'Choose the antonym for "transparent" (meaning "open/honest"):', options: ['Clear', 'Secretive', 'Visible', 'Obvious'], answer: 1 },
  { id: 'v30', type: 'vocabulary', question: '"The project will _____ significant resources." Which word means "require"?', options: ['release', 'generate', 'consume', 'reduce'], answer: 2 },
];
 
// ─── READING COMPREHENSION (30 questions, 6 passages × 5 questions) ───────────
const readingQuestions: EnglishQuestion[] = [
  // Passage 1: Remote Work
  {
    id: 'r01', type: 'reading',
    passage: 'Remote work has transformed the modern workplace. Studies show that employees who work from home report higher job satisfaction and productivity. However, challenges such as communication barriers and feelings of isolation persist. Companies that invest in digital collaboration tools and regular check-ins tend to overcome these obstacles more effectively.',
    question: 'According to the passage, what is a challenge of remote work?',
    options: ['Higher productivity', 'Communication barriers', 'Better job satisfaction', 'More collaboration tools'],
    answer: 1,
  },
  {
    id: 'r02', type: 'reading',
    passage: 'Remote work has transformed the modern workplace. Studies show that employees who work from home report higher job satisfaction and productivity. However, challenges such as communication barriers and feelings of isolation persist. Companies that invest in digital collaboration tools and regular check-ins tend to overcome these obstacles more effectively.',
    question: 'What do companies do to overcome remote work challenges?',
    options: ['Reduce salaries', 'Move to physical offices', 'Invest in digital tools and check-ins', 'Hire more staff'],
    answer: 2,
  },
  // Passage 2: Sustainable Business
  {
    id: 'r03', type: 'reading',
    passage: 'Sustainable business practices are no longer optional — they are a competitive necessity. Consumers increasingly prefer brands that demonstrate environmental responsibility. Companies that adopt green policies not only reduce their carbon footprint but also attract top talent who value purpose-driven work environments.',
    question: 'Why are sustainable practices considered a competitive necessity?',
    options: ['Because they reduce profits', 'Because consumers prefer environmentally responsible brands', 'Because governments mandate them', 'Because they eliminate competition'],
    answer: 1,
  },
  {
    id: 'r04', type: 'reading',
    passage: 'Sustainable business practices are no longer optional — they are a competitive necessity. Consumers increasingly prefer brands that demonstrate environmental responsibility. Companies that adopt green policies not only reduce their carbon footprint but also attract top talent who value purpose-driven work environments.',
    question: 'What is an additional benefit of green policies mentioned in the passage?',
    options: ['Higher product prices', 'Attracting top talent', 'Reducing competition', 'Increasing carbon footprint'],
    answer: 1,
  },
  // Passage 3: Leadership
  {
    id: 'r05', type: 'reading',
    passage: 'Effective leadership requires more than technical expertise. Emotional intelligence — the ability to understand and manage one\'s emotions and those of others — is increasingly recognized as a critical leadership skill. Leaders with high emotional intelligence build stronger teams, resolve conflicts more effectively, and create positive work cultures.',
    question: 'What is described as a critical leadership skill?',
    options: ['Technical expertise', 'Financial management', 'Emotional intelligence', 'Physical strength'],
    answer: 2,
  },
  {
    id: 'r06', type: 'reading',
    passage: 'Effective leadership requires more than technical expertise. Emotional intelligence — the ability to understand and manage one\'s emotions and those of others — is increasingly recognized as a critical leadership skill. Leaders with high emotional intelligence build stronger teams, resolve conflicts more effectively, and create positive work cultures.',
    question: 'According to the passage, what do leaders with high emotional intelligence create?',
    options: ['Higher profits', 'Positive work cultures', 'Larger teams', 'More technical solutions'],
    answer: 1,
  },
  // Passage 4: Digital Transformation
  {
    id: 'r07', type: 'reading',
    passage: 'Digital transformation is reshaping industries at an unprecedented pace. Organizations that fail to adapt risk obsolescence, while those that embrace technology gain significant advantages. Key drivers include artificial intelligence, cloud computing, and data analytics. Successful transformation requires not just new technology but also a shift in organizational culture and mindset.',
    question: 'What risk do organizations face if they fail to adapt to digital transformation?',
    options: ['Higher profits', 'Obsolescence', 'More employees', 'Greater market share'],
    answer: 1,
  },
  {
    id: 'r08', type: 'reading',
    passage: 'Digital transformation is reshaping industries at an unprecedented pace. Organizations that fail to adapt risk obsolescence, while those that embrace technology gain significant advantages. Key drivers include artificial intelligence, cloud computing, and data analytics. Successful transformation requires not just new technology but also a shift in organizational culture and mindset.',
    question: 'According to the passage, what does successful digital transformation require beyond technology?',
    options: ['More funding', 'Larger staff', 'A shift in culture and mindset', 'New office spaces'],
    answer: 2,
  },
  // Passage 5: Customer Service
  {
    id: 'r09', type: 'reading',
    passage: 'Excellent customer service is the foundation of business success. Research indicates that it costs five times more to acquire a new customer than to retain an existing one. Businesses that prioritize customer experience see higher loyalty rates, better word-of-mouth referrals, and ultimately greater revenue. Training employees in communication skills is therefore a worthwhile investment.',
    question: 'How much more does it cost to acquire a new customer versus retaining an existing one?',
    options: ['Twice as much', 'Three times as much', 'Four times as much', 'Five times as much'],
    answer: 3,
  },
  {
    id: 'r10', type: 'reading',
    passage: 'Excellent customer service is the foundation of business success. Research indicates that it costs five times more to acquire a new customer than to retain an existing one. Businesses that prioritize customer experience see higher loyalty rates, better word-of-mouth referrals, and ultimately greater revenue. Training employees in communication skills is therefore a worthwhile investment.',
    question: 'What does the passage say about training employees in communication skills?',
    options: ['It is too expensive', 'It is a worthwhile investment', 'It is not necessary', 'It reduces customer satisfaction'],
    answer: 1,
  },
  // Passage 6: Workplace Diversity
  {
    id: 'r11', type: 'reading',
    passage: 'Workplace diversity and inclusion have moved from being moral imperatives to strategic business advantages. Diverse teams bring varied perspectives, leading to more innovative solutions. Companies with inclusive cultures consistently outperform their peers in profitability and employee retention. Building such a culture requires intentional policies and ongoing commitment from leadership.',
    question: 'What is the business advantage of diverse teams mentioned in the passage?',
    options: ['Reduced costs', 'More innovative solutions', 'Faster production', 'Fewer conflicts'],
    answer: 1,
  },
  {
    id: 'r12', type: 'reading',
    passage: 'Workplace diversity and inclusion have moved from being moral imperatives to strategic business advantages. Diverse teams bring varied perspectives, leading to more innovative solutions. Companies with inclusive cultures consistently outperform their peers in profitability and employee retention. Companies with inclusive cultures consistently outperform their peers.',
    question: 'What is required to build an inclusive culture according to the passage?',
    options: ['Larger budgets', 'More office space', 'Intentional policies and leadership commitment', 'Reducing team size'],
    answer: 2,
  },
  // Additional reading questions
  {
    id: 'r13', type: 'reading',
    passage: 'Time management is one of the most sought-after skills in the modern workplace. Employees who manage their time effectively are more productive, experience less stress, and achieve better work-life balance. Techniques such as prioritization, delegation, and the use of scheduling tools can significantly improve time management.',
    question: 'Which of the following is a time management technique mentioned in the passage?',
    options: ['Multitasking', 'Delegation', 'Working longer hours', 'Avoiding meetings'],
    answer: 1,
  },
  {
    id: 'r14', type: 'reading',
    passage: 'Time management is one of the most sought-after skills in the modern workplace. Employees who manage their time effectively are more productive, experience less stress, and achieve better work-life balance. Techniques such as prioritization, delegation, and the use of scheduling tools can significantly improve time management.',
    question: 'According to the passage, what do employees who manage time effectively experience?',
    options: ['More stress', 'Less productivity', 'Less stress', 'Longer working hours'],
    answer: 2,
  },
  {
    id: 'r15', type: 'reading',
    passage: 'Negotiation is an essential business skill. Successful negotiators understand that the goal is not always to "win" but to reach a mutually beneficial agreement. Preparation, active listening, and the ability to find common ground are key components of effective negotiation. Building long-term relationships often takes precedence over short-term gains.',
    question: 'What is described as the goal of successful negotiation?',
    options: ['Winning at all costs', 'A mutually beneficial agreement', 'Maximizing short-term gains', 'Dominating the other party'],
    answer: 1,
  },
  // More reading questions to reach 30
  {
    id: 'r16', type: 'reading',
    passage: 'Effective communication in the workplace involves both speaking and listening. Many professionals focus on improving their speaking skills while neglecting active listening. Active listening means giving full attention, avoiding interruptions, and providing thoughtful responses. It builds trust and reduces misunderstandings significantly.',
    question: 'What does active listening involve according to the passage?',
    options: ['Interrupting frequently', 'Giving full attention and thoughtful responses', 'Only focusing on speaking', 'Avoiding eye contact'],
    answer: 1,
  },
  {
    id: 'r17', type: 'reading',
    passage: 'Effective communication in the workplace involves both speaking and listening. Many professionals focus on improving their speaking skills while neglecting active listening. Active listening means giving full attention, avoiding interruptions, and providing thoughtful responses. It builds trust and reduces misunderstandings significantly.',
    question: 'What does active listening build according to the passage?',
    options: ['Conflict', 'Trust', 'Competition', 'Stress'],
    answer: 1,
  },
  {
    id: 'r18', type: 'reading',
    passage: 'Professional networking is crucial for career advancement. Building genuine relationships, rather than transactional connections, leads to more meaningful opportunities. Attending industry events, engaging on professional platforms, and maintaining regular contact with your network are effective strategies. Quality of connections often matters more than quantity.',
    question: 'What type of networking does the passage recommend?',
    options: ['Transactional connections', 'Genuine relationships', 'Large quantity of contacts', 'Online only networking'],
    answer: 1,
  },
  {
    id: 'r19', type: 'reading',
    passage: 'Professional networking is crucial for career advancement. Building genuine relationships, rather than transactional connections, leads to more meaningful opportunities. Attending industry events, engaging on professional platforms, and maintaining regular contact with your network are effective strategies. Quality of connections often matters more than quantity.',
    question: 'According to the passage, what matters more than quantity in networking?',
    options: ['Speed', 'Cost', 'Quality of connections', 'Frequency of events'],
    answer: 2,
  },
  {
    id: 'r20', type: 'reading',
    passage: 'Data-driven decision making is transforming how businesses operate. Rather than relying solely on intuition, managers now use analytics to guide strategic choices. This approach reduces bias, identifies trends, and improves forecasting accuracy. However, data must be interpreted carefully, as poor analysis can lead to equally poor decisions.',
    question: 'What is one benefit of data-driven decision making?',
    options: ['Increases bias', 'Reduces trend identification', 'Improves forecasting accuracy', 'Eliminates the need for managers'],
    answer: 2,
  },
  {
    id: 'r21', type: 'reading',
    passage: 'Data-driven decision making is transforming how businesses operate. Rather than relying solely on intuition, managers now use analytics to guide strategic choices. This approach reduces bias, identifies trends, and improves forecasting accuracy. However, data must be interpreted carefully, as poor analysis can lead to equally poor decisions.',
    question: 'What warning does the passage give about data?',
    options: ['Data is always accurate', 'Poor analysis can lead to poor decisions', 'Data should replace intuition entirely', 'Data is too expensive to collect'],
    answer: 1,
  },
  {
    id: 'r22', type: 'reading',
    passage: 'Conflict in the workplace is inevitable, but it does not have to be destructive. When managed well, conflict can lead to better solutions and stronger relationships. Key steps include acknowledging the conflict, listening to all perspectives, and focusing on interests rather than positions. Mediation by a neutral party may be necessary in complex situations.',
    question: 'According to the passage, when can conflict be beneficial?',
    options: ['When it is ignored', 'When it is managed well', 'When only one side wins', 'When it escalates'],
    answer: 1,
  },
  {
    id: 'r23', type: 'reading',
    passage: 'Conflict in the workplace is inevitable, but it does not have to be destructive. When managed well, conflict can lead to better solutions and stronger relationships. Key steps include acknowledging the conflict, listening to all perspectives, and focusing on interests rather than positions. Mediation by a neutral party may be necessary in complex situations.',
    question: 'In complex conflict situations, what does the passage suggest?',
    options: ['Ignoring the conflict', 'Firing one of the parties', 'Mediation by a neutral party', 'Escalating to management'],
    answer: 2,
  },
  {
    id: 'r24', type: 'reading',
    passage: 'Personal branding is the practice of marketing yourself and your career as a brand. In today\'s competitive job market, having a strong personal brand can differentiate you from other candidates. This includes maintaining a professional online presence, clearly communicating your values and strengths, and consistently delivering quality work.',
    question: 'What is personal branding according to the passage?',
    options: ['Creating a company logo', 'Marketing yourself and your career as a brand', 'Designing business cards', 'Building a website'],
    answer: 1,
  },
  {
    id: 'r25', type: 'reading',
    passage: 'Personal branding is the practice of marketing yourself and your career as a brand. In today\'s competitive job market, having a strong personal brand can differentiate you from other candidates. This includes maintaining a professional online presence, clearly communicating your values and strengths, and consistently delivering quality work.',
    question: 'How can personal branding help in a competitive job market?',
    options: ['By increasing your salary automatically', 'By differentiating you from other candidates', 'By eliminating the need for interviews', 'By reducing work requirements'],
    answer: 1,
  },
  {
    id: 'r26', type: 'reading',
    passage: 'Critical thinking enables professionals to analyze situations objectively and make sound judgments. It involves questioning assumptions, evaluating evidence, and considering multiple perspectives before reaching a conclusion. Organizations that cultivate critical thinking among employees are better equipped to solve complex problems and adapt to change.',
    question: 'What does critical thinking involve?',
    options: ['Accepting all information as true', 'Questioning assumptions and evaluating evidence', 'Following instructions without analysis', 'Avoiding collaboration'],
    answer: 1,
  },
  {
    id: 'r27', type: 'reading',
    passage: 'Critical thinking enables professionals to analyze situations objectively and make sound judgments. It involves questioning assumptions, evaluating evidence, and considering multiple perspectives before reaching a conclusion. Organizations that cultivate critical thinking among employees are better equipped to solve complex problems and adapt to change.',
    question: 'What benefit do organizations gain from cultivating critical thinking?',
    options: ['Faster production speed', 'Better equipped to solve problems and adapt', 'Lower operational costs', 'More hierarchical structures'],
    answer: 1,
  },
  {
    id: 'r28', type: 'reading',
    passage: 'Adaptability is one of the most valued traits in today\'s workforce. As industries evolve rapidly due to technological advances, employees who embrace change and continuously develop new skills remain competitive. Lifelong learning — the ongoing pursuit of knowledge and skills — is essential for long-term career success.',
    question: 'Why is adaptability highly valued according to the passage?',
    options: ['Because it reduces workload', 'Because industries evolve rapidly', 'Because it increases salaries', 'Because it simplifies job tasks'],
    answer: 1,
  },
  {
    id: 'r29', type: 'reading',
    passage: 'Adaptability is one of the most valued traits in today\'s workforce. As industries evolve rapidly due to technological advances, employees who embrace change and continuously develop new skills remain competitive. Lifelong learning — the ongoing pursuit of knowledge and skills — is essential for long-term career success.',
    question: 'What does the passage say is essential for long-term career success?',
    options: ['Staying in one company', 'Lifelong learning', 'Technical skills only', 'Seniority'],
    answer: 1,
  },
  {
    id: 'r30', type: 'reading',
    passage: 'Feedback is a powerful tool for professional growth. Constructive feedback — delivered respectfully and focused on behavior rather than personality — helps individuals identify blind spots and improve performance. Equally important is the ability to receive feedback gracefully, treating it as an opportunity rather than a criticism.',
    question: 'How should feedback be delivered according to the passage?',
    options: ['Publicly and harshly', 'Focused on personality', 'Respectfully and focused on behavior', 'Only in written form'],
    answer: 2,
  },
];
 
// ─── SENTENCE COMPLETION (30 questions) ──────────────────────────────────────
const sentenceCompletionQuestions: EnglishQuestion[] = [
  { id: 'sc01', type: 'sentence_completion', question: '"The new policy will _____ all employees, regardless of their department."', options: ['affect', 'effect', 'infect', 'reflect'], answer: 0 },
  { id: 'sc02', type: 'sentence_completion', question: '"Please _____ the attached document before our meeting tomorrow."', options: ['overlook', 'review', 'ignore', 'delete'], answer: 1 },
  { id: 'sc03', type: 'sentence_completion', question: '"The sales figures _____ a significant improvement over the previous quarter."', options: ['indicate', 'ignore', 'dismiss', 'contradict'], answer: 0 },
  { id: 'sc04', type: 'sentence_completion', question: '"She was hired _____ her extensive experience in the field."', options: ['despite', 'because of', 'although', 'unless'], answer: 1 },
  { id: 'sc05', type: 'sentence_completion', question: '"We must _____ a solution before the deadline."', options: ['arrive at', 'arrive to', 'arrive for', 'arrive with'], answer: 0 },
  { id: 'sc06', type: 'sentence_completion', question: '"The board of directors _____ a unanimous decision on the merger."', options: ['reached', 'made to', 'did', 'achieved to'], answer: 0 },
  { id: 'sc07', type: 'sentence_completion', question: '"His presentation was _____, leaving the audience confused."', options: ['lucid', 'coherent', 'incoherent', 'compelling'], answer: 2 },
  { id: 'sc08', type: 'sentence_completion', question: '"The company _____ a new marketing strategy to boost sales."', options: ['implemented', 'implemented for', 'implemented about', 'implementing'], answer: 0 },
  { id: 'sc09', type: 'sentence_completion', question: '"Please _____ your response by end of business today."', options: ['submit', 'submission', 'submitting', 'submitted'], answer: 0 },
  { id: 'sc10', type: 'sentence_completion', question: '"The project was completed _____ schedule, impressing the clients."', options: ['ahead of', 'behind of', 'in front of', 'after of'], answer: 0 },
  { id: 'sc11', type: 'sentence_completion', question: '"The training session is _____ to all new employees."', options: ['mandatory', 'optional', 'voluntary', 'irrelevant'], answer: 0 },
  { id: 'sc12', type: 'sentence_completion', question: '"We will need to _____ additional funds to complete the project."', options: ['allocate', 'eliminate', 'ignore', 'reduce'], answer: 0 },
  { id: 'sc13', type: 'sentence_completion', question: '"Her _____ to detail makes her an excellent quality control manager."', options: ['attention', 'ignorance', 'resistance', 'indifference'], answer: 0 },
  { id: 'sc14', type: 'sentence_completion', question: '"The contract will _____ on the last day of this month."', options: ['expire', 'expiry', 'expiration', 'expired'], answer: 0 },
  { id: 'sc15', type: 'sentence_completion', question: '"I would like to _____ a meeting with you at your earliest convenience."', options: ['schedule', 'cancel', 'postpone indefinitely', 'avoid'], answer: 0 },
  { id: 'sc16', type: 'sentence_completion', question: '"The team worked _____ to meet the tight deadline."', options: ['diligently', 'carelessly', 'slowly', 'reluctantly'], answer: 0 },
  { id: 'sc17', type: 'sentence_completion', question: '"Could you please _____ on the key points of the proposal?"', options: ['elaborate', 'exaggerate', 'eliminate', 'evacuate'], answer: 0 },
  { id: 'sc18', type: 'sentence_completion', question: '"The supervisor gave _____ feedback on the employee\'s performance."', options: ['constructive', 'destructive', 'irrelevant', 'vague'], answer: 0 },
  { id: 'sc19', type: 'sentence_completion', question: '"All expenses must be _____ with official receipts."', options: ['supported', 'submitted', 'confirmed by', 'denied'], answer: 0 },
  { id: 'sc20', type: 'sentence_completion', question: '"Please _____ me if you have any questions or concerns."', options: ['contact', 'ignore', 'avoid', 'forget'], answer: 0 },
  { id: 'sc21', type: 'sentence_completion', question: '"The company is _____ a new office in Manila."', options: ['opening', 'closing permanently', 'demolishing', 'avoiding'], answer: 0 },
  { id: 'sc22', type: 'sentence_completion', question: '"We appreciate your _____ in this matter."', options: ['cooperation', 'interference', 'resistance', 'negligence'], answer: 0 },
  { id: 'sc23', type: 'sentence_completion', question: '"The annual report will be _____ to all shareholders next week."', options: ['distributed', 'hidden', 'destroyed', 'ignored'], answer: 0 },
  { id: 'sc24', type: 'sentence_completion', question: '"She _____ the role of team leader after her predecessor resigned."', options: ['assumed', 'refused', 'avoided', 'missed'], answer: 0 },
  { id: 'sc25', type: 'sentence_completion', question: '"The new product has generated significant _____ from customers."', options: ['interest', 'indifference', 'hostility', 'confusion'], answer: 0 },
  { id: 'sc26', type: 'sentence_completion', question: '"We are _____ to announce the launch of our new service."', options: ['pleased', 'reluctant', 'unable', 'unprepared'], answer: 0 },
  { id: 'sc27', type: 'sentence_completion', question: '"The meeting has been _____ to next Thursday due to scheduling conflicts."', options: ['rescheduled', 'cancelled permanently', 'ignored', 'forgotten'], answer: 0 },
  { id: 'sc28', type: 'sentence_completion', question: '"Your application has been _____ and we will be in touch shortly."', options: ['received', 'lost', 'ignored', 'rejected'], answer: 0 },
  { id: 'sc29', type: 'sentence_completion', question: '"The intern showed great _____ and completed the task ahead of time."', options: ['initiative', 'laziness', 'confusion', 'reluctance'], answer: 0 },
  { id: 'sc30', type: 'sentence_completion', question: '"Please _____ that all documents are signed before submission."', options: ['ensure', 'ignore', 'forget', 'delay'], answer: 0 },
];
 
// ─── ERROR IDENTIFICATION (30 questions) ─────────────────────────────────────
const errorIdentificationQuestions: EnglishQuestion[] = [
  { id: 'e01', type: 'error_identification', question: 'Identify the error: "The team have did an excellent job on this project."', options: ['The team', 'have did', 'excellent job', 'on this project'], answer: 1 },
  { id: 'e02', type: 'error_identification', question: 'Find the mistake: "She is very good in managing her time and resources."', options: ['She is', 'very good', 'in managing', 'her time and resources'], answer: 2 },
  { id: 'e03', type: 'error_identification', question: 'Identify the error: "We need to discuss about the new company policies."', options: ['We need', 'to discuss about', 'the new', 'company policies'], answer: 1 },
  { id: 'e04', type: 'error_identification', question: 'Find the mistake: "He has been working here since three years."', options: ['He has been', 'working here', 'since three years', 'no error'], answer: 2 },
  { id: 'e05', type: 'error_identification', question: 'Identify the error: "Each employees must submit their timesheet by Friday."', options: ['Each employees', 'must submit', 'their timesheet', 'by Friday'], answer: 0 },
  { id: 'e06', type: 'error_identification', question: 'Find the mistake: "The informations provided were very helpful."', options: ['The informations', 'provided were', 'very helpful', 'no error'], answer: 0 },
  { id: 'e07', type: 'error_identification', question: 'Identify the error: "She congratulated him for his successful presentation."', options: ['She congratulated', 'him for', 'his successful', 'no error'], answer: 3 },
  { id: 'e08', type: 'error_identification', question: 'Find the mistake: "The manager asked us to do our best efforts."', options: ['The manager', 'asked us to', 'do our best efforts', 'no error'], answer: 2 },
  { id: 'e09', type: 'error_identification', question: 'Identify the error: "We are looking forward to work with your team."', options: ['We are', 'looking forward to', 'work with', 'your team'], answer: 2 },
  { id: 'e10', type: 'error_identification', question: 'Find the mistake: "The CEO, together with his advisors, are attending the summit."', options: ['The CEO', 'together with his advisors', 'are attending', 'the summit'], answer: 2 },
  { id: 'e11', type: 'error_identification', question: 'Identify the error: "He is one of the most talented employee in our department."', options: ['He is one of', 'the most talented', 'employee in', 'our department'], answer: 2 },
  { id: 'e12', type: 'error_identification', question: 'Find the mistake: "All of the staffs were present at the meeting."', options: ['All of', 'the staffs', 'were present', 'at the meeting'], answer: 1 },
  { id: 'e13', type: 'error_identification', question: 'Identify the error: "She is very interested on learning new technologies."', options: ['She is very', 'interested on', 'learning new', 'technologies'], answer: 1 },
  { id: 'e14', type: 'error_identification', question: 'Find the mistake: "The new recruit adapted very quick to the work environment."', options: ['The new recruit', 'adapted very', 'quick to', 'the work environment'], answer: 2 },
  { id: 'e15', type: 'error_identification', question: 'Identify the error: "Neither the manager nor the employees was informed."', options: ['Neither the manager', 'nor the employees', 'was informed', 'no error'], answer: 2 },
  { id: 'e16', type: 'error_identification', question: 'Find the mistake: "We should avoid to make the same mistakes again."', options: ['We should', 'avoid to make', 'the same mistakes', 'again'], answer: 1 },
  { id: 'e17', type: 'error_identification', question: 'Identify the error: "The report must be submit before the end of the day."', options: ['The report', 'must be submit', 'before the end', 'of the day'], answer: 1 },
  { id: 'e18', type: 'error_identification', question: 'Find the mistake: "She is more better suited for the senior role."', options: ['She is', 'more better', 'suited for', 'the senior role'], answer: 1 },
  { id: 'e19', type: 'error_identification', question: 'Identify the error: "The proposal was approved on behalf of the committee."', options: ['The proposal', 'was approved', 'on behalf of', 'no error'], answer: 3 },
  { id: 'e20', type: 'error_identification', question: 'Find the mistake: "Please revert back to me with your decision."', options: ['Please', 'revert back', 'to me with', 'your decision'], answer: 1 },
  { id: 'e21', type: 'error_identification', question: 'Identify the error: "The client was unsatisfied with our services, therefore, we issued a refund."', options: ['The client was', 'unsatisfied with', 'our services therefore', 'no error'], answer: 3 },
  { id: 'e22', type: 'error_identification', question: 'Find the mistake: "Despite of the challenges, the team succeeded."', options: ['Despite of', 'the challenges', 'the team', 'succeeded'], answer: 0 },
  { id: 'e23', type: 'error_identification', question: 'Identify the error: "He suggested that she should considers applying for the position."', options: ['He suggested that', 'she should', 'considers applying', 'for the position'], answer: 2 },
  { id: 'e24', type: 'error_identification', question: 'Find the mistake: "The seminar was very informative and I learned a lot of informations."', options: ['The seminar was', 'very informative', 'a lot of informations', 'no error'], answer: 2 },
  { id: 'e25', type: 'error_identification', question: 'Identify the error: "We discussed about the possibility of extending the deadline."', options: ['We discussed about', 'the possibility', 'of extending', 'the deadline'], answer: 0 },
  { id: 'e26', type: 'error_identification', question: 'Find the mistake: "The number of complaints have increased this month."', options: ['The number of', 'complaints have', 'increased', 'this month'], answer: 1 },
  { id: 'e27', type: 'error_identification', question: 'Identify the error: "She is capable to handle multiple tasks simultaneously."', options: ['She is', 'capable to handle', 'multiple tasks', 'simultaneously'], answer: 1 },
  { id: 'e28', type: 'error_identification', question: 'Find the mistake: "The company is committed in providing excellent service."', options: ['The company is', 'committed in', 'providing excellent', 'service'], answer: 1 },
  { id: 'e29', type: 'error_identification', question: 'Identify the error: "We need to make sure that all loose ends are tied."', options: ['We need to', 'make sure that', 'all loose ends are tied', 'no error'], answer: 3 },
  { id: 'e30', type: 'error_identification', question: 'Find the mistake: "The manager complemented the team on their hard work."', options: ['The manager', 'complemented the team', 'on their hard work', 'no error'], answer: 1 },
];
 
// ─── Adapter: convert EnglishQuestion → lib Question ─────────────────────────
function toLibQuestion(q: EnglishQuestion): LibQuestion {
  return {
    id:          q.id,
    type:        'grammar' as any,
    prompt:      q.passage ? `📄 Read the passage:\n\n"${q.passage}"\n\n${q.question}` : q.question,
    choices:     q.options,
    answerIndex: q.answer,
  };
}
 
// ─── Random selection: 25 questions (5 per type) ─────────────────────────────
export function getRandomEnglishQuestions(): LibQuestion[] {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
 
  const selected = [
    ...shuffle(grammarQuestions).slice(0, 5),
    ...shuffle(vocabularyQuestions).slice(0, 5),
    ...shuffle(readingQuestions).slice(0, 5),
    ...shuffle(sentenceCompletionQuestions).slice(0, 5),
    ...shuffle(errorIdentificationQuestions).slice(0, 5),
  ];
 
  return shuffle(selected).map(toLibQuestion);
}
