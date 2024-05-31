import api from './Api';

export const login = {
    ownerLogin: async (email, password) => {
        const response = await api.post('owner/login', {
            email,
            password
        });
        return response.data;
    },

    managerLogin: async (email, password) => {
        const response = await api.post('manager/login', {
            email,
            password
        });
        return response.data;
    },

    attendantLogin: async (email, password) => {
        const response = await api.post('attendant/login', {
            email,
            password,
        });
        return response.data;
    }
}

export const createStation = async (data) => {
    try {
        const response = await api.post('/stations', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create station:', error);
        throw error;
      }
}

export const getStations = async (station) => {
    try {
        const response = await api.get('/stations', station);
        return response.data;
      } catch (error) {
        console.error('Failed to get stations:', error);
        throw error;
      }
}

export const getStationById = async (station_id) => {
    try {
        const response = await api.get(`/stations/${station_id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to get station:', error);
        throw error;
      }
}

export const updateStation = async (station_id, station) => {
    try {
        const response = await api.put(`/stations/${station_id}`, station);
        return response.data;
      } catch (error) {
        console.error('Failed to update station:', error);
        throw error;
      }
}

export const deleteStation = async (station_id) => {
    try {
        const response = await api.delete(`/stations/${station_id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete station:', error);
        throw error;
      }
}

export const createManager = async (data) => {
    try {
        const response = await api.post(`/manager/${data.station}`, data);
        return response.data;
    } catch (error) {
        console.error('Failed to create manager:', error);
        throw error;
    }
};

export const getManager = async (manager) => {
    try {
        const response = await api.get('/manager', manager);
        return response.data;
      } catch (error) {
        console.error('Failed to get manager:', error);
        throw error;
    }
}

export const updateManager = async (station_id, manager_id, manager) => {
    try {
        const response = await api.put(`/manager/${station_id}/${manager_id}`, manager);
        return response.data;
      } catch (error) {
        console.error('Failed to update manager:', error);
        throw error;
    }
}

export const changeManagerPassword = async (manager_id, manager) => {
    console.log(manager, manager_id)
    try {
        const response = await api.put(`/manager/${manager_id}/change_password`, manager);
        return response.data;
      } catch (error) {
        console.error('Failed to change manager password:', error);
        throw error;
    }
}

export const deleteManager = async (station_id, manager_id) => {
    try {
        const response = await api.delete(`/manager/${station_id}/${manager_id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete manager:', error);
        throw error;
    }
}

export const createProduct = async (data) => {
    try {
        const response = await api.post('/products', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create product:', error);
        throw error;
    }
}

export const updateProduct = async (id, product) => {
    try {
        const response = await api.put(`/products/${id}`, product);
        return response.data;
    } catch (error) {
        console.error('Failed to update product', error);
        throw error;
    }
}

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete product', error);
        throw error;
    }
}

export const getProductByStation = async (station_id) => {
    try {
        const response = await api.get(`/products/station/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get product', error);
        throw error;
    }
}

export const createPump = async (data) => {
    try {
        const response = await api.post('/pumps', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create pump:', error);
        throw error;
    }
}

export const updatePump = async (id, product) => {
    try {
        const response = await api.put(`/pumps/${id}`, product);
        return response.data;
    } catch (error) {
        console.error('Failed to update pump', error);
        throw error;
    }
}

export const deletePump = async (id) => {
    try {
        const response = await api.delete(`/pumps/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete pump', error);
        throw error;
    }
}

export const getPumpsByStation = async (station_id) => {
    try {
        const response = await api.get(`/pumps/station/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pump', error);
        throw error;
    }
}
