import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ICONS } from '@/components/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIAS = ['Tecnología', 'Música', 'Deporte', 'Arte', 'Educación', 'Social'] as const;
type Categoria = (typeof CATEGORIAS)[number];

const ESTADO_INICIAL = {
    titulo: '',
    fecha: '',
    hora: '',
    lugar: '',
    categoria: '',
    precio: '',
    asistentes: '',
    descripcion: '',
    destacado: false,
    imagenUri: '',
};

export default function CrearEvento() {
    const router = useRouter();
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [enviado, setEnviado] = useState(false);
    const [pasoActual, setPasoActual] = useState(1);
    const totalPasos = 3;

    // Estados para Date y Time Pickers
    const [dateValue, setDateValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const actualizarCampo = (clave: keyof typeof ESTADO_INICIAL) => (valor: string) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    const actualizarCampoNumerico = (clave: keyof typeof ESTADO_INICIAL) => (valor: string) => {
        const soloNumeros = valor.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, [clave]: soloNumeros }));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            const dia = selectedDate.getDate().toString().padStart(2, '0');
            const mes = selectedDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
            const mesFormateado = mes.charAt(0).toUpperCase() + mes.slice(1);
            setForm(prev => ({ ...prev, fecha: `${dia} ${mesFormateado}` }));
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            let horas = selectedDate.getHours();
            const minutos = selectedDate.getMinutes().toString().padStart(2, '0');
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12 || 12;
            setForm(prev => ({ ...prev, hora: `${horas.toString().padStart(2, '0')}:${minutos} ${ampm}` }));
        }
    };

    const seleccionarCategoria = (cat: Categoria) => {
        setForm(prev => ({ ...prev, categoria: cat }));
    };

    // Validaciones del formulario
    const errores = {
        titulo: form.titulo.trim().length === 0,
        descripcion: form.descripcion.trim().length < 10,
        categoria: form.categoria === '',
        fecha: form.fecha.trim().length === 0,
        hora: form.hora.trim().length === 0,
        lugar: form.lugar.trim().length === 0,
    };

    const pasoSiguiente = () => {
        // Validaciones por paso
        if (pasoActual === 1) {
            if (errores.titulo || errores.descripcion || errores.categoria) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, completa el Título, una Descripción detallada y selecciona una Categoría antes de avanzar.');
                return;
            }
        } else if (pasoActual === 2) {
            if (errores.fecha || errores.hora || errores.lugar) {
                Alert.alert('⚠️ Campos requeridos', 'Por favor, ingresa una Fecha, Hora y Lugar válido para el evento.');
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
            { text: 'Excelente', onPress: () => router.replace('../admin') }
        ]);
    };

    // Porcentaje de progreso de la barra
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
                            {pasoActual === 1 ? 'Detalles Básicos' : pasoActual === 2 ? 'Programación' : 'Ajustes Finales'}
                        </Text>
                    </HStack>
                    <Box className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <Box className="h-full bg-cyan-400" style={{ width: progresoWidth }} />
                    </Box>
                </VStack>

                {/* ========================================================
            PASO 1: DETALLES BÁSICOS DEL EVENTO
           ======================================================== */}
                {pasoActual === 1 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Información General</Text>

                        {/* Campo Título */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Type} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Título del evento *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Ej: Torneo Gaming UTP 2026"
                                    className="text-white placeholder:text-gray-500"
                                    value={form.titulo}
                                    onChangeText={actualizarCampo('titulo')}
                                />
                            </Input>
                        </VStack>

                        {/* Campo Descripción */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.AlignLeft} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Descripción del evento *</Text>
                            </HStack>
                            <Input className="h-28 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400 py-2">
                                <InputField
                                    placeholder="Escribe detalles del evento (mínimo 10 caracteres)..."
                                    className="text-white placeholder:text-gray-500"
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
                                <Icon as={ICONS.Tag} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Categoría *</Text>
                            </HStack>
                            <HStack className="flex-wrap" style={{ gap: 8 }}>
                                {CATEGORIAS.map((cat) => {
                                    const activo = form.categoria === cat;
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => seleccionarCategoria(cat)}
                                            className={`px-4 py-2 rounded-full border ${activo ? 'bg-cyan-400/10 border-cyan-400' : 'bg-[#0D1324] border-white/10'}`}
                                        >
                                            <Text className={`text-xs font-bold ${activo ? 'text-cyan-400' : 'text-gray-400'}`}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </HStack>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
            PASO 2: PROGRAMACIÓN Y FECHAS
           ======================================================== */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Fecha, Hora y Ubicación</Text>

                        {/* Fila Fecha y Hora */}
                        <HStack className="justify-between mb-4">
                            {/* Selector de Fecha */}
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={{ width: '48%' }}
                                className="bg-[#0D1324] border border-white/10 rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-2" style={{ gap: 6 }}>
                                    <Icon as={ICONS.CalendarDays} className="text-cyan-400 w-4 h-4" />
                                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Fecha *</Text>
                                </HStack>
                                <Text className="text-white text-sm font-bold mt-1">
                                    {form.fecha || 'Seleccionar...'}
                                </Text>
                            </TouchableOpacity>

                            {/* Selector de Hora */}
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                style={{ width: '48%' }}
                                className="bg-[#0D1324] border border-white/10 rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-2" style={{ gap: 6 }}>
                                    <Icon as={ICONS.Clock} className="text-cyan-400 w-4 h-4" />
                                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Hora *</Text>
                                </HStack>
                                <Text className="text-white text-sm font-bold mt-1">
                                    {form.hora || 'Seleccionar...'}
                                </Text>
                            </TouchableOpacity>
                        </HStack>

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
                                onChange={onTimeChange}
                            />
                        )}

                        {/* Campo Ubicación */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.MapPin} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Lugar del evento *</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="Ej: Campus San Isidro, Auditorio A"
                                    className="text-white placeholder:text-gray-500"
                                    value={form.lugar}
                                    onChangeText={actualizarCampo('lugar')}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
            PASO 3: CONFIGURACIÓN ADICIONAL
           ======================================================== */}
                {pasoActual === 3 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">Ajustes Finales y Registro</Text>

                        {/* Campo Precio */}
                        <HStack className="justify-between mb-4">
                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.DollarSign} className="text-cyan-400 w-4 h-4" />
                                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Precio *</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                    <InputField
                                        placeholder="Ej: Gratis / 25"
                                        className="text-white placeholder:text-gray-500"
                                        value={form.precio}
                                        onChangeText={actualizarCampo('precio')}
                                    />
                                </Input>
                            </VStack>

                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Users} className="text-cyan-400 w-4 h-4" />
                                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">Aforos</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                    <InputField
                                        placeholder="Ej: 150"
                                        className="text-white placeholder:text-gray-500"
                                        keyboardType="numeric"
                                        value={form.asistentes}
                                        onChangeText={actualizarCampoNumerico('asistentes')}
                                    />
                                </Input>
                            </VStack>
                        </HStack>

                        {/* Campo Imagen URL */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.ImageIcon} className="text-cyan-400 w-4 h-4" />
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider">URL de portada (Opcional)</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-[#0D1324] border-white/10 focus:border-cyan-400">
                                <InputField
                                    placeholder="https://images.unsplash.com/..."
                                    className="text-white placeholder:text-gray-500"
                                    value={form.imagenUri}
                                    onChangeText={actualizarCampo('imagenUri')}
                                    autoCapitalize="none"
                                />
                            </Input>
                        </VStack>

                        {/* Campo Destacado Switch */}
                        <TouchableOpacity
                            onPress={() => setForm(prev => ({ ...prev, destacado: !prev.destacado }))}
                            className="bg-[#0D1324] border border-white/5 rounded-2xl p-4 flex-row items-center justify-between mt-2"
                        >
                            <HStack className="items-center" style={{ gap: 10 }}>
                                <Icon as={ICONS.Star} className={form.destacado ? 'text-amber-400 w-5 h-5' : 'text-gray-500 w-5 h-5'} />
                                <VStack>
                                    <Text className="text-white text-sm font-bold">Destacar evento</Text>
                                    <Text className="text-gray-400 text-2xs mt-0.5">Mostrar con insignia dorada en Radar</Text>
                                </VStack>
                            </HStack>
                            <Icon
                                as={form.destacado ? ICONS.ToggleRight : ICONS.ToggleLeft}
                                className={form.destacado ? 'text-cyan-400 w-8 h-8' : 'text-gray-500 w-8 h-8'}
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
                            {pasoActual === totalPasos ? 'Publicar' : 'Siguiente'}
                        </ButtonText>
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({});
