export type Rol = 'Usuario' | 'Admin' | 'Organizador' | 'Moderador';

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
  rol: Rol;
  emoji: string;
}

export interface FormCrearUsuario {
  nombre: string;
  email: string;
  password: string;
  facultad: string;
  rol: Rol;
  departamento: string;
  cargo: string;
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
