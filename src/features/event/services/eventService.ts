import axios from 'axios';
import { authStateManager } from '../../auth/state';
import { API_URL } from '../../../config/apiConfig';
import {
    EventoBackend,
    EventoWritePayload,
    CategoriaBackend,
    QrSessionWritePayload,
    QrSessionResponse
} from '../types/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Obtiene el token de la sesión activa y lo retorna como
 * header Authorization para peticiones protegidas.
 */
function getAuthHeaders(): { Authorization: string } {
    const token = authStateManager.getState().token;
    if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
    }
    return { Authorization: `Bearer ${token}` };
}

export const eventService = {
    /**
     * Obtiene todos los eventos disponibles del backend.
     * Endpoint: GET /api/v1/events
     */
    async fetchAllEvents(): Promise<EventoBackend[]> {
        const response = await apiClient.get<EventoBackend[]>('/events', {
            headers: getAuthHeaders(),
        });
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Obtiene un evento por su ID.
     * Endpoint: GET /api/v1/events/{id}
     */
    async fetchEventById(id: number): Promise<EventoBackend> {
        const response = await apiClient.get<EventoBackend>(`/events/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Crea un nuevo evento.
     * Requiere rol ADMIN o TEACHER.
     * Endpoint: POST /api/v1/events
     */
    async createEvent(payload: EventoWritePayload): Promise<EventoBackend> {
        const response = await apiClient.post<EventoBackend>('/events', payload, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Obtiene todas las categorías de eventos disponibles (con tags anidados).
     * Endpoint: GET /api/v1/event-categories
     */
    async fetchCategories(): Promise<CategoriaBackend[]> {
        const response = await apiClient.get<CategoriaBackend[]>('/event-categories', {
            headers: getAuthHeaders(),
        });
        return Array.isArray(response.data) ? response.data : [];
    },

    /**
     * Genera una sesión de asistencia QR.
     * Requiere rol ADMIN o TEACHER.
     * Endpoint: POST /api/v1/event-qr-sessions
     */
    async generateQrSession(payload: QrSessionWritePayload): Promise<QrSessionResponse> {
        const response = await apiClient.post<QrSessionResponse>('/event-qr-sessions', payload, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },
};
