import { AdminEvent, AdminUser, TeacherFormData, FormCrearEvento } from '../types';

export const CATEGORIAS = ['Tecnología', 'Música', 'Deporte', 'Arte', 'Educación', 'Social'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_EVENTO = [
  'Conferencia',
  'Taller',
  'Seminario',
  'Hackathon',
  'Concierto',
  'Competencia',
  'Exposición',
  'Networking'
] as const;

export const TEACHER_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE'] as const;

export const EMOJIS = ['👨🏻‍💻', '👩‍💻', '👑', '🧑‍🎓', '🧑‍💻', '🤖', '🚀', '✨'] as const;

export const INICIAL_EVENTOS: AdminEvent[] = [
  { id: '1', titulo: 'Hackathon Tech 2026', categoria: 'Tecnología', estado: 'Aprobado', fecha: '24 Abr', color: '#00E5FF' },
  { id: '2', titulo: 'Concierto Estudiantil', categoria: 'Música', estado: 'Pendiente', fecha: '02 May', color: '#FFB300' },
  { id: '3', titulo: 'Liga Universitaria eSports', categoria: 'Deporte', estado: 'Aprobado', fecha: '10 May', color: '#39FF14' },
  { id: '4', titulo: 'Feria del Amor', categoria: 'Social', estado: 'Pendiente', fecha: '18 May', color: '#FF00FF' },
];

export const INICIAL_USUARIOS: AdminUser[] = [
  { id: '1', nombre: 'Alex Rivera', email: 'alex@test.com', rol: 'STUDENT', emoji: '👨🏻‍💻', status: 'ACTIVE' },
  { id: '2', nombre: 'Administrador principal', email: 'admin@admin.com', rol: 'ADMIN', emoji: '👑', status: 'ACTIVE' },
  { id: '3', nombre: 'Carlos Gomez', email: 'carlos@test.com', rol: 'STUDENT', emoji: '🧑‍🎓', status: 'ACTIVE' },
  { id: '4', nombre: 'Sofia Rojas', email: 'sofia@test.com', rol: 'STUDENT', emoji: '👩‍💻', status: 'ACTIVE' },
  { id: '5', nombre: 'Juan Perez', email: 'juan@test.com', rol: 'TEACHER', emoji: '🧑‍💻', status: 'ACTIVE' },
];

export const ESTADO_INICIAL_DOCENTE: TeacherFormData = {
  firstName: '',
  lastName: '',
  dni: '',
  birthDate: '',
  phoneNumber: '',
  title: '',
  specialty: '',
  biography: '',
  hiringDate: '',
  status: 'ACTIVE',
  email: '',
  password: '',
  roleId: null,
};

export const ESTADO_INICIAL_EVENTO: FormCrearEvento = {
  titulo: '',
  fecha: '',
  hora: '',
  horaFin: '',
  lugar: '',
  latitud: 0,
  longitud: 0,
  categoria: '',
  asistentes: '',
  descripcion: '',
  destacado: false,
  imagenUri: '',
  tipo: '',
  edadMinima: '',
  requisitos: '',
  codigoEmpleado: '',
  cargo: '',
  correo: '',
  celular: '',
  codigoAutorizacion: ''
};

