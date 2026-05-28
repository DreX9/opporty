import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';
import { EventoBackend } from '../types/api';

import { eventStateManager } from '../state';

// Shared state at module level
let globalEvents: EventoBackend[] = [];
let globalLoading: boolean = false;
let globalError: string | null = null;
let hasFetchedOnce: boolean = false;

const listeners = new Set<() => void>();

function notifyListeners() {
    listeners.forEach(listener => listener());
}

export function resetEventsCache() {
    globalEvents = [];
    globalLoading = false;
    globalError = null;
    hasFetchedOnce = false;
    notifyListeners();
}

export function useEvents() {
    const [data, setData] = useState<EventoBackend[]>(globalEvents);
    const [loading, setLoading] = useState<boolean>(globalLoading);
    const [error, setError] = useState<string | null>(globalError);

    useEffect(() => {
        const handleUpdate = () => {
            setData(globalEvents);
            setLoading(globalLoading);
            setError(globalError);
        };
        listeners.add(handleUpdate);
        
        // If it hasn't fetched yet, trigger fetch
        if (!hasFetchedOnce && !globalLoading) {
            fetchEvents();
        }

        return () => {
            listeners.delete(handleUpdate);
        };
    }, []);

    const fetchEvents = useCallback(async () => {
        globalLoading = true;
        globalError = null;
        notifyListeners();
        try {
            // Traemos eventos y registros en paralelo para mayor velocidad
            const [events, regs] = await Promise.all([
                eventService.fetchAllEvents(),
                eventService.fetchMyRegistrations()
            ]);
            
            globalEvents = events;
            hasFetchedOnce = true;

            // Hidratamos el estado local con las insignias previas del usuario
            if (regs && regs.length > 0) {
                eventStateManager.hydrateWithRegistrations(regs);
            }

        } catch (err) {
            console.error('Error fetching events:', err);
            let msg = 'Error al cargar eventos.';
            if (err && typeof err === 'object') {
                const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
                msg = axiosErr.response?.data?.message || axiosErr.message || msg;
            }
            globalError = msg;
        } finally {
            globalLoading = false;
            notifyListeners();
        }
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchEvents,
    };
}

