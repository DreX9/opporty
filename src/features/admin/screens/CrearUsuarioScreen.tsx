import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    DimensionValue,
    ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import DropdownSelect from '@/components/DropdownSelect';
import { ICONS } from '@/components/icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ESTADO_INICIAL_DOCENTE, TEACHER_STATUS_OPTIONS } from '../constants';
import { TeacherFormData, TeacherStatus, BackendRole, TeacherRegisterResponse } from '../types';
import { adminService } from '../services/adminService';


export const LISTA_ESPECIALIDADES = [
    'Ingeniería de Software',
    'Inteligencia Artificial',
    'Ciencia de Datos',
    'Seguridad de la Información',
    'Redes y Conectividad',
    'Matemática Aplicada',
    'Física General',
    'Algoritmos y Estructuras de Datos',
    'Diseño UX/UI',
    'Gestión de Proyectos',
    'Administración de Empresas',
    'Derecho Corporativo',
    'Medicina Humana',
    'Psicología Clínica',
    'Otro (Escribir manualmente)'
];

const TOTAL_PASOS = 4;

export default function CrearUsuarioScreen() {
    const router = useRouter();
    const [form, setForm] = useState<TeacherFormData>(ESTADO_INICIAL_DOCENTE);
    const [pasoActual, setPasoActual] = useState(1);
    const [roles, setRoles] = useState<BackendRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [registeredTeacher, setRegisteredTeacher] = useState<TeacherRegisterResponse | null>(null);
    const [selectedSpecialtyOption, setSelectedSpecialtyOption] = useState<string>('');

    // Sincronizar el dropdown con el valor real de la especialidad (por si se navega o se limpia el form)
    useEffect(() => {
        if (!form.specialty) {
            setSelectedSpecialtyOption('');
        } else if (LISTA_ESPECIALIDADES.includes(form.specialty)) {
            setSelectedSpecialtyOption(form.specialty);
        } else {
            setSelectedSpecialtyOption('Otro (Escribir manualmente)');
        }
    }, [form.specialty]);

    const getGeneratedUsername = () => {
        const hasDni = form.dni.length === 8;
        const hasDate = form.birthDate.length === 10;
        const dd = hasDate ? form.birthDate.substring(0, 2) : 'DD';
        const mm = hasDate ? form.birthDate.substring(3, 5) : 'MM';
        const yy = hasDate ? form.birthDate.substring(8, 10) : 'YY';
        const xx = hasDni ? form.dni.substring(6, 8) : 'XX';
        return `mr${dd}${mm}${yy}${xx}`;
    };


    // Pickers de fecha
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showHiringDatePicker, setShowHiringDatePicker] = useState(false);
    const [birthDateValue, setBirthDateValue] = useState(new Date());
    const [hiringDateValue, setHiringDateValue] = useState(new Date());

    // Cargar roles dinámicamente desde el backend
    useEffect(() => {
        adminService
            .fetchRoles()
            .then((data) => setRoles(data))
            .catch(() =>
                Alert.alert('Error', 'No se pudieron cargar los roles del sistema.')
            )
            .finally(() => setLoadingRoles(false));
    }, []);

    const actualizarCampo =
        <K extends keyof TeacherFormData>(clave: K) =>
        (valor: TeacherFormData[K]) => {
            setForm((prev) => ({ ...prev, [clave]: valor }));
        };

    const handleSpecialtyChange = (val: string) => {
        setSelectedSpecialtyOption(val);
        if (val === 'Otro (Escribir manualmente)') {
            actualizarCampo('specialty')('');
        } else {
            actualizarCampo('specialty')(val);
        }
    };

    // ── Handlers de fechas ──────────────────────────────────────────────────
    const onBirthDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowBirthDatePicker(false);
        if (selectedDate) {
            setBirthDateValue(selectedDate);
            const d = selectedDate.getDate().toString().padStart(2, '0');
            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const y = selectedDate.getFullYear();
            actualizarCampo('birthDate')(`${d}/${m}/${y}`);
        }
    };

    const onHiringDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowHiringDatePicker(false);
        if (selectedDate) {
            setHiringDateValue(selectedDate);
            const d = selectedDate.getDate().toString().padStart(2, '0');
            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const y = selectedDate.getFullYear();
            actualizarCampo('hiringDate')(`${d}/${m}/${y}`);
        }
    };

    // ── Validaciones por paso ───────────────────────────────────────────────
    const validarPaso1 = (): string | null => {
        if (form.firstName.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
        if (form.lastName.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres.';
        if (!/^\d{8}$/.test(form.dni)) return 'El DNI debe tener exactamente 8 dígitos.';
        if (!form.birthDate) return 'La fecha de nacimiento es obligatoria.';
        if (form.phoneNumber && !/^\d{9}$/.test(form.phoneNumber))
            return 'El teléfono debe tener exactamente 9 dígitos.';
        return null;
    };

    const validarPaso2 = (): string | null => {
        if (!form.status) return 'El estado del docente es obligatorio.';
        return null;
    };

    const validarPaso3 = (): string | null => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return 'Por favor ingresa un correo electrónico válido.';
        if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
        if (form.roleId === null) return 'Debes seleccionar un rol para el docente.';
        return null;
    };

    const pasoSiguiente = () => {
        let error: string | null = null;
        if (pasoActual === 1) error = validarPaso1();
        else if (pasoActual === 2) error = validarPaso2();
        else if (pasoActual === 3) error = validarPaso3();

        if (error) {
            Alert.alert('⚠️ Campo inválido', error);
            return;
        }

        if (pasoActual < TOTAL_PASOS) {
            setPasoActual((prev) => prev + 1);
        } else {
            ejecutarRegistro();
        }
    };

    const pasoAnterior = () => {
        if (pasoActual > 1) {
            setPasoActual((prev) => prev - 1);
        } else {
            router.back();
        }
    };

    const ejecutarRegistro = async () => {
        setSubmitting(true);
        try {
            const res = await adminService.registerTeacher(form);
            setRegisteredTeacher(res);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Error desconocido al registrar el docente.';
            Alert.alert('❌ Error', message);
        } finally {
            setSubmitting(false);
        }
    };


    const progresoWidth = `${(pasoActual / TOTAL_PASOS) * 100}%` as DimensionValue;

    const rolSeleccionado = roles.find((r) => r.id === form.roleId);

    if (registeredTeacher) {
        const copyToClipboard = async () => {
            const username = registeredTeacher.user?.username || '';
            if (username) {
                await Clipboard.setStringAsync(username);
                Alert.alert('¡Copiado! 📋', 'El nombre de usuario ha sido copiado al portapapeles.');
            }
        };

        return (
            <ScrollView
                className="flex-1 bg-[#F4F4FB]"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40, justifyContent: 'center', alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Ícono de éxito */}
                <Box className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-6 border border-green-100">
                    <Icon as={ICONS.CheckCircle} className="text-green-600 w-10 h-10" style={{ color: '#10B981' }} />
                </Box>

                <Text className="text-[#111827] text-2xl font-black text-center mb-2">¡Docente Registrado!</Text>
                <Text className="text-gray-500 text-sm text-center mb-8 px-4">
                    La cuenta para el docente ha sido creada correctamente en el sistema.
                </Text>

                {/* Tarjeta destacada para el Username/Código */}
                <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-6 mb-6 shadow-sm">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider text-center mb-1">
                        Nombre de Usuario / Código Generado
                    </Text>
                    <Text className="text-indigo-600 text-2xl font-black text-center mb-4 tracking-wide">
                        {registeredTeacher.user?.username || 'mrXXXXXX'}
                    </Text>

                    <TouchableOpacity
                        onPress={copyToClipboard}
                        className="bg-indigo-600 h-12 rounded-xl flex-row items-center justify-center gap-2 active:bg-indigo-700"
                        accessibilityLabel="Copiar código generado"
                        accessibilityRole="button"
                        style={{ backgroundColor: '#6366F1' }}
                    >
                        <Icon as={ICONS.Copy} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                        <Text className="text-white font-bold text-sm">Copiar al Portapapeles</Text>
                    </TouchableOpacity>
                </Box>

                {/* Resumen final */}
                <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-5 mb-8">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                        Detalles del Registro
                    </Text>
                    
                    <HStack className="justify-between py-2 border-b border-gray-100" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-gray-500 text-xs font-bold uppercase">Nombre completo</Text>
                        <Text className="text-[#111827] text-sm font-bold">
                            {registeredTeacher.nombres} {registeredTeacher.apellidos}
                        </Text>
                    </HStack>
                    
                    <HStack className="justify-between py-2 border-b border-gray-100" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-gray-500 text-xs font-bold uppercase">DNI</Text>
                        <Text className="text-gray-800 text-sm font-semibold">{registeredTeacher.dni}</Text>
                    </HStack>

                    <HStack className="justify-between py-2 border-b border-gray-100" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-gray-500 text-xs font-bold uppercase">Correo</Text>
                        <Text className="text-gray-800 text-sm font-semibold">{registeredTeacher.user?.email}</Text>
                    </HStack>

                    <HStack className="justify-between py-2" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-gray-500 text-xs font-bold uppercase">Rol asignado</Text>
                        <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wider">
                            {registeredTeacher.user?.role?.name || 'Docente'}
                        </Text>
                    </HStack>
                </Box>

                {/* Botón de confirmación final */}
                <Button
                    onPress={() => router.replace('/tabs/admin')}
                    className="w-full h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20"
                    style={{ backgroundColor: '#6366F1' }}
                >
                    <ButtonText className="text-white font-extrabold uppercase tracking-wider">
                        Volver a Administración
                    </ButtonText>
                </Button>
            </ScrollView>
        );
    }

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
                {/* ── BARRA DE PROGRESO ─────────────────────────────────── */}
                <VStack className="mb-6">
                    <HStack className="justify-between items-center mb-2">
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            Paso {pasoActual} de {TOTAL_PASOS}
                        </Text>
                        <Text className="text-indigo-600 text-xs font-extrabold tracking-widest uppercase">
                            {pasoActual === 1
                                ? 'Datos Personales'
                                : pasoActual === 2
                                ? 'Datos Profesionales'
                                : pasoActual === 3
                                ? 'Cuenta y Rol'
                                : 'Confirmación'}
                        </Text>
                    </HStack>
                    <Box className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <Box className="h-full bg-indigo-600" style={{ width: progresoWidth }} />
                    </Box>
                </VStack>

                {/* ══════════════════════════════════════════════════════════
                    PASO 1: DATOS PERSONALES
                ══════════════════════════════════════════════════════════ */}
                {pasoActual === 1 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Datos Personales</Text>

                        {/* Nombres */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.user} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Nombres *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="Ej: Juan Carlos"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.firstName}
                                    onChangeText={actualizarCampo('firstName')}
                                />
                            </Input>
                        </VStack>

                        {/* Apellidos */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.user} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Apellidos *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="Ej: Pérez Rodríguez"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.lastName}
                                    onChangeText={actualizarCampo('lastName')}
                                />
                            </Input>
                        </VStack>

                        {/* DNI */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.FileText} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">DNI * (8 dígitos)</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="12345678"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    keyboardType="numeric"
                                    maxLength={8}
                                    value={form.dni}
                                    onChangeText={(v) => actualizarCampo('dni')(v.replace(/[^0-9]/g, ''))}
                                />
                            </Input>
                        </VStack>

                        {/* Fecha de Nacimiento */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Fecha de Nacimiento *</Text>
                            </HStack>
                            <TouchableOpacity
                                onPress={() => setShowBirthDatePicker(true)}
                                className="h-12 rounded-xl bg-white border border-[#E9EAF4] px-4 justify-center"
                            >
                                <Text className={form.birthDate ? 'text-[#111827]' : 'text-gray-400'}>
                                    {form.birthDate || 'Seleccionar fecha'}
                                </Text>
                            </TouchableOpacity>
                            {showBirthDatePicker && (
                                <DateTimePicker
                                    value={birthDateValue}
                                    mode="date"
                                    display="default"
                                    onChange={onBirthDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </VStack>

                        {/* Teléfono (opcional) */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Phone} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Teléfono (opcional, 9 dígitos)</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="987654321"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    keyboardType="phone-pad"
                                    maxLength={9}
                                    value={form.phoneNumber}
                                    onChangeText={(v) => actualizarCampo('phoneNumber')(v.replace(/[^0-9]/g, ''))}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PASO 2: DATOS PROFESIONALES
                ══════════════════════════════════════════════════════════ */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Datos Profesionales</Text>

                        {/* Título */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.GraduationCap} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Título Académico</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="Ej: Magíster en Ingeniería"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.title}
                                    onChangeText={actualizarCampo('title')}
                                />
                            </Input>
                        </VStack>

                        {/* Especialidad */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Laptop} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Especialidad</Text>
                            </HStack>
                            <DropdownSelect
                                selectedValue={selectedSpecialtyOption}
                                onValueChange={handleSpecialtyChange}
                                options={LISTA_ESPECIALIDADES}
                                placeholder="Seleccionar especialidad..."
                                style={{ height: 48, borderRadius: 12, backgroundColor: '#FFFFFF', borderColor: '#E9EAF4', borderWidth: 1 }}
                                textStyle={{ fontSize: 14 }}
                            />
                        </VStack>

                        {/* Entrada personalizada libre si seleccionó 'Otro' */}
                        {selectedSpecialtyOption === 'Otro (Escribir manualmente)' && (
                            <VStack space="xs" className="mb-3">
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Type} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Escribir Especialidad *</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                    <InputField
                                        placeholder="Escribe tu especialidad aquí..."
                                        className="text-[#111827] placeholder:text-gray-400"
                                        value={form.specialty}
                                        onChangeText={actualizarCampo('specialty')}
                                    />
                                </Input>
                            </VStack>
                        )}

                        {/* Biografía */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.AlignLeft} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Biografía</Text>
                            </HStack>
                            <Input className="rounded-xl bg-white border-[#E9EAF4]" style={{ minHeight: 80 }}>
                                <InputField
                                    placeholder="Breve descripción del docente..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    multiline
                                    numberOfLines={3}
                                    value={form.biography}
                                    onChangeText={actualizarCampo('biography')}
                                    style={{ textAlignVertical: 'top', paddingTop: 8 }}
                                />
                            </Input>
                        </VStack>

                        {/* Fecha de Contratación */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Fecha de Contratación</Text>
                            </HStack>
                            <TouchableOpacity
                                onPress={() => setShowHiringDatePicker(true)}
                                className="h-12 rounded-xl bg-white border border-[#E9EAF4] px-4 justify-center"
                            >
                                <Text className={form.hiringDate ? 'text-[#111827]' : 'text-gray-400'}>
                                    {form.hiringDate || 'Seleccionar fecha'}
                                </Text>
                            </TouchableOpacity>
                            {showHiringDatePicker && (
                                <DateTimePicker
                                    value={hiringDateValue}
                                    mode="date"
                                    display="default"
                                    onChange={onHiringDateChange}
                                />
                            )}
                        </VStack>

                        {/* Estado */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Estado *</Text>
                            </HStack>
                            <HStack style={{ gap: 12 }}>
                                {TEACHER_STATUS_OPTIONS.map((statusOption) => {
                                    const activo = form.status === statusOption;
                                    return (
                                        <TouchableOpacity
                                            key={statusOption}
                                            onPress={() => actualizarCampo('status')(statusOption as TeacherStatus)}
                                            style={{ flex: 1 }}
                                            className={`py-3 rounded-xl border items-center justify-center ${
                                                activo ? 'bg-indigo-50 border-indigo-600/30' : 'bg-white border-[#E9EAF4]'
                                            }`}
                                        >
                                            <Text className={`text-sm font-bold ${activo ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {statusOption === 'ACTIVE' ? '✅ Activo' : '🔴 Inactivo'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
                        </VStack>
                    </VStack>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PASO 3: CUENTA Y ROL
                ══════════════════════════════════════════════════════════ */}
                {pasoActual === 3 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Cuenta y Rol</Text>

                        {/* Email */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Mail} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Correo Electrónico *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="docente@universidad.edu"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={form.email}
                                    onChangeText={actualizarCampo('email')}
                                />
                            </Input>
                        </VStack>

                        {/* Contraseña */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.lock} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Contraseña * (mín. 6 caracteres)</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4]">
                                <InputField
                                    placeholder="Contraseña segura"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={form.password}
                                    onChangeText={actualizarCampo('password')}
                                />
                            </Input>
                        </VStack>

                        {/* Selector de Rol (dinámico desde el backend) */}
                        <VStack space="xs" className="mb-3">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Rol de Acceso *</Text>
                            </HStack>

                            {loadingRoles ? (
                                <Box className="items-center py-4">
                                    <ActivityIndicator color="#6366F1" />
                                    <Text className="text-gray-400 text-xs mt-2">Cargando roles...</Text>
                                </Box>
                            ) : (
                                <HStack className="flex-wrap justify-between" style={{ gap: 10 }}>
                                    {roles.map((rol) => {
                                        const activo = form.roleId === rol.id;
                                        return (
                                            <TouchableOpacity
                                                key={rol.id}
                                                onPress={() => actualizarCampo('roleId')(rol.id)}
                                                style={{ width: '48%' }}
                                                className={`py-3 rounded-xl border items-center justify-center mb-1 ${
                                                    activo ? 'bg-indigo-50 border-indigo-600/30' : 'bg-white border-[#E9EAF4]'
                                                }`}
                                            >
                                                <Text className={`text-sm font-bold ${activo ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                    {rol.name}
                                                </Text>
                                                {rol.description ? (
                                                    <Text className="text-gray-400 text-xs mt-0.5 text-center px-1">
                                                        {rol.description}
                                                    </Text>
                                                ) : null}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </HStack>
                            )}
                        </VStack>
                    </VStack>
                )}

                {/* ══════════════════════════════════════════════════════════
                    PASO 4: CONFIRMACIÓN Y RESUMEN
                ══════════════════════════════════════════════════════════ */}
                {pasoActual === 4 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Confirmación de Registro</Text>

                        <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-5 mb-4">
                            <Text className="text-indigo-600 text-xs font-extrabold uppercase tracking-widest mb-3">
                                Datos Personales
                            </Text>
                            <Text className="text-[#111827] text-base font-bold">
                                {form.firstName} {form.lastName}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">DNI: {form.dni}</Text>
                            <Text className="text-gray-500 text-sm">Nacimiento: {form.birthDate}</Text>
                            {form.phoneNumber ? (
                                <Text className="text-gray-500 text-sm">Teléfono: {form.phoneNumber}</Text>
                            ) : null}
                        </Box>

                        <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-5 mb-4">
                            <Text className="text-indigo-600 text-xs font-extrabold uppercase tracking-widest mb-3">
                                Datos Profesionales
                            </Text>
                            {form.title ? <Text className="text-gray-600 text-sm">Título: {form.title}</Text> : null}
                            {form.specialty ? <Text className="text-gray-600 text-sm">Especialidad: {form.specialty}</Text> : null}
                            {form.hiringDate ? <Text className="text-gray-600 text-sm">Contratación: {form.hiringDate}</Text> : null}
                            <HStack className="mt-2" style={{ gap: 8 }}>
                                <Box
                                    className={`px-3 py-1 rounded-full border ${
                                        form.status === 'ACTIVE'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-extrabold uppercase tracking-wider ${
                                            form.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {form.status}
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                        <Box className="w-full bg-white border border-[#E9EAF4] rounded-2xl p-5 mb-4">
                            <Text className="text-indigo-600 text-xs font-extrabold uppercase tracking-widest mb-3">
                                Cuenta
                            </Text>
                            <Text className="text-gray-600 text-sm">Email: {form.email}</Text>
                            <Text className="text-gray-500 text-xs font-semibold mt-2">
                                NOMBRE DE USUARIO SUGERIDO:
                            </Text>
                            <Text className="text-[#111827] text-sm font-bold mt-0.5">
                                {getGeneratedUsername()}
                            </Text>
                            <HStack className="mt-3" style={{ gap: 8 }}>
                                <Box className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                                    <Text className="text-indigo-600 text-xs font-extrabold uppercase tracking-wider">
                                        {rolSeleccionado?.name ?? 'Sin rol'}
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                    </VStack>
                )}

                {/* ── BOTONES DE NAVEGACIÓN ─────────────────────────────── */}
                <HStack className="justify-between items-center mt-8" style={{ gap: 12 }}>
                    <Button
                        onPress={pasoAnterior}
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl border-[#E9EAF4] bg-white"
                        isDisabled={submitting}
                    >
                        <ButtonText className="text-gray-600 font-bold uppercase tracking-wider">
                            {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
                        </ButtonText>
                    </Button>

                    <Button
                        onPress={pasoSiguiente}
                        className="flex-1 h-14 rounded-2xl bg-indigo-600"
                        isDisabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ButtonText className="text-white font-extrabold uppercase tracking-wider">
                                {pasoActual === TOTAL_PASOS ? 'Registrar' : 'Siguiente'}
                            </ButtonText>
                        )}
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
