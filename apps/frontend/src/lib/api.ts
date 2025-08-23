import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// This interceptor handles automatic token refresh.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401, not a retry, and not the refresh endpoint itself.
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the tokens. The browser will send the HttpOnly refresh cookie.
        await api.post('/auth/refresh');
        
        // If the refresh is successful, retry the original failed request.
        return api(originalRequest);

      } catch (refreshError) {
        // If the refresh fails, the user is truly logged out.
        // We will redirect them to the login page.
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, just return the error.
    return Promise.reject(error);
  },
);