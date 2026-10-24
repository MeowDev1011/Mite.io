import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import appletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  ...appletConfig,
  measurementId: appletConfig.measurementId || 'G-24V8B9W25W',
};

export const app = initializeApp(firebaseConfig);
// Named database provisioned for AI Studio
export const db = getFirestore(app, appletConfig.firestoreDatabaseId);
// Default '(default)' database shown first in the Firebase Console
export const defaultDb = getFirestore(app);
export const auth = getAuth(app);

/**
 * Writes a document to BOTH the named database AND the '(default)' database in Firebase
 * so that inspecting either database in the Firebase Console always shows live data.
 */
export async function setDocDual(
  collectionName: string,
  docId: string,
  data: Record<string, any>,
  options?: { merge?: boolean }
): Promise<void> {
  const opts = options || { merge: true };
  await Promise.allSettled([
    setDoc(doc(db, collectionName, docId), data, opts),
    setDoc(doc(defaultDb, collectionName, docId), data, opts),
  ]);
}

export async function deleteDocDual(collectionName: string, docId: string): Promise<void> {
  await Promise.allSettled([
    deleteDoc(doc(db, collectionName, docId)),
    deleteDoc(doc(defaultDb, collectionName, docId)),
  ]);
}

// Initialize Analytics safely in browser environments
if (typeof window !== 'undefined') {
  isSupported()
    .then((yes) => {
      if (yes) getAnalytics(app);
    })
    .catch(() => {});
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: string | boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export {
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
};
export type { User };
