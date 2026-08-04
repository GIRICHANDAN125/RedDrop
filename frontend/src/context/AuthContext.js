import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Platform } from 'react-native';
import { api } from '../api/client';

const VERIFY_TIMEOUT_MS = 5000;

const AuthContext = createContext(null);

// Safe SecureStore wrapper — expo-secure-store is not supported on Web
const SecureStorage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  }
};

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  requiresVerification: false,
  pendingAuth: null,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        requiresVerification: false,
        pendingAuth: null,
        isLoading: false,
        error: null
      };
    case 'SET_PENDING_AUTH':
      return {
        ...state,
        requiresVerification: true,
        pendingAuth: action.payload,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'VERIFY_SUCCESS':
      return {
        ...state,
        user: state.pendingAuth?.user ?? action.payload?.user ?? state.user,
        token: state.pendingAuth?.token ?? action.payload?.token ?? state.token,
        isAuthenticated: true,
        requiresVerification: false,
        pendingAuth: null,
        isLoading: false,
        error: null
      };
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
      const token = await SecureStorage.getItem('auth_token');
      const userStr = await SecureStorage.getItem('auth_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

        // Verify token in background — never blocks startup
        void api.get('/auth/me', { timeout: VERIFY_TIMEOUT_MS })
          .then((response) => {
            if (response?.data?.user) {
              dispatch({ type: 'UPDATE_USER', payload: response.data.user });
            }
          })
          .catch(async () => {
            await clearAuth();
          });
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
      const response = await api.post('/auth/register', userData);
      const data = response.data || {};

      if (data.requiresVerification) {
        dispatch({ type: 'SET_PENDING_AUTH', payload: { token: data.token, user: data.user } });
      } else if (data.token && data.user) {
        await saveAuth(data.token, data.user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      }

      return { success: true, requiresVerification: !!data.requiresVerification };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const completePendingVerification = async (freshData = null) => {
    const token = freshData?.token || state.pendingAuth?.token;
    const user = freshData?.user || state.pendingAuth?.user;

    if (!token || !user) {
      // Still dispatch verify success to allow navigation — user can refresh /me
      dispatch({ type: 'VERIFY_SUCCESS', payload: { token: null, user: null } });
      return true;
    }

    await saveAuth(token, user);
    dispatch({ type: 'VERIFY_SUCCESS', payload: { token, user } });
    return true;
  };

  const logout = async () => {
    await clearAuth();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    SecureStorage.setItem('auth_user', JSON.stringify({ ...state.user, ...updates }));
  };

  const saveAuth = async (token, user) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await Promise.all([
      SecureStorage.setItem('auth_token', token),
      SecureStorage.setItem('auth_user', JSON.stringify(user))
    ]);
  };

  const clearAuth = async () => {
    delete api.defaults.headers.common['Authorization'];
    await Promise.all([
      SecureStorage.deleteItem('auth_token'),
      SecureStorage.deleteItem('auth_user')
    ]);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, completePendingVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
