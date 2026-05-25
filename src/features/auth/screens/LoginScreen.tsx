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

import RegisterModal from '../components/RegisterModal';
import { DatosRegistro } from '../types';
import { authService } from '../services/authService';

export default function LoginScreen() {
    const router = useRouter();

    // --- ESTADOS PARA LOS INPUTS ---
    const [user, setUser] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // --- ESTADOS DEL MODAL DE REGISTRO ---
    const [showModal, setShowModal] = useState<boolean>(false);

    // --- LÓGICA DE LOGIN ---
    const handleLogin = async () => {
        if (!user || !password) {
            Alert.alert(
                "Campos incompletos",
                "Por favor, ingresa tu usuario y contraseña."
            );
            return;
        }

        try {
            await authService.login(user.trim(), password);
            setUser('');
            setPassword('');
            router.push('/tabs/radar');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "El usuario o la contraseña no son correctos.";
            Alert.alert(
                "Acceso Denegado",
                `No se pudo iniciar sesión: ${msg}`,
                [{ text: "Entendido", style: "default" }]
            );
        }
    };

    // --- LÓGICA DE REGISTRO ---
    const handleRegister = async (datos: DatosRegistro) => {
        try {
            const responseData = await authService.registerStudent(datos);
            const usernameGenerated = responseData.user?.username || "generado";
            Alert.alert(
                "¡Éxito!", 
                `Tu cuenta ha sido creada exitosamente.\n\nTu nombre de usuario es: ${usernameGenerated}\n\nPor favor, úsalo para iniciar sesión.`
            );
            setShowModal(false);
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "Error al conectar con el servidor.";
            Alert.alert("Error al Registrar", `No se pudo crear la cuenta: ${msg}`);
        }
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
                            Echo
                        </Text>

                        {/* SUBTÍTULO */}
                        <Text className="text-white/85 text-sm font-medium text-center max-w-[280px] mb-10">
                            Descubre eventos universitarios cerca de ti
                        </Text>

                        {/* FORMULARIO DE ACCESO */}
                        <VStack className="w-full">
                            {/* INPUT USERNAME */}
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
                                    placeholder="Usuario (ej. std12032667)"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    value={user}
                                    onChangeText={setUser}
                                    autoCapitalize="none"
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

                {/* MODAL DE REGISTRO */}
                <RegisterModal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)} 
                    onRegister={handleRegister} 
                />
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}