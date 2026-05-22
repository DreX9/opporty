import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ICONS } from '@/components/icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EMOJIS = ['👨🏻‍💻', '👩‍💻', '👑', '🧑‍🎓', '🧑‍💻', '🤖', '🚀', '✨'] as const;
const ESTADO_INICIAL = {
    nombre: '',
    email: '',
    password: '',
    facultad: '',
    rol: 'Usuario' as 'Usuario' | 'Admin' | 'Organizador' | 'Moderador',
    departamento: '',
    cargo: ''
};

export default function CrearUsuario() {
    const router = useRouter();
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [pasoActual, setPasoActual] = useState(1);
    const totalPasos = 3;

    const actualizarCampo = (clave: keyof typeof ESTADO_INICIAL) => (valor: string | boolean) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    // Validaciones
    const errores = {
        nombre: form.nombre.trim().length < 3,
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
        password: form.password.length < 6,
    };
    const ROLES = ['Usuario', 'Admin', 'Organizador', 'Moderador'] as const;
    type Rol = (typeof ROLES)[number];

    const pasoSiguiente = () => {
        if (pasoActual === 1) {
            if (errores.nombre) {
                Alert.alert('⚠️ Nombre inválido', 'El nombre debe tener al menos 3 caracteres.');
                return;
            }
            if (errores.email) {
                Alert.alert('⚠️ Correo inválido', 'Por favor ingresa un correo electrónico válido.');
                return;
            }
        } else if (pasoActual === 2) {
            if (errores.password) {
                Alert.alert('⚠️ Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
                return;
            }
        }

        if (pasoActual < totalPasos) {
            setPasoActual(prev => prev + 1);
        } else {
            ejecutarCreacion();
        }
    };

    const pasoAnterior = () => {
        if (pasoActual > 1) {
            setPasoActual(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const ejecutarCreacion = () => {
        Alert.alert('👑 ¡Usuario creado!', `La cuenta para "${form.nombre}" ha sido creada exitosamente.`, [
            { text: 'Listo', onPress: () => router.replace('/tabs/admin') }
        ]);
    };

    const progresoWidth = `${(pasoActual / totalPasos) * 100}%` as any;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                className="flex-1 bg-[#070B17]"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* 📊 BARRA DE PROGRESO */}
                <VStack className="mb-6">
                    <HStack className="justify-between items-center mb-2">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            Paso {pasoActual} de {totalPasos}
                        </Text>
                        <Text className="text-cyan-400 text-xs font-extrabold tracking-widest uppercase">
                            {pasoActual === 1 ? 'Perfil Básico' : pasoActual === 2 ? 'Roles' : 'Confirmación'}
                        </Text>
                    </HStack>
                    <Box className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <Box className="h-full bg-cyan-400" style={{ width: progresoWidth }} />
                    </Box>
                </VStack>

                {/* ========================================================
            PASO 1: PERFIL BÁSICO Y PERSONALIZACIÓN
           ======================================================== */}
                {pasoActual === 1 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Información de Cuenta</Text>

                        {/* Campo Nombre */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.user} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Nombre Completo *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Ej: Sofia Rivera"
                                    className="text-white placeholder:text-gray-500"
                                    value={form.nombre}
                                    onChangeText={actualizarCampo('nombre')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Correo */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Mail} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Correo Electrónico *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="sofia@test.com"
                                    className="text-white placeholder:text-gray-500"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={form.email}
                                    onChangeText={actualizarCampo('email')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Contraseña */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.lock} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Contraseña *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Mínimo 6 caracteres"
                                    className="text-white placeholder:text-gray-500"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={form.password}
                                    onChangeText={actualizarCampo('password')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Facultad */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.GraduationCap} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Facultad *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Ej: Ingeniería"
                                    className="text-white placeholder:text-gray-500"
                                    value={form.facultad}
                                    onChangeText={actualizarCampo('facultad')}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
            PASO 2: PRIVILEGIOS Y SEGURIDAD
           ======================================================== */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Roles</Text>

                        {/* Selector de Rol */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Rol de Acceso *</Text>
                            </HStack>

                            {/* Contenedor en fila con flex-wrap para crear la cuadrícula 2x2 */}
                            <HStack className="flex-wrap justify-between" style={{ gap: 12 }}>
                                {ROLES.map((rol) => {
                                    const activo = form.rol === rol;
                                    return (
                                        <TouchableOpacity
                                            key={rol}
                                            onPress={() => actualizarCampo('rol')(rol)}
                                            style={{ width: '48%' }} // <--- Controla que entren exactamente 2 por fila
                                            className={`py-3 rounded-xl border items-center justify-center mb-1 ${activo ? 'bg-cyan-400/10 border-cyan-400' : 'bg-[#0D1324] border-white/10'
                                                }`}
                                        >
                                            <Text className={`text-sm font-bold ${activo ? 'text-cyan-400' : 'text-gray-400'}`}>
                                                {rol}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
            PASO 3: CONFIRMACIÓN Y ESTADO DE CUENTA
           ======================================================== */}
                {pasoActual === 3 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Confirmación de Registro</Text>

                        {/* Resumen Card */}
                        <Box className="w-full bg-[#0D1324] border border-white/5 rounded-2xl p-5 items-center mb-6">
                            <Text className="text-white text-xl font-bold">Nombre: {form.nombre}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Email: {form.email}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Facultad: {form.facultad}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Cargo: {form.cargo}</Text>
                            <HStack className="mt-4" style={{ gap: 8 }}>
                                <Box className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                                    <Text className="text-cyan-400 text-2xs font-extrabold uppercase tracking-wider">
                                        {form.rol}
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>
                    </VStack>
                )}

                {/* 🔘 BOTONES DE NAVEGACIÓN INFERIOR */}
                <HStack className="justify-between items-center mt-8" style={{ gap: 12 }}>
                    <Button
                        onPress={pasoAnterior}
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl border-white/10"
                    >
                        <ButtonText className="text-gray-300 font-bold uppercase tracking-wider">
                            {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
                        </ButtonText>
                    </Button>

                    <Button
                        onPress={pasoSiguiente}
                        className="flex-1 h-14 rounded-2xl bg-cyan-400"
                    >
                        <ButtonText className="text-[#070B17] font-extrabold uppercase tracking-wider">
                            {pasoActual === totalPasos ? 'Crear' : 'Siguiente'}
                        </ButtonText>
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
