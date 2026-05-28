import React from 'react';

export interface EventoDot {
    id: string;
    top: number;
    left: number;
    color: string;
}

export interface EventoCard {
    id: string;
    titulo: string;
    distancia: string;
    asistentes: number;
    fecha: string;
    categoria: string;
    activo: boolean;
}

export interface EventCardProps {
    evento: EventoCard;
    onPress?: () => void;
}

export interface InfoPillProps {
    icon: React.ComponentType;
    label: string;
}
