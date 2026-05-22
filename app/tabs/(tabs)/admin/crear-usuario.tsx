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
const ROLES = ['Usuario', 'Admin'] as const;

const ESTADO_INICIAL = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'Usuario' as 'Usuario' | 'Admin',
    emoji: '👨🏻‍💻',
    activo: true,
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
        confirmPassword: form.password !== form.confirmPassword,
    };

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
            if (errores.confirmPassword) {
                Alert.alert('⚠️ Contraseña no coincide', 'Las contraseñas ingresadas no son iguales.');
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
                            {pasoActual === 1 ? 'Perfil Básico' : pasoActual === 2 ? 'Seguridad' : 'Confirmación'}
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

                        {/* Selector de Avatar Emoji */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Smile} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Selecciona Avatar *</Text>
                            </HStack>
                            <HStack className="flex-wrap" style={{ gap: 10 }}>
                                {EMOJIS.map((emoji) => {
                                    const activo = form.emoji === emoji;
                                    return (
                                        <TouchableOpacity
                                            key={emoji}
                                            onPress={() => actualizarCampo('emoji')(emoji)}
                                            className={`w-12 h-12 rounded-full items-center justify-center border ${activo ? 'bg-cyan-400/10 border-cyan-400' : 'bg-[#0D1324] border-white/10'}`}
                                        >
                                            <Text className="text-xl">{emoji}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
            PASO 2: PRIVILEGIOS Y SEGURIDAD
           ======================================================== */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Seguridad & Privilegios</Text>

                        {/* Selector de Rol */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Rol de Acceso *</Text>
                            </HStack>
                            <HStack style={{ gap: 12 }}>
                                {ROLES.map((rol) => {
                                    const activo = form.rol === rol;
                                    return (
                                        <TouchableOpacity
                                            key={rol}
                                            onPress={() => actualizarCampo('rol')(rol)}
                                            className={`flex-1 py-3 rounded-xl border items-center justify-center ${activo ? 'bg-cyan-400/10 border-cyan-400' : 'bg-[#0D1324] border-white/10'}`}
                                        >
                                            <Text className={`text-sm font-bold ${activo ? 'text-cyan-400' : 'text-gray-400'}`}>
                                                {rol}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
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

                        {/* Campo Confirmar Contraseña */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.lock} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Confirmar Contraseña *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Repite la contraseña"
                                    className="text-white placeholder:text-gray-500"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={form.confirmPassword}
                                    onChangeText={actualizarCampo('confirmPassword')}
                                />
                            </Input>
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
                            <Box className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 items-center justify-center mb-4">
                                <Text className="text-3xl">{form.emoji}</Text>
                            </Box>
                            <Text className="text-white text-xl font-bold">{form.nombre}</Text>
                            <Text className="text-gray-400 text-sm mt-1">{form.email}</Text>

                            <HStack className="mt-4" style={{ gap: 8 }}>
                                <Box className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                                    <Text className="text-cyan-400 text-2xs font-extrabold uppercase tracking-wider">
                                        {form.rol}
                                    </Text>
                                </Box>
                                <Box className={`px-3 py-1 rounded-full ${form.activo ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                                    <Text className={`text-2xs font-extrabold uppercase tracking-wider ${form.activo ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {form.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                        {/* Switch Activo */}
                        <TouchableOpacity
                            onPress={() => actualizarCampo('activo')(!form.activo)}
                            className="bg-[#0D1324] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between"
                        >
                            <HStack className="items-center" style={{ gap: 10 }}>
                                <Icon as={ICONS.CheckCircle} className={form.activo ? 'text-emerald-400 w-5 h-5' : 'text-gray-500 w-5 h-5'} />
                                <VStack>
                                    <Text className="text-white text-sm font-bold">Activar Cuenta de Inmediato</Text>
                                    <Text className="text-gray-400 text-2xs mt-0.5">El usuario podrá iniciar sesión inmediatamente</Text>
                                </VStack>
                            </HStack>
                            <Icon
                                as={form.activo ? ICONS.ToggleRight : ICONS.ToggleLeft}
                                className={form.activo ? 'text-cyan-400 w-8 h-8' : 'text-gray-500 w-8 h-8'}
                            />
                        </TouchableOpacity>
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
