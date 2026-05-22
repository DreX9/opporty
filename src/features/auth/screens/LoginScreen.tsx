import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ICONS } from '@/components/icons';

// Modal
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter
} from '@/components/ui/modal';

interface MockUser {
    email: string;
    password: string;
}

const MOCK_USERS: MockUser[] = [
    { email: 'admin@admin.com', password: '123' },
    { email: 'alex@test.com', password: 'password' }
];

const LoginScreen = () => {
    const router = useRouter();

    // --- ESTADOS PARA LOS INPUTS ---
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // --- ESTADOS DEL MODAL DE REGISTRO ---
    const [showModal, setShowModal] = useState<boolean>(false);
    const [regName, setRegName] = useState<string>('');
    const [regLastName, setRegLastName] = useState<string>('');
    const [regEmail, setRegEmail] = useState<string>('');
    const [regPassword, setRegPassword] = useState<string>('');

    // --- LÓGICA DE LOGIN ---
    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert(
                "Campos incompletos",
                "Por favor, ingresa tu usuario y contraseña."
            );
            return;
        }

        const userFound = MOCK_USERS.find(
            (u) => u.email === email.trim().toLowerCase() && u.password === password
        );

        if (userFound) {
            setEmail('');
            setPassword('');
            router.push('/tabs/radar');
        } else {
            Alert.alert(
                "Acceso Denegado",
                "El usuario o la contraseña no son correctos. Por favor, verifica tus datos e inténtalo de nuevo.",
                [{ text: "Entendido", style: "default" }]
            );
        }
    };

    // --- LÓGICA DE REGISTRO ---
    const handleRegister = () => {
        if (!regName || !regLastName || !regEmail || !regPassword) {
            Alert.alert("Campos incompletos", "Por favor, llena todos los datos para crear tu cuenta.");
            return;
        }
        Alert.alert("¡Éxito!", `La cuenta para ${regName} ha sido creada.`);
        setShowModal(false);

        setRegName('');
        setRegLastName('');
        setRegEmail('');
        setRegPassword('');
    };

    return (
        <LinearGradient
            colors={['#1E3FFF', '#A82BFA']}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 28,
                        paddingVertical: 50
                    }}
                >
                    <Box className="w-full max-w-[400px] items-center">
                        
                        {/* 🔵 LOGO CIRCULAR (White circle with blue Radar icon) */}
                        <Box className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6 shadow-xl shadow-black/20">
                            <Icon as={ICONS.radar} className="w-14 h-14 text-uniradar-blue" style={{ color: '#1E3FFF' }} />
                        </Box>

                        {/* TÍTULO PRINCIPAL */}
                        <Text className="text-white text-4xl font-extrabold mb-2 text-center" style={{ fontFamily: 'System' }}>
                            UniRadar
                        </Text>

                        {/* SUBTÍTULO */}
                        <Text className="text-white/85 text-sm font-medium text-center max-w-[280px] mb-10">
                            Descubre eventos universitarios cerca de ti
                        </Text>

                        {/* FORMULARIO DE ACCESO */}
                        <VStack className="w-full">
                            {/* INPUT EMAIL */}
                            <Input 
                                className="mb-4 h-14 rounded-full px-5 flex-row items-center border"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)'
                                }}
                            >
                                <InputField
                                    className="text-white flex-1 text-base"
                                    style={{ color: '#ffffff' }}
                                    placeholder="Correo universitario"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </Input>

                            {/* INPUT PASSWORD */}
                            <Input 
                                className="mb-6 h-14 rounded-full px-5 flex-row items-center justify-between border"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)'
                                }}
                            >
                                <InputField
                                    className="text-white flex-1 text-base pr-2"
                                    style={{ color: '#ffffff' }}
                                    placeholder="Contraseña"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon 
                                        as={showPassword ? ICONS.eye : ICONS.eyeOff} 
                                        className="text-white/60 w-5 h-5" 
                                        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    />
                                </TouchableOpacity>
                            </Input>

                            {/* BOTÓN INICIAR SESIÓN */}
                            <Button 
                                className="bg-white w-full h-14 rounded-full items-center justify-center shadow-lg shadow-black/15 active:bg-white/90"
                                onPress={handleLogin}
                            >
                                <ButtonText className="text-uniradar-blue font-bold text-base" style={{ color: '#1E3FFF' }}>
                                    Iniciar Sesión
                                </ButtonText>
                            </Button>
                        </VStack>

                        {/* REGISTRO FOOTER */}
                        <Box className='flex-row items-center justify-center mt-8'>
                            <Text className='mr-1.5 text-white/80 text-sm font-medium'>¿No tienes cuenta?</Text>
                            <TouchableOpacity onPress={() => setShowModal(true)}>
                                <Text className='text-white font-extrabold text-sm underline decoration-white'>
                                    Regístrate
                                </Text>
                            </TouchableOpacity>
                        </Box>

                    </Box>
                </ScrollView>

                {/* ===================================================
                    MODAL DE REGISTRO
                =================================================== */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    size="md"
                >
                    <ModalBackdrop />
                    <ModalContent className="bg-[#0D1324] border border-white/10 rounded-3xl mx-4">

                        <ModalHeader className="border-b border-white/5 pb-4">
                            <Text className="text-white font-bold text-xl">Crear Nueva Cuenta</Text>
                            <ModalCloseButton>
                                <Icon as={ICONS.X} className="text-gray-400 w-5 h-5" style={{ color: '#9CA3AF' }} />
                            </ModalCloseButton>
                        </ModalHeader>

                        <ModalBody className="pt-4">
                            <ScrollView showsVerticalScrollIndicator={false}>

                                <Box className="mb-4">
                                    <Text className="text-gray-400 mb-2 text-sm">Nombre</Text>
                                    <Input className="h-12 rounded-xl bg-white/5 border border-white/10 px-3">
                                        <InputField 
                                            placeholder="Ej. Alex" 
                                            placeholderTextColor="#6B7280"
                                            value={regName} 
                                            onChangeText={setRegName}
                                            style={{ color: '#ffffff' }}
                                        />
                                    </Input>
                                </Box>

                                <Box className="mb-4">
                                    <Text className="text-gray-400 mb-2 text-sm">Apellido</Text>
                                    <Input className="h-12 rounded-xl bg-white/5 border border-white/10 px-3">
                                        <InputField 
                                            placeholder="Ej. Rivera" 
                                            placeholderTextColor="#6B7280"
                                            value={regLastName} 
                                            onChangeText={setRegLastName}
                                            style={{ color: '#ffffff' }}
                                        />
                                    </Input>
                                </Box>

                                <Box className="mb-4">
                                    <Text className="text-gray-400 mb-2 text-sm">Correo Electrónico</Text>
                                    <Input className="h-12 rounded-xl bg-white/5 border border-white/10 px-3">
                                        <InputField
                                            placeholder="correo@ejemplo.com"
                                            placeholderTextColor="#6B7280"
                                            value={regEmail}
                                            onChangeText={setRegEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            style={{ color: '#ffffff' }}
                                        />
                                    </Input>
                                </Box>

                                <Box className="mb-4">
                                    <Text className="text-gray-400 mb-2 text-sm">Contraseña</Text>
                                    <Input className="h-12 rounded-xl bg-white/5 border border-white/10 px-3">
                                        <InputField
                                            placeholder="Crea una contraseña segura"
                                            placeholderTextColor="#6B7280"
                                            secureTextEntry
                                            value={regPassword}
                                            onChangeText={setRegPassword}
                                            style={{ color: '#ffffff' }}
                                        />
                                    </Input>
                                </Box>

                            </ScrollView>
                        </ModalBody>

                        <ModalFooter className="border-t border-white/5 pt-4">
                            <Button
                                variant="outline"
                                action="secondary"
                                className="mr-3 border-white/10 rounded-xl"
                                onPress={() => setShowModal(false)}
                            >
                                <ButtonText className="text-gray-300">Cancelar</ButtonText>
                            </Button>
                            <Button className="bg-uniradar-blue rounded-xl px-6" style={{ backgroundColor: '#1E3FFF' }} onPress={handleRegister}>
                                <ButtonText className="text-white font-bold">Registrarse</ButtonText>
                            </Button>
                        </ModalFooter>

                    </ModalContent>
                </Modal>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

export default LoginScreen;