export interface MockUser {
    email: string;
    password: string;
}

export interface DatosRegistro {
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    fechaNacimiento: string;
    carrera: string;
    ciclo: string;
    phoneNumber: string;
    contrasena: string;
    profilePictureUrl?: string;
}

export interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (datos: DatosRegistro) => void;
}
