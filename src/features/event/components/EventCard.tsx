import React from 'react';
import {
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { EventCardProps } from '../types';
import { C } from '../constants';
import InfoPill from './InfoPill';

const { width: SW } = Dimensions.get('window');

export default function EventCard({ evento, favorito, onToggleFavorito, onVerDetalle }: EventCardProps) {
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

const styles = StyleSheet.create({
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
});
