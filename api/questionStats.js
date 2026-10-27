import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

function readQuestionBank(fileName) {
  return JSON.parse(readFileSync(resolve(dataDirectory, fileName), 'utf8'));
}

const iqBank = readQuestionBank('iq.json');
const englishBank = readQuestionBank('english.json');
const aptitudeBank = readQuestionBank('aptitude.json');

const ENGLISH_CATEGORY_LABELS = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading Comprehension',
  sentence_completion: 'Sentence Completion',
  error_identification: 'Error Identification',
};

function getScoredQuestions(testType) {
  if (testType === 'iq') {
    return Object.entries(iqBank).flatMap(([category, questions]) =>
      questions.map((question) => ({
        ...question,
        category: category === 'pattern' ? 'Pattern Recognition'
          : category === 'sequence' ? 'Number Sequence'
            : 'Matrix Reasoning',
      })),
    );
  }

  if (testType === 'english') {
    const readingQuestions = englishBank.reading.flatMap((passage) =>
      passage.questions.map((question) => ({
        ...question,
        passage: passage.passage,
        category: ENGLISH_CATEGORY_LABELS.reading,
      })),
    );
    return [
      ...englishBank.grammar.map((question) => ({ ...question, category: ENGLISH_CATEGORY_LABELS.grammar })),
      ...englishBank.vocabulary.map((question) => ({ ...question, category: ENGLISH_CATEGORY_LABELS.vocabulary })),
      ...readingQuestions,
      ...englishBank.sentence_completion.map((question) => ({
        ...question,
        category: ENGLISH_CATEGORY_LABELS.sentence_completion,
      })),
      ...englishBank.error_identification.map((question) => ({
        ...question,
        category: ENGLISH_CATEGORY_LABELS.error_identification,
      })),
    ];
  }

  if (testType === 'aptitude') {
    return aptitudeBank.workAptitude.map((question) => ({
      ...question,
      category: 'Work Aptitude',
    }));
  }

  throw new Error(`Unsupported question-statistics test type: ${testType}`);
}

export function getQuestionStatistics(db, testType) {
  const questions = getScoredQuestions(testType).map((question) => ({
    id: question.id,
    category: question.category,
    prompt: question.prompt,
    passage: question.passage || '',
    choices: question.choices,
    answerIndex: question.answerIndex,
    responses: 0,
    correct: 0,
    incorrect: 0,
  }));
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const submissions = db.prepare(`
    SELECT answers_json
    FROM assessment_results
    WHERE test_type = ?
  `).all(testType);

  for (const submission of submissions) {
    const answers = JSON.parse(submission.answers_json);
    for (const [questionId, answerIndex] of Object.entries(answers)) {
      const question = questionById.get(questionId);
      if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.choices.length) {
        continue;
      }
      question.responses += 1;
      if (answerIndex === question.answerIndex) question.correct += 1;
      else question.incorrect += 1;
    }
  }

  return {
    testType,
    submissionCount: submissions.length,
    questions: questions.map(({ answerIndex: _answerIndex, ...question }) => ({
      ...question,
      accuracyPercent: question.responses
        ? Math.round((question.correct / question.responses) * 100)
        : null,
    })),
  };
}
