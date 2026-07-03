import React, { useState, useEffect } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ICONS } from '@/components/icons';
import * as NavigationBar from 'expo-navigation-bar';
import { MotiView } from 'moti';
import OnboardingScreen from './OnboardingScreen';
import ConfirmModal from '@/components/ConfirmModal';

import RegisterModal from '../components/RegisterModal';
import { DatosRegistro } from '../types';
import { authService } from '../services/authService';
import { authStateManager } from '../state';

export default function LoginScreen() {
    const router = useRouter();

    // --- CONFIGURACIÓN DE LA NAV BAR (ANDROID) ---
    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync('#A82BFA').catch(() => { });
            NavigationBar.setButtonStyleAsync('light').catch(() => { });
        }
        return () => {
            if (Platform.OS === 'android') {
                NavigationBar.setBackgroundColorAsync('#131927').catch(() => { });
                NavigationBar.setButtonStyleAsync('light').catch(() => { });
            }
        };
    }, []);

    // --- ESTADOS PARA LOS INPUTS ---
    const [user, setUser] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // --- ESTADOS DEL MODAL DE REGISTRO ---
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

    // --- ESTADO DE ALERTAS PERSONALIZADAS ---
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        type: 'error' | 'success' | 'info';
    }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'info'
    });
    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));
    const showAlert = (title: string, description: string, type: 'error' | 'success' | 'info') => {
        setAlertConfig({ isOpen: true, title, description, type });
    };

    // --- ESTADO PARA ERROR INLINE DE LOGIN ---
    const [loginError, setLoginError] = useState<string | null>(null);

    // --- LÓGICA DE LOGIN ---
    const handleLogin = async () => {
        setLoginError(null);
        if (!user || !password) {
            setLoginError("Por favor, ingresa tu usuario y contraseña.");
            return;
        }

        try {
            const responseData = await authService.login(user.trim(), password);
            const token = responseData.access_token || responseData.token;
            if (token) {
                authStateManager.setSession(token);
            }
            setUser('');
            setPassword('');
            router.replace('/tabs/radar');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            let msg = err.response?.data?.message || err.message || "El usuario o la contraseña no son correctos.";
            
            // Traducir Bad credentials
            if (msg.toLowerCase().includes("bad credentials")) {
                msg = "La contraseña o el usuario ingresados son incorrectos.";
            }
            
            setLoginError(msg);
        }
    };

    // --- LÓGICA DE REGISTRO ---
    const handleRegister = async (datos: DatosRegistro) => {
        try {
            const responseData = await authService.registerStudent(datos);
            const usernameGenerated = responseData.user?.username || "generado";
            showAlert(
                "¡Éxito!",
                `Tu cuenta ha sido creada exitosamente.\n\nTu nombre de usuario es: ${usernameGenerated}\n\nPor favor, úsalo para iniciar sesión.`,
                "success"
            );
            setShowModal(false);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = err.response?.data?.message || err.message || "Error al conectar con el servidor.";
            showAlert("Error al Registrar", `No se pudo crear la cuenta: ${msg}`, "error");
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
                        <MotiView
                            from={{ opacity: 0, scale: 0.8, translateY: -20 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 600, delay: 100 }}
                        >
                            <Box className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6 shadow-xl shadow-black/20">
                                <Icon as={ICONS.radar} className="w-14 h-14 text-uniradar-blue" style={{ color: '#1E3FFF' }} />
                            </Box>
                        </MotiView>

                        {/* TÍTULO PRINCIPAL */}
                        <MotiView
                            from={{ opacity: 0, translateY: 15 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 600, delay: 200 }}
                            className="items-center"
                        >
                            <Text className="text-white text-4xl font-extrabold mb-2 text-center" style={{ fontFamily: 'System' }}>
                                Echo
                            </Text>
                        </MotiView>

                        {/* SUBTÍTULO */}
                        <MotiView
                            from={{ opacity: 0, translateY: 15 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 600, delay: 300 }}
                            className="items-center"
                        >
                            <Text className="text-white/85 text-sm font-medium text-center max-w-[280px] mb-10">
                                Descubre eventos universitarios cerca de ti
                            </Text>
                        </MotiView>

                        {/* FORMULARIO DE ACCESO (CONTROLES INDIVIDUALMENTE ANIMADOS) */}
                        <VStack className="w-full">
                            {/* INPUT USERNAME */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 400 }}
                                className="w-full"
                            >
                                <Input
                                    className="mb-4 h-14 rounded-full px-5 flex-row items-center border-0"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                    }}
                                >
                                    <InputField
                                        className="flex-1 text-base"
                                        style={{ color: '#1E3FFF' }}
                                        placeholder="Usuario"
                                        placeholderTextColor="#6B7280"
                                        value={user}
                                        onChangeText={setUser}
                                        autoCapitalize="none"
                                    />
                                </Input>
                            </MotiView>

                            {/* INPUT PASSWORD */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 500 }}
                                className="w-full"
                            >
                                <Input
                                    className="mb-6 h-14 rounded-full px-5 flex-row items-center justify-between border-0"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                    }}
                                >
                                    <InputField
                                        className="flex-1 text-base pr-2"
                                        style={{ color: '#1E3FFF' }}
                                        placeholder="Contraseña"
                                        placeholderTextColor="#6B7280"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Icon
                                            as={showPassword ? ICONS.eye : ICONS.eyeOff}
                                            className="w-5 h-5"
                                            style={{ color: '#1E3FFF' }}
                                        />
                                    </TouchableOpacity>
                                </Input>
                            </MotiView>

                            {/* ERROR INLINE PARA LOGIN */}
                            {loginError && (
                                <MotiView
                                    from={{ opacity: 0, translateY: -10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ type: 'timing', duration: 300 }}
                                    className="mb-6 bg-rose-500/20 px-4 py-3.5 rounded-2xl flex-row items-center border border-rose-500/30"
                                >
                                    <Icon as={ICONS.AlertCircle} className="w-5 h-5 mr-3" style={{ color: '#FECDD3' }} />
                                    <Text className="text-sm font-medium flex-1" style={{ color: '#FFE4E6' }}>
                                        {loginError}
                                    </Text>
                                </MotiView>
                            )}

                            {/* BOTÓN INICIAR SESIÓN */}
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 600 }}
                                className="w-full"
                            >
                                <Button
                                    className="bg-white w-full h-14 rounded-full items-center justify-center shadow-lg shadow-black/15 active:bg-white/90"
                                    onPress={handleLogin}
                                >
                                    <ButtonText className="text-uniradar-blue font-bold text-base" style={{ color: '#1E3FFF' }}>
                                        Iniciar Sesión
                                    </ButtonText>
                                </Button>
                            </MotiView>
                        </VStack>

                        {/* REGISTRO FOOTER */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 600, delay: 700 }}
                        >
                            <Box className='flex-row items-center justify-center mt-8'>
                                <Text className='mr-1.5 text-white/80 text-sm font-medium'>¿No tienes cuenta?</Text>
                                <TouchableOpacity onPress={() => setShowModal(true)}>
                                    <Text className='text-white font-extrabold text-sm underline decoration-white'>
                                        Regístrate
                                    </Text>
                                </TouchableOpacity>
                            </Box>
                        </MotiView>

                        {/* BOTÓN VER TUTORIAL EN LOGIN */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 600, delay: 800 }}
                        >
                            <TouchableOpacity
                                onPress={() => setIsOnboardingOpen(true)}
                                className="flex-row items-center justify-center mt-6 px-5 py-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                            >
                                <Icon as={ICONS.bookOpen} className="text-white w-4 h-4 mr-2" style={{ color: '#FFFFFF' }} />
                                <Text className="text-white text-sm font-semibold">
                                    Ver tutorial de bienvenida
                                </Text>
                            </TouchableOpacity>
                        </MotiView>

                    </Box>
                </ScrollView>

                {/* MODAL DE REGISTRO */}
                <RegisterModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onRegister={handleRegister}
                />

                {/* MODAL DEL TUTORIAL DE BIENVENIDA */}
                <Modal
                    visible={isOnboardingOpen}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsOnboardingOpen(false)}
                >
                    <OnboardingScreen onFinish={() => setIsOnboardingOpen(false)} isModal={false} />
                </Modal>

                {/* MODAL DE ALERTAS */}
                <ConfirmModal
                    isOpen={alertConfig.isOpen}
                    onClose={closeAlert}
                    onConfirm={closeAlert}
                    title={alertConfig.title}
                    description={alertConfig.description}
                    confirmLabel="Entendido"
                    hideCancel={true}
                    icon={
                        alertConfig.type === 'error' ? ICONS.AlertCircle : 
                        alertConfig.type === 'success' ? ICONS.CheckCircle : ICONS.AlertCircle
                    }
                    iconColor={
                        alertConfig.type === 'error' ? '#EF4444' : 
                        alertConfig.type === 'success' ? '#10B981' : '#3B82F6'
                    }
                    confirmColor={
                        alertConfig.type === 'error' ? '#EF4444' : 
                        alertConfig.type === 'success' ? '#10B981' : '#3B82F6'
                    }
                />
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}