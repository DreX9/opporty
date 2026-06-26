import React, { useState, useEffect } from 'react';
import {
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    View,
    ActivityIndicator,
} from 'react-native';
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

import { useAuthState, authStateManager } from '../../auth/state';
import { profileService } from '../services/profileService';
import { StudentProfile, TeacherProfile, StudentWriteData, TeacherWriteData } from '../types';
import DropdownSelect from '@/components/DropdownSelect';
import { LISTA_CARRERAS, LISTA_CICLOS_REGISTRO } from '../../auth/components/RegisterModal';
import { LISTA_ESPECIALIDADES } from '../../admin/screens/CrearUsuarioScreen';
import {
    validatePassword, validatePasswordMatch,
    validateDni, validatePhone, validateMinLength, validateRequired,
    getValidationBorderStyle, PasswordStrengthIndicator,
} from '@/src/utils/formValidation';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileUpdated: () => void;
}

const C = {
    bg: '#F7F8FC',
    white: '#FFFFFF',
    accent: '#6366F1',
    border: '#E9EAF4',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    placeholder: '#9CA3AF',
    grayLight: '#E5E7EB',
};

function fromIsoDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function EditProfileModal({ isOpen, onClose, onProfileUpdated }: EditProfileModalProps) {
    const { role } = useAuthState();
    const isStudent = role === 'STUDENT';

    // Estados de carga y perfil completo
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);

    // --- ESTADOS COMUNES ---
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [dni, setDni] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('01/01/2008');
    const [phoneNumber, setPhoneNumber] = useState('');

    // --- ESTADOS ACADÉMICOS (Estudiante) ---
    const [carrera, setCarrera] = useState('');
    const [ciclo, setCiclo] = useState('');

    // --- ESTADOS PROFESIONALES (Profesor / Admin) ---
    const [titulo, setTitulo] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [selectedSpecialtyOption, setSelectedSpecialtyOption] = useState('');
    const [biography, setBiography] = useState('');
    const [hiringDate, setHiringDate] = useState('');

    // --- ESTADOS DE SEGURIDAD ---
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- PICKERS DE FECHA ---
    const [showBirthPicker, setShowBirthPicker] = useState(false);
    const [showHiringPicker, setShowHiringPicker] = useState(false);
    const [birthDateValue, setBirthDateValue] = useState(new Date(2008, 0, 1));
    const [hiringDateValue, setHiringDateValue] = useState(new Date());

    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // Cargar datos del perfil según rol
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setContrasena('');
            setConfirmarContrasena('');
            
            if (isStudent) {
                profileService.fetchStudentMe()
                    .then((profile) => {
                        setStudentProfile(profile);
                        setNombres(profile.nombres);
                        setApellidos(profile.apellidos);
                        setDni(profile.dni);
                        setFechaNacimiento(profile.fechaNacimiento ? fromIsoDate(profile.fechaNacimiento) : '01/01/2008');
                        setPhoneNumber(profile.phoneNumber || '');
                        setCarrera(profile.carrera || '');
                        setCiclo(profile.ciclo ? `Ciclo ${profile.ciclo}` : '');
                        
                        if (profile.fechaNacimiento) {
                            setBirthDateValue(new Date(profile.fechaNacimiento + 'T12:00:00'));
                        } else {
                            setBirthDateValue(new Date(2008, 0, 1));
                        }
                    })
                    .catch(() => {
                        Alert.alert('Error', 'No se pudieron cargar los datos del estudiante.');
                        onClose();
                    })
                    .finally(() => setLoading(false));
            } else {
                profileService.fetchTeacherMe()
                    .then((profile) => {
                        setTeacherProfile(profile);
                        setNombres(profile.nombres);
                        setApellidos(profile.apellidos);
                        setDni(profile.dni);
                        setFechaNacimiento(profile.fechaNacimiento ? fromIsoDate(profile.fechaNacimiento) : '01/01/2008');
                        setPhoneNumber(profile.telefono || '');
                        setTitulo(profile.titulo || '');
                        setEspecialidad(profile.especialidad || '');
                        if (profile.especialidad) {
                            if (LISTA_ESPECIALIDADES.includes(profile.especialidad)) {
                                setSelectedSpecialtyOption(profile.especialidad);
                            } else {
                                setSelectedSpecialtyOption('Otro (Escribir manualmente)');
                            }
                        } else {
                            setSelectedSpecialtyOption('');
                        }
                        setBiography(profile.biography || '');
                        setHiringDate(fromIsoDate(profile.hiringDate));
                        
                        if (profile.fechaNacimiento) {
                            setBirthDateValue(new Date(profile.fechaNacimiento + 'T12:00:00'));
                        } else {
                            setBirthDateValue(new Date(2008, 0, 1));
                        }
                        if (profile.hiringDate) {
                            setHiringDateValue(new Date(profile.hiringDate + 'T12:00:00'));
                        }
                    })
                    .catch(() => {
                        Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
                        onClose();
                    })
                    .finally(() => setLoading(false));
            }
        }
    }, [isOpen]);

    const handleSpecialtyChange = (val: string) => {
        setSelectedSpecialtyOption(val);
        if (val === 'Otro (Escribir manualmente)') {
            setEspecialidad('');
        } else {
            setEspecialidad(val);
        }
    };

    // Handlers de fecha
    const onBirthDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowBirthPicker(false);
        if (selectedDate) {
            setBirthDateValue(selectedDate);
            const d = selectedDate.getDate().toString().padStart(2, '0');
            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const y = selectedDate.getFullYear();
            setFechaNacimiento(`${d}/${m}/${y}`);
        }
    };

    const onHiringDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowHiringPicker(false);
        if (selectedDate) {
            setHiringDateValue(selectedDate);
            const d = selectedDate.getDate().toString().padStart(2, '0');
            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const y = selectedDate.getFullYear();
            setHiringDate(`${d}/${m}/${y}`);
        }
    };

    // Validaciones
    const getValidationErrors = (): string[] => {
        const errors: string[] = [];
        if (nombres.trim().length < 2) errors.push('- Nombres (mín. 2 letras)');
        if (apellidos.trim().length < 2) errors.push('- Apellidos (mín. 2 letras)');
        if (!/^\d{8}$/.test(dni)) errors.push('- DNI (debe tener exactamente 8 dígitos)');
        if (!fechaNacimiento) errors.push('- Fecha de nacimiento (requerida)');
        if (phoneNumber && !/^\d{9}$/.test(phoneNumber)) errors.push('- Teléfono (debe tener exactamente 9 dígitos)');

        if (isStudent) {
            if (carrera.trim().length < 2) errors.push('- Carrera (seleccione una)');
            const cicloNum = Number(ciclo.replace('Ciclo ', ''));
            if (!ciclo || isNaN(cicloNum) || cicloNum < 1 || cicloNum > 10) errors.push('- Ciclo (debe ser un número válido entre 1 y 10)');
        }

        if (contrasena) {
            if (validatePassword(contrasena) !== 'valid') {
                errors.push('- Contraseña nueva (debe cumplir los 4 criterios de seguridad)');
            }
            if (validatePasswordMatch(contrasena, confirmarContrasena) !== 'valid') {
                errors.push('- Confirmar contraseña (debe coincidir con la contraseña nueva)');
            }
        }

        return errors;
    };

    const handleSave = async () => {
        const errors = getValidationErrors();
        if (errors.length > 0) {
            Alert.alert('⚠️ Campos inválidos', `Por favor corrige los siguientes campos:\n${errors.join('\n')}`);
            return;
        }

        setSaving(true);
        try {
            if (isStudent && studentProfile) {
                const data: StudentWriteData = {
                    id: studentProfile.id,
                    nombres: nombres.trim(),
                    apellidos: apellidos.trim(),
                    dni: dni.trim(),
                    fechaNacimiento,
                    phoneNumber: phoneNumber.trim() || undefined,
                    carrera: carrera.trim(),
                    ciclo: Number(ciclo.replace('Ciclo ', '')),
                    status: studentProfile.status,
                    userId: studentProfile.user.id,
                    password: contrasena ? contrasena : undefined,
                };
                await profileService.updateStudent(data);
            } else if (!isStudent && teacherProfile) {
                const data: TeacherWriteData = {
                    id: teacherProfile.id,
                    nombres: nombres.trim(),
                    apellidos: apellidos.trim(),
                    dni: dni.trim(),
                    fechaNacimiento,
                    telefono: phoneNumber.trim() || undefined,
                    titulo: titulo.trim() || undefined,
                    especialidad: especialidad.trim() || undefined,
                    biography: biography.trim() || undefined,
                    hiringDate: hiringDate ? hiringDate : undefined,
                    status: teacherProfile.status,
                    userId: teacherProfile.user.id,
                    password: contrasena ? contrasena : undefined,
                };
                await profileService.updateTeacher(data);
            }

            authStateManager.updateProfileNames(nombres.trim(), apellidos.trim());

            Alert.alert('✅ ¡Éxito!', 'Tu perfil ha sido actualizado correctamente.', [
                {
                    text: 'Listo',
                    onPress: () => {
                        onProfileUpdated();
                        onClose();
                    },
                },
            ]);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error desconocido al actualizar perfil.';
            Alert.alert('❌ Error', msg);
        } finally {
            setSaving(false);
        }
    };

    const getUsername = () => {
        if (isStudent && studentProfile) return studentProfile.user.username;
        if (!isStudent && teacherProfile) return teacherProfile.user.username;
        return '';
    };

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <HStack style={styles.header}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.backBtn}
                            accessibilityLabel="Volver"
                            accessibilityRole="button"
                        >
                            <Icon as={ICONS.ChevronRight} style={{ color: C.accent, width: 20, height: 20, transform: [{ rotate: '180deg' }] }} />
                            <Text style={styles.backText}>Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Editar Perfil</Text>
                        <View style={{ width: 60 }} />
                    </HStack>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={C.accent} size="large" />
                            <Text style={styles.loadingText}>Cargando datos...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContainer}
                        >
                            {/* Información congelada de Cuenta */}
                            <VStack style={styles.frozenSection}>
                                <Text style={styles.sectionTitle}>Mi Cuenta</Text>
                                <HStack style={styles.frozenRow}>
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={styles.frozenLabel}>USERNAME / CÓDIGO (NO EDITABLE)</Text>
                                        <Text style={styles.frozenValue}>@{getUsername()}</Text>
                                    </VStack>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleBadgeText}>
                                            {isStudent ? 'Estudiante' : 'Docente / Admin'}
                                        </Text>
                                    </View>
                                </HStack>
                            </VStack>

                            {/* SECCIÓN 1: DATOS PERSONALES */}
                            <VStack style={{ gap: 14, marginTop: 20 }}>
                                <Text style={styles.sectionTitle}>Datos Personales</Text>
                                
                                <HStack style={{ gap: 12 }}>
                                    <VStack style={{ flex: 1, gap: 4 }}>
                                        <Text style={styles.inputLabel}>Nombre</Text>
                                        <Input style={[styles.inputBox, getValidationBorderStyle(validateMinLength(nombres, 2), focusedInput === 'nombres')]}>
                                            <Icon as={ICONS.user} style={styles.inputIcon} />
                                            <InputField
                                                placeholder="Nombres"
                                                placeholderTextColor={C.placeholder}
                                                value={nombres}
                                                onChangeText={setNombres}
                                                onFocus={() => setFocusedInput('nombres')}
                                                onBlur={() => setFocusedInput(null)}
                                                style={{ color: C.textPrimary }}
                                            />
                                        </Input>
                                    </VStack>
                                    <VStack style={{ flex: 1, gap: 4 }}>
                                        <Text style={styles.inputLabel}>Apellido</Text>
                                        <Input style={[styles.inputBox, getValidationBorderStyle(validateMinLength(apellidos, 2), focusedInput === 'apellidos')]}>
                                            <Icon as={ICONS.user} style={styles.inputIcon} />
                                            <InputField
                                                placeholder="Apellidos"
                                                placeholderTextColor={C.placeholder}
                                                value={apellidos}
                                                onChangeText={setApellidos}
                                                onFocus={() => setFocusedInput('apellidos')}
                                                onBlur={() => setFocusedInput(null)}
                                                style={{ color: C.textPrimary }}
                                            />
                                        </Input>
                                    </VStack>
                                </HStack>

                                <VStack style={{ gap: 4 }}>
                                    <Text style={styles.inputLabel}>DNI</Text>
                                    <Input style={[styles.inputBox, getValidationBorderStyle(validateDni(dni), focusedInput === 'dni')]}>
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
                                            style={{ color: C.textPrimary }}
                                        />
                                    </Input>
                                </VStack>

                                <VStack style={{ gap: 4 }}>
                                    <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setShowBirthPicker(true)}
                                        style={[styles.pickerBox, getValidationBorderStyle(validateRequired(fechaNacimiento))]}
                                    >
                                        <HStack style={{ alignItems: 'center', gap: 10, flex: 1 }}>
                                            <Icon as={ICONS.CalendarDays} style={styles.inputIcon} />
                                            <Text style={{ color: fechaNacimiento ? C.textPrimary : C.placeholder, fontSize: 14, fontWeight: '500' }}>
                                                {fechaNacimiento || 'Fecha de nacimiento'}
                                            </Text>
                                        </HStack>
                                    </TouchableOpacity>
                                </VStack>

                                <VStack style={{ gap: 4 }}>
                                    <Text style={styles.inputLabel}>Teléfono (Opcional)</Text>
                                    <Input style={[styles.inputBox, getValidationBorderStyle(validatePhone(phoneNumber, true), focusedInput === 'phoneNumber')]}>
                                        <Icon as={ICONS.Phone} style={styles.inputIcon} />
                                        <InputField
                                            placeholder="Teléfono (9 dígitos)"
                                            placeholderTextColor={C.placeholder}
                                            value={phoneNumber}
                                            onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9]/g, ''))}
                                            onFocus={() => setFocusedInput('phoneNumber')}
                                            onBlur={() => setFocusedInput(null)}
                                            keyboardType="phone-pad"
                                            maxLength={9}
                                            style={{ color: C.textPrimary }}
                                        />
                                    </Input>
                                </VStack>
                            </VStack>

                            {/* SECCIÓN 2: DATOS ACADÉMICOS / PROFESIONALES */}
                            {isStudent ? (
                                <VStack style={{ gap: 14, marginTop: 24 }}>
                                    <Text style={styles.sectionTitle}>Datos Académicos</Text>

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Carrera</Text>
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
                                    </VStack>

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Ciclo Académico</Text>
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
                                    </VStack>
                                </VStack>
                            ) : (
                                <VStack style={{ gap: 14, marginTop: 24 }}>
                                    <Text style={styles.sectionTitle}>Datos Profesionales</Text>

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Título Académico</Text>
                                        <Input style={[styles.inputBox, focusedInput === 'titulo' ? styles.inputBoxFocused : {}]}>
                                            <Icon as={ICONS.GraduationCap} style={styles.inputIcon} />
                                            <InputField
                                                placeholder="Título Académico"
                                                placeholderTextColor={C.placeholder}
                                                value={titulo}
                                                onChangeText={setTitulo}
                                                onFocus={() => setFocusedInput('titulo')}
                                                onBlur={() => setFocusedInput(null)}
                                                style={{ color: C.textPrimary }}
                                            />
                                        </Input>
                                    </VStack>

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Especialidad</Text>
                                        <DropdownSelect
                                            selectedValue={selectedSpecialtyOption}
                                            onValueChange={handleSpecialtyChange}
                                            options={LISTA_ESPECIALIDADES}
                                            placeholder="Seleccionar especialidad..."
                                            icon={ICONS.Laptop}
                                            style={[
                                                styles.inputBox,
                                                focusedInput === 'especialidad' ? styles.inputBoxFocused : {}
                                            ]}
                                            inputIconStyle={styles.inputIcon}
                                            textStyle={{ fontSize: 14 }}
                                        />
                                    </VStack>

                                    {selectedSpecialtyOption === 'Otro (Escribir manualmente)' && (
                                        <VStack style={{ gap: 4 }}>
                                            <Text style={styles.inputLabel}>Escribir Especialidad</Text>
                                            <Input style={[styles.inputBox, focusedInput === 'especialidad_custom' ? styles.inputBoxFocused : {}]}>
                                                <Icon as={ICONS.Type} style={styles.inputIcon} />
                                                <InputField
                                                    placeholder="Escribe tu especialidad aquí..."
                                                    placeholderTextColor={C.placeholder}
                                                    value={especialidad}
                                                    onChangeText={setEspecialidad}
                                                    onFocus={() => setFocusedInput('especialidad_custom')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    style={{ color: C.textPrimary }}
                                                />
                                            </Input>
                                        </VStack>
                                    )}

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Fecha de Contratación</Text>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onPress={() => setShowHiringPicker(true)}
                                            style={[styles.pickerBox, focusedInput === 'hiringDate' ? styles.inputBoxFocused : {}]}
                                        >
                                            <HStack style={{ alignItems: 'center', gap: 10, flex: 1 }}>
                                                <Icon as={ICONS.CalendarDays} style={styles.inputIcon} />
                                                <Text style={{ color: hiringDate ? C.textPrimary : C.placeholder, fontSize: 14, fontWeight: '500' }}>
                                                    {hiringDate || 'Fecha de Contratación'}
                                                </Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    </VStack>

                                    <VStack style={{ gap: 4 }}>
                                        <Text style={styles.inputLabel}>Biografía</Text>
                                        <Input style={[styles.inputBox, focusedInput === 'biography' ? styles.inputBoxFocused : {}, { minHeight: 80 }]}>
                                            <InputField
                                                placeholder="Biografía breve..."
                                                placeholderTextColor={C.placeholder}
                                                multiline
                                                numberOfLines={3}
                                                value={biography}
                                                onChangeText={setBiography}
                                                onFocus={() => setFocusedInput('biography')}
                                                onBlur={() => setFocusedInput(null)}
                                                style={{ color: C.textPrimary, textAlignVertical: 'top', paddingTop: 8 }}
                                            />
                                        </Input>
                                    </VStack>
                                </VStack>
                            )}

                            {/* SECCIÓN 3: CAMBIAR CONTRASEÑA */}
                            <VStack style={{ gap: 14, marginTop: 24 }}>
                                <Text style={styles.sectionTitle}>Cambiar Contraseña (Opcional)</Text>

                                <VStack style={{ gap: 4 }}>
                                    <Text style={styles.inputLabel}>Nueva contraseña</Text>
                                    <Input style={[styles.inputBox, getValidationBorderStyle(contrasena.length > 0 ? validatePassword(contrasena) : 'neutral', focusedInput === 'contrasena')]}>
                                        <Icon as={ICONS.lock} style={styles.inputIcon} />
                                        <InputField
                                            placeholder="Nueva contraseña (mín. 8 caracteres)"
                                            placeholderTextColor={C.placeholder}
                                            secureTextEntry={!showPassword}
                                            value={contrasena}
                                            onChangeText={setContrasena}
                                            onFocus={() => setFocusedInput('contrasena')}
                                            onBlur={() => setFocusedInput(null)}
                                            style={{ color: C.textPrimary }}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Icon as={showPassword ? ICONS.eye : ICONS.eyeOff} style={{ color: C.textSecondary, width: 18, height: 18 }} />
                                        </TouchableOpacity>
                                    </Input>

                                    {/* Indicador de fortaleza de contraseña */}
                                    <PasswordStrengthIndicator password={contrasena} />
                                </VStack>

                                <VStack style={{ gap: 4 }}>
                                    <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
                                    <Input style={[styles.inputBox, getValidationBorderStyle(contrasena.length > 0 ? validatePasswordMatch(contrasena, confirmarContrasena) : 'neutral', focusedInput === 'confirmarContrasena')]}>
                                        <Icon as={ICONS.lock} style={styles.inputIcon} />
                                        <InputField
                                            placeholder="Confirmar nueva contraseña"
                                            placeholderTextColor={C.placeholder}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmarContrasena}
                                            onChangeText={setConfirmarContrasena}
                                            onFocus={() => setFocusedInput('confirmarContrasena')}
                                            onBlur={() => setFocusedInput(null)}
                                            style={{ color: C.textPrimary }}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Icon as={showConfirmPassword ? ICONS.eye : ICONS.eyeOff} style={{ color: C.textSecondary, width: 18, height: 18 }} />
                                        </TouchableOpacity>
                                    </Input>
                                </VStack>
                            </VStack>

                            {/* BOTÓN GUARDAR CAMBIOS */}
                            <Button
                                onPress={handleSave}
                                style={styles.saveBtn}
                                isDisabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <ButtonText style={styles.saveBtnText}>Guardar Cambios</ButtonText>
                                )}
                            </Button>

                            {/* Date Pickers */}
                            {showBirthPicker && (
                                <DateTimePicker
                                    value={birthDateValue}
                                    mode="date"
                                    display="default"
                                    onChange={onBirthDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

                            {showHiringPicker && (
                                <DateTimePicker
                                    value={hiringDateValue}
                                    mode="date"
                                    display="default"
                                    onChange={onHiringDateChange}
                                />
                            )}
                        </ScrollView>
                    )}
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
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E9EAF4',
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: 60,
    },
    backText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    frozenSection: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    frozenRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    frozenLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    frozenValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#6366F1',
    },
    roleBadge: {
        backgroundColor: '#EAB308',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    inputBox: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9EAF4',
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        marginTop: 4,
    },
    inputBoxFocused: {
        borderColor: '#6366F1',
        borderWidth: 2,
    },
    pickerBox: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderColor: '#E9EAF4',
        borderWidth: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
    },
    inputIcon: {
        color: '#6366F1',
        width: 18,
        height: 18,
        marginRight: 10,
    },
    saveBtn: {
        backgroundColor: '#6366F1',
        height: 54,
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
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
});
