import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axiosInstance';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      login: async (credentials) => {
        const { data } = await axiosInstance.post('/auth/login', credentials);
        set({ user: data, isAuthenticated: true });
        return data;
      },
      
      logout: async () => {
        await axiosInstance.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
      },
      
      checkAuth: async () => {
        try {
          const { data } = await axiosInstance.get('/auth/me');
          set({ user: data, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
