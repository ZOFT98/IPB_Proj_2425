import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function createUserDocument(uid, data) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
