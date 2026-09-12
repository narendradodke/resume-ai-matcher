import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Validates and resolves the backend API base URL.
 * 
 * Rules:
 * 1. In production (NODE_ENV === "production"):
 *    - NEXT_PUBLIC_API_BASE_URL must be explicitly provided at build time.
 *    - Silent fallback to localhost is strictly prohibited.
 * 2. In development/test:
 *    - Defaults to "http://localhost:8000/api/v1".
 * 3. Trailing slashes are always removed to prevent double-slash path concatenation.
 */
export function validateApiBaseUrl(
  envUrl?: string,
  nodeEnv: string = process.env.NODE_ENV || "development"
): string {
  const trimmed = envUrl?.trim();
  if (nodeEnv === "production") {
    if (!trimmed) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not configured. In production mode, a valid backend API URL must be defined at build time."
      );
    }
    return trimmed.replace(/\/+$/, "");
  }

  const defaultUrl = "http://localhost:8000/api/v1";
  return (trimmed || defaultUrl).replace(/\/+$/, "");
}

export const API_BASE_URL = validateApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  process.env.NODE_ENV
);

/**
 * Formats API and network errors into safe, user-friendly messages.
 * Never exposes stack traces, database details, or raw secrets.
 */
export function formatApiError(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    // 1. Network / connectivity error (no response received from backend)
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
        return "Request timed out. The server took too long to respond.";
      }
      return "Unable to reach the server. Please check your connection or backend status.";
    }

    const status = error.response.status;
    const data = error.response.data as { error?: string; detail?: string; message?: string } | undefined;
    const backendMessage = data?.error || data?.detail || data?.message;

    switch (status) {
      case 400:
        return backendMessage || "Bad request. Please verify your inputs.";
      case 401:
        return backendMessage || "Invalid credentials or session expired. Please sign in.";
      case 403:
        return backendMessage || "Access forbidden. You do not have permission.";
      case 404:
        return backendMessage || "The requested resource could not be found.";
      case 409:
        return backendMessage || "An account with this email already exists.";
      case 422:
        return backendMessage || "Invalid data submitted. Please check the required fields.";
      case 429:
        return "Too many requests. Please slow down and try again shortly.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again in a few moments.";
      default:
        if (backendMessage && typeof backendMessage === "string" && backendMessage.length < 200) {
          return backendMessage;
        }
        return fallbackMessage;
    }
  }

  if (error instanceof Error) {
    if (error.message?.toLowerCase().includes("network error") || error.message?.includes("Failed to fetch")) {
      return "Unable to reach the server. Please check your connection or backend status.";
    }
    return error.message;
  }

  return fallbackMessage;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor: attach bearer access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/signup")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

      if (!refreshToken) {
        isRefreshing = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data?.data?.access_token;
        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_user");
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
