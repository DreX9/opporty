import React, { useState } from 'react';
import {
    ScrollView,
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ICONS } from '@/components/icons';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { useAuthState, authStateManager } from '../../auth/state';
import * as Clipboard from 'expo-clipboard';

import { C, INTERESES_INICIAL, MENU_ITEMS } from '../constants';
import { Interes } from '../types';
import InterestChip from '../components/InterestChip';
import MenuRow from '../components/MenuRow';
import EditProfileModal from '../components/EditProfileModal';
import { eventStateManager, useEventState } from '../../event/state';
import { Evento, mapBackendToEvento } from '../../event/types';
import { useEvents } from '../../event/hooks/useEvents';

export default function ProfileScreen() {
    const router = useRouter();
    const { payload, role } = useAuthState();
    const isAdmin = role === 'ADMIN';

    const eventState = useEventState();
    const { data: backendEvents } = useEvents();
    const EVENTOS = Array.isArray(backendEvents) ? backendEvents.map(mapBackendToEvento) : [];

    const [intereses, setIntereses] = useState<Interes[]>(INTERESES_INICIAL);
    const [selectedConstanciaEvento, setSelectedConstanciaEvento] = useState<Evento | null>(null);
    const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);


    const totalActivos = intereses.filter((i) => i.activo).length;

    const copyUsername = async () => {
        if (payload?.sub) {
            await Clipboard.setStringAsync(payload.sub);
            Alert.alert('¡Copiado! 📋', 'El nombre de usuario ha sido copiado al portapapeles.');
        }
    };

    const toggleInteres = (id: number) => {
        setIntereses((prev) =>
            prev.map((i) => (i.id === id ? { ...i, activo: !i.activo } : i))
        );
    };

    const handleDownloadCert = (evento: Evento) => {
        eventStateManager.descargarConstancia(evento.id);
        Alert.alert(
            '¡Constancia Guardada! 📄',
            `Se ha generado y descargado con éxito la Constancia de Participación para "${evento.titulo}" en formato PDF.`,
            [{ text: 'Aceptar', onPress: () => setIsDiplomaOpen(false) }]
        );
    };

    const handleOpenDiploma = (evento: Evento) => {
        setSelectedConstanciaEvento(evento);
        setIsDiplomaOpen(true);
    };

    const handleLogout = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Salir', 
                style: 'destructive', 
                onPress: () => {
                    authStateManager.clearSession();
                    router.replace('/');
                } 
            },
        ]);
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: C.bg }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 48 }}
        >
            {/* ── Banner de perfil (degradado índigo → púrpura) ─────────────── */}
            <View style={styles.heroBanner}>
                {/* Botón de ajustes */}
                <TouchableOpacity
                    onPress={() => setIsEditOpen(true)}
                    style={styles.settingsBtn}
                    accessibilityLabel="Ajustes"
                    accessibilityRole="button"
                >

                    <Icon as={ICONS.edit2} style={{ color: C.accent, width: 20, height: 20 }} />
                </TouchableOpacity>

                {/* Avatar */}
                <View style={styles.avatarRing}>
                    <View style={styles.avatarInner}>
                        <Icon as={ICONS.user} style={{ color: C.accent, width: 44, height: 44 }} />
                    </View>
                </View>

                {/* Nombre y email */}
                <Text style={styles.heroName}>
                    {payload?.firstName && payload?.lastName
                        ? `${payload.firstName} ${payload.lastName}`
                        : (payload?.sub || 'Usuario')}
                </Text>
                
                <HStack style={styles.usernameRow}>
                    <Text style={styles.heroEmail}>@{payload?.sub || 'username'}</Text>
                    <TouchableOpacity
                        onPress={copyUsername}
                        style={styles.smallCopyBtn}
                        accessibilityLabel="Copiar usuario"
                        accessibilityRole="button"
                    >
                        <Icon as={ICONS.Copy} style={{ color: 'rgba(255, 255, 255, 0.8)', width: 12, height: 12 }} />
                    </TouchableOpacity>
                </HStack>

                {/* Badge de rol */}
                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{isAdmin ? 'Administrador' : 'Alumno UTP'}</Text>
                </View>
            </View>

            {/* ── Tarjeta universidad / facultad ───────────────────────────── */}
            <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                    <View style={[styles.infoIconBox, { backgroundColor: C.accentLight }]}>
                        <Icon as={ICONS.Laptop} style={{ color: C.accent, width: 18, height: 18 }} />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Universidad</Text>
                        <Text style={styles.infoValue}>Sistema UniRadar</Text>
                    </View>
                </View>

                <View style={[styles.infoDivider, { backgroundColor: C.cardBorder }]} />

                <View style={styles.infoItem}>
                    <View style={[styles.infoIconBox, { backgroundColor: '#F5F3FF' }]}>
                        <Icon as={ICONS.Zap} style={{ color: C.accentPurple, width: 18, height: 18 }} />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Facultad</Text>
                        <Text style={styles.infoValue}>Administración</Text>
                    </View>
                </View>
            </View>

            {/* ── Sección Intereses ─────────────────────────────────────────── */}
            <View style={[styles.section, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
                {/* Header */}
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon as={ICONS.Heart} style={{ color: C.danger, width: 18, height: 18 }} />
                        <Text style={styles.sectionTitle}>Intereses</Text>
                    </View>
                    <Text style={{ color: C.textSecondary, fontSize: 13 }}>
                        {totalActivos} seleccionados
                    </Text>
                </View>

                {/* Grid 2 columnas */}
                <View style={styles.chipGrid}>
                    {intereses.map((item) => (
                        <InterestChip key={item.id} interes={item} onToggle={toggleInteres} />
                    ))}
                </View>
            </View>

            {/* ── Sección Mis Constancias ── */}
            {(() => {
                const registradosConConstancia = EVENTOS.filter(ev => eventState.registrados.has(ev.id));
                const totalConstanciasObtenidas = registradosConConstancia.filter(ev => {
                    const ins = eventState.insignias[ev.id] || { ingreso: false, salida: false };
                    return ins.ingreso && ins.salida;
                }).length;

                return (
                    <View style={[styles.section, { backgroundColor: C.cardBg, borderColor: C.cardBorder, marginTop: 16 }]}>
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Icon as={ICONS.GraduationCap} style={{ color: '#EAB308', width: 18, height: 18 }} />
                                <Text style={styles.sectionTitle}>Mis Constancias Oficiales</Text>
                            </View>
                            <Text style={{ color: C.textSecondary, fontSize: 13, fontWeight: '700' }}>
                                {totalConstanciasObtenidas} Obtenidas
                            </Text>
                        </View>

                        {registradosConConstancia.length > 0 ? (
                            <View style={{ gap: 12 }}>
                                {registradosConConstancia.map((ev) => {
                                    const ins = eventState.insignias[ev.id] || { ingreso: false, salida: false };
                                    const completado = ins.ingreso && ins.salida;
                                    const hasDescargado = eventStateManager.hasDescargadoConstancia(ev.id);

                                    return (
                                        <View key={ev.id} style={styles.badgeRowContainer}>
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <Text style={styles.badgeEventTitle} numberOfLines={1}>
                                                    {ev.titulo}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: completado ? '#10B981' : '#6B7280', fontWeight: '600' }}>
                                                    {completado ? '🎓 Constancia Disponible' : '⏳ Asistencia en curso'}
                                                </Text>
                                            </View>
                                            
                                            {completado ? (
                                                <TouchableOpacity
                                                    onPress={() => handleOpenDiploma(ev)}
                                                    style={hasDescargado ? styles.certDownloadBtnMiniSuccess : styles.certDownloadBtnMini}
                                                >
                                                    <Icon as={ICONS.FileText} style={{ color: '#FFFFFF', width: 12, height: 12 }} />
                                                    <Text style={styles.certDownloadBtnMiniText}>
                                                        {hasDescargado ? 'Descargada ✓' : 'Descargar PDF'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={styles.certStatusPendingBox}>
                                                    <Icon as={ICONS.lock} style={{ color: '#94A3B8', width: 11, height: 11 }} />
                                                    <Text style={styles.certStatusPendingText}>Faltan QRs</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.noBadgesBox}>
                                <Text style={styles.noBadgesText}>
                                    Aún no tienes constancias académicas. Regístrate a eventos, asiste y escanea tus códigos QR para desbloquearlas.
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })()}

            {/* ── Menú de opciones ─────────────────────────────────────────── */}
            <View style={styles.menuContainer}>
                {MENU_ITEMS.map((item) => (
                    <MenuRow key={item.id} item={item} />
                ))}

                {/* Cerrar sesión (separado para énfasis) */}
                <MenuRow
                    item={{
                        id: 'logout',
                        icono: ICONS.arrrowDownUp,
                        etiqueta: 'Cerrar Sesión',
                        peligro: true,
                    }}
                    onPress={handleLogout}
                />
            </View>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>UniRadar v1.0.0</Text>
                <Text style={styles.footerSub}>Descubre eventos universitarios</Text>
            </View>

            {/* ── MODAL DEL DIPLOMA ACADÉMICO EN PERFIL ── */}
            {selectedConstanciaEvento && (
                <Modal
                    visible={isDiplomaOpen}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setIsDiplomaOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.certModalContainer}>
                            {/* Cabecera */}
                            <View style={styles.certHeader}>
                                <Text style={styles.certHeaderTitle}>Documento Académico</Text>
                                <TouchableOpacity onPress={() => setIsDiplomaOpen(false)} style={styles.certCloseBtn}>
                                    <Icon as={ICONS.X} style={{ color: '#6B7280', width: 18, height: 18 }} />
                                </TouchableOpacity>
                            </View>

                            {/* Diploma Estilizado */}
                            <View style={styles.diplomaBox}>
                                <View style={styles.diplomaBorder}>
                                    <View style={styles.diplomaInnerBorder}>
                                        {/* Encabezado */}
                                        <Icon as={ICONS.GraduationCap} style={styles.diplomaIcon} />
                                        <Text style={styles.diplomaUniName}>UNIVERSIDAD DEMO</Text>
                                        <Text style={styles.diplomaSub}>SISTEMA DE ASISTENCIA UNIRADAR</Text>

                                        <View style={styles.diplomaDivider} />

                                        <Text style={styles.diplomaConstName}>CONSTANCIA OFICIAL</Text>
                                        <Text style={styles.diplomaBodyText}>
                                            Se otorga el presente reconocimiento y constancia a:
                                        </Text>

                                        <Text style={styles.diplomaStudent}>
                                            {payload?.firstName && payload?.lastName
                                                ? `${payload.firstName} ${payload.lastName}`.toUpperCase()
                                                : 'ALEX RIVERA'}
                                        </Text>

                                        <Text style={styles.diplomaBodyText}>
                                            Por haber registrado su asistencia (Ingreso y Salida) y participado activamente en el evento académico:
                                        </Text>

                                        <Text style={styles.diplomaEventTitle}>"{selectedConstanciaEvento.titulo}"</Text>

                                        <Text style={styles.diplomaCredits}>
                                            Realizado en {selectedConstanciaEvento.lugar} el {selectedConstanciaEvento.fecha} con valor curricular de 16 horas académicas.
                                        </Text>

                                        {/* Sello y Firmas */}
                                        <HStack style={styles.diplomaSignatures}>
                                            <VStack style={styles.signatureBox}>
                                                <View style={styles.signLine} />
                                                <Text style={styles.signName}>Dr. Eduardo Valdivia</Text>
                                                <Text style={styles.signRole}>Rector Universitario</Text>
                                            </VStack>

                                            <View style={styles.diplomaSeal}>
                                                <Icon as={ICONS.Star} style={{ color: '#D97706', width: 16, height: 16 }} />
                                                <Text style={styles.sealText}>SELLO</Text>
                                            </View>

                                            <VStack style={styles.signatureBox}>
                                                <View style={styles.signLine} />
                                                <Text style={styles.signName}>Ing. Karen Mendoza</Text>
                                                <Text style={styles.signRole}>Decana de Ingeniería</Text>
                                            </VStack>
                                        </HStack>

                                        <Text style={styles.diplomaVerificationCode}>
                                            Código de Verificación QR: SEC-EV-{selectedConstanciaEvento.id}-2026-UTP
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Botón de Guardado */}
                            <TouchableOpacity
                                onPress={() => handleDownloadCert(selectedConstanciaEvento)}
                                style={styles.certDownloadBtn}
                            >
                                <Icon as={ICONS.FileText} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                <Text style={styles.certDownloadBtnText}>Descargar en PDF / Guardar Constancia</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* ── MODAL DE EDICIÓN DE PERFIL ── */}
            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onProfileUpdated={() => {
                    // La reactividad de authStateManager actualiza automáticamente los datos locales
                }}
            />
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    // Hero banner
    heroBanner: {
        backgroundColor: '#6366F1',
        paddingTop: 24,
        paddingBottom: 32,
        alignItems: 'center',
        position: 'relative',
    },
    settingsBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatarInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },
    heroEmail: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '600',
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    smallCopyBtn: {
        padding: 2,
    },
    roleBadge: {
        backgroundColor: '#EAB308',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Info card universidad
    infoCard: {
        marginHorizontal: 16,
        marginTop: -18,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E9EAF4',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 1,
    },
    infoValue: {
        color: '#111827',
        fontSize: 13,
        fontWeight: '700',
    },
    infoDivider: {
        width: 1,
        height: 40,
    },

    // Sección genérica (card con borde)
    section: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
    },

    // Grid de intereses
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    // Menú
    menuContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Footer
    footer: {
        alignItems: 'center',
        marginTop: 28,
        gap: 3,
    },
    footerTitle: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
    },
    footerSub: {
        color: '#D1D5DB',
        fontSize: 11,
    },
    // Estilos de Insignias del Perfil (Rediseñados para Constancias)
    badgeRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    badgeEventTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    noBadgesBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    noBadgesText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },
    certDownloadBtnMini: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    certDownloadBtnMiniSuccess: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    certDownloadBtnMiniText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    certStatusPendingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    certStatusPendingText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '700',
    },
    // Estilos del Modal del Diploma (Perfil)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
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