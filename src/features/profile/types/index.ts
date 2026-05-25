import React from 'react';

export interface Interes {
    id: number;
    nombre: string;
    emoji: string;
    activo: boolean;
}

export interface MenuItem {
    id: string;
    icono: React.ComponentType;
    etiqueta: string;
    badge?: string;
    peligro?: boolean;
    info?: string;
}

export interface InterestChipProps {
    interes: Interes;
    onToggle: (id: number) => void;
}

export interface MenuRowProps {
    item: MenuItem;
    onPress?: () => void;
}
