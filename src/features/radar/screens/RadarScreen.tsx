import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Alert,
    Linking,
    Modal,
    LayoutAnimation,
    Platform,
    UIManager,
    useWindowDimensions,
} from 'react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    cancelAnimation,
    useDerivedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Circle, Line, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { C } from '../constants';
import EventCard from '../components/EventCard';
import { EventoCard } from '../types';
import { useEvents } from '../../event/hooks/useEvents';
import { mapBackendToEvento, getCategoryAccentColor } from '../../event/types';
import { EventoBackend } from '../../event/types/api';
import { Evento } from '../../event/types';
import EventDetailModal from '../../event/components/EventDetailModal';
import RecommendedEventCard from '../components/RecommendedEventCard';
import { useInterests } from '../../profile/state/interestsState';
import RadarBlip from '../components/RadarBlip';

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

    const isFocused = useIsFocused();

    // 1. Barrido de radar rotatorio 360° continuo en el hilo de UI
    const sweepRotation = useSharedValue(0);
    useEffect(() => {
        if (isFocused) {
            sweepRotation.value = 0; // Resetear para que empiece de forma limpia a velocidad constante
            sweepRotation.value = withRepeat(
                withTiming(360, {
                    duration: 8000, // Barrido a velocidad balanceada (3.2 segundos)
                    easing: Easing.linear,
                }),
                -1,
                false
            );
        } else {
            cancelAnimation(sweepRotation);
        }
        return () => {
            cancelAnimation(sweepRotation);
        };
    }, [isFocused]);

    // 2. Pulso para favoritos y recomendados (halo externo)
    const pulseScale = useSharedValue(1);
    useEffect(() => {
        if (isFocused) {
            pulseScale.value = 1;
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.6, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 1100, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            cancelAnimation(pulseScale);
        }
        return () => {
            cancelAnimation(pulseScale);
        };
    }, [isFocused]);

    // 3. Animación de pulso para anillos concéntricos
    const pulseTime = useSharedValue(0);
    useEffect(() => {
        if (isFocused) {
            pulseTime.value = 0; // Resetear al iniciar ciclo
            pulseTime.value = withRepeat(
                withTiming(3000, {
                    duration: 3000,
                    easing: Easing.linear,
                }),
                -1,
                false
            );
        } else {
            cancelAnimation(pulseTime);
        }
        return () => {
            cancelAnimation(pulseTime);
        };
    }, [isFocused]);

    // Fases derivadas para cada anillo concéntrico
    const phase1 = useDerivedValue(() => {
        return pulseTime.value / 3000;
    });
    const phase2 = useDerivedValue(() => {
        return ((pulseTime.value + 1000) % 3000) / 3000;
    });
    const phase3 = useDerivedValue(() => {
        return ((pulseTime.value + 2000) % 3000) / 3000;
    });

    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [eventoParaOpciones, setEventoParaOpciones] = useState<RadarEvento | null>(null);

    // ── Transición suave al rotar ────────────────────────────────────────────
    const { width: W } = useWindowDimensions();
    const prevW = useRef(W);
    useEffect(() => {
        if (prevW.current !== W) {
            LayoutAnimation.configureNext({
                duration: 280,
                create: { type: 'easeInEaseOut', property: 'opacity' },
                update: { type: 'easeInEaseOut' },
                delete: { type: 'easeInEaseOut', property: 'opacity' },
            });
            prevW.current = W;
        }
    }, [W]);

    // ── Abrir Google Maps con la ruta hacia el evento ──────────────────────────
    const abrirGoogleMaps = (lat: number, lon: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        Linking.openURL(url).catch((err) => {
            Alert.alert('Error', 'No se pudo abrir Google Maps en este dispositivo.');
            console.error('Error opening maps URL:', err);
        });
    };

    // ── Opciones del evento al presionar un punto en el radar ─────────────────
    const handleEventDotPress = (re: RadarEvento) => {
        const lat = re.backend.latitud;
        const lon = re.backend.longitud;

        if (lat !== null && lon !== null) {
            setEventoParaOpciones(re);
        } else {
            setEventoSeleccionado(re.mapped);
        }
    };

    // ── Pinch-to-zoom ─────────────────────────────────────────────────────────
    const ZOOM_MIN = 1.0;
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
                asistentes: backend.inscritosCount ?? 0,
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

    const maxDistanciaKm = useMemo(() => {
        if (radarEventos.length === 0) return 1.5;
        const dists = radarEventos.map((re) => re.distanciaKm);
        return Math.max(...dists, 1.5);
    }, [radarEventos]);

    const toggleFavorito = (id: string) => {
        setFavoritos((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const isLoading = loading || locationLoading;

    // ── Intereses del usuario y recomendaciones ───────────────────────────────
    const { matchesInterest } = useInterests();

    const eventosRecomendados = useMemo(() => {
        if (isLoading) return [];
        return radarEventos
            .filter(re => matchesInterest(re.card.categoria))
            .sort((a, b) => a.distanciaKm - b.distanciaKm)
            .slice(0, 3);
    }, [radarEventos, matchesInterest, isLoading]);

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
                <Reanimated.View
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

                    {/* Contenedor del Radar de tamaño fijo, centrado para asegurar alineación y escala perfectas */}
                    <View style={styles.radarCanvas}>
                        {/* 1. Fondo de Svg estático con ejes, círculos concéntricos y textos de distancia */}
                        <Svg
                            width="100%"
                            height="100%"
                            viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
                            style={StyleSheet.absoluteFillObject}
                            pointerEvents="none"
                        >
                            {/* Círculos concéntricos uniformes */}
                            <Circle cx="140" cy="140" r="112" stroke="#D1D5DB" strokeWidth="1.2" fill="none" />
                            <Circle cx="140" cy="140" r="78.4" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                            <Circle cx="140" cy="140" r="42" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" fill="none" />

                            {/* Ejes estilizados */}
                            <Line x1="28" y1="140" x2="252" y2="140" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                            <Line x1="140" y1="28" x2="140" y2="252" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

                            {/* Referencia de distancias sobre los anillos */}
                            <SvgText x="145" y="38" fill="#94A3B8" fontSize="8" fontWeight="600" textAnchor="start">
                                {formatearDistancia(maxDistanciaKm)}
                            </SvgText>
                            <SvgText x="145" y="72" fill="#94A3B8" fontSize="8" fontWeight="600" textAnchor="start">
                                {formatearDistancia(maxDistanciaKm * 0.7)}
                            </SvgText>
                            <SvgText x="145" y="108" fill="#94A3B8" fontSize="8" fontWeight="600" textAnchor="start">
                                {formatearDistancia(maxDistanciaKm * 0.375)}
                            </SvgText>
                        </Svg>

                        {/* 2. Anillos animados pulsantes nativos (Reanimated loops) con escala fluida porcentual */}
                        <Reanimated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                { alignItems: 'center', justifyContent: 'center' },
                                useAnimatedStyle(() => {
                                    return {
                                        transform: [{ scale: 0.15 + 0.85 * phase1.value }],
                                        opacity: 0.6 * (1 - phase1.value),
                                    };
                                })
                            ]}
                            pointerEvents="none"
                        >
                            <View
                                style={{
                                    width: '80%',
                                    height: '80%',
                                    borderRadius: 9999,
                                    borderWidth: 1.5,
                                    borderColor: C.radarRing1,
                                }}
                            />
                        </Reanimated.View>

                        <Reanimated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                { alignItems: 'center', justifyContent: 'center' },
                                useAnimatedStyle(() => {
                                    return {
                                        transform: [{ scale: 0.15 + 0.85 * phase2.value }],
                                        opacity: 0.6 * (1 - phase2.value),
                                    };
                                })
                            ]}
                            pointerEvents="none"
                        >
                            <View
                                style={{
                                    width: '56%',
                                    height: '56%',
                                    borderRadius: 9999,
                                    borderWidth: 1.5,
                                    borderColor: C.radarRing2,
                                }}
                            />
                        </Reanimated.View>

                        <Reanimated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                { alignItems: 'center', justifyContent: 'center' },
                                useAnimatedStyle(() => {
                                    return {
                                        transform: [{ scale: 0.15 + 0.85 * phase3.value }],
                                        opacity: 0.6 * (1 - phase3.value),
                                    };
                                })
                            ]}
                            pointerEvents="none"
                        >
                            <View
                                style={{
                                    width: '30%',
                                    height: '30%',
                                    borderRadius: 9999,
                                    borderWidth: 1.5,
                                    borderColor: C.radarRing3,
                                }}
                            />
                        </Reanimated.View>

                        {/* 3. Barrido de radar rotatorio con estela (Sweep y cono de luz) */}
                        <Reanimated.View
                            style={[
                                StyleSheet.absoluteFillObject,
                                useAnimatedStyle(() => {
                                    return {
                                        transform: [{ rotate: `${sweepRotation.value}deg` }],
                                    };
                                })
                            ]}
                            pointerEvents="none"
                        >
                            <Svg width="100%" height="100%" viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} style={StyleSheet.absoluteFillObject}>
                                <Defs>
                                    <LinearGradient id="sweepGrad" x1="100%" y1="50%" x2="75%" y2="10%" gradientUnits="userSpaceOnUse">
                                        <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                                        <Stop offset="50%" stopColor="#6366F1" stopOpacity="0.12" />
                                        <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                                    </LinearGradient>
                                </Defs>
                                {/* Estela luminosa: cono gradual */}
                                <Path
                                    d="M 140 140 L 210 18.76 A 140 140 0 0 1 280 140 Z"
                                    fill="url(#sweepGrad)"
                                />
                                {/* Brazo de barrido */}
                                <Line
                                    x1="140"
                                    y1="140"
                                    x2="280"
                                    y2="140"
                                    stroke="#6366F1"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                {/* Punta brillante */}
                                <Circle cx="280" cy="140" r="3.5" fill="#FFFFFF" />
                            </Svg>
                        </Reanimated.View>

                        {/* Punto central (usuario) */}
                        <View style={styles.centerDot}>
                            <View style={styles.centerDotInner} />
                        </View>

                        {/* Puntos (blips) de eventos reales sobre el radar */}
                        {!isLoading &&
                            radarEventos.map((re) => {
                                const esRecomendado = matchesInterest(re.card.categoria);
                                const esFavorito = favoritos.has(re.card.id);
                                const accentColor = getCategoryAccentColor(re.card.categoria);
                                return (
                                    <RadarBlip
                                        key={re.card.id}
                                        id={re.card.id}
                                        titulo={re.card.titulo}
                                        top={re.top}
                                        left={re.left}
                                        isFavorite={esRecomendado || esFavorito}
                                        accentColor={accentColor}
                                        onPress={() => handleEventDotPress(re)}
                                        sweepRotation={sweepRotation}
                                        pulseScale={pulseScale}
                                    />
                                );
                            })}
                    </View>

                    {/* Spinner de carga sobre el radar */}
                    {isLoading && (
                        <ActivityIndicator
                            size="large"
                            color={C.accent}
                            style={{ position: 'absolute', zIndex: 30 }}
                        />
                    )}

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
                </Reanimated.View>
            </GestureDetector>

            {/* ── Sección "Puede interesarte" ───────────────────────────────── */}
            {!isLoading && eventosRecomendados.length > 0 && (
                <View style={{ marginTop: 20 }}>
                    <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <HStack style={{ alignItems: 'center', gap: 6 }}>
                            <Icon as={ICONS.Heart} style={{ color: '#EF4444', width: 16, height: 16 }} />
                            <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 15 }}>
                                Puede interesarte
                            </Text>
                        </HStack>
                        <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                            {eventosRecomendados.length} recomendado(s)
                        </Text>
                    </HStack>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
                    >
                        {eventosRecomendados.map((re) => (
                            <RecommendedEventCard
                                key={re.card.id}
                                radarEvento={re}
                                onPress={() => setEventoSeleccionado(re.mapped)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* ── Eventos Detectados ────────────────────────────────────────── */}
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

            {/* ── Modal de Opciones del Evento (Diseño Premium) ────────────────── */}
            <Modal
                visible={eventoParaOpciones !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEventoParaOpciones(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEventoParaOpciones(null)}
                >
                    <View style={styles.optionsSheet}>
                        {eventoParaOpciones && (
                            <>
                                <View style={styles.sheetIndicator} />

                                <Text style={[styles.optionsCategory, { color: getCategoryAccentColor(eventoParaOpciones.card.categoria) }]} numberOfLines={1}>
                                    {eventoParaOpciones.card.categoria.toUpperCase()}
                                </Text>

                                <Text style={styles.optionsTitle} numberOfLines={2}>
                                    {eventoParaOpciones.card.titulo}
                                </Text>

                                <HStack style={styles.optionsLocationRow}>
                                    <Icon as={ICONS.MapPin} style={{ color: C.textSecondary, width: 14, height: 14 }} />
                                    <Text style={styles.optionsLocationText} numberOfLines={1}>
                                        {eventoParaOpciones.backend.lugar || 'No especificado'}
                                    </Text>
                                </HStack>

                                <Text style={styles.optionsDistance}>
                                    A {eventoParaOpciones.card.distancia} de ti
                                </Text>

                                <VStack style={styles.optionsButtonsContainer}>
                                    {/* Botón Guiar al Evento (Destacado) */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            const lat = eventoParaOpciones.backend.latitud;
                                            const lon = eventoParaOpciones.backend.longitud;
                                            if (lat !== null && lon !== null) {
                                                abrirGoogleMaps(lat, lon);
                                            }
                                            setEventoParaOpciones(null);
                                        }}
                                        style={[
                                            styles.actionButtonSolid,
                                            { backgroundColor: getCategoryAccentColor(eventoParaOpciones.card.categoria) }
                                        ]}
                                    >
                                        <Icon as={ICONS.MapPin} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                        <Text style={styles.actionButtonSolidText}>Guiar al evento (Google Maps)</Text>
                                    </TouchableOpacity>

                                    {/* Botón Ver Detalles */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEventoSeleccionado(eventoParaOpciones.mapped);
                                            setEventoParaOpciones(null);
                                        }}
                                        style={[
                                            styles.actionButtonOutline,
                                            { borderColor: getCategoryAccentColor(eventoParaOpciones.card.categoria) }
                                        ]}
                                    >
                                        <Icon as={ICONS.FileText} style={{ color: getCategoryAccentColor(eventoParaOpciones.card.categoria), width: 16, height: 16 }} />
                                        <Text style={[styles.actionButtonOutlineText, { color: getCategoryAccentColor(eventoParaOpciones.card.categoria) }]}>
                                            Ver detalles del evento
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Botón Cancelar */}
                                    <TouchableOpacity
                                        onPress={() => setEventoParaOpciones(null)}
                                        style={styles.cancelButton}
                                    >
                                        <Text style={styles.cancelButtonText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </VStack>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ── Modal de detalle del evento ─────────────────────────────── */}
            <EventDetailModal
                visible={eventoSeleccionado !== null}
                evento={eventoSeleccionado}
                onClose={() => setEventoSeleccionado(null)}
                favorito={eventoSeleccionado ? favoritos.has(eventoSeleccionado.id) : false}
                onToggleFavorito={toggleFavorito}
                onEventSaved={() => { }}
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
    radarCanvas: {
        width: RADAR_SIZE,
        height: RADAR_SIZE,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Oscuro translúcido para enfoque
        justifyContent: 'flex-end', // Estilo Bottom Sheet
    },
    optionsSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    sheetIndicator: {
        width: 38,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#E2E8F0',
        marginBottom: 18,
    },
    optionsCategory: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 6,
        textAlign: 'center',
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    optionsLocationRow: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 4,
    },
    optionsLocationText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    optionsDistance: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 20,
    },
    optionsButtonsContainer: {
        width: '100%',
        gap: 12,
    },
    actionButtonSolid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 50,
        borderRadius: 14,
        width: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButtonSolidText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    actionButtonOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 50,
        borderRadius: 14,
        borderWidth: 2,
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    actionButtonOutlineText: {
        fontSize: 14,
        fontWeight: '800',
    },
    cancelButton: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 4,
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '700',
    },
});