import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Add user data to Firestore under `users/{uid}`
export const createUserDocument = async (uid, userData) => {
  try {
    await setDoc(doc(db, "users", uid), userData);
  } catch (error) {
    throw new Error("Erro ao salvar no Firestore: " + error.message);
  }
};

export const getUserDocument = async (uid) => {
  if (!uid) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    throw new Error("Erro ao buscar no Firestore: " + error.message);
  }
};

export const updateUser = async (uid, userData) => {
  try {
    await updateDoc(doc(db, "users", uid), userData);
  } catch (error) {
    throw new Error("Erro ao atualizar no Firestore: " + error.message);
  }
};
