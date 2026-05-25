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
    universidad: string;
    carrera: string;
    ciclo: string;
    contrasena: string;
}

export interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (datos: DatosRegistro) => void;
}
