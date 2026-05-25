import React from 'react';

export interface Evento {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    lugar: string;
    categoria: string;
    asistentes: number;
    rating: number;
    precio: string;
    destacado: boolean;
    descripcion: string;
    imagenUri: string;
    accentColor: string;
    IconCategoria: React.ComponentType<{ size: number; color: string }>;
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
