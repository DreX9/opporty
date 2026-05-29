import React from 'react';
import { EventoBackend } from '../../event/types/api';
import { Evento } from '../../event/types';

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

export interface RadarEvento {
    backend: EventoBackend;
    card: EventoCard;
    mapped: Evento;
    distanciaKm: number;
    top: number;
    left: number;
}
