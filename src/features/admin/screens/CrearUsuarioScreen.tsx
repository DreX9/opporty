import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, DimensionValue } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ICONS } from '@/components/icons';
import { useRouter } from 'expo-router';

import { ESTADO_INICIAL_USUARIO, ROLES } from '../constants';
import { FormCrearUsuario, Rol } from '../types';

export default function CrearUsuarioScreen() {
    const router = useRouter();
    const [form, setForm] = useState<FormCrearUsuario>(ESTADO_INICIAL_USUARIO);
    const [pasoActual, setPasoActual] = useState(1);
    const totalPasos = 3;

    const actualizarCampo = (clave: keyof FormCrearUsuario) => (valor: string | Rol) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    // Validaciones
    const errores = {
        nombre: form.nombre.trim().length < 3,
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
        password: form.password.length < 6,
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

    const progresoWidth = `${(pasoActual / totalPasos) * 100}%` as DimensionValue;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                className="flex-1 bg-[#F4F4FB]"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* 📊 BARRA DE PROGRESO */}
                <VStack className="mb-6">
                    <HStack className="justify-between items-center mb-2">
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            Paso {pasoActual} de {totalPasos}
                        </Text>
                        <Text className="text-indigo-600 text-xs font-extrabold tracking-widest uppercase">
                            {pasoActual === 1 ? 'Perfil Básico' : pasoActual === 2 ? 'Roles' : 'Confirmación'}
                        </Text>
                    </HStack>
                    <Box className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <Box className="h-full bg-indigo-600" style={{ width: progresoWidth }} />
                    </Box>
                </VStack>

                {/* ========================================================
            PASO 1: PERFIL BÁSICO Y PERSONALIZACIÓN
           ======================================================== */}
                {pasoActual === 1 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Información de Cuenta</Text>

                        {/* Campo Nombre */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.user} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Nombre Completo *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Ej: Sofia Rivera"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.nombre}
                                    onChangeText={actualizarCampo('nombre')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Correo */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Mail} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Correo Electrónico *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="sofia@test.com"
                                    className="text-[#111827] placeholder:text-gray-400"
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
                                <Icon as={ICONS.lock} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Contraseña *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Mínimo 6 caracteres"
                                    className="text-[#111827] placeholder:text-gray-400"
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
                                <Icon as={ICONS.GraduationCap} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Facultad *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Ej: Ingeniería"
                                    className="text-[#111827] placeholder:text-gray-400"
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
                        <Text className="text-[#111827] text-lg font-bold mb-1">Roles</Text>

                        {/* Selector de Rol */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Rol de Acceso *</Text>
                            </HStack>

                            {/* Contenedor en fila con flex-wrap para crear la cuadrícula 2x2 */}
                            <HStack className="flex-wrap justify-between" style={{ gap: 12 }}>
                                {ROLES.map((rol) => {
                                    const activo = form.rol === rol;
                                    return (
                                        <TouchableOpacity
                                            key={rol}
                                            onPress={() => actualizarCampo('rol')(rol)}
                                            style={{ width: '48%' }}
                                            className={`py-3 rounded-xl border items-center justify-center mb-1 ${activo ? 'bg-indigo-50 border-indigo-600/30' : 'bg-white border-[#E9EAF4]'
                                                }`}
                                        >
                                            <Text className={`text-sm font-bold ${activo ? 'text-indigo-600' : 'text-gray-500'}`}>
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
                        <Text className="text-[#111827] text-lg font-bold mb-1">Confirmación de Registro</Text>

                        {/* Resumen Card */}
                        <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-5 items-center mb-6">
                            <Text className="text-[#111827] text-xl font-bold">Nombre: {form.nombre}</Text>
                            <Text className="text-gray-500 text-sm mt-1">Email: {form.email}</Text>
                            <Text className="text-gray-500 text-sm mt-1">Facultad: {form.facultad}</Text>
                            <Text className="text-gray-500 text-sm mt-1">Cargo: {form.cargo}</Text>
                            <HStack className="mt-4" style={{ gap: 8 }}>
                                <Box className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                                    <Text className="text-indigo-600 text-2xs font-extrabold uppercase tracking-wider">
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
                        className="flex-1 h-14 rounded-2xl border-[#E9EAF4] bg-white"
                    >
                        <ButtonText className="text-gray-600 font-bold uppercase tracking-wider">
                            {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
                        </ButtonText>
                    </Button>

                    <Button
                        onPress={pasoSiguiente}
                        className="flex-1 h-14 rounded-2xl bg-indigo-600"
                    >
                        <ButtonText className="text-white font-extrabold uppercase tracking-wider">
                            {pasoActual === totalPasos ? 'Crear' : 'Siguiente'}
                        </ButtonText>
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
