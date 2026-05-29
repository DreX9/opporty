import React from 'react';
import { EventoBackend } from './api';
import { ICONS } from '@/components/icons';

export interface Evento {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    lugar: string;
    categoria: string;
    asistentes: number;
    capacidad: number | null;      // límite máximo de inscritos
    inscritosCount: number;         // cantidad actual de inscritos activos
    rating: number;
    precio: string;
    destacado: boolean;
    descripcion: string;
    imagenUri: string;
    accentColor: string;
    IconCategoria: React.ComponentType<{ size: number; color: string }>;
    imageUrls?: string[];
    tags?: string[];
    latitud?: number | null;
    longitud?: number | null;
}

export interface EventCardProps {
    evento: Evento;
    favorito: boolean;
    onToggleFavorito: (id: string) => void;
    onVerDetalle: (evento: Evento) => void;
}

export interface InfoPillProps {
    icono: React.ComponentType;
    label: string;
    color?: string;
}

const MONTHS_ES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
];

export function formatBackendDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const day = parts[2];
            const monthIdx = parseInt(parts[1], 10) - 1;
            const month = MONTHS_ES[monthIdx] || '';
            return `${day} ${month}`;
        }
    } catch (e) {
        console.error('Error formatting date:', e);
    }
    return dateStr;
}

export function formatBackendTime(timeStr: string | null): string {
    if (!timeStr) return '--:--';
    try {
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            let hour = parseInt(parts[0], 10);
            const minute = parts[1];
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            hour = hour ? hour : 12; // hour 0 should be 12
            const strHour = hour < 10 ? `0${hour}` : `${hour}`;
            return `${strHour}:${minute} ${ampm}`;
        }
    } catch (e) {
        console.error('Error formatting time:', e);
    }
    return timeStr;
}

export function getCategoryAccentColor(catName: string): string {
    const name = catName.toLowerCase();
    if (name.includes('tecnol')) return '#6366F1'; // indigo
    if (name.includes('músic') || name.includes('music')) return '#A82BFA'; // purple
    if (name.includes('deport')) return '#22C55E'; // green
    if (name.includes('social')) return '#EC4899'; // pink
    if (name.includes('cultur')) return '#EAB308'; // gold
    return '#22D3EE'; // cyan default
}

export function getCategoryIcon(catName: string): React.ComponentType<{ size: number; color: string }> {
    const name = catName.toLowerCase();
    if (name.includes('tecnol')) return ICONS.Laptop;
    if (name.includes('músic') || name.includes('music')) return ICONS.Music2;
    if (name.includes('deport')) return ICONS.Trophy;
    if (name.includes('social')) return ICONS.Heart;
    if (name.includes('cultur')) return ICONS.Zap;
    return ICONS.Zap;
}

export function mapBackendToEvento(dto: EventoBackend): Evento {
    const firstCategory = dto.categories && dto.categories.length > 0 ? dto.categories[0].nombre : 'General';
    return {
        id: String(dto.id),
        titulo: dto.titulo,
        fecha: formatBackendDate(dto.fechaInicio),
        hora: formatBackendTime(dto.horaInicio),
        lugar: dto.lugar || 'No especificado',
        categoria: firstCategory,
        asistentes: dto.inscritosCount ?? 0,
        capacidad: dto.capacidad ?? null,
        inscritosCount: dto.inscritosCount ?? 0,
        rating: 4.8, // Mocked rating
        precio: 'Gratis',
        destacado: dto.capacidad ? dto.capacidad >= 100 : false,
        descripcion: dto.descripcion || 'Sin descripción',
        imagenUri: dto.imagenUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
        accentColor: getCategoryAccentColor(firstCategory),
        IconCategoria: getCategoryIcon(firstCategory),
        imageUrls: dto.imageUrls || [],
        tags: dto.tags ? dto.tags.map(t => t.nombre) : [],
        latitud: dto.latitud,
        longitud: dto.longitud,
    };
}

