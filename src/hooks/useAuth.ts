import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { 
  register, 
  login, 
  loginWithGoogle, 
  logout, 
  updateUserProfile 
} from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading, error } = useSelector((state: RootState) => state.auth);

  return {
    currentUser,
    loading,
    error,
    register: (email: string, password: string, name: string) => 
      dispatch(register({ email, password, name })),
    login: (email: string, password: string) => 
      dispatch(login({ email, password })),
    loginWithGoogle: () => dispatch(loginWithGoogle()),
    logout: () => dispatch(logout()),
    updateUserProfile: (data: { displayName?: string; photoURL?: string }) => 
      dispatch(updateUserProfile(data))
  };
} 