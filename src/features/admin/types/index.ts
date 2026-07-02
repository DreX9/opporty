export type TeacherStatus = 'ACTIVE' | 'INACTIVE';

export interface BackendRole {
  id: number;
  name: string;
  description: string;
}

export interface TeacherRegisterResponse {
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
  user?: {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    role?: BackendRole;
  };
}


import { EventoBackend } from '../../event/types/api';

export interface AdminEvent {
  id: string;
  titulo: string;
  categoria: string;
  estado: 'Aprobado' | 'Pendiente' | 'Rechazado' | 'Programado' | 'Suspendido' | 'Cancelado' | 'DRAFT' | 'CANCELLED' | 'FINISHED' | 'Finalizado';
  fecha: string;
  color?: string;
  motivoRechazo?: string | null;
  raw?: EventoBackend;
}

export interface AdminUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  emoji: string;
  status?: 'ACTIVE' | 'INACTIVE';
  career?: string;
  specialty?: string;
  ciclo?: number;
  dni?: string;
  fechaNacimiento?: string;
  phoneNumber?: string;
  biography?: string;
  hiringDate?: string;
  titulo?: string;
  username?: string;
}

export interface UsersViewDTO {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  role: BackendRole;
  status: string;
  nombre: string;
  career?: string;
  specialty?: string;
  ciclo?: number;
  dni?: string;
  fechaNacimiento?: string;
  phoneNumber?: string;
  biography?: string;
  hiringDate?: string;
  titulo?: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  phoneNumber: string;
  title: string;
  specialty: string;
  biography: string;
  hiringDate: string;
  status: TeacherStatus;
  email: string;
  password: string;
  roleId: number | null;
}

export interface FormCrearEvento {
  titulo: string;
  descripcion: string;
  fechaInicio: string;    // ISO "yyyy-MM-dd"
  fechaFin: string;      // ISO "yyyy-MM-dd"
  horaInicio: string;     // "HH:mm"
  horaFin: string;        // "HH:mm"
  capacidad: string;
  imagenUrl: string;      // primera imagen (principal)
  imageUrls: string[];    // hasta 3 imágenes adicionales Cloudinary
  modalidad: string;      // PRESENCIAL, VIRTUAL, HIBRIDO
  lugar: string;
  referencia: string;
  latitud: number;
  longitud: number;
  estado: string;         // 'PUBLISHED' o 'DRAFT'
  requiresApproval: boolean;
  allowQrAttendance: boolean;
  edadMinima: string;
  requisitos: string;
  categoryIds: number[];
  tagIds: number[];
  grabacionUrl?: string;
}



