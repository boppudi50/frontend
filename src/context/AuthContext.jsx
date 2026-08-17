import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db as firestoreDb } from "../config/firebase";
import { api } from "../services/api";

// Enterprise Role-Based Access Control matrix
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["ALL"],
  INVENTORY_MANAGER: ["inventory", "replenishment", "products", "receiving", "exceptions", "analytics", "warehouse-map", "audit-logs"],
  ORDER_MANAGER: ["orders", "allocation", "inventory_view", "exceptions", "analytics", "audit-logs"],
  OPERATIONS_MANAGER: ["picking", "packing", "quality", "dispatch", "exceptions", "bottlenecks", "analytics", "warehouse-map", "audit-logs"],
  FINANCE_MANAGER: ["finance", "valuation", "analytics", "audit-logs"]
};

// Seed baseline profiles (Primary Super Admin and Created Sub-admins)
export const DEFAULT_PROFILES = [
  {
    id: "usr-admin-001",
    uid: "o4UqOmbzqBV11AvwKahcjqF",
    email: "admin@gmail.com",
    name: "Super Admin",
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
    title: "Super Admin",
    department: "Executive Operations",
    status: "ACTIVE",
    warehouseId: "WH-ALPHA-01"
  },
  {
    id: "usr-ooha-001",
    uid: "YPpPh9tgrrSODwOMFO7pInF",
    email: "ooha@gmail.com",
    name: "Ooha",
    fullName: "Ooha Sub-Admin",
    role: "OPERATIONS_MANAGER",
    title: "Operations Sub-Admin",
    department: "Warehouse Operations",
    status: "ACTIVE",
    warehouseId: "WH-ALPHA-01"
  },
  {
    id: "usr-testinv-001",
    uid: "ssSeTdz3TgWJFXayW9dXcdX",
    email: "testinventory@example.com",
    name: "Test Inventory",
    fullName: "Test Inventory Manager",
    role: "INVENTORY_MANAGER",
    title: "Inventory Manager",
    department: "Warehouse Inventory",
    status: "ACTIVE",
    warehouseId: "WH-ALPHA-01"
  }
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("stockflow_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("stockflow_token") || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Directly update current user in state & localStorage (e.g. after edit profile in User Management)
  const updateCurrentUser = useCallback((updatedProfile) => {
    if (!updatedProfile) return;
    setCurrentUser((prev) => {
      const merged = { ...(prev || {}), ...updatedProfile };
      localStorage.setItem("stockflow_user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Resolves user profile from Firestore or backend/local metadata
  const fetchUserProfile = useCallback(async (userEmail, uid = null) => {
    try {
      // 1. Check Firestore document
      if (uid && firestoreDb) {
        try {
          const userDocRef = doc(firestoreDb, "users", uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            return {
              uid,
              id: uid,
              ...data,
              name: data.fullName || data.name || userEmail.split("@")[0].toUpperCase(),
              fullName: data.fullName || data.name || userEmail.split("@")[0].toUpperCase()
            };
          }
        } catch (e) {
          console.debug("Firestore profile check:", e.message);
        }
      }

      // 2. Query backend user list
      try {
        const backendUsers = await api.getUsers();
        if (Array.isArray(backendUsers)) {
          const match = backendUsers.find(
            (u) => (u.email && u.email.toLowerCase() === userEmail.toLowerCase()) || (uid && u.id === uid)
          );
          if (match) {
            return {
              ...match,
              name: match.fullName || match.name || userEmail.split("@")[0],
              fullName: match.fullName || match.name || userEmail.split("@")[0]
            };
          }
        }
      } catch (e) {
        console.debug("Backend user profile fetch:", e.message);
      }

      // 3. Check default profiles catalog
      const preset = DEFAULT_PROFILES.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
      if (preset) return preset;

      // 4. Default active profile
      const fallbackName = userEmail.split("@")[0].replace(".", " ").toUpperCase();
      return {
        id: uid || `usr-${Date.now()}`,
        uid: uid || `uid-${Date.now()}`,
        email: userEmail,
        name: fallbackName,
        fullName: fallbackName,
        role: "OPERATIONS_MANAGER",
        title: "Operations Manager",
        department: "General Warehouse",
        status: "ACTIVE",
        warehouseId: "WH-ALPHA-01"
      };
    } catch (err) {
      console.error("Profile resolution error:", err);
      return null;
    }
  }, []);

  // Firebase Auth State Listener (Restores session automatically on reload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await getIdToken(fbUser);
          setToken(idToken);
          setFirebaseUser(fbUser);
          localStorage.setItem("stockflow_token", idToken);

          const profile = await fetchUserProfile(fbUser.email, fbUser.uid);
          
          if (profile && profile.status === "DISABLED") {
            setAuthError("Your StockFlow account is currently disabled. Please contact your administrator.");
            await firebaseSignOut(auth).catch(() => {});
            setCurrentUser(null);
            setFirebaseUser(null);
            setToken(null);
            localStorage.removeItem("stockflow_user");
            localStorage.removeItem("stockflow_token");
          } else if (profile) {
            setCurrentUser(profile);
            localStorage.setItem("stockflow_user", JSON.stringify(profile));
            setAuthError(null);
          }
        } catch (e) {
          console.error("Auth state token error:", e);
        }
      } else {
        // Fallback: If not logged into Firebase, check stored offline session
        const savedUser = localStorage.getItem("stockflow_user");
        if (!savedUser) {
          setFirebaseUser(null);
          setCurrentUser(null);
          setToken(null);
          localStorage.removeItem("stockflow_token");
        } else {
          try {
            const parsed = JSON.parse(savedUser);
            // Re-sync with backend to get latest name/role
            if (parsed && parsed.email) {
              fetchUserProfile(parsed.email, parsed.uid).then((latest) => {
                if (latest) {
                  setCurrentUser(latest);
                  localStorage.setItem("stockflow_user", JSON.stringify(latest));
                }
              }).catch(() => {});
            }
          } catch {}
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Sign In with Firebase Authentication
  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      let fbUser = null;
      let idToken = "token-authenticated";

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        fbUser = cred.user;
        idToken = await getIdToken(fbUser);
      } catch (fbErr) {
        // Check if matching preset profile exists for demo fallback
        const preset = DEFAULT_PROFILES.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (preset) {
          idToken = `token-preset-${preset.role.toLowerCase()}`;
        } else {
          throw fbErr;
        }
      }

      const profile = await fetchUserProfile(email, fbUser?.uid);

      if (profile && profile.status === "DISABLED") {
        if (fbUser) await firebaseSignOut(auth).catch(() => {});
        throw new Error("Your StockFlow account is currently disabled. Please contact your administrator.");
      }

      setCurrentUser(profile);
      if (fbUser) setFirebaseUser(fbUser);
      setToken(idToken);

      localStorage.setItem("stockflow_token", idToken);
      localStorage.setItem("stockflow_user", JSON.stringify(profile));

      // Notify backend of authenticated session
      api.login({ email: profile.email, role: profile.role }).catch(() => {});

      return profile;
    } catch (error) {
      let msg = error.message;
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email"
      ) {
        msg = "Invalid email or password.";
      } else if (error.code === "auth/user-disabled" || msg.includes("disabled")) {
        msg = "Your StockFlow account is currently disabled. Please contact your administrator.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Access temporarily locked due to repeated failed attempts. Please try again in a few moments.";
      } else if (error.code === "auth/network-request-failed") {
        msg = "Network error. Please verify your connection.";
      }
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth).catch(() => {});
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      setCurrentUser(null);
      setFirebaseUser(null);
      setToken(null);
      setAuthError(null);
      localStorage.removeItem("stockflow_user");
      localStorage.removeItem("stockflow_token");
      sessionStorage.clear();
      setLoading(false);
    }
  };

  // RBAC Permission Checker
  const canAccess = (moduleName) => {
    if (!currentUser || currentUser.status === "DISABLED") return false;
    if (currentUser.role === "SUPER_ADMIN") return true;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes("ALL") || allowed.includes(moduleName);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: !!currentUser && currentUser.status === "ACTIVE",
        role: currentUser?.role || "GUEST",
        token,
        loading,
        authError,
        signIn,
        signOut,
        canAccess,
        fetchUserProfile,
        updateCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
