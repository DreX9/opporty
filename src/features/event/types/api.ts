export interface TagBackend {
  id: number;
  nombre: string;
  createdAt: string;
}

export interface CategoriaBackend {
  id: number;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  tags: TagBackend[];
}

export interface EventoBackend {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;        // "yyyy-MM-dd"
  fechaFin: string;          // "yyyy-MM-dd"
  horaInicio: string | null;  // "HH:mm:ss" o "HH:mm"
  horaFin: string | null;    // "HH:mm:ss" o "HH:mm"
  capacidad: number | null;
  imagenUrl: string | null;   // imagen principal
  modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
  lugar: string | null;
  referencia: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: 'DRAFT' | 'PENDING' | 'REJECTED' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';
  requiresApproval: boolean;
  allowQrAttendance: boolean;
  edadMinima: number | null;
  requisitos: string | null;
  motivoRechazo: string | null;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoriaBackend[];
  tags: TagBackend[];
  imageUrls: string[];        // imágenes adicionales
}

export interface EventoWritePayload {
  id?: number; // Para edición en el futuro
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  capacidad: number | null;
  imagenUrl: string | null;
  modalidad: string;
  lugar: string | null;
  referencia: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  requiresApproval: boolean;
  allowQrAttendance: boolean;
  edadMinima: number | null;
  requisitos: string | null;
  categoryIds: number[];
  tagIds: number[];
  imageUrls: string[];
  motivoRechazo?: string | null;
}

export interface QrSessionWritePayload {
  eventId: number;
  type: 'ENTRY' | 'EXIT';
  durationMinutes: number;
}

export interface QrSessionViewDTO {
  id: number;
  eventId: number;
  eventTitulo: string;
  type: string;
  token: string;
  generatedAt: string;
  expiresAt: string;
  active: boolean;
  createdByUsername: string;
}

export interface QrSessionResponse {
  session: QrSessionViewDTO;
  qrCodeBase64: string;
}
