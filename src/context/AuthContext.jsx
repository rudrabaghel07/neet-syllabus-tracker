import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          setLoading(true);

          if (!user) {
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          try {
            // Get latest Firebase user data
            await user.reload();

            const refreshedUser =
              auth.currentUser;

            if (
              refreshedUser &&
              refreshedUser.emailVerified
            ) {
              setCurrentUser(
                refreshedUser
              );
            } else {
              setCurrentUser(null);
            }
          } catch (error) {
            console.error(
              "Auth refresh error:",
              error
            );

            setCurrentUser(null);
          }

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}