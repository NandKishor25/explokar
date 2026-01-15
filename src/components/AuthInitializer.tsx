import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';

export function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return null;
} 