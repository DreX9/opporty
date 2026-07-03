import React, { useState } from 'react';
import {
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    View,
    Image,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../admin/services/cloudinaryService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { ICONS } from '@/components/icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';

import { RegisterModalProps, DatosRegistro } from '../types';
import DropdownSelect from '@/components/DropdownSelect';
import {
    validateEmail, validatePassword, validatePasswordMatch,
    validateDni, validatePhone, validateMinLength, validateRequired,
    getValidationBorderStyle, PasswordStrengthIndicator,
} from '@/src/utils/formValidation';

export const LISTA_CARRERAS = [
    'Ingeniería de Sistemas',
    'Ingeniería de Software',
    'Ingeniería Civil',
    'Ingeniería Industrial',
    'Ingeniería Electrónica',
    'Arquitectura',
    'Derecho',
    'Medicina',
    'Administración',
    'Contabilidad',
    'Psicología',
    'Marketing',
    'Diseño Gráfico',
    'Comunicación'
];

export const LISTA_CICLOS_REGISTRO = [
    'Ciclo 1',
    'Ciclo 2',
    'Ciclo 3',
    'Ciclo 4',
    'Ciclo 5',
    'Ciclo 6',
    'Ciclo 7',
    'Ciclo 8',
    'Ciclo 9',
    'Ciclo 10'
];

const C = {
    bg: '#F7F8FC',             // Fondo lila muy claro
    white: '#FFFFFF',          // Fondo de tarjetas e inputs
    accent: '#6366F1',         // Indigo principal (uniradar)
    border: '#E9EAF4',         // Borde gris claro
    textPrimary: '#111827',    // Texto primario oscuro
    textSecondary: '#6B7280',  // Texto secundario gris
    placeholder: '#9CA3AF',   // Color placeholder
    grayLight: '#E5E7EB',      // Gris para barras de progreso inactivas
};

export default function RegisterModal({ isOpen, onClose, onRegister }: RegisterModalProps) {
    const [pasoActual, setPasoActual] = useState(1);
    const totalPasos = 2;

    // --- ESTADOS DEL FORMULARIO ---
    const [nombres, setNombres] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('01/01/2008');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [carrera, setCarrera] = useState('');
    const [ciclo, setCiclo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    // --- ESTADOS ADICIONALES ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dateValue, setDateValue] = useState(new Date(2008, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(generatedUsername);
        Alert.alert('¡Copiado! 📋', 'El nombre de usuario sugerido ha sido copiado al portapapeles.');
    };

    // --- CÁLCULO DINÁMICO DEL USERNAME ---
    const getGeneratedUsername = () => {
        const hasDni = dni.length === 8;
        const lastFour = hasDni ? dni.substring(4, 8) : 'XXXX';
        const currentYear = new Date().getFullYear();
        const suffixVal = currentYear - 2026 + 1;
        const suffix = suffixVal > 0 ? String(suffixVal).padStart(2, '0') : '01';
        return `u${currentYear}${lastFour}${suffix}`;
    };
    const generatedUsername = getGeneratedUsername();

    const seleccionarFotoPerfil = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('⚠️ Permiso denegado', 'Se requieren permisos de la galería para seleccionar una foto de perfil.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const localUri = result.assets[0].uri;
                
                const filename = localUri.split('/').pop() || '';
                const match = /\.(\w+)$/.exec(filename);
                const extension = match ? match[1].toLowerCase() : '';
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
                if (extension && !allowedExtensions.includes(extension)) {
                    Alert.alert('⚠️ Archivo no válido', 'Solo se permiten imágenes (JPG, JPEG, PNG, WEBP, GIF).');
                    return;
                }

                setSubiendoFoto(true);
                const secureUrl = await uploadImageToCloudinary(localUri);
                setFotoPerfil(secureUrl);
                Alert.alert('✅ Éxito', 'Foto de perfil subida correctamente.');
            }
        } catch (error: any) {
            console.error('[RegisterModal] Error al subir foto de perfil:', error);
            Alert.alert('⚠️ Error', error.message || 'No se pudo subir la foto de perfil.');
        } finally {
            setSubiendoFoto(false);
        }
    };

    const eliminarFotoPerfil = () => {
        setFotoPerfil('');
    };

    const handleClose = () => {
        // Reset states
        setPasoActual(1);
        setNombres('');
        setApellidos('');
        setEmail('');
        setDni('');
        setFechaNacimiento('01/01/2008');
        setPhoneNumber('');
        setCarrera('');
        setCiclo('');
        setContrasena('');
        setConfirmarContrasena('');
        setDateValue(new Date(2008, 0, 1));
        setFocusedInput(null);
        setFotoPerfil('');
        setSubiendoFoto(false);
        onClose();
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateValue(selectedDate);
            const dia = selectedDate.getDate().toString().padStart(2, '0');
            const mes = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const anio = selectedDate.getFullYear();
            setFechaNacimiento(`${dia}/${mes}/${anio}`);
        }
    };

    // Validaciones
    const erroresPaso1 = {
        nombres: nombres.trim().length < 2,
        apellidos: apellidos.trim().length < 2,
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        dni: !/^\d{8}$/.test(dni),
        fechaNacimiento: fechaNacimiento.trim().length === 0,
    };

    const erroresPaso2 = {
        carrera: carrera.trim().length < 2,
        ciclo: ciclo.trim().length === 0,
        phoneNumber: phoneNumber.trim().length > 0 && !/^\d{9}$/.test(phoneNumber),
        contrasena: validatePassword(contrasena) !== 'valid',
        confirmarContrasena: validatePasswordMatch(contrasena, confirmarContrasena) !== 'valid',
    };

    const handleSiguiente = () => {
        if (pasoActual === 1) {
            const listErrors: string[] = [];
            if (nombres.trim().length < 2) listErrors.push('- Nombres (mín. 2 letras)');
            if (apellidos.trim().length < 2) listErrors.push('- Apellidos (mín. 2 letras)');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) listErrors.push('- Correo electrónico (formato inválido)');
            if (!/^\d{8}$/.test(dni)) listErrors.push('- DNI (debe tener exactamente 8 dígitos)');
            if (fechaNacimiento.trim().length === 0) listErrors.push('- Fecha de nacimiento (requerida)');

            if (listErrors.length > 0) {
                Alert.alert('⚠️ Campos inválidos', `Por favor corrige los siguientes campos:\n${listErrors.join('\n')}`);
                return;
            }
            setPasoActual(2);
        } else {
            const listErrors: string[] = [];
            if (carrera.trim().length < 2) listErrors.push('- Carrera (seleccione una)');
            if (ciclo.trim().length === 0) listErrors.push('- Ciclo (seleccione uno)');
            if (phoneNumber.trim().length > 0 && !/^\d{9}$/.test(phoneNumber)) {
                listErrors.push('- Teléfono (debe tener exactamente 9 dígitos)');
            }
            if (validatePassword(contrasena) !== 'valid') {
                listErrors.push('- Contraseña (debe cumplir los 4 criterios de seguridad)');
            }
            if (validatePasswordMatch(contrasena, confirmarContrasena) !== 'valid') {
                listErrors.push('- Confirmar contraseña (debe coincidir con la contraseña)');
            }

            if (listErrors.length > 0) {
                Alert.alert('⚠️ Campos inválidos', `Por favor corrige los siguientes campos:\n${listErrors.join('\n')}`);
                return;
            }

            const datos: DatosRegistro = {
                nombres,
                apellidos,
                email,
                dni,
                fechaNacimiento,
                carrera,
                ciclo: ciclo.replace('Ciclo ', ''),
                phoneNumber,
                contrasena,
                profilePictureUrl: fotoPerfil || undefined
            };
            onRegister(datos);
            handleClose();
        }
    };

    const hasUnsavedChanges = () => {
        return nombres.trim() !== '' ||
               apellidos.trim() !== '' ||
               email.trim() !== '' ||
               dni.trim() !== '';
    };

    const handleAtras = () => {
        if (pasoActual > 1) {
            setPasoActual(pasoActual - 1);
        } else {
            if (hasUnsavedChanges()) {
                Alert.alert(
                    '¿Cancelar registro?',
                    'Tienes datos ingresados. ¿Estás seguro de que deseas salir y perder los cambios?',
                    [
                        { text: 'No', style: 'cancel', onPress: () => {} },
                        {
                            text: 'Sí, salir',
                            style: 'destructive',
                            onPress: () => handleClose(),
                        },
                    ]
                );
            } else {
                handleClose();
            }
        }
    };

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            onRequestClose={handleAtras}
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* HEADER CON BOTÓN VOLVER */}
                    <HStack style={styles.header}>
                        <TouchableOpacity
                            onPress={handleAtras}
                            style={styles.backBtn}
                            accessibilityLabel="Volver"
                            accessibilityRole="button"
                        >
                            <Icon as={ICONS.ChevronRight} style={{ color: C.accent, width: 20, height: 20, transform: [{ rotate: '180deg' }] }} />
                            <Text style={styles.backText}>Volver</Text>
                        </TouchableOpacity>
                    </HStack>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContainer}
                    >
                        {/* TÍTULO Y DESCRIPCIÓN */}
                        <VStack style={styles.titleContainer}>
                            <Text style={styles.title}>Crear Cuenta</Text>
                            <Text style={styles.subtitle}>
                                {pasoActual === 1 ? 'Información básica' : 'Información académica'}
                            </Text>
                        </VStack>

                        {/* BARRAS DE PROGRESO SEGMENTADAS */}
                        <HStack style={styles.progressContainer}>
                            <View 
                                style={[
                                    styles.progressSegment, 
                                    { backgroundColor: pasoActual >= 1 ? C.accent : C.grayLight }
                                ]} 
                            />
                            <View 
                                style={[
                                    styles.progressSegment, 
                                    { backgroundColor: pasoActual >= 2 ? C.accent : C.grayLight }
                                ]} 
                            />
                        </HStack>

                        {/* ========================================================
                            PASO 1: INFORMACIÓN BÁSICA
                        ======================================================== */}
                        {pasoActual === 1 && (
                            <VStack style={{ gap: 16 }}>
                                {/* Foto de perfil (Opcional) */}
                                <VStack style={{ alignItems: 'center', marginBottom: 12 }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={seleccionarFotoPerfil}
                                        style={styles.avatarPickerRing}
                                        accessibilityLabel="Seleccionar foto de perfil"
                                        accessibilityRole="button"
                                    >
                                        <View style={styles.avatarPickerInner}>
                                            {subiendoFoto ? (
                                                <ActivityIndicator size="small" color={C.accent} />
                                            ) : fotoPerfil ? (
                                                <Image
                                                    source={{ uri: fotoPerfil }}
                                                    style={styles.avatarPickerImage}
                                                />
                                            ) : (
                                                <Icon as={ICONS.user} style={{ color: C.accent, width: 44, height: 44 }} />
                                            )}
                                        </View>
                                        
                                        {/* Camera Icon Overlay */}
                                        <View style={styles.cameraIconOverlay}>
                                            <Icon as={ICONS.Camera} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                                        </View>
                                    </TouchableOpacity>
                                    
                                    {fotoPerfil ? (
                                        <TouchableOpacity
                                            onPress={eliminarFotoPerfil}
                                            style={{ marginTop: 8 }}
                                        >
                                            <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>
                                                Eliminar foto
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 6 }}>
                                            Foto de perfil (opcional)
                                        </Text>
                                    )}
                                </VStack>

                                {/* Nombre y Apellido lado a lado */}
                                <HStack style={{ gap: 12 }}>
                                    <VStack style={{ flex: 1 }}>
                                        <Input
                                            style={[
                                                styles.inputBox,
                                                getValidationBorderStyle(validateMinLength(nombres, 2), focusedInput === 'nombres')
                                            ]}
                                        >
                                            <Icon as={ICONS.user} style={styles.inputIcon} />
                                            <InputField
                                                placeholder="Nombre"
                                                placeholderTextColor={C.placeholder}
                                                value={nombres}
                                                onChangeText={setNombres}
                                                onFocus={() => setFocusedInput('nombres')}
                                                onBlur={() => setFocusedInput(null)}
                                                className="text-gray-900 text-sm flex-1"
                                                style={{ color: '#111827' }}
                                            />
                                        </Input>
                                    </VStack>
                                    <VStack style={{ flex: 1 }}>
                                        <Input
                                            style={[
                                                styles.inputBox,
                                                getValidationBorderStyle(validateMinLength(apellidos, 2), focusedInput === 'apellidos')
                                            ]}
                                        >
                                            <Icon as={ICONS.user} style={styles.inputIcon} />
                                            <InputField
                                                placeholder="Apellido"
                                                placeholderTextColor={C.placeholder}
                                                value={apellidos}
                                                onChangeText={setApellidos}
                                                onFocus={() => setFocusedInput('apellidos')}
                                                onBlur={() => setFocusedInput(null)}
                                                className="text-gray-900 text-sm flex-1"
                                                style={{ color: '#111827' }}
                                            />
                                        </Input>
                                    </VStack>
                                </HStack>

                                {/* Correo Universitario */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        getValidationBorderStyle(validateEmail(email), focusedInput === 'email')
                                    ]}
                                >
                                    <Icon as={ICONS.Mail} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Correo universitario"
                                        placeholderTextColor={C.placeholder}
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* DNI */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        getValidationBorderStyle(validateDni(dni), focusedInput === 'dni')
                                    ]}
                                >
                                    <Icon as={ICONS.FileText} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="DNI (8 dígitos)"
                                        placeholderTextColor={C.placeholder}
                                        value={dni}
                                        onChangeText={(v) => setDni(v.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedInput('dni')}
                                        onBlur={() => setFocusedInput(null)}
                                        keyboardType="numeric"
                                        maxLength={8}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* Fecha de Nacimiento (Picker) */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => setShowDatePicker(true)}
                                    style={[
                                        styles.pickerBox,
                                        getValidationBorderStyle(validateRequired(fechaNacimiento))
                                    ]}
                                >
                                    <HStack style={{ alignItems: 'center', gap: 10, flex: 1 }}>
                                        <Icon as={ICONS.CalendarDays} style={styles.inputIcon} />
                                        <Text style={{
                                            color: fechaNacimiento ? C.textPrimary : C.placeholder,
                                            fontSize: 14,
                                            fontWeight: fechaNacimiento ? '500' : '400'
                                        }}>
                                            {fechaNacimiento || 'Fecha de nacimiento'}
                                        </Text>
                                    </HStack>
                                </TouchableOpacity>


                                {showDatePicker && (

                                    <DateTimePicker
                                        value={dateValue}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </VStack>
                        )}

                        {/* ========================================================
                            PASO 2: INFORMACIÓN ACADÉMICA Y SEGURIDAD
                        ======================================================== */}
                        {pasoActual === 2 && (
                            <VStack style={{ gap: 16 }}>
                                {/* Teléfono (opcional, 9 dígitos) */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        getValidationBorderStyle(validatePhone(phoneNumber, true), focusedInput === 'phoneNumber')
                                    ]}
                                >
                                    <Icon as={ICONS.Phone} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Teléfono (9 dígitos, opcional)"
                                        placeholderTextColor={C.placeholder}
                                        value={phoneNumber}
                                        onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedInput('phoneNumber')}
                                        onBlur={() => setFocusedInput(null)}
                                        keyboardType="phone-pad"
                                        maxLength={9}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* Carrera */}
                                {/* Carrera */}
                                <DropdownSelect
                                    selectedValue={carrera}
                                    onValueChange={setCarrera}
                                    options={LISTA_CARRERAS}
                                    placeholder="Seleccionar carrera..."
                                    icon={ICONS.Laptop}
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'carrera' ? styles.inputBoxFocused : {}
                                    ]}
                                    inputIconStyle={styles.inputIcon}
                                    textStyle={{ fontSize: 14 }}
                                />

                                {/* Ciclo */}
                                <DropdownSelect
                                    selectedValue={ciclo}
                                    onValueChange={setCiclo}
                                    options={LISTA_CICLOS_REGISTRO}
                                    placeholder="Seleccionar ciclo..."
                                    icon={ICONS.Layers}
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'ciclo' ? styles.inputBoxFocused : {}
                                    ]}
                                    inputIconStyle={styles.inputIcon}
                                    textStyle={{ fontSize: 14 }}
                                />

                                {/* Contraseña */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        getValidationBorderStyle(validatePassword(contrasena), focusedInput === 'contrasena')
                                    ]}
                                >
                                    <Icon as={ICONS.lock} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Contraseña"
                                        placeholderTextColor={C.placeholder}
                                        secureTextEntry={!showPassword}
                                        value={contrasena}
                                        onChangeText={setContrasena}
                                        onFocus={() => setFocusedInput('contrasena')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Icon as={showPassword ? ICONS.eye : ICONS.eyeOff} style={{ color: C.textSecondary, width: 18, height: 18 }} />
                                    </TouchableOpacity>
                                </Input>

                                {/* Indicador de fortaleza de contraseña */}
                                <PasswordStrengthIndicator password={contrasena} />

                                {/* Confirmar Contraseña */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        getValidationBorderStyle(validatePasswordMatch(contrasena, confirmarContrasena), focusedInput === 'confirmarContrasena')
                                    ]}
                                >
                                    <Icon as={ICONS.lock} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Confirmar contraseña"
                                        placeholderTextColor={C.placeholder}
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmarContrasena}
                                        onChangeText={setConfirmarContrasena}
                                        onFocus={() => setFocusedInput('confirmarContrasena')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Icon as={showConfirmPassword ? ICONS.eye : ICONS.eyeOff} style={{ color: C.textSecondary, width: 18, height: 18 }} />
                                    </TouchableOpacity>
                                </Input>
                            </VStack>
                        )}

                        {/* Nombre de usuario generado (Persistente en todo el formulario) */}
                        <VStack style={styles.suggestedUserCard}>
                            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <HStack style={{ alignItems: 'center', gap: 8, flex: 1 }}>
                                    <Icon as={ICONS.user} style={{ color: C.accent, width: 18, height: 18 }} />
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                                            USUARIO SUGERIDO
                                        </Text>
                                        <Text style={{ color: C.accent, fontSize: 16, fontWeight: '800' }}>
                                            {generatedUsername}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <TouchableOpacity
                                    onPress={copyToClipboard}
                                    style={styles.copyBadgeBtn}
                                    accessibilityLabel="Copiar usuario generado"
                                    accessibilityRole="button"
                                >
                                    <Icon as={ICONS.Copy} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Copiar</Text>
                                </TouchableOpacity>
                            </HStack>
                        </VStack>

                        {/* BOTÓN CONTINUAR / CREAR CUENTA */}
                        <Button
                            onPress={handleSiguiente}
                            style={styles.continueBtn}
                        >

                            <ButtonText style={styles.continueBtnText}>
                                {pasoActual === 1 ? 'Continuar' : 'Crear Cuenta'}
                            </ButtonText>
                        </Button>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backText: {
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 16,
        gap: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    progressContainer: {
        gap: 8,
        marginBottom: 28,
        height: 4,
        width: '100%',
    },
    progressSegment: {
        flex: 1,
        height: '100%',
        borderRadius: 2,
    },
    inputBox: {
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9EAF4',
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputBoxFocused: {
        borderColor: '#6366F1',
        borderWidth: 2,
    },
    pickerBox: {
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9EAF4',
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputIcon: {
        color: '#6366F1',
        width: 20,
        height: 20,
        marginRight: 10,
    },
    continueBtn: {
        backgroundColor: '#6366F1',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    suggestedUserCard: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 20,
    },
    copyBadgeBtn: {
        backgroundColor: '#6366F1',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    avatarPickerRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        borderColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarPickerInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarPickerImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6366F1',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

