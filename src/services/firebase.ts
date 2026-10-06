import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Question, ExamSubmission, ExamConfig } from '../types/exam';

export const firebaseConfig = {
  apiKey: "AIzaSyCvAaWlk7-SESGtoMHp3tMp37eyEpg33KM",
  authDomain: "examportal-fd653.firebaseapp.com",
  projectId: "examportal-fd653",
  storageBucket: "examportal-fd653.firebasestorage.app",
  messagingSenderId: "591541516302",
  appId: "1:591541516302:web:c39f121beef2fdcb87645f",
  measurementId: "G-NF5KX0XS2K"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Warning: ', JSON.stringify(errInfo));
  return errInfo;
}

// Collections
const COLLECTIONS = {
  QUESTIONS: 'questions',
  SUBMISSIONS: 'submissions',
  CONFIG: 'config',
};

// --- Realtime Questions Sync ---
export function subscribeQuestions(
  onData: (questions: Question[]) => void,
  onError?: (err: any) => void
) {
  try {
    const qCol = collection(db, COLLECTIONS.QUESTIONS);
    return onSnapshot(
      qCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Question[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              category: data.category,
              question: data.question,
              codeSnippet: data.codeSnippet || undefined,
              options: data.options || [],
              correctAnswerIndex: data.correctAnswerIndex ?? 0,
              explanation: data.explanation || '',
              difficulty: data.difficulty || 'Easy',
            });
          });
          onData(list);
        } else {
          onData([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.QUESTIONS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.QUESTIONS);
    return () => {};
  }
}

export async function saveQuestionToFirestore(question: Question): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.QUESTIONS, question.id);
    await setDoc(docRef, {
      ...question,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.QUESTIONS}/${question.id}`);
    return false;
  }
}

export async function deleteQuestionFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.QUESTIONS, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.QUESTIONS}/${id}`);
    return false;
  }
}

export async function seedQuestionsToFirestore(questions: Question[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    questions.forEach((q) => {
      const docRef = doc(db, COLLECTIONS.QUESTIONS, q.id);
      batch.set(docRef, {
        ...q,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.QUESTIONS);
    return false;
  }
}

// --- Realtime Submissions Sync ---
export function subscribeSubmissions(
  onData: (subs: ExamSubmission[]) => void,
  onError?: (err: any) => void
) {
  try {
    const subCol = collection(db, COLLECTIONS.SUBMISSIONS);
    return onSnapshot(
      subCol,
      (snapshot) => {
        const list: ExamSubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            studentName: data.studentName || 'Student',
            rollNumber: data.rollNumber || '',
            category: data.category || 'All',
            totalQuestions: data.totalQuestions || 0,
            attempted: data.attempted || 0,
            correctAnswers: data.correctAnswers || 0,
            wrongAnswers: data.wrongAnswers || 0,
            unanswered: data.unanswered || 0,
            score: data.score || 0,
            percentage: data.percentage || 0,
            isPassed: Boolean(data.isPassed),
            timeTakenSeconds: data.timeTakenSeconds || 0,
            allocatedTimeSeconds: data.allocatedTimeSeconds || 600,
            submittedAt: data.submittedAt || new Date().toLocaleString(),
            answers: data.answers || [],
          });
        });
        // Sort descending by id or timestamp
        list.sort((a, b) => b.id.localeCompare(a.id));
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SUBMISSIONS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SUBMISSIONS);
    return () => {};
  }
}

export async function saveSubmissionToFirestore(submission: ExamSubmission): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SUBMISSIONS, submission.id);
    await setDoc(docRef, {
      ...submission,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.SUBMISSIONS}/${submission.id}`);
    return false;
  }
}

export async function deleteSubmissionFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SUBMISSIONS, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.SUBMISSIONS}/${id}`);
    return false;
  }
}

export async function clearAllSubmissionsFromFirestore(currentSubmissions: ExamSubmission[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    currentSubmissions.forEach((s) => {
      batch.delete(doc(db, COLLECTIONS.SUBMISSIONS, s.id));
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.SUBMISSIONS);
    return false;
  }
}

// --- Realtime Config Sync ---
export function subscribeExamConfig(
  onData: (config: ExamConfig) => void,
  onError?: (err: any) => void
) {
  try {
    const configDoc = doc(db, COLLECTIONS.CONFIG, 'exam_settings');
    return onSnapshot(
      configDoc,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onData({
            timeLimitMinutes: data.timeLimitMinutes || 10,
            passingPercentage: data.passingPercentage || 50,
            questionsPerExam: data.questionsPerExam || 10,
            shuffleQuestions: data.shuffleQuestions ?? true,
            allowReviewAfterSubmission: data.allowReviewAfterSubmission ?? true,
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CONFIG}/exam_settings`);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.CONFIG}/exam_settings`);
    return () => {};
  }
}

export async function saveExamConfigToFirestore(config: ExamConfig): Promise<boolean> {
  try {
    const configDoc = doc(db, COLLECTIONS.CONFIG, 'exam_settings');
    await setDoc(configDoc, {
      ...config,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CONFIG}/exam_settings`);
    return false;
  }
}
