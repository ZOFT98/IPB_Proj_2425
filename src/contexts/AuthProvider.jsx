import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import PropTypes from "prop-types";
import { auth } from "../firebase";
import { AuthContext } from "./AuthContext";
import { getUserDocument } from "../firebase/firestoreService";

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await getUserDocument(user.uid);
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const refreshCurrentUser = async () => {
    const user = auth.currentUser;
    if (user) {
      const userProfile = await getUserDocument(user.uid);
      setCurrentUser(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout, refreshCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
