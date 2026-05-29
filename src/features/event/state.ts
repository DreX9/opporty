import { useState, useEffect } from 'react';
import { RegistrationBackend } from './types/api';

export interface InsigniaState {
    ingreso: boolean;
    salida: boolean;
}

export interface QRState {
    ingresoQR: string;
    salidaQR: string;
}

/**
 * Metadata de la inscripción del usuario autenticado para un evento dado.
 * SOLO se almacena lo que devuelve /event-registrations/me para el usuario de la sesión activa.
 * Garantía de aislamiento: este estado se resetea en cada logout (resetState).
 */
export interface RegistrationMeta {
    registrationId: number;
    checkInAt: string | null;
    checkOutAt: string | null;
    eventId: string;
    eventTitulo: string;
}

export interface EventGlobalState {
    registrados: Set<string>;
    insignias: Record<string, InsigniaState>;
    qrs: Record<string, QRState>;
    constanciasDescargadas: Set<string>;
    readNotifications: Set<string>;
    /** Metadata de inscripción por eventId — pertenece al usuario de la sesión activa. */
    registrationMeta: Record<string, RegistrationMeta>;
}

let globalState: EventGlobalState = {
    registrados: new Set<string>(),
    insignias: {},
    qrs: {},
    constanciasDescargadas: new Set<string>(),
    readNotifications: new Set<string>(),
    registrationMeta: {},
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

    /**
     * Devuelve la metadata de inscripción del usuario autenticado para un evento.
     * Retorna undefined si el usuario no tiene inscripción registrada en el estado local.
     */
    getRegistrationMeta(eventId: string): RegistrationMeta | undefined {
        return globalState.registrationMeta[eventId];
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
     * Sincroniza el estado local con los registros provenientes del backend.
     * GARANTÍA DE SESIÓN: Este método solo es llamado con los registros del usuario
     * autenticado (endpoint /event-registrations/me usa el Bearer token de la sesión).
     * Nunca mezcla datos de distintos usuarios porque resetState() limpia todo en logout.
     */
    hydrateWithRegistrations(registrations: RegistrationBackend[]) {
        const nuevosRegistrados = new Set<string>();
        const nuevasInsignias: Record<string, InsigniaState> = {};
        const constanciasDes: Set<string> = new Set<string>();
        const nuevaMeta: Record<string, RegistrationMeta> = {};

        registrations.forEach(reg => {
            const evId = String(reg.eventId);
            if (!evId || evId === 'undefined') return;

            nuevosRegistrados.add(evId);

            nuevasInsignias[evId] = {
                ingreso: Boolean(reg.qrEntryScanned),
                salida: Boolean(reg.qrExitScanned),
            };

            if (reg.certificateGenerated) {
                constanciasDes.add(evId);
            }

            // Almacenamos la metadata de la inscripción para el diploma
            nuevaMeta[evId] = {
                registrationId: reg.id,
                checkInAt: reg.checkInAt,
                checkOutAt: reg.checkOutAt,
                eventId: evId,
                eventTitulo: reg.eventTitulo,
            };
        });

        globalState = {
            ...globalState,
            registrados: nuevosRegistrados,
            insignias: nuevasInsignias,
            constanciasDescargadas: constanciasDes,
            registrationMeta: nuevaMeta,
        };
        notify();
    },

    /**
     * Limpia COMPLETAMENTE el estado global del evento.
     * Debe llamarse siempre que el usuario hace logout para
     * evitar fuga de estado entre sesiones de distintos usuarios.
     * Incluye registrationMeta para garantizar el aislamiento de sesión.
     */
    resetState() {
        globalState = {
            registrados: new Set<string>(),
            insignias: {},
            qrs: {},
            constanciasDescargadas: new Set<string>(),
            readNotifications: new Set<string>(),
            registrationMeta: {},
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
