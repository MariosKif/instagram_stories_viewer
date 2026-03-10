/**
 * Authentication helpers wrapping Firebase Auth.
 * Provides login, register, logout, and session utilities.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const googleProvider = new GoogleAuthProvider();

/** Sign in with email and password */
export async function login(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Create a new account with email and password */
export async function register(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Sign in with Google */
export async function loginWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Sign the current user out */
export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

/** Get the currently signed-in user (null if signed out) */
export function getCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}
