import React from 'react';

export interface Interes {
    id: number;
    nombre: string;
    emoji: string;
    activo: boolean;
    color?: string;
    Icon?: React.ComponentType<{ size: number; color: string }>;
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

export interface StudentProfile {
    id: number;
    nombres: string;
    apellidos: string;
    carrera?: string;
    ciclo?: number;
    dni: string;
    fechaNacimiento: string;
    phoneNumber?: string;
    status: string;
    user: {
        id: number;
        username: string;
        email: string;
        enabled: boolean;
        role: {
            id: number;
            name: string;
            description: string;
        };
    };
}

export interface TeacherProfile {
    id: number;
    nombres: string;
    apellidos: string;
    titulo?: string;
    especialidad?: string;
    telefono?: string;
    dni: string;
    fechaNacimiento: string;
    biography?: string;
    status: string;
    hiringDate?: string;
    user: {
        id: number;
        username: string;
        email: string;
        enabled: boolean;
        role: {
            id: number;
            name: string;
            description: string;
        };
    };
}

export interface StudentWriteData {
    id: number;
    nombres: string;
    apellidos: string;
    carrera?: string;
    ciclo?: number;
    dni: string;
    fechaNacimiento: string;
    phoneNumber?: string;
    status: string;
    userId: number;
    password?: string;
}

export interface TeacherWriteData {
    id: number;
    nombres: string;
    apellidos: string;
    titulo?: string;
    especialidad?: string;
    telefono?: string;
    dni: string;
    fechaNacimiento: string;
    biography?: string;
    status: string;
    hiringDate?: string;
    userId: number;
    password?: string;
}

