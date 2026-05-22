import React, { useState } from 'react';
import {
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

// ─── Constantes ────────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');

// ─── Paleta (tokens uniradar) ─────────────────────────────────────────────────

const C = {
    bg: '#F4F4FB',
    cardBg: '#FFFFFF',
    cardBorder: '#E9EAF4',
    accent: '#6366F1',          // uniradar-indigo
    accentLight: '#EEF2FF',
    accentPurple: '#A82BFA',
    accentCyan: '#22D3EE',
    accentGold: '#EAB308',
    green: '#22C55E',
    greenLight: '#DCFCE7',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    favActive: '#EC4899',
    tagBg: '#EEF2FF',
    tagText: '#4F46E5',
};

// ─── Tipos (sin any / unknown / partial) ──────────────────────────────────────

interface Evento {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    lugar: string;
    categoria: string;
    asistentes: number;
    rating: number;
    precio: string;
    destacado: boolean;
    descripcion: string;
    imagenUri: string;
    accentColor: string;
    IconCategoria: React.ComponentType<{ size: number; color: string }>;
}

interface EventCardProps {
    evento: Evento;
    favorito: boolean;
    onToggleFavorito: (id: string) => void;
    onVerDetalle: (evento: Evento) => void;
}

// ─── Datos estáticos ───────────────────────────────────────────────────────────

const CATS: string[] = ['Todos', 'Tecnología', 'Música', 'Deporte', 'Social', 'Cultural'];

const EVENTOS: Evento[] = [
    {
        id: '1',
        titulo: 'Hackathon Tech 2025',
        fecha: '24 Abr',
        hora: '09:00 AM',
        lugar: 'Centro de Convenciones, Lima',
        categoria: 'Tecnología',
        asistentes: 342,
        rating: 4.8,
        precio: 'Gratis',
        destacado: true,
        descripcion: 'El hackathon más grande del Perú. 48 horas de innovación, networking y premios increíbles.',
        imagenUri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
        accentColor: C.accent,
        IconCategoria: ICONS.Laptop,
    },
    {
        id: '2',
        titulo: 'Festival Neon Beats',
        fecha: '02 May',
        hora: '07:00 PM',
        lugar: 'Anfiteatro del Parque, Miraflores',
        categoria: 'Música',
        asistentes: 1200,
        rating: 4.9,
        precio: 'S/ 80',
        destacado: true,
        descripcion: 'Una noche mágica con los mejores DJs del underground electrónico latinoamericano.',
        imagenUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        accentColor: C.accentPurple,
        IconCategoria: ICONS.Music2,
    },
    {
        id: '3',
        titulo: 'Liga Universitaria eSports',
        fecha: '10 May',
        hora: '02:00 PM',
        lugar: 'Auditorio UTP, San Isidro',
        categoria: 'Deporte',
        asistentes: 580,
        rating: 4.6,
        precio: 'S/ 15',
        destacado: false,
        descripcion: 'Compite en League of Legends, Valorant y FIFA con los mejores equipos universitarios.',
        imagenUri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        accentColor: C.green,
        IconCategoria: ICONS.Trophy,
    },
    {
        id: '4',
        titulo: 'Workshop: React Native Pro',
        fecha: '18 May',
        hora: '10:00 AM',
        lugar: 'Online — Zoom',
        categoria: 'Tecnología',
        asistentes: 95,
        rating: 4.7,
        precio: 'S/ 45',
        destacado: false,
        descripcion: 'Aprende a construir apps móviles profesionales con React Native y Expo en 6 horas.',
        imagenUri: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
        accentColor: C.accentCyan,
        IconCategoria: ICONS.Zap,
    },
    {
        id: '5',
        titulo: 'Feria del Amor',
        fecha: '05 Mayo',
        hora: '17:00 PM',
        lugar: 'Plaza Central, Lima',
        categoria: 'Social',
        asistentes: 210,
        rating: 4.5,
        precio: 'Gratis',
        destacado: false,
        descripcion: 'Un espacio de encuentro, arte y experiencias sensoriales para conectar personas.',
        imagenUri: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
        accentColor: C.favActive,
        IconCategoria: ICONS.Heart,
    },
];

// ─── Sub-componente: Info pill ─────────────────────────────────────────────────

function InfoPill({
    icono,
    label,
    color = C.textSecondary,
}: {
    icono: React.ComponentType;
    label: string;
    color?: string;
}) {
    return (
        <HStack style={{ alignItems: 'center', gap: 3 }}>
            <Icon as={icono} style={{ color, width: 12, height: 12 }} />
            <Text style={{ color, fontSize: 11, fontWeight: '500' }}>{label}</Text>
        </HStack>
    );
}

// ─── Sub-componente: Tarjeta de evento ────────────────────────────────────────

function EventCard({ evento, favorito, onToggleFavorito, onVerDetalle }: EventCardProps) {
    return (
        <Box
            style={[
                styles.card,
                { backgroundColor: C.cardBg, borderColor: C.cardBorder },
            ]}
        >
            {/* Línea de acento izquierda */}
            <Box
                style={[
                    styles.accentBar,
                    { backgroundColor: evento.accentColor },
                ]}
            />

            {/* Imagen */}
            <Image
                source={{ uri: evento.imagenUri }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            {/* Badge DESTACADO */}
            {evento.destacado && (
                <Box style={[styles.badge, { backgroundColor: evento.accentColor }]}>
                    <Icon as={ICONS.Star} style={{ color: '#FFFFFF', width: 10, height: 10 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>
                        DESTACADO
                    </Text>
                </Box>
            )}

            {/* Contenido */}
            <VStack style={{ padding: 12, gap: 8 }}>

                {/* Título + corazón */}
                <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text
                        style={[styles.cardTitle, { color: C.textPrimary }]}
                        numberOfLines={2}
                    >
                        {evento.titulo}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onToggleFavorito(evento.id)}
                        style={{ padding: 4 }}
                        accessibilityLabel={`Favorito ${evento.titulo}`}
                        accessibilityRole="button"
                    >
                        <Icon
                            as={ICONS.Heart}
                            style={{
                                color: favorito ? C.favActive : C.textMuted,
                                width: 18,
                                height: 18,
                            }}
                        />
                    </TouchableOpacity>
                </HStack>

                {/* Categoría */}
                <HStack style={{ alignItems: 'center', gap: 4 }}>
                    <evento.IconCategoria size={12} color={evento.accentColor} />
                    <Text style={{ color: evento.accentColor, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
                        {evento.categoria.toUpperCase()}
                    </Text>
                </HStack>

                {/* Descripción */}
                <Text style={{ color: C.textSecondary, fontSize: 12, lineHeight: 17 }} numberOfLines={2}>
                    {evento.descripcion}
                </Text>

                {/* Fecha / Hora / Precio */}
                <HStack style={{ flexWrap: 'wrap', gap: 10 }}>
                    <InfoPill icono={ICONS.CalendarDays} label={evento.fecha} />
                    <InfoPill icono={ICONS.Clock} label={evento.hora} />
                    <InfoPill icono={ICONS.Tag} label={evento.precio} color={evento.accentColor} />
                </HStack>

                {/* Lugar */}
                <InfoPill icono={ICONS.MapPin} label={evento.lugar} />

                {/* Pie: asistentes + rating + botón */}
                <HStack
                    style={[
                        styles.cardFooter,
                        { borderColor: C.cardBorder },
                    ]}
                >
                    <InfoPill icono={ICONS.Users} label={`${evento.asistentes.toLocaleString()} asistentes`} />
                    <InfoPill icono={ICONS.Star} label={String(evento.rating)} color={C.accentGold} />

                    <TouchableOpacity
                        onPress={() => onVerDetalle(evento)}
                        style={[styles.verMasBtn, { borderColor: evento.accentColor }]}
                        accessibilityLabel={`Ver detalle ${evento.titulo}`}
                        accessibilityRole="button"
                    >
                        <Text style={{ color: evento.accentColor, fontSize: 11, fontWeight: '700' }}>
                            Ver más
                        </Text>
                        <Icon as={ICONS.ChevronRight} style={{ color: evento.accentColor, width: 12, height: 12 }} />
                    </TouchableOpacity>
                </HStack>
            </VStack>
        </Box>
    );
}

// ─── Pantalla principal ────────────────────────────────────────────────────────

const EventScreen = () => {
    const [busqueda, setBusqueda] = useState<string>('');
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [filtroActivo, setFiltroActivo] = useState<string>('Todos');

    const totalFavoritos = favoritos.size;

    const filtrados = EVENTOS.filter(
        (ev) =>
            (ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                ev.lugar.toLowerCase().includes(busqueda.toLowerCase())) &&
            (filtroActivo === 'Todos' || ev.categoria === filtroActivo)
    );

    const toggleFav = (id: string) => {
        setFavoritos((prev) => {
            const siguiente = new Set(prev);
            siguiente.has(id) ? siguiente.delete(id) : siguiente.add(id);
            return siguiente;
        });
    };

    const verDetalle = (ev: Evento) =>
        Alert.alert(
            `📅 ${ev.titulo}`,
            `Categoría: ${ev.categoria}\nFecha: ${ev.fecha} — ${ev.hora}\nLugar: ${ev.lugar}\nPrecio: ${ev.precio}\n\n${ev.descripcion}`,
            [{ text: '¡Anotado!' }]
        );

    const cambiarFiltro = (cat: string) => {
        setFiltroActivo(cat);
        setBusqueda('');
    };

    return (
        <Box style={{ flex: 1, backgroundColor: C.bg }}>

            {/* ── Buscador + favoritos ───────────────────────────────────── */}
            <Box style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 10 }}>
                    Descubre lo que pasa cerca de ti
                </Text>

                <HStack style={{ gap: 10, alignItems: 'center', marginBottom: 12 }}>
                    {/* Input búsqueda */}
                    <HStack
                        style={[
                            styles.searchBar,
                            { backgroundColor: C.cardBg, borderColor: C.cardBorder, flex: 1 },
                        ]}
                    >
                        <Icon as={ICONS.Search} style={{ color: C.textMuted, width: 15, height: 15, marginRight: 6 }} />
                        <TextInput
                            placeholder="Buscar eventos o lugares..."
                            placeholderTextColor={C.textMuted}
                            value={busqueda}
                            onChangeText={setBusqueda}
                            style={{ flex: 1, fontSize: 13, color: C.textPrimary, height: 40 }}
                            accessibilityLabel="Buscar eventos"
                        />
                        {busqueda.length > 0 && (
                            <TouchableOpacity onPress={() => setBusqueda('')}>
                                <Text style={{ color: C.accent, fontSize: 11, fontWeight: '600' }}>Limpiar</Text>
                            </TouchableOpacity>
                        )}
                    </HStack>

                    {/* Badge favoritos */}
                    <HStack
                        style={[
                            styles.favBadge,
                            { backgroundColor: totalFavoritos > 0 ? '#FDF2F8' : C.cardBg, borderColor: C.cardBorder },
                        ]}
                    >
                        <Icon
                            as={ICONS.Heart}
                            style={{
                                color: totalFavoritos > 0 ? C.favActive : C.textMuted,
                                width: 15,
                                height: 15,
                            }}
                        />
                        <Text style={{ color: totalFavoritos > 0 ? C.favActive : C.textMuted, fontSize: 12, fontWeight: '700' }}>
                            {totalFavoritos}
                        </Text>
                    </HStack>
                </HStack>

                {/* Chips de categoría */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                    style={{ marginBottom: 10 }}
                >
                    {CATS.map((cat) => {
                        const activo = filtroActivo === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => cambiarFiltro(cat)}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: activo ? C.accent : C.cardBg,
                                        borderColor: activo ? C.accent : C.cardBorder,
                                    },
                                ]}
                                accessibilityLabel={`Filtrar ${cat}`}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={{
                                        color: activo ? '#FFFFFF' : C.textSecondary,
                                        fontSize: 13,
                                        fontWeight: activo ? '700' : '500',
                                    }}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Contador */}
                <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>
                    {filtrados.length} evento{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
                </Text>
            </Box>

            {/* ── Lista de eventos ───────────────────────────────────────── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 32 }}
            >
                {filtrados.length > 0 ? (
                    filtrados.map((ev) => (
                        <EventCard
                            key={ev.id}
                            evento={ev}
                            favorito={favoritos.has(ev.id)}
                            onToggleFavorito={toggleFav}
                            onVerDetalle={verDetalle}
                        />
                    ))
                ) : (
                    <VStack style={{ alignItems: 'center', paddingTop: 64, gap: 12 }}>
                        <Icon as={ICONS.Search} style={{ color: C.textMuted, width: 48, height: 48 }} />
                        <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '700' }}>
                            Sin resultados
                        </Text>
                        <Text style={{ color: C.textSecondary, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
                            No hay eventos que coincidan con "{busqueda}"
                        </Text>
                        <TouchableOpacity
                            style={[styles.resetBtn, { backgroundColor: C.accent }]}
                            onPress={() => { setBusqueda(''); setFiltroActivo('Todos'); }}
                            accessibilityLabel="Ver todos los eventos"
                            accessibilityRole="button"
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                                Ver todos los eventos
                            </Text>
                        </TouchableOpacity>
                    </VStack>
                )}
                <Box style={{ height: 16 }} />
            </ScrollView>
        </Box>
    );
};

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    favBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 16,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        position: 'relative',
        width: SW - 32,
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        zIndex: 10,
    },
    cardImage: {
        width: '100%',
        height: SW * 0.40,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderTopWidth: 1,
        paddingTop: 8,
        marginTop: 2,
        gap: 8,
    },
    verMasBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 2,
    },
    resetBtn: {
        marginTop: 8,
        borderRadius: 999,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
});

export default EventScreen;
