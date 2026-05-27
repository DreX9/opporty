import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';
import { EventoBackend } from '../types/api';

export function useEvents() {
    const [data, setData] = useState<EventoBackend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const events = await eventService.fetchAllEvents();
            setData(events);
        } catch (err: any) {
            console.error('Error fetching events:', err);
            setError(err.response?.data?.message || err.message || 'Error al cargar eventos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        data,
        loading,
        error,
        refetch: fetchEvents,
    };
}
