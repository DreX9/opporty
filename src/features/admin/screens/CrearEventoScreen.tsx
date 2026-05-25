import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, DimensionValue, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ICONS } from '@/components/icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SelectorMapaModal } from '@/components/SelectorMapaModal';

import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem
} from '@/components/ui/select';

import { ESTADO_INICIAL_EVENTO, CATEGORIAS, TIPOS_EVENTO, Categoria } from '../constants';
import { FormCrearEvento } from '../types';

export default function CrearEventoScreen() {
    const router = useRouter();
    const [form, setForm] = useState<FormCrearEvento>(ESTADO_INICIAL_EVENTO);
    const [, setEnviado] = useState(false);
    const [pasoActual, setPasoActual] = useState(1);
    const totalPasos = 4;

    // Estados para Date y Time Pickers
    const [dateValue, setDateValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [modalMapaVisible, setModalMapaVisible] = useState(false);

    const actualizarCampo = (clave: keyof FormCrearEvento) => (valor: string) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    const actualizarCampoNumerico = (clave: keyof FormCrearEvento) => (valor: string) => {
        const soloNumeros = valor.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, [clave]: soloNumeros }));
    };

    const actualizarCampoEdadMinima = (clave: keyof FormCrearEvento) => (valor: string) => {
        const soloNumeros = valor.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, [clave]: soloNumeros }));
    };
    const actualizarRequisitos = (clave: keyof FormCrearEvento) => (valor: string) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };
    const actualizarCampoTexto = (clave: keyof FormCrearEvento) => (valor: string) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            const dia = selectedDate.getDate().toString().padStart(2, '0');
            const mes = selectedDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
            const mesFormateado = mes.charAt(0).toUpperCase() + mes.slice(1);
            setForm(prev => ({ ...prev, fecha: `${dia} ${mesFormateado}` }));
        }
    };

    const onTimeChange = (type: 'inicio' | 'fin') => (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (type === 'inicio') {
            setShowTimePicker(false);
        } else {
            setShowEndTimePicker(false);
        }

        if (selectedDate) {
            setDateValue(selectedDate);

            let horas = selectedDate.getHours();
            const minutos = selectedDate.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12 || 12;

            const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos} ${ampm}`;

            setForm(prev => ({
                ...prev,
                [type === 'inicio' ? 'hora' : 'horaFin']: horaFormateada
            }));
        }
    };

    const seleccionarCategoria = (cat: Categoria) => {
        setForm(prev => ({ ...prev, categoria: cat }));
    };

    // Validaciones del formulario actualizadas
    const errores = {
        titulo: form.titulo.trim().length === 0,
        descripcion: form.descripcion.trim().length < 10,
        categoria: form.categoria === '',
        tipo: form.tipo === '',
        fecha: form.fecha.trim().length === 0,
        hora: form.hora.trim().length === 0,
        horaFin: form.horaFin.trim().length === 0,
        lugar: form.lugar.trim().length === 0,
        codigoEmpleado: form.codigoEmpleado.trim().length === 0,
        cargo: form.cargo.trim().length === 0,
        correo: form.correo.trim().length === 0,
        celular: form.celular.trim().length === 0,
        codigoAutorizacion: form.codigoAutorizacion.trim().length === 0,
        asistentes: form.asistentes.trim().length === 0,
        edadMinima: form.edadMinima.trim().length === 0,
        requisitos: form.requisitos.trim().length < 10,
    };

    const pasoSiguiente = () => {
        if (pasoActual === 1) {
            if (errores.titulo || errores.descripcion || errores.categoria || errores.tipo) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, completa el Título, una Descripción detallada, selecciona una Categoría y el Tipo de evento antes de avanzar.');
                return;
            }
        } else if (pasoActual === 2) {
            if (errores.fecha || errores.hora || errores.horaFin || errores.lugar) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, ingresa una Fecha, Hora de Inicio, Hora Final y el Lugar del evento.');
                return;
            }
        } else if (pasoActual === 3) {
            if (errores.asistentes || errores.edadMinima || errores.requisitos) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, ingresa el Número de Asistentes, la Edad Mínima y los Requisitos del evento.');
                return;
            }
        } else if (pasoActual === 4) {
            if (errores.codigoEmpleado || errores.cargo || errores.correo || errores.celular || errores.codigoAutorizacion) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, ingresa el Código de Empleado, Cargo, Correo, Celular y Código de Autorización.');
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
        setEnviado(true);
        Alert.alert('✅ ¡Evento creado!', `El evento "${form.titulo}" se publicó correctamente en UniRadar.`, [
            { text: 'Excelente', onPress: () => router.replace('/tabs/admin') }
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
                            {pasoActual === 1 ? 'Detalles Básicos' : pasoActual === 2 ? 'Programación' : pasoActual === 3 ? 'Ajustes Finales' : 'Verificación'}
                        </Text>
                    </HStack>
                    <Box className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <Box className="h-full bg-indigo-600" style={{ width: progresoWidth }} />
                    </Box>
                </VStack>

                {/* ========================================================
                PASO 1: DETALLES BÁSICOS DEL EVENTO
                ======================================================== */}
                {pasoActual === 1 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Información General</Text>

                        {/* Campo Título */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Type} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Título del evento *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Ej: Torneo Gaming UTP 2026"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.titulo}
                                    onChangeText={actualizarCampo('titulo')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Descripción */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.AlignLeft} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Descripción del evento *</Text>
                            </HStack>
                            <Input className="h-28 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500 py-2">
                                <InputField
                                    placeholder="Escribe detalles del evento (mínimo 10 caracteres)..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    multiline
                                    numberOfLines={4}
                                    value={form.descripcion}
                                    onChangeText={actualizarCampo('descripcion')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Categoría */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Tag} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Categoría *</Text>
                            </HStack>
                            <HStack className="flex-wrap" style={{ gap: 8 }}>
                                {CATEGORIAS.map((cat) => {
                                    const activo = form.categoria === cat;
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => seleccionarCategoria(cat)}
                                            className={`px-4 py-2 rounded-full border ${activo ? 'bg-indigo-50 border-indigo-600/30' : 'bg-white border-[#E9EAF4]'}`}
                                        >
                                            <Text className={`text-xs font-bold ${activo ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
                        </VStack>

                        {/* Campo: Tipo de Evento (Select de Gluestack) */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Layers} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tipo de evento *</Text>
                            </HStack>

                            <Select
                                selectedValue={form.tipo}
                                onValueChange={(valor) => setForm(prev => ({ ...prev, tipo: valor }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500 justify-between px-4 flex-row items-center">
                                    <SelectInput
                                        placeholder="Seleccionar tipo"
                                        className="text-[#111827] placeholder:text-gray-400 text-sm flex-1"
                                    />
                                    <SelectIcon as={ICONS.ChevronDown} className="text-indigo-600 w-4 h-4" />
                                </SelectTrigger>

                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent className="bg-white border-t border-[#E9EAF4]">
                                        {TIPOS_EVENTO.map((tipo) => (
                                            <SelectItem
                                                key={tipo}
                                                label={tipo}
                                                value={tipo}
                                                className="hover:bg-gray-50 focus:bg-indigo-50 py-3 text-[#111827]"
                                            />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>
                        {/* Campo Imagen URL */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.ImageIcon} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">URL de portada (Opcional)</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="https://images.unsplash.com/..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.imagenUri}
                                    onChangeText={actualizarCampo('imagenUri')}
                                    autoCapitalize="none"
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
                PASO 2: PROGRAMACIÓN Y FECHAS
                ======================================================== */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Fecha, Hora y Ubicación</Text>

                        {/* Contenedor Principal en Fila */}
                        <HStack className="justify-between mb-4 items-start">

                            {/* COLUMNA IZQUIERDA: Selector de Fecha */}
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={{ width: '48%' }}
                                className="bg-white border border-[#E9EAF4] rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-2" style={{ gap: 6 }}>
                                    <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Fecha *</Text>
                                </HStack>
                                <Text className="text-[#111827] text-sm font-bold mt-1">
                                    {form.fecha || 'Seleccionar...'}
                                </Text>
                            </TouchableOpacity>

                            {/* COLUMNA DERECHA: Horas apiladas */}
                            <VStack style={{ width: '48%', gap: 12 }}>

                                {/* Selector de Hora Inicio */}
                                <TouchableOpacity
                                    onPress={() => setShowTimePicker(true)}
                                    className="bg-white border border-[#E9EAF4] rounded-2xl p-4 w-full"
                                >
                                    <HStack className="items-center mb-2" style={{ gap: 6 }}>
                                        <Icon as={ICONS.Clock} className="text-indigo-600 w-4 h-4" />
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Hora Inicio *</Text>
                                    </HStack>
                                    <Text className="text-[#111827] text-sm font-bold mt-1">
                                        {form.hora || 'Seleccionar...'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Selector de Hora Final */}
                                <TouchableOpacity
                                    onPress={() => setShowEndTimePicker(true)}
                                    className="bg-white border border-[#E9EAF4] rounded-2xl p-4 w-full"
                                >
                                    <HStack className="items-center mb-2" style={{ gap: 6 }}>
                                        <Icon as={ICONS.Clock} className="text-indigo-600 w-4 h-4" />
                                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Hora Final *</Text>
                                    </HStack>
                                    <Text className="text-[#111827] text-sm font-bold mt-1">
                                        {form.horaFin || 'Seleccionar...'}
                                    </Text>
                                </TouchableOpacity>

                            </VStack>
                        </HStack>

                        {/* Modales de los Pickers */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={dateValue}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={dateValue}
                                mode="time"
                                display="default"
                                onChange={onTimeChange('inicio')}
                            />
                        )}

                        {showEndTimePicker && (
                            <DateTimePicker
                                value={dateValue}
                                mode="time"
                                display="default"
                                onChange={onTimeChange('fin')}
                            />
                        )}

                        {/* Campo Ubicación */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center justify-between">
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.MapPin} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lugar del evento *</Text>
                                </HStack>

                                <TouchableOpacity onPress={() => setModalMapaVisible(true)}>
                                    <Text className="text-indigo-600 text-xs font-bold underline">Seleccionar en Mapa</Text>
                                </TouchableOpacity>
                            </HStack>

                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Ej: Campus San Isidro, Auditorio A o búscalo en el mapa"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.lugar}
                                    onChangeText={actualizarCampo('lugar')}
                                />
                            </Input>
                        </VStack>

                        <SelectorMapaModal
                            visible={modalMapaVisible}
                            onClose={() => setModalMapaVisible(false)}
                            onUbicacionSeleccionada={(datos) => {
                                setForm(prev => ({
                                    ...prev,
                                    lugar: datos.direccion,
                                    latitud: datos.coords.lat,
                                    longitud: datos.coords.lng
                                }));
                            }}
                        />
                    </VStack>
                )}

                {/* ========================================================
                PASO 3: CONFIGURACIÓN ADICIONAL
                ======================================================== */}
                {pasoActual === 3 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Ajustes Finales y Registro</Text>

                        {/* Campo Aforo */}
                        <HStack className="justify-between mb-4">
                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Users} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Aforo</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                    <InputVitalsFieldEvent
                                        placeholder="Ej: 150"
                                        className="text-[#111827] placeholder:text-gray-400"
                                        keyboardType="numeric"
                                        value={form.asistentes}
                                        onChangeText={actualizarCampoNumerico('asistentes')}
                                    />
                                </Input>
                            </VStack>
                        </HStack>
                        {/* Campo Edad minima */}
                        <HStack className="justify-between mb-4">

                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Users} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Edad Minima</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                    <InputVitalsFieldEvent
                                        placeholder="Ej: 18"
                                        className="text-[#111827] placeholder:text-gray-400"
                                        keyboardType="numeric"
                                        value={form.edadMinima}
                                        onChangeText={actualizarCampoEdadMinima('edadMinima')}
                                    />
                                </Input>
                            </VStack>
                        </HStack>

                        {/* Campo Requisitos */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.AlignLeft} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Requisitos del evento</Text>
                            </HStack>
                            <Input className="h-28 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500 py-2">
                                <InputVitalsFieldEvent
                                    placeholder="Escribe los requisitos del evento (mínimo 10 caracteres)..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    multiline
                                    numberOfLines={4}
                                    value={form.requisitos}
                                    onChangeText={actualizarRequisitos('requisitos')}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
                PASO 4: VERIFICACIÓN 
                ======================================================== */}
                {pasoActual === 4 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Verificación de Organizador</Text>
                        <Text className="text-gray-500 text-sm mb-6">Para garantizar la autenticidad de los eventos, necesitamos verificar tu identidad como organizador autorizado.
                        </Text>

                        {/* Campo Código de Empleado */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Hash} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Código de Empleado</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Escribe tu código de empleado..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.codigoEmpleado}
                                    onChangeText={actualizarCampoTexto('codigoEmpleado')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Cargo */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Users} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Cargo</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Escribe tu cargo..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.cargo}
                                    onChangeText={actualizarCampoTexto('cargo')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Correo */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Mail} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Correo</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Escribe tu correo..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    keyboardType="email-address"
                                    value={form.correo}
                                    onChangeText={actualizarCampoTexto('correo')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Celular */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Phone} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Celular</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Escribe tu celular..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    keyboardType="phone-pad"
                                    value={form.celular}
                                    onChangeText={actualizarCampoTexto('celular')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Código de Autorización */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Shield} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Código de Autorización</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Escribe el código de autorización..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.codigoAutorizacion}
                                    onChangeText={actualizarCampoTexto('codigoAutorizacion')}
                                />
                            </Input>
                        </VStack>

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
                            {pasoActual === totalPasos ? 'Publicar' : 'Siguiente'}
                        </ButtonText>
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Un pequeño alias para compatibilidad interna de campos que pueden usar multilineas
const InputVitalsFieldEvent = InputField;
