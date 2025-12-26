// core/EventBus.js
// 📡 Sistema de comunicación entre módulos (Pub/Sub)

class EventBus {
    constructor() {
        this.events = new Map();
    }

    // ✅ Suscribirse a un evento
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        this.events.get(eventName).push(callback);
        
        // Retornar función para desuscribirse
        return () => this.off(eventName, callback);
    }

    // ✅ Desuscribirse de un evento
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    // ✅ Emitir un evento
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        
        this.events.get(eventName).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error en callback de evento "${eventName}":`, error);
            }
        });
    }

    // ✅ Suscribirse a un evento solo una vez
    once(eventName, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(eventName, onceCallback);
        };
        
        this.on(eventName, onceCallback);
    }

    // 🧹 Limpiar todos los eventos
    clear() {
        this.events.clear();
    }
}

// Exportar instancia singleton
const eventBus = new EventBus();
export default eventBus;