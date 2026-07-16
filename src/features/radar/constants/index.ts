import { EventoDot, EventoCard } from '../types';

export const C = {
    bg: '#F4F4FB',           // fondo general ligeramente lila
    radarBg: '#EEF0FA',      // fondo de la caja del radar
    radarRing1: '#6366F1',   // azul/índigo sutil
    radarRing2: '#6366F1',   // azul/índigo sutil
    radarRing3: '#6366F1',   // azul/índigo sutil
    accent: '#6366F1',
    accentPurple: '#A82BFA',
    cardBg: '#FFFFFF',
    cardBorder: '#E9EAF4',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    tagBg: '#EEF2FF',
    tagText: '#4F46E5',
    green: '#22C55E',
};

export const DOTS: EventoDot[] = [
    { id: 'a', top: 0.48, left: 0.50, color: '#A82BFA' },   // centro (púrpura)
    { id: 'b', top: 0.38, left: 0.72, color: '#22C55E' },   // derecha-arriba (verde)
    { id: 'c', top: 0.60, left: 0.22, color: '#22C55E' },   // izquierda-abajo
    { id: 'd', top: 0.68, left: 0.52, color: '#3B82F6' },   // abajo-centro (azul)
];

export const EVENTOS: EventoCard[] = [
    {
        id: '1',
        titulo: 'Hackathon Tech 2026',
        distancia: '0.5 km',
        asistentes: 150,
        fecha: '24 may',
        categoria: 'Tecnología',
        activo: true,
    },
    {
        id: '2',
        titulo: 'Feria de Emprendimiento',
        distancia: '1.2 km',
        asistentes: 90,
        fecha: '26 may',
        categoria: 'Emprendimiento',
        activo: false,
    },
    {
        id: '3',
        titulo: 'Concierto Universitario',
        distancia: '0.8 km',
        asistentes: 220,
        fecha: '28 may',
        categoria: 'Música',
        activo: true,
    },
];
