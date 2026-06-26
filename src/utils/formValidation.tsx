import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// ── Colores de validación ─────────────────────────────────────────────────────
export const V_COLORS = {
    valid: '#10B981',      // Verde esmeralda
    invalid: '#EF4444',    // Rojo
    neutral: '#E9EAF4',    // Gris neutro (por defecto)
    focused: '#6366F1',    // Indigo (foco sin validación activa)
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type ValidationState = 'valid' | 'invalid' | 'neutral';

// ── Funciones de validación puras ─────────────────────────────────────────────
// Retornan 'neutral' si el campo está vacío (sin interacción),
// 'valid' o 'invalid' si el usuario ya escribió algo.

export function validateEmail(value: string): ValidationState {
    if (value.length === 0) return 'neutral';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'valid' : 'invalid';
}

export function validatePassword(value: string): ValidationState {
    if (value.length === 0) return 'neutral';
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value);
    return hasMinLength && hasUppercase && hasNumber && hasSpecial ? 'valid' : 'invalid';
}

export function validatePasswordMatch(password: string, confirm: string): ValidationState {
    if (confirm.length === 0) return 'neutral';
    return password === confirm ? 'valid' : 'invalid';
}

export function validateDni(value: string): ValidationState {
    if (value.length === 0) return 'neutral';
    return /^\d{8}$/.test(value) ? 'valid' : 'invalid';
}

export function validatePhone(value: string, optional: boolean = true): ValidationState {
    if (value.length === 0) return optional ? 'neutral' : 'invalid';
    return /^\d{9}$/.test(value) ? 'valid' : 'invalid';
}

export function validateMinLength(value: string, min: number): ValidationState {
    if (value.length === 0) return 'neutral';
    return value.trim().length >= min ? 'valid' : 'invalid';
}

export function validateRequired(value: string): ValidationState {
    if (value.length === 0) return 'neutral';
    return value.trim().length > 0 ? 'valid' : 'neutral';
}

export function validateCapacity(value: string): ValidationState {
    if (value.length === 0) return 'neutral';
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 ? 'valid' : 'invalid';
}

export function validateDateNotPast(dateStr: string): ValidationState {
    if (!dateStr || dateStr.length === 0) return 'neutral';
    // Soporta formato ISO yyyy-mm-dd
    const parts = dateStr.split('-');
    if (parts.length !== 3) return 'neutral';
    const eventDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today ? 'valid' : 'invalid';
}

export function validateDateOrder(startDateStr: string, endDateStr: string): ValidationState {
    if (!endDateStr || endDateStr.length === 0) return 'neutral';
    if (!startDateStr || startDateStr.length === 0) return 'neutral';
    const startParts = startDateStr.split('-');
    const endParts = endDateStr.split('-');
    if (startParts.length !== 3 || endParts.length !== 3) return 'neutral';
    const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
    const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
    return end >= start ? 'valid' : 'invalid';
}

// ── Helper para obtener estilo de borde ───────────────────────────────────────
export function getValidationBorderStyle(
    state: ValidationState,
    isFocused: boolean = false,
): { borderColor: string; borderWidth: number } {
    if (state === 'valid') return { borderColor: V_COLORS.valid, borderWidth: 2 };
    if (state === 'invalid') return { borderColor: V_COLORS.invalid, borderWidth: 2 };
    if (isFocused) return { borderColor: V_COLORS.focused, borderWidth: 2 };
    return { borderColor: V_COLORS.neutral, borderWidth: 1 };
}

// ── Criterios de contraseña para el indicador ─────────────────────────────────
interface PasswordCriterion {
    label: string;
    met: boolean;
}

function getPasswordCriteria(password: string): PasswordCriterion[] {
    return [
        { label: 'Mín. 8 caracteres', met: password.length >= 8 },
        { label: '1 mayúscula (A-Z)', met: /[A-Z]/.test(password) },
        { label: '1 número (0-9)', met: /[0-9]/.test(password) },
        { label: '1 especial (!@#...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
    ];
}

// ── Componente de indicador de fortaleza de contraseña ─────────────────────────
interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
    if (password.length === 0) return null;

    const criteria = getPasswordCriteria(password);
    const metCount = criteria.filter(c => c.met).length;
    const total = criteria.length;

    const getBarColor = (index: number) => {
        if (index >= metCount) return '#E5E7EB';
        if (metCount <= 1) return '#EF4444';
        if (metCount <= 2) return '#F59E0B';
        if (metCount <= 3) return '#3B82F6';
        return '#10B981';
    };

    const getStrengthLabel = () => {
        if (metCount <= 1) return { text: 'Muy débil', color: '#EF4444' };
        if (metCount <= 2) return { text: 'Débil', color: '#F59E0B' };
        if (metCount <= 3) return { text: 'Media', color: '#3B82F6' };
        return { text: 'Fuerte ✓', color: '#10B981' };
    };

    const strength = getStrengthLabel();

    return (
        <VStack style={indicatorStyles.container}>
            {/* Barra de progreso segmentada */}
            <HStack style={indicatorStyles.barRow}>
                {criteria.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            indicatorStyles.barSegment,
                            { backgroundColor: getBarColor(i) },
                        ]}
                    />
                ))}
            </HStack>

            {/* Etiqueta de fortaleza */}
            <HStack style={indicatorStyles.strengthRow}>
                <Text style={[indicatorStyles.strengthLabel, { color: strength.color }]}>
                    {strength.text}
                </Text>
                <Text style={indicatorStyles.criteriaCount}>
                    {metCount}/{total} criterios
                </Text>
            </HStack>

            {/* Lista de criterios */}
            <VStack style={indicatorStyles.criteriaList}>
                {criteria.map((c, i) => (
                    <HStack key={i} style={indicatorStyles.criteriaRow}>
                        <Text style={{ fontSize: 11 }}>
                            {c.met ? '✅' : '⚪'}
                        </Text>
                        <Text style={[
                            indicatorStyles.criteriaText,
                            { color: c.met ? '#10B981' : '#9CA3AF' },
                        ]}>
                            {c.label}
                        </Text>
                    </HStack>
                ))}
            </VStack>
        </VStack>
    );
}

const indicatorStyles = StyleSheet.create({
    container: {
        marginTop: 8,
        gap: 6,
    },
    barRow: {
        gap: 4,
        height: 4,
    },
    barSegment: {
        flex: 1,
        height: '100%',
        borderRadius: 2,
    },
    strengthRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    strengthLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    criteriaCount: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    criteriaList: {
        gap: 3,
    },
    criteriaRow: {
        alignItems: 'center',
        gap: 6,
    },
    criteriaText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
