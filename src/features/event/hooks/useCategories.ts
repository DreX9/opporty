import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';
import { CategoriaBackend } from '../types/api';

export function useCategories() {
    const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const cats = await eventService.fetchCategories();
            setCategorias(cats);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || err.message || 'Error al cargar categorías.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categorias,
        loading,
        error,
        refetch: fetchCategories,
    };
}
