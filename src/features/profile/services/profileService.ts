import { Platform } from 'react-native';
import axios from 'axios';
import { authStateManager } from '../../auth/state';
import { StudentProfile, TeacherProfile, StudentWriteData, TeacherWriteData } from '../types';

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

function getAuthHeaders(): { Authorization: string } {
    const token = authStateManager.getState().token;
    if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
    }
    return { Authorization: `Bearer ${token}` };
}

function toIsoDate(date: string): string {
    const parts = date.split('/');
    if (parts.length !== 3) {
        throw new Error(`Formato de fecha inválido: "${date}". Se esperaba dd/mm/yyyy.`);
    }
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export const profileService = {
    async fetchStudentMe(): Promise<StudentProfile> {
        const response = await apiClient.get<StudentProfile>('/students/me', {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    async fetchTeacherMe(): Promise<TeacherProfile> {
        const response = await apiClient.get<TeacherProfile>('/teachers/me', {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    async updateStudent(data: StudentWriteData): Promise<StudentProfile> {
        const payload = {
            ...data,
            fechaNacimiento: toIsoDate(data.fechaNacimiento),
        };
        const response = await apiClient.put<StudentProfile>('/students', payload, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },

    async updateTeacher(data: TeacherWriteData): Promise<TeacherProfile> {
        const payload = {
            ...data,
            fechaNacimiento: toIsoDate(data.fechaNacimiento),
            hiringDate: data.hiringDate ? toIsoDate(data.hiringDate) : null,
        };
        const response = await apiClient.put<TeacherProfile>('/teachers', payload, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },
};
