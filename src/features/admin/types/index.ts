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


export interface AdminEvent {
  id: string;
  titulo: string;
  categoria: string;
  estado: 'Aprobado' | 'Pendiente';
  fecha: string;
  color?: string;
}

export interface AdminUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  emoji: string;
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
  fecha: string;
  hora: string;
  horaFin: string;
  lugar: string;
  latitud: number;
  longitud: number;
  categoria: string;
  asistentes: string;
  descripcion: string;
  destacado: boolean;
  imagenUri: string;
  tipo: string;
  edadMinima: string;
  requisitos: string;
  codigoEmpleado: string;
  cargo: string;
  correo: string;
  celular: string;
  codigoAutorizacion: string;
}

