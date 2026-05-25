import { Platform } from 'react-native';
import axios from 'axios';
import { DatosRegistro } from '../types';

// En emulador de Android local, localhost es accesible en 10.0.2.2. En iOS o Web se usa localhost.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';

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
    async login(username: string, password: string) {
        const response = await apiClient.post('/auth/authenticate', {
            username,
            password,
        });
        return response.data; // { token: string, refreshToken: string }
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
            password: datos.contrasena,
        };

        const response = await apiClient.post('/auth/register/student', payload);
        return response.data;
    },
};
