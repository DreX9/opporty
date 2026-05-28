import React, { useState, useEffect, useMemo } from 'react';
import RadarRing from '@/components/animations/RadarRing';
import { ICONS } from '@/components/icons';
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
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

import { C } from '../constants';
import EventCard from '../components/EventCard';
import { EventoCard } from '../types';
import { useEvents } from '../../event/hooks/useEvents';
import { mapBackendToEvento, getCategoryAccentColor } from '../../event/types';
import { EventoBackend } from '../../event/types/api';
import { Evento } from '../../event/types';
import EventDetailModal from '../../event/components/EventDetailModal';

// ── Coordenadas por defecto (Lima, Perú — UTP) ────────────────────────────────
const DEFAULT_LOCATION = { latitude: -12.046374, longitude: -77.042793 };
const RADAR_SIZE = 280;

// ── Haversine: calcula la distancia en km entre dos coordenadas ──────────────
function calcularDistanciaKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ── Formatea la distancia en texto legible ────────────────────────────────────
function formatearDistancia(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

// ── Proyecta las coordenadas del evento sobre el radar en [0, 1] ──────────────
function calcularPosicionRadar(
    userLat: number,
    userLon: number,
    eventoLat: number,
    eventoLon: number,
    distanciaKm: number,
    maxDistanciaKm: number,
): { top: number; left: number } {
    const dLat = eventoLat - userLat;
    const dLon =
        (eventoLon - userLon) * Math.cos((userLat * Math.PI) / 180);
    const angulo = Math.atan2(dLat, dLon);
    // Raíz cuadrada: comprime distancias grandes, expande las pequeñas → espaciado visual más natural
    const radioNorm = Math.sqrt(Math.min(distanciaKm / maxDistanciaKm, 1));
    // Margen máximo de 0.40 para dejar espacio visual en los bordes
    const radio = radioNorm * 0.40;
    return {
        left: 0.5 + radio * Math.cos(angulo),
        top: 0.5 - radio * Math.sin(angulo),
    };
}

interface RadarEvento {
    backend: EventoBackend;
    card: EventoCard;
    mapped: Evento;
    distanciaKm: number;
    top: number;
    left: number;
}

export default function RadarScreen() {
    const { data: backendEvents, loading } = useEvents();

    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());

    // ── Pinch-to-zoom ─────────────────────────────────────────────────────────
    const ZOOM_MIN = 0.6;
    const ZOOM_MAX = 3.0;
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            const next = savedScale.value * e.scale;
            scale.value = Math.min(Math.max(next, ZOOM_MIN), ZOOM_MAX);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const animatedRadarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Doble tap para resetear zoom al valor original
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            savedScale.value = 1;
        });

    const combinedGesture = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

    // ── Obtener ubicación del dispositivo ─────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const obtenerUbicacion = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    if (mounted) setUserLocation(DEFAULT_LOCATION);
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                if (mounted) {
                    setUserLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                }
            } catch {
                if (mounted) setUserLocation(DEFAULT_LOCATION);
            } finally {
                if (mounted) setLocationLoading(false);
            }
        };
        obtenerUbicacion();
        return () => { mounted = false; };
    }, []);

    // ── Procesar eventos: filtrar, calcular distancias y proyectar en radar ───
    const radarEventos: RadarEvento[] = useMemo(() => {
        if (!userLocation || !Array.isArray(backendEvents)) return [];

        const eventosConCoordenadas = backendEvents.filter(
            (e) =>
                e.latitud !== null &&
                e.longitud !== null &&
                (e.estado === 'PUBLISHED' || e.estado === 'SCHEDULED'),
        );

        const filtrados = searchQuery.trim()
            ? eventosConCoordenadas.filter(
                  (e) =>
                      e.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (e.lugar ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
              )
            : eventosConCoordenadas;

        if (filtrados.length === 0) return [];

        // Calcular distancias
        const conDistancia = filtrados.map((e) => ({
            backend: e,
            distanciaKm: calcularDistanciaKm(
                userLocation.latitude,
                userLocation.longitude,
                e.latitud!,
                e.longitud!,
            ),
        }));

        // La distancia máxima define la escala del radar (mínimo 1 km para evitar saturación)
        const maxDistanciaKm = Math.max(
            ...conDistancia.map((x) => x.distanciaKm),
            1,
        );

        return conDistancia.map(({ backend, distanciaKm }) => {
            const { top, left } = calcularPosicionRadar(
                userLocation.latitude,
                userLocation.longitude,
                backend.latitud!,
                backend.longitud!,
                distanciaKm,
                maxDistanciaKm,
            );

            const firstCategoria =
                backend.categories && backend.categories.length > 0
                    ? backend.categories[0].nombre
                    : 'General';

            const card: EventoCard = {
                id: String(backend.id),
                titulo: backend.titulo,
                distancia: formatearDistancia(distanciaKm),
                asistentes: backend.capacidad ? Math.floor(backend.capacidad * 0.3) : 0,
                fecha: backend.fechaInicio,
                categoria: firstCategoria,
                activo: backend.estado === 'PUBLISHED',
            };

            return {
                backend,
                card,
                mapped: mapBackendToEvento(backend),
                distanciaKm,
                top,
                left,
            };
        });
    }, [backendEvents, userLocation, searchQuery]);

    const toggleFavorito = (id: string) => {
        setFavoritos((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const isLoading = loading || locationLoading;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: C.bg }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        >
            {/* Subtítulo */}
            <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 16 }}>
                {userLocation
                    ? 'Mostrando eventos cercanos a tu ubicación'
                    : 'Sistema UniRadar'}
            </Text>

            {/* ── Buscador ────────────────────────────────────────────────── */}
            <View style={[styles.searchBar, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
                <Icon as={ICONS.Search} style={{ color: C.textSecondary, width: 16, height: 16, marginRight: 8 }} />
                <TextInput
                    placeholder="Buscar eventos..."
                    placeholderTextColor={C.textSecondary}
                    style={{ flex: 1, fontSize: 14, color: C.textPrimary }}
                    accessibilityLabel="Buscar eventos"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={{ color: C.accent, fontSize: 11, fontWeight: '600' }}>
                            Limpiar
                        </Text>
                    </TouchableOpacity>
                )}
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
                    {isLoading ? 'Cargando...' : `${radarEventos.length} eventos`}
                </Text>
            </HStack>

            {/* ── Zona del radar animado — con pinch-to-zoom ───────────────── */}
            <GestureDetector gesture={combinedGesture}>
                <Animated.View
                    style={[
                        styles.radarBox,
                        { backgroundColor: C.radarBg, borderColor: C.cardBorder },
                        animatedRadarStyle,
                    ]}
                >
                {/* Badge de eventos detectados */}
                <View style={styles.badge}>
                    <Text style={{ color: C.textPrimary, fontSize: 11, fontWeight: '600' }}>
                        {isLoading ? '...' : `${radarEventos.length} eventos detectados`}
                    </Text>
                </View>

                {/* Anillos estáticos (estructura visual) — reducidos para evitar recorte */}
                {[RADAR_SIZE * 0.80, RADAR_SIZE * 0.56, RADAR_SIZE * 0.30].map((s, i) => (
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

                {/* Anillos animados (pulso) — tamaño reducido para que el scale de Moti no se recorte */}
                <RadarRing size={RADAR_SIZE * 0.80} delay={0} color={C.radarRing1} />
                <RadarRing size={RADAR_SIZE * 0.56} delay={1000} color={C.radarRing2} />
                <RadarRing size={RADAR_SIZE * 0.30} delay={2000} color={C.radarRing3} />

                {/* Punto central (usuario) */}
                <View style={styles.centerDot}>
                    <View style={styles.centerDotInner} />
                </View>

                {/* Spinner de carga sobre el radar */}
                {isLoading && (
                    <ActivityIndicator
                        size="large"
                        color={C.accent}
                        style={{ position: 'absolute' }}
                    />
                )}

                {/* Puntos de eventos reales sobre el radar */}
                {!isLoading &&
                    radarEventos.map((re) => (
                        <TouchableOpacity
                            key={re.card.id}
                            onPress={() => setEventoSeleccionado(re.mapped)}
                            style={[
                                styles.eventDot,
                                {
                                    backgroundColor: getCategoryAccentColor(re.card.categoria),
                                    top: `${re.top * 100}%` as DimensionValue,
                                    left: `${re.left * 100}%` as DimensionValue,
                                    transform: [{ translateX: -6 }, { translateY: -6 }],
                                },
                            ]}
                            accessibilityLabel={`Ver evento ${re.card.titulo}`}
                            accessibilityRole="button"
                        />
                    ))}

                {/* Mensaje si no hay eventos con coordenadas */}
                {!isLoading && radarEventos.length === 0 && (
                    <View style={styles.emptyOverlay}>
                        <Icon as={ICONS.MapPin} style={{ color: C.textSecondary, width: 24, height: 24 }} />
                        <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                            {searchQuery
                                ? 'Sin coincidencias en el radar'
                                : 'No hay eventos con ubicación registrada'}
                        </Text>
                    </View>
                )}
            </Animated.View>
            </GestureDetector>

            {/* ── Eventos Destacados ────────────────────────────────────────── */}
            <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 16 }}>
                    Eventos Detectados
                </Text>
                <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                    {isLoading ? '...' : `${radarEventos.length} resultado(s)`}
                </Text>
            </HStack>

            {isLoading ? (
                <VStack style={{ alignItems: 'center', paddingVertical: 32, gap: 10 }}>
                    <ActivityIndicator size="small" color={C.accent} />
                    <Text style={{ color: C.textSecondary, fontSize: 13 }}>
                        Obteniendo ubicación y eventos...
                    </Text>
                </VStack>
            ) : radarEventos.length === 0 ? (
                <VStack style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
                    <Icon as={ICONS.Search} style={{ color: C.textSecondary, width: 36, height: 36 }} />
                    <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 15 }}>
                        Sin eventos disponibles
                    </Text>
                    <Text style={{ color: C.textSecondary, fontSize: 12, textAlign: 'center', paddingHorizontal: 24 }}>
                        {searchQuery
                            ? 'Ningún evento coincide con tu búsqueda.'
                            : 'Los eventos publicados aparecerán aquí cuando tengan coordenadas registradas.'}
                    </Text>
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={{ color: C.accent, fontWeight: '700', fontSize: 13 }}>
                                Limpiar búsqueda
                            </Text>
                        </TouchableOpacity>
                    )}
                </VStack>
            ) : (
                <VStack style={{ gap: 12 }}>
                    {radarEventos
                        .slice()
                        .sort((a, b) => a.distanciaKm - b.distanciaKm)
                        .map((re) => (
                            <EventCard
                                key={re.card.id}
                                evento={re.card}
                                onPress={() => setEventoSeleccionado(re.mapped)}
                            />
                        ))}
                </VStack>
            )}

            {/* ── Modal de detalle del evento ─────────────────────────────── */}
            <EventDetailModal
                visible={eventoSeleccionado !== null}
                evento={eventoSeleccionado}
                onClose={() => setEventoSeleccionado(null)}
                favorito={eventoSeleccionado ? favoritos.has(eventoSeleccionado.id) : false}
                onToggleFavorito={toggleFavorito}
                onEventSaved={() => {}}
            />
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
        // overflow visible para que los anillos animados de Moti no se recorten al expandirse
        overflow: 'visible',
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
    emptyOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
});