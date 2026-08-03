import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Access authentication state & actions from AuthContext.
 * @returns {{ user, token, login, logout, isAuthenticated, isLoading }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
