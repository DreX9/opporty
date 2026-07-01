import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Alert,
    DimensionValue,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Switch,
    StyleSheet,
    View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { ICONS } from '@/components/icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

import { ESTADO_INICIAL_EVENTO } from '../constants';
import { FormCrearEvento } from '../types';
import { useCategories } from '../../event/hooks/useCategories';
import { eventService } from '../../event/services/eventService';
import { useAuthState } from '../../auth/state';
import { eventStateManager } from '../../event/state';
import {
    validateRequired, validateMinLength, validateCapacity,
    validateDateNotPast, validateDateOrder, validateTimeNotPast, validateEndTime,
    getValidationBorderStyle,
} from '@/src/utils/formValidation';

export default function CrearEventoScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { role } = useAuthState();
    const { categorias, loading: loadingCats } = useCategories();

    const [form, setForm] = useState<FormCrearEvento>(ESTADO_INICIAL_EVENTO);
    const [pasoActual, setPasoActual] = useState(1);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [publicando, setPublicando] = useState(false);
    const [modalMapaVisible, setModalMapaVisible] = useState(false);
    const [cargandoEdicion, setCargandoEdicion] = useState(false);
    const [currentPicker, setCurrentPicker] = useState<'fechaInicio' | 'fechaFin' | 'horaInicio' | 'horaFin' | null>(null);

    useEffect(() => {
        if (id) {
            const cargarDetallesEvento = async () => {
                try {
                    setCargandoEdicion(true);
                    const ev = await eventService.fetchEventById(Number(id));
                    
                    const formattedHoraInicio = ev.horaInicio ? ev.horaInicio.slice(0, 5) : '';
                    const formattedHoraFin = ev.horaFin ? ev.horaFin.slice(0, 5) : '';
                    
                    setForm({
                        titulo: ev.titulo || '',
                        descripcion: ev.descripcion || '',
                        fechaInicio: ev.fechaInicio || '',
                        fechaFin: ev.fechaFin || '',
                        horaInicio: formattedHoraInicio,
                        horaFin: formattedHoraFin,
                        capacidad: ev.capacidad ? String(ev.capacidad) : '',
                        imagenUrl: ev.imagenUrl || '',
                        imageUrls: ev.imageUrls || [],
                        modalidad: ev.modalidad || '',
                        lugar: ev.lugar || '',
                        referencia: ev.referencia || '',
                        latitud: ev.latitud || 0,
                        longitud: ev.longitud || 0,
                        estado: ev.estado || 'PENDING',
                        requiresApproval: false,
                        allowQrAttendance: true,
                        edadMinima: ev.edadMinima ? String(ev.edadMinima) : '',
                        requisitos: ev.requisitos || '',
                        categoryIds: ev.categories ? ev.categories.map(c => c.id) : [],
                        tagIds: ev.tags ? ev.tags.map(t => t.id) : [],
                        grabacionUrl: ev.grabacionUrl || '',
                    });
                } catch (err) {
                    console.error('Error al cargar detalles del evento:', err);
                    let msg = 'No se pudo cargar la información del evento.';
                    if (err && typeof err === 'object') {
                        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
                        msg = axiosErr.response?.data?.message || axiosErr.message || msg;
                    }
                    Alert.alert('Error', msg);
                } finally {
                    setCargandoEdicion(false);
                }
            };
            cargarDetallesEvento();
        }
    }, [id]);

    if (cargandoEdicion) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F4FB' }}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 12, color: '#475569', fontWeight: '700', fontSize: 13 }}>
                    Cargando datos del evento...
                </Text>
            </View>
        );
    }

    // DateTime Picker helper states
    const totalPasos = 4;

    const seleccionarImagen = async () => {
        if (form.imageUrls.length >= 3) {
            Alert.alert('⚠️ Límite alcanzado', 'Solo puedes subir hasta 3 imágenes para este evento.');
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('⚠️ Permiso denegado', 'Se requieren permisos de la galería para seleccionar una imagen.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const localUri = result.assets[0].uri;
                setSubiendoImagen(true);
                
                const secureUrl = await uploadImageToCloudinary(localUri);
                
                setForm(prev => {
                    const newUrls = [...prev.imageUrls, secureUrl];
                    return {
                        ...prev,
                        imageUrls: newUrls,
                        imagenUrl: newUrls[0] // La primera es la principal
                    };
                });
                
                Alert.alert('✅ Éxito', 'La imagen se ha subido correctamente a Cloudinary.');
            }
        } catch (error: any) {
            console.error('[CrearEventoScreen] Error al subir imagen:', error);
            Alert.alert('⚠️ Error', error.message || 'No se pudo subir la imagen.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const eliminarImagen = (index: number) => {
        setForm(prev => {
            const newUrls = prev.imageUrls.filter((_, i) => i !== index);
            return {
                ...prev,
                imageUrls: newUrls,
                imagenUrl: newUrls.length > 0 ? newUrls[0] : ''
            };
        });
    };

    const toggleCategoria = (id: number) => {
        setForm(prev => {
            const yaSeleccionada = prev.categoryIds.includes(id);
            const nuevasCategorias = yaSeleccionada
                ? prev.categoryIds.filter(cid => cid !== id)
                : [...prev.categoryIds, id];

            // Limpiar tags que ya no pertenezcan a ninguna de las categorías seleccionadas
            const selectedCats = categorias.filter(c => nuevasCategorias.includes(c.id));
            const availableTagIds = selectedCats.flatMap(c => c.tags).map(t => t.id);
            const nuevosTags = prev.tagIds.filter(tid => availableTagIds.includes(tid));

            return {
                ...prev,
                categoryIds: nuevasCategorias,
                tagIds: nuevosTags
            };
        });
    };

    const toggleTag = (id: number) => {
        setForm(prev => {
            const yaSeleccionado = prev.tagIds.includes(id);
            const nuevosTags = yaSeleccionado
                ? prev.tagIds.filter(tid => tid !== id)
                : [...prev.tagIds, id];
            return {
                ...prev,
                tagIds: nuevosTags
            };
        });
    };

    const actualizarCampo = (clave: keyof FormCrearEvento) => (valor: any) => {
        setForm(prev => ({ ...prev, [clave]: valor }));
    };

    const actualizarCampoNumerico = (clave: keyof FormCrearEvento) => (valor: string) => {
        const soloNumeros = valor.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, [clave]: soloNumeros }));
    };

    const formatDateToISO = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeToISO = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDisplayDate = (isoStr: string): string => {
        if (!isoStr) return 'Seleccionar...';
        const parts = isoStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return isoStr;
    };

    const formatDisplayTime = (timeStr: string): string => {
        if (!timeStr) return 'Seleccionar...';
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            let hour = parseInt(parts[0], 10);
            const minute = parts[1];
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
        }
        return timeStr;
    };

    // Get tags belonging to selected categories
    const tagsDisponibles = categorias
        .filter(c => form.categoryIds.includes(c.id))
        .flatMap(c => c.tags);

    // Validations
    const errores = {
        titulo: form.titulo.trim().length === 0,
        descripcion: form.descripcion.trim().length < 10,
        categorias: form.categoryIds.length === 0,
        modalidad: form.modalidad === '',
        imagenes: form.imageUrls.length === 0,
        fechaInicio: form.fechaInicio === '',
        fechaFin: form.fechaFin === '',
        horaInicio: form.horaInicio === '',
        horaFin: form.horaFin === '',
        lugar: form.lugar.trim().length === 0,
        capacidad: form.capacidad.trim().length === 0,
        edadMinima: form.edadMinima.trim().length === 0,
        requisitos: form.requisitos.trim().length < 10,
    };

    const pasoSiguiente = () => {
        if (subiendoImagen) {
            Alert.alert('⏳ Subiendo imagen', 'Por favor, espera a que termine de subir la imagen antes de continuar.');
            return;
        }

        if (pasoActual === 1) {
            const listErrors: string[] = [];
            if (form.titulo.trim().length === 0) listErrors.push('- Título (requerido)');
            if (form.descripcion.trim().length < 10) listErrors.push('- Descripción detallada (mín. 10 caracteres)');
            if (form.categoryIds.length === 0) listErrors.push('- Categorías (selecciona al menos una)');
            if (form.modalidad === '') listErrors.push('- Modalidad (requerida)');
            if (form.imageUrls.length === 0) listErrors.push('- Imágenes (sube al menos una)');

            if (listErrors.length > 0) {
                Alert.alert('⚠️ Campos requeridos', `Por favor completa o corrige los siguientes campos:\n${listErrors.join('\n')}`);
                return;
            }
        } else if (pasoActual === 2) {
            const listErrors: string[] = [];
            if (form.fechaInicio === '') {
                listErrors.push('- Fecha de Inicio (requerida)');
            } else if (validateDateNotPast(form.fechaInicio) !== 'valid') {
                listErrors.push('- Fecha de Inicio (no puede ser anterior a la actual)');
            }

            if (form.fechaFin === '') {
                listErrors.push('- Fecha de Fin (requerida)');
            } else if (validateDateNotPast(form.fechaFin) !== 'valid') {
                listErrors.push('- Fecha de Fin (no puede ser anterior a la actual)');
            } else if (validateDateOrder(form.fechaInicio, form.fechaFin) !== 'valid') {
                listErrors.push('- Fecha de Fin (no puede ser anterior a la Fecha de Inicio)');
            }

            if (form.horaInicio === '') {
                listErrors.push('- Hora de Inicio (requerida)');
            } else if (validateTimeNotPast(form.fechaInicio, form.horaInicio) !== 'valid') {
                listErrors.push('- Hora de Inicio (no puede ser anterior a la actual)');
            }

            if (form.horaFin === '') {
                listErrors.push('- Hora de Fin (requerida)');
            } else if (validateEndTime(form.fechaInicio, form.fechaFin, form.horaInicio, form.horaFin) !== 'valid') {
                listErrors.push('- Hora de Fin (debe ser posterior a la Hora de Inicio)');
            }

            if (form.lugar.trim().length === 0) {
                listErrors.push('- Lugar del evento (seleccione en el mapa)');
            }

            if (listErrors.length > 0) {
                Alert.alert('⚠️ Campos requeridos', `Por favor completa o corrige los siguientes campos:\n${listErrors.join('\n')}`);
                return;
            }
        } else if (pasoActual === 3) {
            const listErrors: string[] = [];
            if (validateCapacity(form.capacidad) !== 'valid') listErrors.push('- Capacidad de aforo (debe ser mayor a 0)');
            if (validateCapacity(form.edadMinima) !== 'valid') listErrors.push('- Edad Mínima (debe ser mayor a 0)');
            if (validateMinLength(form.requisitos, 10) !== 'valid') listErrors.push('- Requisitos (mín. 10 caracteres)');

            if (listErrors.length > 0) {
                Alert.alert('⚠️ Campos requeridos', `Por favor completa o corrige los siguientes campos:\n${listErrors.join('\n')}`);
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

    const ejecutarCreacion = async () => {
        if (publicando) return;
        setPublicando(true);
        try {
            const payload = {
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                fechaInicio: form.fechaInicio,
                fechaFin: form.fechaFin,
                horaInicio: form.horaInicio ? `${form.horaInicio}:00` : null,
                horaFin: form.horaFin ? `${form.horaFin}:00` : null,
                capacidad: form.capacidad ? parseInt(form.capacidad, 10) : null,
                imagenUrl: form.imagenUrl || null,
                modalidad: form.modalidad,
                lugar: form.lugar.trim() || null,
                referencia: form.referencia.trim() || null,
                latitud: form.latitud,
                longitud: form.longitud,
                estado: role === 'MANAGER' ? 'PENDING' : 'PUBLISHED',
                requiresApproval: form.requiresApproval,
                allowQrAttendance: form.allowQrAttendance,
                edadMinima: form.edadMinima ? parseInt(form.edadMinima, 10) : null,
                requisitos: form.requisitos.trim() || null,
                categoryIds: form.categoryIds,
                tagIds: form.tagIds,
                imageUrls: form.imageUrls,
                motivoRechazo: null,
                grabacionUrl: form.grabacionUrl || null,
            };

            if (id) {
                await eventService.updateEvent(Number(id), payload);
                const msgExito = role === 'MANAGER'
                    ? `El evento "${form.titulo}" ha sido corregido y reenviado para revisión.`
                    : `El evento "${form.titulo}" se actualizó correctamente.`;
                
                eventStateManager.markNotificationAsRead(String(id));
                
                Alert.alert('✅ ¡Evento actualizado!', msgExito, [
                    {
                        text: 'Excelente',
                        onPress: () => {
                            if (role === 'ADMIN') {
                                router.replace({ pathname: '/tabs/admin', params: { tab: 'eventos' } });
                            } else {
                                router.replace('/tabs/radar');
                            }
                        }
                    }
                ]);
            } else {
                await eventService.createEvent(payload);
                const msgExito = role === 'MANAGER'
                    ? `El evento "${form.titulo}" ha sido creado y enviado para revisión del administrador.`
                    : `El evento "${form.titulo}" se publicó correctamente. Será visible para los estudiantes de inmediato.`;
                Alert.alert('✅ ¡Evento publicado!', msgExito, [
                    {
                        text: 'Excelente',
                        onPress: () => {
                            if (role === 'ADMIN') {
                                router.replace({ pathname: '/tabs/admin', params: { tab: 'eventos' } });
                            } else {
                                router.replace('/tabs/radar');
                            }
                        }
                    }
                ]);
            }
        } catch (err) {
            console.error('[CrearEventoScreen] Error al guardar evento:', err);
            let msg = 'No se pudo conectar con el servidor.';
            if (err && typeof err === 'object') {
                const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
                msg = axiosErr.response?.data?.message || axiosErr.message || msg;
            }
            Alert.alert('⚠️ Error al guardar evento', msg);
        } finally {
            setPublicando(false);
        }
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
                            {id ? (role === 'ADMIN' ? 'Editar Evento' : 'Corregir Evento') : (pasoActual === 1 ? 'Detalles Básicos' : pasoActual === 2 ? 'Programación' : pasoActual === 3 ? 'Ajustes Finales' : 'Verificación')}
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
                            <Input className="h-12 rounded-xl bg-white" style={getValidationBorderStyle(validateRequired(form.titulo))}>
                                <InputField
                                    placeholder="Ej: Hackathon UTP 2026"
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
                            <Input className="h-28 rounded-xl bg-white py-2" style={getValidationBorderStyle(validateMinLength(form.descripcion, 10))}>
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

                        {/* Campo Categorías (Multi-selección) */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Tag} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Categorías (Elige una o más) *</Text>
                            </HStack>
                            {loadingCats ? (
                                <ActivityIndicator size="small" color="#4F46E5" />
                            ) : (
                                <HStack className="flex-wrap" style={{ gap: 8 }}>
                                    {categorias.map((cat) => {
                                        const activo = form.categoryIds.includes(cat.id);
                                        return (
                                            <TouchableOpacity
                                                key={cat.id}
                                                onPress={() => toggleCategoria(cat.id)}
                                                className={`px-4 py-2 rounded-full border ${activo ? 'bg-indigo-50 border-indigo-600/30' : 'bg-white border-[#E9EAF4]'}`}
                                            >
                                                <Text className={`text-xs font-bold ${activo ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                    {cat.nombre}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </HStack>
                            )}
                        </VStack>

                        {/* Campo Tags (Dependientes de las categorías seleccionadas) */}
                        {form.categoryIds.length > 0 && tagsDisponibles.length > 0 && (
                            <VStack space="xs" className="mb-4">
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Hash} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tags recomendados (Selecciona los que gustes)</Text>
                                </HStack>
                                <HStack className="flex-wrap" style={{ gap: 8 }}>
                                    {tagsDisponibles.map((tag) => {
                                        const activo = form.tagIds.includes(tag.id);
                                        return (
                                            <TouchableOpacity
                                                key={tag.id}
                                                onPress={() => toggleTag(tag.id)}
                                                className={`px-3 py-1.5 rounded-full border ${activo ? 'bg-purple-50 border-purple-500/40' : 'bg-white border-[#E9EAF4]'}`}
                                            >
                                                <Text className={`text-[11px] font-bold ${activo ? 'text-purple-600' : 'text-gray-400'}`}>
                                                    #{tag.nombre}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </HStack>
                            </VStack>
                        )}

                        {/* Campo Modalidad */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.Layers} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Modalidad *</Text>
                            </HStack>
                            <Select
                                selectedValue={form.modalidad}
                                onValueChange={actualizarCampo('modalidad')}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500 justify-between px-4 flex-row items-center">
                                    <SelectInput
                                        placeholder="Seleccionar modalidad"
                                        className="text-[#111827] placeholder:text-gray-400 text-sm flex-1"
                                    />
                                    <SelectIcon as={ICONS.ChevronDown} className="text-indigo-600 w-4 h-4" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent className="bg-white border-t border-[#E9EAF4]">
                                        <SelectItem label="Presencial" value="PRESENCIAL" className="py-3 text-[#111827]" />
                                        <SelectItem label="Virtual" value="VIRTUAL" className="py-3 text-[#111827]" />
                                        <SelectItem label="Híbrido" value="HIBRIDO" className="py-3 text-[#111827]" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>

                        {/* Campo Imágenes (Múltiples, hasta 3) */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.ImageIcon} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Imágenes del Evento (Hasta 3) *</Text>
                            </HStack>

                            {/* Listado de imágenes subidas */}
                            {form.imageUrls.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
                                    {form.imageUrls.map((url, idx) => (
                                        <Box key={url} className="w-36 h-24 rounded-xl overflow-hidden bg-white border border-[#E9EAF4] relative">
                                            <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                                            <Box className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded">
                                                <Text className="text-white text-[9px] font-bold">
                                                    {idx === 0 ? 'Principal' : `Foto ${idx + 1}`}
                                                </Text>
                                            </Box>
                                            <TouchableOpacity
                                                onPress={() => eliminarImagen(idx)}
                                                style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(239, 68, 68, 0.8)' }}
                                                className="p-1.5 rounded-full"
                                            >
                                                <Icon as={ICONS.X} className="text-white w-3 h-3" />
                                            </TouchableOpacity>
                                        </Box>
                                    ))}
                                </ScrollView>
                            )}

                            {form.imageUrls.length < 3 && (
                                <TouchableOpacity
                                    onPress={seleccionarImagen}
                                    disabled={subiendoImagen}
                                    className="w-full h-24 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/20 justify-center items-center flex-col mt-2"
                                    style={{ gap: 4 }}
                                >
                                    {subiendoImagen ? (
                                        <VStack className="items-center" space="xs">
                                            <ActivityIndicator size="small" color="#4F46E5" />
                                            <Text className="text-xs text-indigo-600 font-bold">Subiendo a Cloudinary...</Text>
                                        </VStack>
                                    ) : (
                                        <>
                                            <Icon as={ICONS.UploadCloud} className="text-indigo-600 w-6 h-6" />
                                            <Text className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">
                                                Subir imagen ({form.imageUrls.length}/3)
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </VStack>
                    </VStack>
                )}

                {/* ========================================================
                PASO 2: PROGRAMACIÓN Y FECHAS
                ======================================================== */}
                {pasoActual === 2 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Fecha, Hora y Ubicación</Text>

                        {/* Contenedor de Fechas */}
                        <HStack className="justify-between mb-2">
                            <TouchableOpacity
                                onPress={() => setCurrentPicker('fechaInicio')}
                                style={[{ width: '48%' }, getValidationBorderStyle(validateDateNotPast(form.fechaInicio))]}
                                className="bg-white rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-1" style={{ gap: 4 }}>
                                    <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-3.5 h-3.5" />
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">F. Inicio *</Text>
                                </HStack>
                                <Text className="text-[#111827] text-xs font-bold mt-1">
                                    {formatDisplayDate(form.fechaInicio)}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setCurrentPicker('fechaFin')}
                                style={[{ width: '48%' }, getValidationBorderStyle(
                                    form.fechaFin.length === 0 ? 'neutral' :
                                    (validateDateNotPast(form.fechaFin) === 'valid' && validateDateOrder(form.fechaInicio, form.fechaFin) === 'valid' ? 'valid' : 'invalid')
                                )]}
                                className="bg-white rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-1" style={{ gap: 4 }}>
                                    <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-3.5 h-3.5" />
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">F. Fin *</Text>
                                </HStack>
                                <Text className="text-[#111827] text-xs font-bold mt-1">
                                    {formatDisplayDate(form.fechaFin)}
                                </Text>
                            </TouchableOpacity>
                        </HStack>

                        {/* Contenedor de Horas */}
                        <HStack className="justify-between mb-4">
                            <TouchableOpacity
                                onPress={() => setCurrentPicker('horaInicio')}
                                style={[{ width: '48%' }, getValidationBorderStyle(
                                    form.horaInicio.length === 0 ? 'neutral' : validateTimeNotPast(form.fechaInicio, form.horaInicio)
                                )]}
                                className="bg-white rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-1" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Clock} className="text-indigo-600 w-3.5 h-3.5" />
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">H. Inicio *</Text>
                                </HStack>
                                <Text className="text-[#111827] text-xs font-bold mt-1">
                                    {formatDisplayTime(form.horaInicio)}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setCurrentPicker('horaFin')}
                                style={[{ width: '48%' }, getValidationBorderStyle(
                                    form.horaFin.length === 0 ? 'neutral' : validateEndTime(form.fechaInicio, form.fechaFin, form.horaInicio, form.horaFin)
                                )]}
                                className="bg-white rounded-2xl p-4"
                            >
                                <HStack className="items-center mb-1" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Clock} className="text-indigo-600 w-3.5 h-3.5" />
                                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">H. Fin *</Text>
                                </HStack>
                                <Text className="text-[#111827] text-xs font-bold mt-1">
                                    {formatDisplayTime(form.horaFin)}
                                </Text>
                            </TouchableOpacity>
                        </HStack>

                        {/* Unified DateTimePicker Modal */}
                        {currentPicker && (
                            <DateTimePicker
                                value={new Date()}
                                mode={currentPicker.startsWith('fecha') ? 'date' : 'time'}
                                display="default"
                                onChange={(event, date) => {
                                    setCurrentPicker(null);
                                    if (date) {
                                        if (currentPicker === 'fechaInicio') {
                                            setForm(prev => ({ ...prev, fechaInicio: formatDateToISO(date) }));
                                        } else if (currentPicker === 'fechaFin') {
                                            setForm(prev => ({ ...prev, fechaFin: formatDateToISO(date) }));
                                        } else if (currentPicker === 'horaInicio') {
                                            setForm(prev => ({ ...prev, horaInicio: formatTimeToISO(date) }));
                                        } else if (currentPicker === 'horaFin') {
                                            setForm(prev => ({ ...prev, horaFin: formatTimeToISO(date) }));
                                        }
                                    }
                                }}
                            />
                        )}

                        {/* Campo Ubicación */}
                        <VStack space="xs" className="mb-2">
                            <HStack className="items-center justify-between">
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.MapPin} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lugar del evento *</Text>
                                </HStack>

                                <TouchableOpacity onPress={() => setModalMapaVisible(true)}>
                                    <Text className="text-indigo-600 text-xs font-bold underline">Ubicación en Mapa</Text>
                                </TouchableOpacity>
                            </HStack>

                            <TouchableOpacity onPress={() => setModalMapaVisible(true)} activeOpacity={0.7}>
                                <View pointerEvents="none">
                                    <Input className="h-12 rounded-xl bg-white" style={getValidationBorderStyle(validateRequired(form.lugar))}>
                                        <InputField
                                            placeholder="Presiona para seleccionar en el mapa..."
                                            className="text-[#111827] placeholder:text-gray-400"
                                            value={form.lugar}
                                            editable={false}
                                        />
                                    </Input>
                                </View>
                            </TouchableOpacity>
                        </VStack>

                        {/* Campo Referencia */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.AlignLeft} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Referencia de ubicación</Text>
                            </HStack>
                            <Input className="h-12 rounded-xl bg-white border-[#E9EAF4] focus:border-indigo-500">
                                <InputField
                                    placeholder="Ej: Al costado de biblioteca, 3er piso"
                                    className="text-[#111827] placeholder:text-gray-400"
                                    value={form.referencia}
                                    onChangeText={actualizarCampo('referencia')}
                                />
                            </Input>
                        </VStack>

                        <SelectorMapaModal
                            visible={modalMapaVisible}
                            onClose={() => setModalMapaVisible(false)}
                            initialCoords={form.latitud && form.longitud ? { latitude: form.latitud, longitude: form.longitud } : null}
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
                PASO 3: CONFIGURACIÓN ADICIONAL Y AJUSTES
                ======================================================== */}
                {pasoActual === 3 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">Ajustes Finales y Registro</Text>

                        {/* Fila: Aforo y Edad mínima */}
                        <HStack className="justify-between mb-2">
                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.Users} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Aforo (Capacidad) *</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-white" style={getValidationBorderStyle(validateCapacity(form.capacidad))}>
                                    <InputField
                                        placeholder="Ej: 150"
                                        className="text-[#111827] placeholder:text-gray-400"
                                        keyboardType="numeric"
                                        value={form.capacidad}
                                        onChangeText={actualizarCampoNumerico('capacidad')}
                                    />
                                </Input>
                            </VStack>

                            <VStack space="xs" style={{ width: '48%' }}>
                                <HStack className="items-center" style={{ gap: 4 }}>
                                    <Icon as={ICONS.GraduationCap} className="text-indigo-600 w-4 h-4" />
                                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Edad Mínima *</Text>
                                </HStack>
                                <Input className="h-12 rounded-xl bg-white" style={getValidationBorderStyle(validateCapacity(form.edadMinima))}>
                                    <InputField
                                        placeholder="Ej: 16"
                                        className="text-[#111827] placeholder:text-gray-400"
                                        keyboardType="numeric"
                                        value={form.edadMinima}
                                        onChangeText={actualizarCampoNumerico('edadMinima')}
                                    />
                                </Input>
                            </VStack>
                        </HStack>

                        {/* Campo Requisitos */}
                        <VStack space="xs" className="mb-4">
                            <HStack className="items-center" style={{ gap: 4 }}>
                                <Icon as={ICONS.FileText} className="text-indigo-600 w-4 h-4" />
                                <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Requisitos para participar *</Text>
                            </HStack>
                            <Input className="h-24 rounded-xl bg-white py-2" style={getValidationBorderStyle(validateMinLength(form.requisitos, 10))}>
                                <InputField
                                    placeholder="Ej: Llevar laptop, carné de estudiante..."
                                    className="text-[#111827] placeholder:text-gray-400"
                                    multiline
                                    numberOfLines={3}
                                    value={form.requisitos}
                                    onChangeText={actualizarCampo('requisitos')}
                                />
                            </Input>
                        </VStack>

                    </VStack>
                )}

                {/* ========================================================
                PASO 4: VERIFICACIÓN Y RESUMEN DEL EVENTO
                ======================================================== */}
                {pasoActual === 4 && (
                    <VStack space="md" className="flex-1">
                        <Text className="text-[#111827] text-lg font-bold mb-1">
                            {id ? 'Confirmar Corrección' : 'Confirmar Publicación'}
                        </Text>
                        <Text className="text-gray-500 text-sm mb-4">
                            {id ? 'Revisa detenidamente las correcciones de tu evento antes de volver a enviarlo.' : 'Revisa detenidamente los detalles de tu evento antes de publicarlo en el radar estudiantil.'}
                        </Text>

                        {/* Tarjeta de Resumen */}
                        <VStack className="bg-white p-5 rounded-2xl border border-[#E9EAF4]" space="md">
                            {/* Título */}
                            <VStack space="xs">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Título del Evento</Text>
                                <Text className="text-[#111827] text-base font-bold">{form.titulo}</Text>
                            </VStack>

                            {/* Modalidad & Lugar */}
                            <HStack className="justify-between">
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Modalidad</Text>
                                    <Text className="text-[#111827] text-xs font-semibold">{form.modalidad}</Text>
                                </VStack>
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Lugar</Text>
                                    <Text className="text-[#111827] text-xs font-semibold" numberOfLines={2}>{form.lugar}</Text>
                                </VStack>
                            </HStack>

                            {/* Fechas */}
                            <HStack className="justify-between">
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">F. Inicio</Text>
                                    <Text className="text-[#111827] text-xs font-semibold">
                                        {formatDisplayDate(form.fechaInicio)} — {formatDisplayTime(form.horaInicio)}
                                    </Text>
                                </VStack>
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">F. Fin</Text>
                                    <Text className="text-[#111827] text-xs font-semibold">
                                        {formatDisplayDate(form.fechaFin)} — {formatDisplayTime(form.horaFin)}
                                    </Text>
                                </VStack>
                            </HStack>

                            {/* Categorías y Tags */}
                            <VStack space="xs">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Categorías</Text>
                                <Text className="text-gray-600 text-xs font-semibold">
                                    {categorias
                                        .filter(c => form.categoryIds.includes(c.id))
                                        .map(c => c.nombre)
                                        .join(', ')}
                                </Text>
                            </VStack>

                            {form.tagIds.length > 0 && (
                                <VStack space="xs">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Tags</Text>
                                    <Text className="text-purple-600 text-[11px] font-bold">
                                        {tagsDisponibles
                                            .filter(t => form.tagIds.includes(t.id))
                                            .map(t => `#${t.nombre}`)
                                            .join(' ')}
                                    </Text>
                                </VStack>
                            )}

                            {/* Aforo, Edad, Toggles */}
                            <HStack className="justify-between">
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Aforo</Text>
                                    <Text className="text-[#111827] text-xs font-semibold">{form.capacidad} vacantes</Text>
                                </VStack>
                                <VStack space="xs" style={{ width: '48%' }}>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Edad Mínima</Text>
                                    <Text className="text-[#111827] text-xs font-semibold">{form.edadMinima} años</Text>
                                </VStack>
                            </HStack>


                        </VStack>
                    </VStack>
                )}

                {/* 🔘 BOTONES DE NAVEGACIÓN INFERIOR */}
                <HStack className="justify-between items-center mt-8" style={{ gap: 12 }}>
                    <Button
                        onPress={pasoAnterior}
                        variant="outline"
                        disabled={publicando}
                        className="flex-1 h-14 rounded-2xl border-[#E9EAF4] bg-white"
                    >
                        <ButtonText className="text-gray-600 font-bold uppercase tracking-wider">
                            {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
                        </ButtonText>
                    </Button>

                    <Button
                        onPress={pasoSiguiente}
                        disabled={publicando}
                        className="flex-1 h-14 rounded-2xl bg-indigo-600"
                    >
                        {publicando ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <ButtonText className="text-white font-extrabold uppercase tracking-wider">
                                {pasoActual === totalPasos ? (id ? 'Enviar Corrección' : 'Publicar') : 'Siguiente'}
                            </ButtonText>
                        )}
                    </Button>
                </HStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
