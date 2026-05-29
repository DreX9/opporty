import React from 'react';
import {
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    View,
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
import { eventStateManager, useEventState } from '../state';

const { width: SW } = Dimensions.get('window');

export default function EventCard({ evento, favorito, onToggleFavorito, onVerDetalle }: EventCardProps) {
    const eventState = useEventState();
    const isRegistered = eventStateManager.isRegistered(evento.id);
    const isFull = !!(evento.capacidad && evento.capacidad > 0 && evento.inscritosCount >= evento.capacidad);

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
            {evento.destacado && !isFull && (
                <Box style={[styles.badge, { backgroundColor: evento.accentColor }]}>
                    <Icon as={ICONS.Star} style={{ color: '#FFFFFF', width: 10, height: 10 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>
                        DESTACADO
                    </Text>
                </Box>
            )}

            {/* Badge LLENO */}
            {isFull && (
                <Box style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                    <Icon as={ICONS.Users} style={{ color: '#FFFFFF', width: 10, height: 10 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>
                        LLENO
                    </Text>
                </Box>
            )}

            {/* Contenido */}
            <VStack style={{ padding: 12, gap: 8 }}>

                {/* Título + corazón / Estado Registro */}
                <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <VStack style={{ flex: 1, marginRight: 8 }}>
                        <HStack style={{ alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text
                                style={[styles.cardTitle, { color: C.textPrimary }]}
                                numberOfLines={2}
                            >
                                {evento.titulo}
                            </Text>
                            {isRegistered && (
                                <View style={styles.regBadge}>
                                    <Icon as={ICONS.CheckCircle} style={{ color: '#16A34A', width: 12, height: 12 }} />
                                    <Text style={styles.regBadgeText}>Registrado</Text>
                                </View>
                            )}
                        </HStack>
                    </VStack>
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
                    <InfoPill icono={ICONS.Users} label={`${evento.inscritosCount}${evento.capacidad ? '/' + evento.capacidad : ''} asistentes`} />
                    <InfoPill icono={ICONS.Star} label={String(evento.rating)} color={C.accentGold} />

                    <TouchableOpacity
                        onPress={() => onVerDetalle && onVerDetalle(evento)}
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
        lineHeight: 22,
        flex: 1,
    },
    regBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#DCFCE7',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
        alignSelf: 'flex-start',
    },
    regBadgeText: {
        color: '#15803D',
        fontSize: 10,
        fontWeight: '700',
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
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    registerBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    badgesSection: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 10,
        gap: 8,
        marginTop: 4,
    },
    badgesSecTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badgesRow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 8,
    },
    insigniaBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    insigniaLocked: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    insigniaUnlocked: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    insigniaText: {
        fontSize: 10,
        fontWeight: '700',
    },
    insigniaLockedText: {
        color: '#64748B',
    },
    insigniaUnlockedText: {
        color: '#047857',
    },
    certBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 2,
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    certBtnActive: {
        backgroundColor: '#EAB308',
    },
    certBtnSuccess: {
        backgroundColor: '#059669',
    },
    certBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    certLockedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    certLockedText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    // Estilos del Modal del Diploma
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    certModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        maxWidth: 420,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    certHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    certHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    certCloseBtn: {
        padding: 4,
    },
    diplomaBox: {
        width: '100%',
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FCD34D',
        padding: 8,
        marginBottom: 16,
    },
    diplomaBorder: {
        borderWidth: 2,
        borderColor: '#D97706',
        borderRadius: 12,
        padding: 10,
    },
    diplomaInnerBorder: {
        borderWidth: 1,
        borderColor: '#FCD34D',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    diplomaIcon: {
        color: '#D97706',
        width: 32,
        height: 32,
        marginBottom: 6,
    },
    diplomaUniName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: 1.5,
    },
    diplomaSub: {
        fontSize: 8,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 8,
    },
    diplomaDivider: {
        width: 60,
        height: 2,
        backgroundColor: '#D97706',
        marginVertical: 8,
    },
    diplomaConstName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#D97706',
        letterSpacing: 2,
        marginBottom: 10,
    },
    diplomaBodyText: {
        fontSize: 10,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 14,
        marginVertical: 4,
    },
    diplomaStudent: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: 0.5,
        marginVertical: 6,
        textDecorationLine: 'underline',
    },
    diplomaEventTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginVertical: 4,
    },
    diplomaCredits: {
        fontSize: 9,
        fontWeight: '600',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 12,
        marginTop: 6,
        marginBottom: 12,
    },
    diplomaSignatures: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 8,
    },
    signatureBox: {
        alignItems: 'center',
        width: 100,
    },
    signLine: {
        width: 80,
        height: 1,
        backgroundColor: '#94A3B8',
        marginBottom: 4,
    },
    signName: {
        fontSize: 8,
        fontWeight: '700',
        color: '#1E293B',
    },
    signRole: {
        fontSize: 6,
        fontWeight: '600',
        color: '#64748B',
    },
    diplomaSeal: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#D97706',
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-15deg' }],
    },
    sealText: {
        fontSize: 7,
        fontWeight: '900',
        color: '#D97706',
    },
    diplomaVerificationCode: {
        fontSize: 7,
        fontFamily: 'monospace',
        color: '#94A3B8',
        marginTop: 8,
    },
    certDownloadBtn: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    certDownloadBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
});
