/**
 * Axios API Client Configuration
 * REST API와의 통신을 담당합니다.
 */
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT = 30000;
class ApiClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        // Response interceptor
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    async get(url, params) {
        try {
            const response = await this.client.get(url, { params });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async post(url, data) {
        try {
            const response = await this.client.post(url, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async put(url, data) {
        try {
            const response = await this.client.put(url, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async delete(url) {
        try {
            const response = await this.client.delete(url);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (axios.isAxiosError(error)) {
            const response = error.response?.data;
            return {
                code: response?.code || 'UNKNOWN_ERROR',
                message: response?.message || error.message,
                details: response?.details,
            };
        }
        return {
            code: 'NETWORK_ERROR',
            message: 'Network request failed',
        };
    }
}
export const apiClient = new ApiClient();
