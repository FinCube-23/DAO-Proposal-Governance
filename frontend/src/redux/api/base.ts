import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@redux/store';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).persistedReducer.authReducer.auth?.access;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('ngrok-skip-browser-warning', 'true');
    return headers;
  },
  timeout: 5000, // Consider reducing this timeout if appropriate
});

// Create a base API to inject endpoints into elsewhere
export const api = createApi({
  reducerPath: 'splitApi',
  baseQuery: baseQuery,
  tagTypes: ['mfs', 'auth'],
  endpoints: () => ({}),
});