import React from 'react';
import RadarRing from '@/components/animations/RadarRing';
import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
    ScrollView,
    TextInput,
    View,
    TouchableOpacity,
    StyleSheet,
    DimensionValue,
} from 'react-native';

import { C, DOTS, EVENTOS } from '../constants';
import EventCard from '../components/EventCard';

export default function RadarScreen() {
    const RADAR_SIZE = 280;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: C.bg }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
            {/* Subtítulo debajo del header */}
            <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 16 }}>
                Sistema UniRadar
            </Text>

            {/* ── Buscador ────────────────────────────────────────────────── */}
            <View style={[styles.searchBar, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
                <Icon as={ICONS.Search} style={{ color: C.textSecondary, width: 16, height: 16, marginRight: 8 }} />
                <TextInput
                    placeholder="Buscar eventos..."
                    placeholderTextColor={C.textSecondary}
                    style={{ flex: 1, fontSize: 14, color: C.textPrimary }}
                    accessibilityLabel="Buscar eventos"
                />
            </View>

            {/* ── Título sección radar ─────────────────────────────────────── */}
            <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <HStack style={{ alignItems: 'center', gap: 6 }}>
                    <Icon as={ICONS.radar} style={{ color: C.accent, width: 18, height: 18 }} />
                    <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 15 }}>
                        Radar Activo
                    </Text>
                </HStack>
                <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                    {EVENTOS.length} eventos
                </Text>
            </HStack>

            {/* ── Zona del radar animado ───────────────────────────────────── */}
            <View
                style={[
                    styles.radarBox,
                    { backgroundColor: C.radarBg, borderColor: C.cardBorder },
                ]}
            >
                {/* Badge de eventos detectados */}
                <View style={styles.badge}>
                    <Text style={{ color: C.textPrimary, fontSize: 11, fontWeight: '600' }}>
                        {EVENTOS.length} eventos detectados
                    </Text>
                </View>

                {/* Anillos estáticos (estructura visual) */}
                {[RADAR_SIZE * 0.95, RADAR_SIZE * 0.65, RADAR_SIZE * 0.35].map((s, i) => (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            width: s,
                            height: s,
                            borderRadius: s / 2,
                            borderWidth: 1,
                            borderColor: '#C7C8E8',
                        }}
                    />
                ))}

                {/* Anillos animados (pulso) */}
                <RadarRing size={RADAR_SIZE * 0.95} delay={0} color={C.radarRing1} />
                <RadarRing size={RADAR_SIZE * 0.65} delay={1000} color={C.radarRing2} />
                <RadarRing size={RADAR_SIZE * 0.35} delay={2000} color={C.radarRing3} />

                {/* Punto central (usuario) */}
                <View style={styles.centerDot}>
                    <View style={styles.centerDotInner} />
                </View>

                {/* Puntos de eventos sobre el radar */}
                {DOTS.filter((d) => d.id !== 'a').map((dot) => (
                    <View
                        key={dot.id}
                        style={[
                            styles.eventDot,
                            {
                                backgroundColor: dot.color,
                                top: `${dot.top * 100}%` as DimensionValue,
                                left: `${dot.left * 100}%` as DimensionValue,
                                transform: [{ translateX: -6 }, { translateY: -6 }],
                            },
                        ]}
                    />
                ))}
            </View>

            {/* ── Eventos Destacados ────────────────────────────────────────── */}
            <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 16 }}>
                    Eventos Destacados
                </Text>
                <TouchableOpacity>
                    <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>
                        Ver todos
                    </Text>
                </TouchableOpacity>
            </HStack>

            <VStack style={{ gap: 12 }}>
                {EVENTOS.map((ev) => (
                    <EventCard key={ev.id} evento={ev} />
                ))}
            </VStack>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    radarBox: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        zIndex: 10,
    },
    centerDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#A82BFA',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
    centerDotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#A82BFA',
    },
    eventDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 10,
    },
});