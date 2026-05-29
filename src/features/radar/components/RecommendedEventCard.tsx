import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { RadarEvento } from '../types';
import { getCategoryAccentColor } from '../../event/types';

interface RecommendedEventCardProps {
    radarEvento: RadarEvento;
    onPress: () => void;
}

export default function RecommendedEventCard({ radarEvento, onPress }: RecommendedEventCardProps) {
    const { card, backend } = radarEvento;
    const accentColor = getCategoryAccentColor(card.categoria);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            style={[styles.card, { borderColor: `${accentColor}33` }]}
            accessibilityLabel={`Evento recomendado: ${card.titulo}`}
            accessibilityRole="button"
        >
            {/* Badge superior "Para ti" */}
            <View style={[styles.badge, { backgroundColor: `${accentColor}18` }]}>
                <Text style={[styles.badgeText, { color: accentColor }]}>🎯 Para ti</Text>
            </View>

            <VStack style={styles.content}>
                {/* Categoría */}
                <Text style={[styles.categoria, { color: accentColor }]} numberOfLines={1}>
                    {card.categoria.toUpperCase()}
                </Text>

                {/* Título */}
                <Text style={styles.titulo} numberOfLines={2}>
                    {card.titulo}
                </Text>

                {/* Ubicación y distancia */}
                <HStack style={styles.metaRow}>
                    <Icon as={ICONS.MapPin} style={{ color: '#94A3B8', width: 11, height: 11 }} />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {backend.lugar || 'Sin ubicación'} · {card.distancia}
                    </Text>
                </HStack>

                {/* Fecha */}
                <HStack style={styles.metaRow}>
                    <Icon as={ICONS.CalendarDays} style={{ color: '#94A3B8', width: 11, height: 11 }} />
                    <Text style={styles.metaText}>{card.fecha}</Text>
                </HStack>
            </VStack>

            {/* Flecha indicadora */}
            <View style={[styles.arrowCircle, { backgroundColor: `${accentColor}15` }]}>
                <Icon as={ICONS.ChevronRight} style={{ color: accentColor, width: 14, height: 14 }} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        marginRight: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    content: {
        gap: 4,
        flex: 1,
    },
    categoria: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    titulo: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
        lineHeight: 17,
        marginBottom: 4,
    },
    metaRow: {
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
        flex: 1,
    },
    arrowCircle: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
