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
} from 'react-native';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface EventoDot {
    id: string;
    top: number;
    left: number;
    color: string;
}

interface EventoCard {
    id: string;
    titulo: string;
    distancia: string;
    asistentes: number;
    fecha: string;
    categoria: string;
    activo: boolean;
}

// ─── Datos estáticos de muestra ───────────────────────────────────────────────

const DOTS: EventoDot[] = [
    { id: 'a', top: 0.48, left: 0.50, color: '#A82BFA' },   // centro (púrpura)
    { id: 'b', top: 0.38, left: 0.72, color: '#22C55E' },   // derecha-arriba (verde)
    { id: 'c', top: 0.60, left: 0.22, color: '#22C55E' },   // izquierda-abajo
    { id: 'd', top: 0.68, left: 0.52, color: '#3B82F6' },   // abajo-centro (azul)
];

const EVENTOS: EventoCard[] = [
    {
        id: '1',
        titulo: 'Hackathon Tech 2026',
        distancia: '0.5 km',
        asistentes: 150,
        fecha: '24 may',
        categoria: 'Tecnología',
        activo: true,
    },
    {
        id: '2',
        titulo: 'Feria de Emprendimiento',
        distancia: '1.2 km',
        asistentes: 90,
        fecha: '26 may',
        categoria: 'Emprendimiento',
        activo: false,
    },
    {
        id: '3',
        titulo: 'Concierto Universitario',
        distancia: '0.8 km',
        asistentes: 220,
        fecha: '28 may',
        categoria: 'Música',
        activo: true,
    },
];

// ─── Colores de la paleta ─────────────────────────────────────────────────────
const C = {
    bg: '#F4F4FB',           // fondo general ligeramente lila
    radarBg: '#EEF0FA',      // fondo de la caja del radar
    radarRing1: '#C084FC',   // uniradar-lightPurple
    radarRing2: '#A78BFA',   // violeta medio
    radarRing3: '#6366F1',   // uniradar-indigo
    accent: '#6366F1',
    accentPurple: '#A82BFA',
    cardBg: '#FFFFFF',
    cardBorder: '#E9EAF4',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    tagBg: '#EEF2FF',
    tagText: '#4F46E5',
    green: '#22C55E',
};

// ─── Componentes locales ──────────────────────────────────────────────────────

function InfoPill({ icon, label }: { icon: React.ComponentType; label: string }) {
    return (
        <HStack style={{ alignItems: 'center', gap: 3 }}>
            <Icon as={icon} style={{ color: C.textSecondary, width: 12, height: 12 }} />
            <Text style={{ color: C.textSecondary, fontSize: 11 }}>{label}</Text>
        </HStack>
    );
}

function EventCard({ evento }: { evento: EventoCard }) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
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

// ─── Pantalla principal ───────────────────────────────────────────────────────

const RadarScreen = () => {
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
                                top: `${dot.top * 100}%` as unknown as number,
                                left: `${dot.left * 100}%` as unknown as number,
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
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

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

export default RadarScreen;