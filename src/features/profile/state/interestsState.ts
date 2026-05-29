import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** Nombre de las categorías activas seleccionadas por el usuario */
export interface InterestsState {
    activeCategories: string[];  // nombres normalizados a minúsculas
}

// ── Estado global de módulo ───────────────────────────────────────────────────

let globalActiveCategories: string[] = [];
const listeners = new Set<() => void>();

function notifyListeners() {
    listeners.forEach(l => l());
}

// ── Clave de AsyncStorage por usuario ─────────────────────────────────────────

function getStorageKey(username: string): string {
    return `@uniradar:interests:${username}`;
}

// ── Cargar intereses persistidos ──────────────────────────────────────────────

export async function loadInterests(username: string): Promise<void> {
    try {
        const stored = await AsyncStorage.getItem(getStorageKey(username));
        if (stored) {
            const parsed: string[] = JSON.parse(stored);
            globalActiveCategories = parsed;
        } else {
            globalActiveCategories = [];
        }
    } catch {
        globalActiveCategories = [];
    }
    notifyListeners();
}

// ── Guardar intereses ─────────────────────────────────────────────────────────

export async function saveInterests(username: string, activeCategories: string[]): Promise<void> {
    globalActiveCategories = activeCategories;
    notifyListeners();
    try {
        await AsyncStorage.setItem(getStorageKey(username), JSON.stringify(activeCategories));
    } catch {
        // silenciar error de escritura
    }
}

// ── Hook de consumo ───────────────────────────────────────────────────────────

export function useInterests() {
    const [activeCategories, setActiveCategories] = useState<string[]>(globalActiveCategories);

    useEffect(() => {
        const handleUpdate = () => setActiveCategories([...globalActiveCategories]);
        listeners.add(handleUpdate);
        return () => { listeners.delete(handleUpdate); };
    }, []);

    /** Comprueba si una categoría de evento coincide con los intereses activos */
    const matchesInterest = (categoriaNombre: string): boolean => {
        if (activeCategories.length === 0) return false;
        const norm = categoriaNombre.toLowerCase();
        return activeCategories.some(cat => norm.includes(cat) || cat.includes(norm));
    };

    return { activeCategories, matchesInterest };
}
