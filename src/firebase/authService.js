import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserDocument } from "./firestoreService";

export async function register(userData) {
  const { email, password, displayName, role = "user", ...profileData } = userData;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  await createUserDocument(user.uid, {
    email,
    role,            
    displayName: displayName ?? null,
    ...profileData,
    createdAt: new Date().toISOString(),
  });

  return userCredential;
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// helper opcional para escutar sessão
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}
