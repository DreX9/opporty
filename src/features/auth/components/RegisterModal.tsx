import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    View,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { ICONS } from '@/components/icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { RegisterModalProps, DatosRegistro } from '../types';

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
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [universidad, setUniversidad] = useState('');
    const [carrera, setCarrera] = useState('');
    const [ciclo, setCiclo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    // --- ESTADOS ADICIONALES ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dateValue, setDateValue] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // --- CÁLCULO DINÁMICO DEL USERNAME ---
    const getGeneratedUsername = () => {
        const hasDni = dni.length === 8;
        const hasDate = fechaNacimiento.length === 10;
        const dd = hasDate ? fechaNacimiento.substring(0, 2) : 'DD';
        const mm = hasDate ? fechaNacimiento.substring(3, 5) : 'MM';
        const yy = hasDate ? fechaNacimiento.substring(8, 10) : 'YY';
        const xx = hasDni ? dni.substring(6, 8) : 'XX';
        return `std${dd}${mm}${yy}${xx}`;
    };
    const generatedUsername = getGeneratedUsername();

    const handleClose = () => {
        // Reset states
        setPasoActual(1);
        setNombres('');
        setApellidos('');
        setEmail('');
        setDni('');
        setFechaNacimiento('');
        setUniversidad('');
        setCarrera('');
        setCiclo('');
        setContrasena('');
        setConfirmarContrasena('');
        setFocusedInput(null);
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
        universidad: universidad.trim().length < 2,
        carrera: carrera.trim().length < 2,
        ciclo: ciclo.trim().length === 0,
        contrasena: contrasena.length < 6,
        confirmarContrasena: contrasena !== confirmarContrasena,
    };

    const handleSiguiente = () => {
        if (pasoActual === 1) {
            if (erroresPaso1.nombres || erroresPaso1.apellidos) {
                Alert.alert('⚠️ Campos inválidos', 'Por favor ingresa nombres y apellidos válidos.');
                return;
            }
            if (erroresPaso1.email) {
                Alert.alert('⚠️ Correo inválido', 'Por favor ingresa un correo electrónico universitario válido.');
                return;
            }
            if (erroresPaso1.dni) {
                Alert.alert('⚠️ DNI inválido', 'El DNI debe tener exactamente 8 dígitos.');
                return;
            }
            if (erroresPaso1.fechaNacimiento) {
                Alert.alert('⚠️ Fecha requerida', 'Por favor selecciona tu fecha de nacimiento.');
                return;
            }
            setPasoActual(2);
        } else {
            if (erroresPaso2.universidad || erroresPaso2.carrera || erroresPaso2.ciclo) {
                Alert.alert('⚠️ Información académica incompleta', 'Por favor ingresa tu universidad, carrera y ciclo.');
                return;
            }
            if (erroresPaso2.contrasena) {
                Alert.alert('⚠️ Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (erroresPaso2.confirmarContrasena) {
                Alert.alert('⚠️ Contraseñas no coinciden', 'La contraseña de confirmación no coincide.');
                return;
            }

            const datos: DatosRegistro = {
                nombres,
                apellidos,
                email,
                dni,
                fechaNacimiento,
                universidad,
                carrera,
                ciclo,
                contrasena
            };
            onRegister(datos);
            handleClose();
        }
    };

    const handleAtras = () => {
        if (pasoActual > 1) {
            setPasoActual(pasoActual - 1);
        } else {
            handleClose();
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
                                {/* Nombre y Apellido lado a lado */}
                                <HStack style={{ gap: 12 }}>
                                    <VStack style={{ flex: 1 }}>
                                        <Input
                                            style={[
                                                styles.inputBox,
                                                focusedInput === 'nombres' ? styles.inputBoxFocused : {}
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
                                                focusedInput === 'apellidos' ? styles.inputBoxFocused : {}
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
                                        focusedInput === 'email' ? styles.inputBoxFocused : {}
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
                                        focusedInput === 'dni' ? styles.inputBoxFocused : {}
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
                                        focusedInput === 'fechaNacimiento' ? styles.inputBoxFocused : {}
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

                                {/* Nombre de usuario generado automáticamente (Solo lectura) */}
                                <View style={[styles.inputBox, { backgroundColor: '#F0F1FA', borderColor: '#D7DAF0', opacity: 0.85 }]}>
                                    <Icon as={ICONS.user} style={styles.inputIcon} />
                                    <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: '500', flex: 1 }}>
                                        Nombre de usuario: <Text style={{ color: C.accent, fontWeight: '700' }}>{generatedUsername}</Text>
                                    </Text>
                                </View>

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
                                {/* Universidad */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'universidad' ? styles.inputBoxFocused : {}
                                    ]}
                                >
                                    <Icon as={ICONS.GraduationCap} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Universidad"
                                        placeholderTextColor={C.placeholder}
                                        value={universidad}
                                        onChangeText={setUniversidad}
                                        onFocus={() => setFocusedInput('universidad')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* Carrera */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'carrera' ? styles.inputBoxFocused : {}
                                    ]}
                                >
                                    <Icon as={ICONS.Laptop} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Carrera"
                                        placeholderTextColor={C.placeholder}
                                        value={carrera}
                                        onChangeText={setCarrera}
                                        onFocus={() => setFocusedInput('carrera')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* Ciclo */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'ciclo' ? styles.inputBoxFocused : {}
                                    ]}
                                >
                                    <Icon as={ICONS.Layers} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Ciclo académico (Ej. 5)"
                                        placeholderTextColor={C.placeholder}
                                        value={ciclo}
                                        onChangeText={(v) => setCiclo(v.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setFocusedInput('ciclo')}
                                        onBlur={() => setFocusedInput(null)}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        className="text-gray-900 text-sm flex-1"
                                        style={{ color: '#111827' }}
                                    />
                                </Input>

                                {/* Contraseña */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'contrasena' ? styles.inputBoxFocused : {}
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

                                {/* Confirmar Contraseña */}
                                <Input
                                    style={[
                                        styles.inputBox,
                                        focusedInput === 'confirmarContrasena' ? styles.inputBoxFocused : {}
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
});
