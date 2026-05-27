import axios from 'axios';
import { DatosRegistro } from '../types';
import { API_URL } from '../../../config/apiConfig';

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token?: string;
}

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    /**
     * Inicia sesión con nombre de usuario y contraseña en el backend
     */
    async login(username: string, password: string): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/authenticate', {
            username,
            password,
        });
        return response.data;
    },

    /**
     * Registra un nuevo estudiante en el backend
     */
    async registerStudent(datos: DatosRegistro) {
        // Convertir la fecha de nacimiento de dd/mm/yyyy a yyyy-MM-dd para compatibilidad con LocalDate en Java
        const parts = datos.fechaNacimiento.split('/');
        if (parts.length !== 3) {
            throw new Error('Formato de fecha de nacimiento inválido (debe ser dd/mm/yyyy).');
        }
        const fechaNacimientoFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;

        const payload = {
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            email: datos.email,
            dni: datos.dni,
            fechaNacimiento: fechaNacimientoFormatted,
            carrera: datos.carrera,
            ciclo: Number(datos.ciclo),
            phoneNumber: datos.phoneNumber || null,
            password: datos.contrasena,
        };

        const response = await apiClient.post('/auth/register/student', payload);
        return response.data;
    },
};

