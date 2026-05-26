import React, { useState } from 'react';
import {
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

import { C, CATS, EVENTOS } from '../constants';
import { Evento } from '../types';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import { useEventState } from '../state';

export default function EventScreen() {
    const eventState = useEventState();
    const [busqueda, setBusqueda] = useState<string>('');
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [filtroActivo, setFiltroActivo] = useState<string>('Todos');
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

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

    const verDetalle = (ev: Evento) => {
        setEventoSeleccionado(ev);
    };

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

            <EventDetailModal
                visible={eventoSeleccionado !== null}
                evento={eventoSeleccionado}
                onClose={() => setEventoSeleccionado(null)}
                favorito={eventoSeleccionado ? favoritos.has(eventoSeleccionado.id) : false}
                onToggleFavorito={toggleFav}
            />
        </Box>
    );
}

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
    resetBtn: {
        marginTop: 8,
        borderRadius: 999,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
});
