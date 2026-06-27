import { ICONS } from '@/components/icons';
import { Interes, MenuItem } from '../types';

export const C = {
    bg: '#F4F4FB',
    cardBg: '#FFFFFF',
    cardBorder: '#E9EAF4',
    heroBg: '#6366F1',          // indigo (fondo del banner de perfil)
    accent: '#6366F1',          // uniradar-indigo
    accentPurple: '#A82BFA',    // uniradar-purple
    accentLight: '#EEF2FF',     // uniradar-tagBg
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textWhite: '#FFFFFF',
    textWhite70: 'rgba(255,255,255,0.7)',
    badgeBg: '#EAB308',         // amarillo para el badge de rol
    badgeText: '#FFFFFF',
    interestActive: '#EEF2FF',
    interestActiveBorder: '#6366F1',
    interestInactiveText: '#374151',
    dotNotif: '#EF4444',
};

export const INTERESES_INICIAL: Interes[] = [
    { id: 1, nombre: 'Tecnología', emoji: '💻', activo: true },
    { id: 2, nombre: 'Música',     emoji: '🎵', activo: true },
    { id: 3, nombre: 'Deportes',   emoji: '⚽', activo: false },
    { id: 4, nombre: 'Arte',       emoji: '🎨', activo: true },
    { id: 5, nombre: 'Gastronomía',emoji: '🍕', activo: false },
    { id: 6, nombre: 'Emprendimiento', emoji: '💼', activo: true },
];

export const MENU_ITEMS: MenuItem[] = [
    { id: 'eventos',    icono: ICONS.CalendarDays, etiqueta: 'Mis Eventos',           info: '5 eventos' },
    { id: 'notif',      icono: ICONS.radar,        etiqueta: 'Notificaciones',         badge: 'dot' },
    { id: 'tutorial',   icono: ICONS.bookOpen,     etiqueta: 'Ver tutorial de bienvenida' },
    { id: 'privacidad', icono: ICONS.Shield,       etiqueta: 'Privacidad y Seguridad' },
];
