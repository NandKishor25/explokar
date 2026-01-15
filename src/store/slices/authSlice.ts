import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import axios from 'axios';
import toast from 'react-hot-toast';

// Serializable user interface
interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  currentUser: SerializableUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  loading: true,
  error: null,
};

// Helper to make Firebase user serializable
const getSerializableUser = (user: User): SerializableUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

// Initialize auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        dispatch(setUser(user ? getSerializableUser(user) : null));
        unsubscribe();
        resolve();
      });
    });
  }
);

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      await axios.post('/api/auth', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        photoURL: userCredential.user.photoURL || '',
      });

      return getSerializableUser(userCredential.user);
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return getSerializableUser(userCredential.user);
    } catch (error: any) {
      console.error('Error during login:', error);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      try {
        await axios.post('/api/auth', {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL || '',
        });
      } catch (error) {
        console.log('User might already exist in the database.');
      }

      return getSerializableUser(result.user);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, new GoogleAuthProvider());
      } else {
        console.error('Error during Google login:', error);
        toast.error(error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { displayName?: string; photoURL?: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const user = auth.currentUser;

    if (!user) {
      return rejectWithValue('No user logged in');
    }

    try {
      await updateProfile(user, data);
      await axios.put(`/api/auth/${user.uid}`, {
        name: data.displayName,
        photoURL: data.photoURL,
      });
      toast.success('Profile updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
      })

      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload,
          };
        }
      });
  },
});

export const { setUser, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
