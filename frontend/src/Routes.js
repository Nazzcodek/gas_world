import api from './Api';
import { getCookie } from './components/utils';

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
export const logout = async () => {
    try {
        const refreshToken = getCookie('refresh');
        const response = await api.post('/logout', { refresh: refreshToken }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateUser = async (role, userId, data, stationId) => {
    try {
        let response;
        const url = role === 'owner' ? `/${role}/${userId}` : `/${role}/${stationId}/${userId}`;
        
        response = await api.put(url, data);

        return response.data;
    } catch (error) {
        console.error(`Failed to update ${role} profile:`, error);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
        throw error;
    }
};

export const getUser = async (role, userId, stationId) => {
    try {
        let response;
        const url = role === 'owner' ? `/${role}/${userId}` : `/${role}/${stationId}/${userId}`;
        
        response = await api.get(url);
        return response.data;

    } catch (error) {
        console.error(`Failed to get ${role} user`);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
        throw error;
    }
}

export const createOwner = async (owner) => {
    try {
        const response = await api.post('/owner', owner);
        return response.data;
    } catch (error) {
        console.error('Failed to create Owner');
        throw error;
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
    try {
        const response = await api.put(`/manager/${manager_id}/change_password`, manager);
        return response.data;
      } catch (error) {
        console.error('Failed to change manager password:', error);
        throw error;
    }
}

export const changePassword = async (userId, role, data) => {
    try {
        const response = await api.put(`/${role}/${userId}/change_password`, data);
        return response.data;
      } catch (error) {
        console.error(`Failed to change ${role} password:`, error);
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

export const getStationManager = async (station_id) => {
    try {
        const response = await api.get(`/manager/station/${station_id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to get manager:', error);
        throw error;
    }
}

export const createAttendant = async (station_id, data) => {
    try {
        const response = await api.post(`/attendants/${station_id}`, data);
        return response.data;
    } catch (error) {
        console.error('Failed to create attendant:', error);
        throw error;
    }
}

export const updateAttendant = async (station_id, attendant_id, data) => {
    try {
        const response = await api.patch(`/attendants/${station_id}/${attendant_id}`, data);
        return response.data;
    } catch (error) {
        console.error('Failed to update attendant')
        throw error
    }
}

export const deleteAttendant = async (station_id, attendant_id) => {
    try {
        const response = await api.delete(`/attendants/${station_id}/${attendant_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete Attendant')
        throw error
    }
}

export const getAttendantsByStation = async (station_id) => {
    try {
        const response = await api.get(`/attendants/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get attendants:', error);
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

export const updatePump = async (id, pump) => {
    try {
        const response = await api.put(`/pumps/${id}`, pump);
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

export const getPumpByProduct = async (product_id) => {
    try {
        const response = await api.get(`/pumps/product/${product_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pump', error);
        throw error;
    }
}

export const getPumpByPit = async (pit_id) => {
    try {
        const response = await api.get(`/pumps/pit/${pit_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pump', error);
        throw error;
    }
}

export const createPit = async (data) => {
    try {
        const response = await api.post('/pits', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create pump:', error);
        throw error;
    }
}

export const updatePit = async (id, product) => {
    try {
        const response = await api.put(`/pits/${id}`, product);
        return response.data;
    } catch (error) {
        console.error('Failed to update pit', error);
        throw error;
    }
}

export const deletePit = async (id) => {
    try {
        const response = await api.delete(`/pits/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete pit', error);
        throw error;
    }
}

export const getPitsByStation = async (station_id) => {
    try {
        const response = await api.get(`/pits/station/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pits', error);
        throw error;
    }
}

export const getPitsByProduct = async (product_id) => {
    try {
        const response = await api.get(`/pits/product/${product_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pits for product');
        throw error;
    }
}

export const createShift = async (pump_id, data) => {
    try {
        const response = await api.post(`/pumpreadings/pump/${pump_id}`, data);
        return response.data;
    } catch (error) {
        console.error('Failed to create shift:', error);
        throw error;
    }
}

export const updateShift = async (id, shift) => {
    try {
        const response = await api.put(`/pumpreadings/${id}`, shift);
        return response.data;
    } catch (error) {
        console.error('Failed to update shift', error);
        throw error;
    }
}

export const deleteShift = async (id) => {
    try {
        const response = await api.delete(`/pumpreadings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete shift', error);
        throw error;
    }
}

export const getShifts = async (type, id) => {
    try {
        const response = await api.get(`/pumpreadings/${type}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to get shifts by ${type}`, error);
        throw error;
    }
}

export const getShiftsByAttendant = async (attendant_id) => {
    return getShifts('attendant', attendant_id);
}

export const getShiftsByStation = async (station_id) => {
    return getShifts('station', station_id);
}

export const getShiftByPump = async (pump_id) => {
    return getShifts('pump', pump_id);
}

export const createPitShift = async (pit_id) => {
    try {
        const response = await api.post(`/pitreadings/pit/${pit_id}`, { reading_pit: pit_id });
        return response.data;
    } catch (error) {
        console.error('Failed to create pit shift:', error);
        throw error;
    }
}


export const updatePitShift = async (id, shift) => {
    try {
        const response = await api.put(`/pitreadings/${id}`, shift);
        return response.data;
    } catch (error) {
        console.error('Failed to update pit shift', error);
        throw error;
    }
}

export const deletePitShift = async (id) => {
    try {
        const response = await api.delete(`/pitreadings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete pit shift', error);
        throw error;
    }
}

export const getPitShiftsByStation = async (station_id) => {
    try {
        const response = await api.get(`/pitreadings/station/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pit shifts', error);
        throw error;
    }
}

export const getPitShiftByPump = async (pump_id) => {
    try {
        const response = await api.get(`/pitreadings/pump/${pump_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pit shifts', error);
        throw error;
    }
}

export const getPitShiftByPit = async (pit_id) => {
    try {
        const response = await api.get(`/pitreadings/pit-get/${pit_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get pit shifts', error);
        throw error;
    }
}

export const getSalesByAttendant = async (attendant_id) => {
    try {
        const response = await api.get(`/sales/attendant/${attendant_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get sales', error);
        throw error;
    }
}

export const getSalesByStation = async (station_id) => {
    try {
        const response = await api.get(`/sales/station/${station_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get sales', error);
        throw error;
    }
}

export const getSalesByPump = async (pump_id) => {
    try {
        const response = await api.get(`/sales/pump/${pump_id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get sales', error);
        throw error;
    }
}

export const updateShiftSales = async (id, sales) => {
    try {
        const response = await api.put(`/sales/${id}`, sales);
        return response.data;
    } catch (error) {
        console.error('Failed to update sales', error);
        throw error;
    }
}

export const getSales = async (id) => {
    try {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to get sales`, error);
        throw error;
    }
}

