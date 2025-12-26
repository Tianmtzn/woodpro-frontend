// utils/DOMHelpers.js
// 🛠️ Utilidades para manipulación eficiente del DOM

export const DOMHelpers = {
    
    // ✅ Crear elemento con atributos y clases
    createElement(tag, options = {}) {
        const el = document.createElement(tag);
        
        if (options.className) el.className = options.className;
        if (options.id) el.id = options.id;
        if (options.innerHTML) el.innerHTML = options.innerHTML;
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                el.setAttribute(key, value);
            });
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                el.addEventListener(event, handler);
            });
        }
        
        if (options.children) {
            options.children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else {
                    el.appendChild(child);
                }
            });
        }
        
        return el;
    },

    // ✅ Actualizar solo el contenido que cambió (diff)
    updateElement(element, newHTML) {
        if (element.innerHTML === newHTML) return; // No hacer nada si es igual
        element.innerHTML = newHTML;
    },

    // ✅ Alternar clases de forma segura
    toggleClass(element, className, force) {
        if (force !== undefined) {
            element.classList.toggle(className, force);
        } else {
            element.classList.toggle(className);
        }
    },

    // ✅ Ocultar/Mostrar con transición
    hide(element, remove = false) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.classList.add('hidden');
            if (remove) element.remove();
        }, 200);
    },

    show(element) {
        element.classList.remove('hidden');
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 10);
    },

    // ✅ Limpiar hijos de un elemento
    clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    // ✅ Query selector con validación
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    // ✅ Delegar eventos (mejor performance para listas)
    delegate(parent, eventType, selector, handler) {
        parent.addEventListener(eventType, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }
};

// Atajo global (opcional)
window.$ = DOMHelpers.$;
window.$$ = DOMHelpers.$$;