import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, storage } from "../firebase";
import { createUserDocument } from "./firestoreService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function register(userData) {
  const { email, password, name, role = "admin", photoURL, ...profileData } = userData;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;

  let downloadURL = null;
  if (photoURL instanceof File) {
    const storageRef = ref(storage, `users/${user.uid}/${photoURL.name}`);
    const snapshot = await uploadBytes(storageRef, photoURL);
    downloadURL = await getDownloadURL(snapshot.ref);
  }

  await updateProfile(user, { 
    displayName: name, 
    photoURL: downloadURL 
  });

  await createUserDocument(user.uid, {
    email,
    role,
    name,
    photoURL: downloadURL,
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
