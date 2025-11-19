import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'merchant';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  profileCompleted: boolean;
  verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  signup: (email: string, password: string, fullName: string, phoneNumber: string, adminSecret: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token: string, user: User) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },
      
      signup: async (email: string, password: string, fullName: string, phoneNumber: string, adminSecret: string) => {
        const response = await fetch('https://tillflow-backend.onrender.com/api/users/register-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            phoneNumber,
            adminSecret,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create admin account');
        }

        if (!data.success) {
          throw new Error(data.message || 'Registration failed');
        }

        // After successful registration, you might want to automatically log the user in
        // or redirect to login page. For now, we'll just set the user data if the backend returns it
        if (data.user && data.token) {
          set({ 
            user: data.user, 
            token: data.token,
            isAuthenticated: true 
          });
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      resetPassword: async (email: string) => {
        // TODO: Implement actual password reset API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
    }),
    {
      name: 'tillflow-auth',
    }
  )
);