import axios from 'axios';
import { supabase } from './supabase';

/**
 * Base URL pour les appels API :
 * - Vide = routes Next.js (défaut, tout-en-un sur Vercel)
 * - URL définie = backend externe (ex: Hugging Face Space dedalys-civ/dedalys-api)
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios interceptor to automatically add the Supabase JWT token to every request
api.interceptors.request.use(
    async (config) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }

            return config;
        } catch (error) {
            console.error('Error attaching token:', error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);
