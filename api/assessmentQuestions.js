import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const iqBank = readQuestionBank('iq.json');
const englishBank = readQuestionBank('english.json');
const aptitudeBank = readQuestionBank('aptitude.json');

const IQ_TYPES = {
  pattern: 'logical_reasoning',
  sequence: 'number_series',
  matrix: 'figure_reasoning',
};
const IQ_PICKS = { pattern: 8, sequence: 8, matrix: 9 };
const ENGLISH_POOLS = [
  englishBank.grammar,
  englishBank.vocabulary,
  englishBank.reading.flatMap((passage) =>
    passage.questions.map((question) => ({ ...question, passage: passage.passage })),
  ),
  englishBank.sentence_completion,
  englishBank.error_identification,
];

function readQuestionBank(fileName) {
  return JSON.parse(readFileSync(path.join(dataDirectory, fileName), 'utf8'));
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getIQQuestions() {
  return shuffle(Object.entries(IQ_PICKS).flatMap(([category, count]) =>
    shuffle(iqBank[category]).slice(0, count).map((question) => ({
      id: question.id,
      type: IQ_TYPES[category],
      prompt: question.prompt,
      choices: question.choices,
      answerIndex: question.answerIndex,
    })),
  ));
}

function getEnglishQuestions() {
  return shuffle(ENGLISH_POOLS.flatMap((pool) => shuffle(pool).slice(0, 5))).map((question) => ({
    id: question.id,
    type: 'grammar',
    prompt: question.passage
      ? `📄 Read the passage:\n\n"${question.passage}"\n\n${question.prompt}`
      : question.prompt,
    choices: question.choices,
    answerIndex: question.answerIndex,
  }));
}

function getAptitudeQuestions() {
  const workQuestions = shuffle(aptitudeBank.workAptitude).slice(0, 15).map((question) => ({
    id: question.id,
    type: 'logical_reasoning',
    prompt: `💼 Workplace Situation:\n\n${question.prompt}`,
    choices: question.choices,
    answerIndex: question.answerIndex,
  }));
  const personalityQuestions = shuffle(aptitudeBank.personality).slice(0, 15).map((question) => ({
    id: question.id,
    type: 'likert',
    prompt: `🧭 Rate your agreement with the following statement:\n\n"${question.prompt}"`,
    choices: aptitudeBank.likertScale,
    answerIndex: -1,
  }));
  return [...workQuestions, ...personalityQuestions];
}

export function createAssessmentQuestions(testType) {
  switch (testType) {
    case 'iq':
      return getIQQuestions();
    case 'english':
      return getEnglishQuestions();
    case 'aptitude':
      return getAptitudeQuestions();
    default:
      throw new Error(`Unsupported built-in assessment: ${testType}`);
  }
}

export function scoreAssessmentQuestions(questions, answers) {
  const scoredQuestions = questions.filter((question) => question.type !== 'likert');
  const correct = scoredQuestions.filter((question) => answers[question.id] === question.answerIndex).length;
  return {
    correct,
    total: scoredQuestions.length,
    percent: Math.round((correct / scoredQuestions.length) * 100),
  };
}

export function getAptitudePersonality(answers) {
  const dimensions = Object.fromEntries(
    aptitudeBank.personality.reduce((scores, question) => {
      if (!scores.has(question.dimension)) scores.set(question.dimension, []);
      const answer = answers[question.id];
      if (Number.isInteger(answer)) {
        scores.get(question.dimension).push(question.reverse ? 4 - answer : answer);
      }
      return scores;
    }, new Map()),
  );
  return Object.fromEntries(Object.entries(aptitudeBank.dimensions).map(([dimension]) => {
    const scores = dimensions[dimension] ?? [];
    const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 2;
    return [dimension, Math.round((average / 4) * 100)];
  }));
}
