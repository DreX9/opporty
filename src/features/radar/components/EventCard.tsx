import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ICONS } from '@/components/icons';
import { EventCardProps } from '../types';
import { C } from '../constants';
import InfoPill from './InfoPill';

export default function EventCard({ evento, onPress }: EventCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.card, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}
        >
            {/* Indicador activo */}
            <View
                style={[
                    styles.activeDot,
                    { backgroundColor: evento.activo ? C.green : C.textSecondary },
                ]}
            />

            <VStack style={{ gap: 6 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 15 }}>
                    {evento.titulo}
                </Text>

                {/* Meta info */}
                <HStack style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <InfoPill icon={ICONS.MapPin} label={evento.distancia} />
                    <InfoPill icon={ICONS.Users} label={`${evento.asistentes}`} />
                    <InfoPill icon={ICONS.CalendarDays} label={evento.fecha} />
                </HStack>

                {/* Tag categoría */}
                <View style={styles.tag}>
                    <Text style={{ color: C.tagText, fontSize: 11, fontWeight: '600' }}>
                        {evento.categoria}
                    </Text>
                </View>
            </VStack>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        position: 'relative',
    },
    activeDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tag: {
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
});
