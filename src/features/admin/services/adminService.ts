import axios from 'axios';
import { authStateManager } from '../../auth/state';
import { BackendRole, TeacherFormData, TeacherRegisterResponse, AdminUser, UsersViewDTO } from '../types';
import { API_URL } from '../../../config/apiConfig';

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

    /**
     * Obtiene todos los usuarios del sistema.
     * Endpoint: GET /api/v1/users
     */
    async fetchUsers(): Promise<AdminUser[]> {
        const response = await apiClient.get<UsersViewDTO[]>('/users', {
            headers: getAuthHeaders(),
        });
        return response.data.map(u => ({
            id: String(u.id),
            nombre: u.nombre || u.username,
            email: u.email,
            rol: u.role.name,
            emoji: u.role.name === 'STUDENT' ? '🧑‍🎓' : u.role.name === 'ADMIN' ? '👑' : u.role.name === 'TEACHER' ? '🧑‍💻' : '👨🏻‍💻',
            status: (u.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
            career: u.career,
            specialty: u.specialty,
            ciclo: u.ciclo,
            dni: u.dni,
            fechaNacimiento: u.fechaNacimiento,
            phoneNumber: u.phoneNumber,
            biography: u.biography,
            hiringDate: u.hiringDate,
            titulo: u.titulo,
            username: u.username
        }));
    },

    /**
     * Actualiza el estado activo/inactivo de un usuario.
     * Endpoint: PUT /api/v1/users/{id}/status
     */
    async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<UsersViewDTO> {
        const response = await apiClient.put<UsersViewDTO>(`/users/${id}/status`, { status }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    /**
     * Actualiza el rol de un usuario (TEACHER, MANAGER, ADMIN).
     * Endpoint: PUT /api/v1/users/{id}/role
     */
    async updateUserRole(id: string, role: string): Promise<UsersViewDTO> {
        const response = await apiClient.put<UsersViewDTO>(`/users/${id}/role`, { role }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

};
