import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { eventService } from '../services/eventService';
import { EventoBackend, RegistrationBackend, UpdateCheck } from '../types/api';
import { eventStateManager } from '../state';

// Shared state at module level
let globalEvents: EventoBackend[] = [];
let globalLoading: boolean = false;
let globalError: string | null = null;
let hasFetchedOnce: boolean = false;
let globalUpdateInfo: UpdateCheck | null = null;
let pollIntervalId: any = null;
let activeFocusCount = 0;

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

function startPolling(fetchFn: () => Promise<void>) {
    if (pollIntervalId) return;
    pollIntervalId = setInterval(async () => {
        if (AppState.currentState !== 'active' || activeFocusCount <= 0 || globalLoading) {
            return;
        }
        try {
            const checkInfo = await eventService.checkUpdates();
            if (globalUpdateInfo) {
                if (
                    globalUpdateInfo.eventsCount !== checkInfo.eventsCount ||
                    globalUpdateInfo.eventsLastUpdated !== checkInfo.eventsLastUpdated ||
                    globalUpdateInfo.registrationsCount !== checkInfo.registrationsCount ||
                    globalUpdateInfo.registrationsLastUpdated !== checkInfo.registrationsLastUpdated
                ) {
                    console.log('[Real-time] Detectado cambio en eventos o inscripciones. Refrescando...');
                    await fetchFn();
                }
            } else {
                globalUpdateInfo = checkInfo;
            }
        } catch (err) {
            console.error('Error in event polling:', err);
        }
    }, 5000);
}

function stopPolling() {
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
    }
}

export function useEvents() {
    const [data, setData] = useState<EventoBackend[]>(globalEvents);
    const [loading, setLoading] = useState<boolean>(globalLoading);
    const [error, setError] = useState<string | null>(globalError);
    const isFocused = useIsFocused();

    const fetchEvents = useCallback(async () => {
        globalLoading = true;
        globalError = null;
        notifyListeners();
        try {
            // Traemos eventos, registros y check-updates en paralelo
            const [events, regs, updateInfo] = await Promise.all([
                eventService.fetchAllEvents(),
                eventService.fetchMyRegistrations(),
                eventService.checkUpdates()
            ]);
            
            globalEvents = events;
            globalUpdateInfo = updateInfo;
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
    }, [fetchEvents]);

    useEffect(() => {
        if (isFocused) {
            activeFocusCount++;
            startPolling(fetchEvents);
        } else {
            activeFocusCount = Math.max(0, activeFocusCount - 1);
            if (activeFocusCount === 0) {
                stopPolling();
            }
        }
        return () => {
            if (isFocused) {
                activeFocusCount = Math.max(0, activeFocusCount - 1);
                if (activeFocusCount === 0) {
                    stopPolling();
                }
            }
        };
    }, [isFocused, fetchEvents]);

    return {
        data,
        loading,
        error,
        refetch: fetchEvents,
    };
}

