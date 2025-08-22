import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Add user data to Firestore under `users/{uid}`
export const createUserDocument = async (uid, userData) => {
  try {
    await setDoc(doc(db, "users", uid), userData);
  } catch (error) {
    throw new Error("Erro ao salvar no Firestore: " + error.message);
  }
};
