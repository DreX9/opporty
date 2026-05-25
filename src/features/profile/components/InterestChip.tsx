import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { InterestChipProps } from '../types';
import { C } from '../constants';

export default function InterestChip({ interes, onToggle }: InterestChipProps) {
    return (
        <TouchableOpacity
            onPress={() => onToggle(interes.id)}
            activeOpacity={0.75}
            style={[
                styles.chip,
                {
                    backgroundColor: interes.activo ? C.interestActive : C.cardBg,
                    borderColor: interes.activo ? C.interestActiveBorder : C.cardBorder,
                },
            ]}
            accessibilityLabel={`Interés: ${interes.nombre}`}
            accessibilityRole="button"
        >
            <Text style={styles.chipEmoji}>{interes.emoji}</Text>
            <Text
                style={[
                    styles.chipLabel,
                    { color: interes.activo ? C.accent : C.interestInactiveText },
                ]}
            >
                {interes.nombre}
            </Text>
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
    },
    chipEmoji: {
        fontSize: 26,
    },
    chipLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
});
