import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string, photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Save user to MongoDB
      await axios.post('/api/users', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        photoURL: userCredential.user.photoURL || ''
      });

      setCurrentUser(userCredential.user);
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast.error(error.message);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
    } catch (error: any) {
      console.error("Error during login:", error);
      toast.error(error.message);
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleGoogleAuthResult(result.user);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, new GoogleAuthProvider());
      } else {
        console.error("Error during Google login:", error);
        toast.error(error.message);
      }
    }
  }

  async function handleGoogleAuthResult(user: User) {
    try {
      // Save user in MongoDB
      await axios.post('/api/users', {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL || ''
      });
      setCurrentUser(user);
    } catch (error) {
      console.log("User might already exist in the database.");
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error('Failed to log out');
    }
  }

  async function updateUserProfile(data: { displayName?: string, photoURL?: string }) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updateProfile(currentUser, data);
      await axios.put(`/api/users/${currentUser.uid}`, {
        name: data.displayName,
        photoURL: data.photoURL
      });

      setCurrentUser({ ...currentUser, ...data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleGoogleAuthResult(result.user);
        }
      })
      .catch((error) => {
        console.error("Error handling redirect result:", error);
        toast.error('Google authentication failed.');
      });

    return unsubscribe;
  }, []);

  const value = { currentUser, loading, register, login, loginWithGoogle, logout, updateUserProfile };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
