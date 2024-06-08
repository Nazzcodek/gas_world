import axios from 'axios';
import Cookies from 'js-cookie';
import { createBrowserHistory } from 'history';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/',
    withCredentials: true,
});

const refreshToken = async () => {
    try {
        const response = await api.post('/token/refresh/', {
            refresh: Cookies.get('refresh'),
        });
        Cookies.set('access', response.data.access, { expires: 1, secure: false, sameSite: 'Lax' });
        return response.data.access;
    } catch (error) {
        console.error("Refresh token failed", error);
        return null;
    }
};

api.interceptors.request.use(
    async (config) => {
        const token = Cookies.get('access');
        const csrfToken = Cookies.get('csrftoken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const history = createBrowserHistory();

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } else {
                Cookies.remove('access');
                Cookies.remove('refresh');
                history.push('/')
            }
        }
        return Promise.reject(error);
    }
);

export default api;