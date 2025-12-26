// core/APIClient.js
// 🔌 Cliente API centralizado con manejo de errores y loading

import stateManager from './StateManager.js';
import { showError } from '../utils/ErrorHandler.js';

class APIClient {
    constructor(baseURL = 'http://127.0.0.1:8000') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // ✅ Método genérico para hacer requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Activar loading global
        stateManager.setState('ui.cargando', true);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            showError(`No se pudo conectar con el servidor. ${error.message}`);
            return { success: false, error: error.message };
        } finally {
            stateManager.setState('ui.cargando', false);
        }
    }

    // 📋 PEDIDOS
    
    async obtenerPedidos() {
        const result = await this.request('/pedidos');
        if (result.success) {
            stateManager.setState('pedidos', result.data);
        }
        return result;
    }

    async crearPedido(datos) {
        const result = await this.request('/pedidos', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
        
        if (result.success) {
            // Agregar al estado local
            const pedidos = stateManager.getState('pedidos');
            stateManager.setState('pedidos', [...pedidos, result.data]);
        }
        return result;
    }

    async actualizarPedido(id, cambios) {
        const result = await this.request(`/pedidos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cambios)
        });

        if (result.success) {
            // Actualizar en el estado local
            stateManager.actualizarPedido(id, cambios);
        }
        return result;
    }

    async eliminarPedido(id) {
        const result = await this.request(`/pedidos/${id}`, {
            method: 'DELETE'
        });

        if (result.success) {
            stateManager.eliminarPedido(id);
        }
        return result;
    }

    // 💰 COTIZACIONES
    
    async calcularCotizacion(datos) {
        return await this.request('/cotizar', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    }

    // 🌲 INVENTARIO (placeholder para futuro)
    
    async obtenerInventario() {
        return await this.request('/inventario');
    }
}

// Exportar instancia singleton
const apiClient = new APIClient();
export default apiClient;