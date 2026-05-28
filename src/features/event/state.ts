import { useState, useEffect } from 'react';

export interface InsigniaState {
    ingreso: boolean;
    salida: boolean;
}

export interface QRState {
    ingresoQR: string;
    salidaQR: string;
}

export interface EventGlobalState {
    registrados: Set<string>;
    insignias: Record<string, InsigniaState>;
    qrs: Record<string, QRState>;
    constanciasDescargadas: Set<string>;
    readNotifications: Set<string>;
}

let globalState: EventGlobalState = {
    registrados: new Set<string>(),
    insignias: {},
    qrs: {},
    constanciasDescargadas: new Set<string>(),
    readNotifications: new Set<string>(),
};

// Listeners para actualizaciones reactivas
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((l) => l());
}

export const eventStateManager = {
    getState() {
        return { ...globalState };
    },

    registerToEvent(id: string) {
        globalState.registrados.add(id);
        if (!globalState.insignias[id]) {
            globalState.insignias[id] = { ingreso: false, salida: false };
        }
        notify();
    },

    unregisterFromEvent(id: string) {
        globalState.registrados.delete(id);
        notify();
    },

    isRegistered(id: string) {
        return globalState.registrados.has(id);
    },

    unlockInsignia(eventId: string, tipo: 'ingreso' | 'salida'): boolean {
        if (!globalState.insignias[eventId]) {
            globalState.insignias[eventId] = { ingreso: false, salida: false };
        }
        
        const yaDesbloqueada = globalState.insignias[eventId][tipo];
        if (yaDesbloqueada) return false;

        globalState.insignias[eventId][tipo] = true;
        notify();
        return true;
    },

    getInsignias(eventId: string): InsigniaState {
        return globalState.insignias[eventId] || { ingreso: false, salida: false };
    },

    hasQRs(eventId: string): boolean {
        return !!globalState.qrs[eventId];
    },

    generateQRs(eventId: string, titulo: string) {
        globalState.qrs[eventId] = {
            ingresoQR: JSON.stringify({ eventId, tipo: 'ingreso', titulo }),
            salidaQR: JSON.stringify({ eventId, tipo: 'salida', titulo }),
        };
        // Aseguramos que tenga el objeto de insignias listo
        if (!globalState.insignias[eventId]) {
            globalState.insignias[eventId] = { ingreso: false, salida: false };
        }
        notify();
    },

    getQRs(eventId: string): QRState | undefined {
        return globalState.qrs[eventId];
    },

    isCertificateUnlocked(eventId: string): boolean {
        const ins = this.getInsignias(eventId);
        return ins.ingreso && ins.salida;
    },

    descargarConstancia(eventId: string) {
        globalState.constanciasDescargadas.add(eventId);
        notify();
    },

    hasDescargadoConstancia(eventId: string): boolean {
        return globalState.constanciasDescargadas.has(eventId);
    },

    markNotificationAsRead(id: string) {
        const nextSet = new Set(globalState.readNotifications);
        nextSet.add(id);
        globalState.readNotifications = nextSet;
        notify();
    },

    isNotificationRead(id: string): boolean {
        return globalState.readNotifications.has(id);
    },

    /**
     * Limpia COMPLETAMENTE el estado global del evento.
     * Debe llamarse siempre que el usuario hace logout para
     * evitar fuga de estado entre sesiones de distintos usuarios.
     */
    resetState() {
        globalState = {
            registrados: new Set<string>(),
            insignias: {},
            qrs: {},
            constanciasDescargadas: new Set<string>(),
            readNotifications: new Set<string>(),
        };
        notify();
    },
};

export function useEventState() {
    const [state, setState] = useState<EventGlobalState>(eventStateManager.getState());

    useEffect(() => {
        const handler = () => {
            setState(eventStateManager.getState());
        };
        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);

    return state;
}
