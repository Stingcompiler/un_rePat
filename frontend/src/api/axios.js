import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Vite proxy handles redirection
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('refresh')) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                await api.post('/auth/refresh/');

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or clear state
                // We can optionally trigger an event or just let the error propagate
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
