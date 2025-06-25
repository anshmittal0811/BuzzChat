/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
    statusCode: number;
    message: string;
    data: T;
}

const API_BASE_URL = 'http://localhost:5000'; // Change as needed

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const isBrowser = typeof window !== 'undefined';

const getAccessToken = () => {
    if (!isBrowser) return null;
    return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
    if (!isBrowser) return null;
    return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken: string, refreshToken: string) => {
    if (!isBrowser) return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

const clearTokensAndRedirect = () => {
    if (!isBrowser) return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth';
};



api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            }
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                clearTokensAndRedirect();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = data.data;
                setTokens(accessToken, newRefreshToken);

                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                }

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (err) {
                processQueue(err as AxiosError, null);
                clearTokensAndRedirect();
                return Promise.reject((err as AxiosError).response?.data);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export { setTokens, clearTokensAndRedirect };
export default api;
