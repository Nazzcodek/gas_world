import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access');
        const csrfToken = Cookies.get('csrftoken')
        if (token ) {
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

export default api;
