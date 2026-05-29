import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { InterestChipProps } from '../types';
import { C } from '../constants';

export default function InterestChip({ interes, onToggle }: InterestChipProps) {
    const accentColor = interes.color || C.accent;
    const borderColorActive = accentColor;
    const bgColorActive = `${accentColor}18`; // 10% opacidad

    return (
        <TouchableOpacity
            onPress={() => onToggle(interes.id)}
            activeOpacity={0.75}
            style={[
                styles.chip,
                {
                    backgroundColor: interes.activo ? bgColorActive : C.cardBg,
                    borderColor: interes.activo ? borderColorActive : C.cardBorder,
                },
            ]}
            accessibilityLabel={`Interés: ${interes.nombre}`}
            accessibilityRole="button"
        >
            {/* Icono o Emoji */}
            {interes.Icon && interes.activo ? (
                <View style={styles.iconContainer}>
                    <interes.Icon
                        size={22}
                        color={accentColor}
                    />
                </View>
            ) : (
                <Text style={styles.chipEmoji}>{interes.emoji}</Text>
            )}

            <Text
                style={[
                    styles.chipLabel,
                    { color: interes.activo ? accentColor : C.interestInactiveText },
                ]}
            >
                {interes.nombre}
            </Text>

            {/* Indicador activo */}
            {interes.activo && (
                <View style={[styles.activeDot, { backgroundColor: accentColor }]} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        width: '47%',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        position: 'relative',
    },
    iconContainer: {
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipEmoji: {
        fontSize: 26,
    },
    chipLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
});
