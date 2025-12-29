// core/StateManager.js
// 🧠 Gestor centralizado de estado con patrón Observer

class StateManager {
    constructor() {
        this.state = {
            pedidos: [],
            filtros: {
                tipo: 'all',
                busqueda: ''
            },
            ui: {
                drawerAbierto: false,
                pedidoActual: null,
                cargando: false
            }
        };
        
        this.subscribers = new Map(); // { key: [callbacks] }
        this.subscribe('pedidos', () => this.guardarEnLocalStorage());

    }

    // ✅ Obtener estado (inmutable)
    getState(path = null) {
        if (!path) return { ...this.state };
        
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    // ✅ Actualizar estado y notificar
    setState(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Notificar a los suscriptores
        this.notify(path, value, oldValue);
    }

    // ✅ Actualización múltiple (batch)
    batchUpdate(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.setState(path, value);
        });
    }

    // ✅ Suscribirse a cambios
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, []);
        }
        this.subscribers.get(path).push(callback);
        
        // Retornar función para desuscribirse
        return () => {
            const callbacks = this.subscribers.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    // 🔔 Notificar cambios
    notify(path, newValue, oldValue) {
        // Notificar suscriptores exactos
        this.subscribers.get(path)?.forEach(cb => cb(newValue, oldValue));
        
        // Notificar suscriptores de paths padre (ej: "pedidos" notifica a "pedidos.1")
        this.subscribers.forEach((callbacks, subscribedPath) => {
            if (subscribedPath.startsWith(path + '.')) {
                callbacks.forEach(cb => cb(newValue, oldValue));
            }
        });
    }

    // 🔥 Métodos específicos del negocio (helpers)
    
    actualizarPedido(id, cambios) {
        const pedidos = this.getState('pedidos');
        const index = pedidos.findIndex(p => p.id === id);
        
        if (index !== -1) {
            pedidos[index] = { ...pedidos[index], ...cambios };
            this.setState('pedidos', [...pedidos]);
        }
    }

    eliminarPedido(id) {
        const pedidos = this.getState('pedidos').filter(p => p.id !== id);
        this.setState('pedidos', pedidos);
    }

    agregarPedido(pedido) {
    const pedidos = this.getState('pedidos');
    this.setState('pedidos', [pedido, ...pedidos]);
    }

    
    obtenerPedido(id) {
        return this.getState('pedidos').find(p => p.id === id);
    }


    cargarDesdeLocalStorage() {
    try {
        const raw = localStorage.getItem('woodpro_pedidos');
        if (!raw) return;
        const pedidos = JSON.parse(raw);
        if (Array.isArray(pedidos)) this.setState('pedidos', pedidos);
    } catch (e) {
        console.warn('No se pudo cargar pedidos del localStorage', e);
    }
    }

    guardarEnLocalStorage() {
    try {
        const pedidos = this.getState('pedidos');
        localStorage.setItem('woodpro_pedidos', JSON.stringify(pedidos));
    } catch (e) {
        console.warn('No se pudo guardar pedidos en localStorage', e);
    }
    }

    // Filtros computados (no guardamos el resultado, se calcula on-demand)
    getPedidosFiltrados() {
        const pedidos = this.getState('pedidos');
        const { tipo, busqueda } = this.getState('filtros');
        const hoy = new Date().toISOString().split('T')[0];

        return pedidos.filter(pedido => {
            // Filtro por tipo
            let matchesTipo = true;
            if (tipo === 'p-high') matchesTipo = pedido.prioridad === 'p-high';
            else if (tipo === 'atrasado') matchesTipo = pedido.deadline && pedido.deadline < hoy;
            else if (tipo === 'bloqueado') matchesTipo = pedido.bloqueado === true;

            // Filtro por búsqueda
            const matchesBusqueda = busqueda === '' || 
                pedido.cliente_mueble.toLowerCase().includes(busqueda.toLowerCase()) ||
                pedido.id.toString().includes(busqueda);

            return matchesTipo && matchesBusqueda;
        });
    }
}

// Exportar instancia singleton
const stateManager = new StateManager();
export default stateManager;