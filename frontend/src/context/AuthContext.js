import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userStr] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('auth_user')
      ]);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

        // Verify token is still valid
        try {
          const response = await api.get('/auth/me');
          dispatch({ type: 'UPDATE_USER', payload: response.data.user });
        } catch {
          await clearAuth();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await saveAuth(data.token, data.user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      await saveAuth(data.token, data.user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return { success: true, requiresVerification: data.requiresVerification };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await clearAuth();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    SecureStore.setItemAsync('auth_user', JSON.stringify({ ...state.user, ...updates }));
  };

  const saveAuth = async (token, user) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await Promise.all([
      SecureStore.setItemAsync('auth_token', token),
      SecureStore.setItemAsync('auth_user', JSON.stringify(user))
    ]);
  };

  const clearAuth = async () => {
    delete api.defaults.headers.common['Authorization'];
    await Promise.all([
      SecureStore.deleteItemAsync('auth_token'),
      SecureStore.deleteItemAsync('auth_user')
    ]);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
