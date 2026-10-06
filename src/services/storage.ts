import { Question, ExamSubmission, ExamConfig } from '../types/exam';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEYS = {
  QUESTIONS: 'smartexam_questions_v1',
  SUBMISSIONS: 'smartexam_submissions_v1',
  CONFIG: 'smartexam_config_v1',
};

export const DEFAULT_CONFIG: ExamConfig = {
  timeLimitMinutes: 10, // 10 minutes default
  passingPercentage: 50,
  questionsPerExam: 10,
  shuffleQuestions: true,
  allowReviewAfterSubmission: true,
};

export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      saveQuestions(DEFAULT_QUESTIONS);
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_QUESTIONS;
  } catch (e) {
    console.error('Failed to load questions from storage', e);
    return DEFAULT_QUESTIONS;
  }
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions', e);
  }
}

export function resetQuestionsToDefault(): Question[] {
  saveQuestions(DEFAULT_QUESTIONS);
  return DEFAULT_QUESTIONS;
}

export function loadSubmissions(): ExamSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load submissions', e);
    return [];
  }
}

export function saveSubmission(submission: ExamSubmission): void {
  try {
    const existing = loadSubmissions();
    const updated = [submission, ...existing];
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save submission', e);
  }
}

export function deleteSubmission(id: string): ExamSubmission[] {
  try {
    const existing = loadSubmissions();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete submission', e);
    return [];
  }
}

export function clearAllSubmissions(): void {
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
}

export function loadConfig(): ExamConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: ExamConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}
