import { Platform } from 'react-native';
import axios from 'axios';
import { authStateManager } from '../../auth/state';
import { BackendRole, TeacherFormData, TeacherRegisterResponse } from '../types';


const API_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:8080/api/v1'
        : 'http://localhost:8080/api/v1';

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

/**
 * Convierte una fecha en formato dd/mm/yyyy a yyyy-MM-dd (LocalDate de Java)
 */
function toIsoDate(date: string): string {
    const parts = date.split('/');
    if (parts.length !== 3) {
        throw new Error(`Formato de fecha inválido: "${date}". Se esperaba dd/mm/yyyy.`);
    }
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export const adminService = {
    /**
     * Obtiene todos los roles disponibles en el backend.
     * Endpoint: GET /api/v1/roles
     */
    async fetchRoles(): Promise<BackendRole[]> {
        const response = await apiClient.get<BackendRole[]>('/roles', {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Registra un nuevo docente en el backend.
     * Requiere rol ADMIN (validado en el servidor con @PreAuthorize).
     * Endpoint: POST /api/v1/teachers/register
     */
    async registerTeacher(data: TeacherFormData): Promise<TeacherRegisterResponse> {
        if (data.roleId === null) {
            throw new Error('Debes seleccionar un rol para el docente.');
        }

        const payload = {
            email: data.email,
            password: data.password,
            dni: data.dni,
            birthDate: toIsoDate(data.birthDate),
            firstName: data.firstName,
            lastName: data.lastName,
            title: data.title || null,
            specialty: data.specialty || null,
            phoneNumber: data.phoneNumber || null,
            biography: data.biography || null,
            status: data.status,
            hiringDate: data.hiringDate ? toIsoDate(data.hiringDate) : null,
            roleId: data.roleId,
        };

        const response = await apiClient.post<TeacherRegisterResponse>('/teachers/register', payload, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

};
