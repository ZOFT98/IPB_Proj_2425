import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  getAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { auth, storage } from "../firebase";
import { createUserDocument } from "./firestoreService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export async function createUser(userData) {
  const {
    email,
    password,
    name,
    role = "admin",
    photoURL,
    ...profileData
  } = userData;

  const secondaryApp = initializeApp(firebaseConfig, "secondary");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const { user } = userCredential;

    let downloadURL = null;
    if (photoURL instanceof File) {
      const storageRef = ref(storage, `users/${user.uid}/${photoURL.name}`);
      const snapshot = await uploadBytes(storageRef, photoURL);
      downloadURL = await getDownloadURL(snapshot.ref);
    }
    
    await updateProfile(user, {
      displayName: name,
      photoURL: downloadURL,
    });

    await createUserDocument(user.uid, {
      email,
      role,
      name,
      photoURL: downloadURL,
      ...profileData,
      createdAt: new Date().toISOString(),
    });

    return user;
  } finally {
    await signOut(secondaryAuth);
  }
}

export async function register(userData) {
  const {
    email,
    password,
    name,
    role = "admin",
    photoURL,
    ...profileData
  } = userData;

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const { user } = userCredential;

  let downloadURL = null;
  if (photoURL instanceof File) {
    const storageRef = ref(storage, `users/${user.uid}/${photoURL.name}`);
    const snapshot = await uploadBytes(storageRef, photoURL);
    downloadURL = await getDownloadURL(snapshot.ref);
  }

  await updateProfile(user, {
    displayName: name,
    photoURL: downloadURL,
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
