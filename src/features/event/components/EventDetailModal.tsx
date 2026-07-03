import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    Modal,
    View,
    Alert,
    ActivityIndicator,
    ScrollView,
    Animated,
    Linking,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { Evento } from '../types';
import { C } from '../constants';
import InfoPill from './InfoPill';
import { eventStateManager, useEventState } from '../state';
import { useAuthState } from '../../auth/state';
import EventQrPanel from './EventQrPanel';
import { exportConstanciaPDF, ConstanciaData } from '../services/constanciaService';
import { EventoBackend } from '../types/api';
import { eventService } from '../services/eventService';
import ConfirmModal from '@/components/ConfirmModal';

const { width: SW, height: SH } = Dimensions.get('window');

interface EventDetailModalProps {
    visible: boolean;
    evento: Evento | null;
    eventoBackend?: EventoBackend | null; // para datos del organizador
    onClose: () => void;
    favorito: boolean;
    onToggleFavorito: (id: string) => void;
    onEventSaved?: () => void;
    highlightAnim?: 'ingreso' | 'salida';
}

export default function EventDetailModal({
    visible,
    evento,
    eventoBackend,
    onClose,
    favorito,
    onToggleFavorito,
    onEventSaved,
    highlightAnim,
}: EventDetailModalProps) {
    const eventState = useEventState();
    const { role, payload } = useAuthState();
    const [isCertOpen, setIsCertOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // --- ESTADO DE ALERTAS PERSONALIZADAS ---
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        type: 'error' | 'success' | 'info' | 'warning';
        onConfirm?: () => void;
        confirmLabel?: string;
        cancelLabel?: string;
        hideCancel?: boolean;
    }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'info'
    });
    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));
    const showAlert = (title: string, description: string, type: 'error' | 'success' | 'info' | 'warning', onConfirm?: () => void, confirmLabel: string = 'Entendido', cancelLabel: string = '', hideCancel: boolean = true) => {
        setAlertConfig({ isOpen: true, title, description, type, onConfirm, confirmLabel, cancelLabel, hideCancel });
    };

    // Animaciones
    const animIngreso = useRef(new Animated.Value(1)).current;
    const animSalida = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible && highlightAnim) {
            const targetAnim = highlightAnim === 'ingreso' ? animIngreso : animSalida;
            Animated.sequence([
                Animated.timing(targetAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
                Animated.timing(targetAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(targetAnim, { toValue: 1.15, duration: 300, useNativeDriver: true }),
                Animated.timing(targetAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [visible, highlightAnim]);

    if (!evento) return null;

    const isAdminOrTeacher = role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER';
    const isRegistered = eventStateManager.isRegistered(evento.id);
    const insignias = eventStateManager.getInsignias(evento.id);
    const isCertUnlocked = insignias.ingreso && insignias.salida;
    const hasDescargado = eventStateManager.hasDescargadoConstancia(evento.id);
    // Verificar si el aforo del evento está completo
    const isFull = !!(evento.capacidad && evento.capacidad > 0 && evento.inscritosCount >= evento.capacidad);


    const handleRegister = async () => {
        if (isRegistering) return;
        setIsRegistering(true);
        try {
            const reg = await eventService.registerToEvent(Number(evento.id));
            eventStateManager.registerToEvent(evento.id);
            showAlert(
                '¡Registro Exitoso! 🎉',
                `Te has registrado correctamente en "${evento.titulo}". Recuerda asistir el día del evento y escanear tus códigos QR de Ingreso y Salida para obtener tu constancia académica.`,
                'success',
                () => {},
                '¡Excelente!'
            );
            onEventSaved?.();
        } catch (err: any) {
            const status = err?.response?.status;
            const serverMsg: string = err?.response?.data?.message || err?.message || '';

            if (status === 409 || serverMsg.toLowerCase().includes('aforo') || serverMsg.toLowerCase().includes('capacidad')) {
                showAlert(
                    '🚫 Aforo Completo',
                    'El aforo de este evento ha sido completado. Ya no hay lugares disponibles.',
                    'warning'
                );
                // Refrescar estado para que el botón refleje "Aforo Completo"
                onEventSaved?.();
            } else if (status === 400 && serverMsg.toLowerCase().includes('ya estás registrado')) {
                // El usuario ya está registrado (p.ej. desde otro dispositivo)
                eventStateManager.registerToEvent(evento.id);
                showAlert('Ya Inscrito', 'Ya te encuentras registrado en este evento.', 'info');
            } else {
                showAlert('Error al Registrarse', serverMsg || 'Ocurrió un error inesperado. Intenta de nuevo.', 'error', () => {}, 'Cerrar');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDownloadCert = async () => {
        if (!evento || !payload) return;
        setIsExporting(true);
        try {
            // Extrae datos de la sesión activa del usuario autenticado.
            // GARANTÍA: registrationMeta solo contiene datos del usuario
            // cuyo Bearer token fue usado en fetchMyRegistrations.
            const regMeta = eventStateManager.getRegistrationMeta(evento.id);

            const nombreCompleto = (payload.firstName && payload.lastName)
                ? `${payload.firstName} ${payload.lastName}`
                : '';

            const constanciaData: ConstanciaData = {
                participanteNombre: nombreCompleto,
                participanteUsername: payload.sub,
                eventoId: evento.id,
                eventoTitulo: evento.titulo,
                eventoFecha: evento.fecha,
                eventoHora: evento.hora,
                eventoLugar: evento.lugar,
                eventoModalidad: eventoBackend?.modalidad ?? 'PRESENCIAL',
                eventoCategoria: evento.categoria,
                organizadorUsername: eventoBackend?.createdByUsername ?? 'organizador',
                registrationId: regMeta?.registrationId ?? 0,
                checkInAt: regMeta?.checkInAt ?? null,
                checkOutAt: regMeta?.checkOutAt ?? null,
            };

            await exportConstanciaPDF(constanciaData);
            eventStateManager.descargarConstancia(evento.id);
            setIsCertOpen(false);
        } catch (err) {
            console.error('Error exportando constancia:', err);
            showAlert(
                'Error al exportar',
                'No se pudo generar el PDF. Por favor intenta nuevamente.',
                'error'
            );
        } finally {
            setIsExporting(false);
        }
    };

    // Generar tags correspondientes a la categoría del evento como fallback
    const getTagsForCategoria = (cat: string) => {
        switch (cat) {
            case 'Tecnología':
                return ['#innovación', '#startup', '#tecnología', '#desarrollo'];
            case 'Música':
                return ['#festival', '#concierto', '#neonbeats', '#cultura'];
            case 'Deporte':
                return ['#torneo', '#esports', '#competencia', '#saludable'];
            case 'Social':
                return ['#comunidad', '#feria', '#arte', '#sensorial'];
            case 'Cultural':
                return ['#exposición', '#historia', '#aprendizaje', '#universitario'];
            default:
                return ['#evento', '#utp', '#uniradar', '#estudiantes'];
        }
    };

    const tags = (evento.tags && evento.tags.length > 0)
        ? evento.tags.map(t => `#${t}`)
        : getTagsForCategoria(evento.categoria);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <Box style={{ flex: 1, backgroundColor: C.bg }}>
                {/* ── CONTENIDO PRINCIPAL SCROLLABLE ── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Contenedor de Banner de Imagen */}
                    <View style={styles.bannerContainer}>
                        {evento.imageUrls && evento.imageUrls.length > 1 ? (
                            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                                {evento.imageUrls.map((url) => (
                                    <Image key={url} source={{ uri: url }} style={{ width: SW, height: SH * 0.32, resizeMode: 'cover' }} />
                                ))}
                            </ScrollView>
                        ) : (
                            <Image source={{ uri: evento.imagenUri }} style={styles.bannerImage} />
                        )}
                        
                        {/* Overlay Oscuro superior para legibilidad de botones */}
                        <View style={styles.overlayTop} />

                        {/* Botones Absolutos en Cabecera */}
                        <HStack style={styles.headerRow}>
                            <TouchableOpacity onPress={onClose} style={styles.headerCircleBtn}>
                                <Icon as={ICONS.X} style={{ color: '#1E293B', width: 20, height: 20 }} />
                            </TouchableOpacity>

                            <HStack style={{ gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => onToggleFavorito(evento.id)}
                                    style={styles.headerCircleBtn}
                                >
                                    <Icon
                                        as={ICONS.Heart}
                                        style={{
                                            color: favorito ? C.favActive : '#1E293B',
                                            width: 20,
                                            height: 20,
                                        }}
                                    />
                                </TouchableOpacity>
                            </HStack>
                        </HStack>

                        {/* Badge de Destacado */}
                        {evento.destacado && (
                            <Box style={[styles.destacadoBadge, { backgroundColor: '#F59E0B' }]}>
                                <Icon as={ICONS.Star} style={{ color: '#FFFFFF', width: 10, height: 10 }} />
                                <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                                    DESTACADO
                                </Text>
                            </Box>
                        )}
                    </View>

                    {/* Información del Evento */}
                    <VStack style={styles.infoContent}>
                        {/* Categoría */}
                        <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <evento.IconCategoria size={14} color={evento.accentColor} />
                            <Text style={{ color: evento.accentColor, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>
                                {evento.categoria.toUpperCase()}
                            </Text>
                        </HStack>

                        {/* Título */}
                        <Text style={[styles.mainTitle, { color: C.textPrimary }]}>
                            {evento.titulo}
                        </Text>

                        {/* Descripción corta */}
                        <Text style={[styles.descriptionText, { color: C.textSecondary }]}>
                            {evento.descripcion}
                        </Text>

                        {/* ── CUADRÍCULA DE DATOS 2X2 PREMIUM ── */}
                        <View style={styles.grid2x2}>
                            <HStack style={styles.gridRow}>
                                {/* Caja 1: Fecha */}
                                <HStack style={[styles.gridCell, { backgroundColor: '#EFF6FF' }]}>
                                    <View style={[styles.gridIconCircle, { backgroundColor: '#3B82F6' }]}>
                                        <Icon as={ICONS.CalendarDays} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                    </View>
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={styles.gridCellLabel}>Fecha</Text>
                                        <Text style={[styles.gridCellValue, { color: '#1E3A8A' }]} numberOfLines={1}>
                                            {evento.fecha}
                                        </Text>
                                    </VStack>
                                </HStack>

                                {/* Caja 2: Hora */}
                                <HStack style={[styles.gridCell, { backgroundColor: '#F5F3FF' }]}>
                                    <View style={[styles.gridIconCircle, { backgroundColor: '#8B5CF6' }]}>
                                        <Icon as={ICONS.Clock} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                    </View>
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={styles.gridCellLabel}>Hora</Text>
                                        <Text style={[styles.gridCellValue, { color: '#4C1D95' }]} numberOfLines={1}>
                                            {evento.hora}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>

                            <HStack style={styles.gridRow}>
                                {/* Caja 3: Distancia */}
                                <HStack style={[styles.gridCell, { backgroundColor: '#ECFDF5' }]}>
                                    <View style={[styles.gridIconCircle, { backgroundColor: '#10B981' }]}>
                                        <Icon as={ICONS.MapPin} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                    </View>
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={styles.gridCellLabel}>Distancia</Text>
                                        <Text style={[styles.gridCellValue, { color: '#064E3B' }]} numberOfLines={1}>
                                            0.5 km de ti
                                        </Text>
                                    </VStack>
                                </HStack>

                                {/* Caja 4: Asistentes / Aforo */}
                                <HStack style={[styles.gridCell, { backgroundColor: isFull ? '#FEF2F2' : '#FFFBEB' }]}>
                                    <View style={[styles.gridIconCircle, { backgroundColor: isFull ? '#EF4444' : '#F59E0B' }]}>
                                        <Icon as={ICONS.Users} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                    </View>
                                    <VStack style={{ flex: 1 }}>
                                        <Text style={styles.gridCellLabel}>Asistentes</Text>
                                        <Text style={[styles.gridCellValue, { color: isFull ? '#991B1B' : '#78350F' }]} numberOfLines={1}>
                                            {evento.inscritosCount}/{evento.capacidad ?? '∞'}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </View>

                        {/* Ubicación */}
                        <VStack style={styles.sectionDivider}>
                            <Text style={styles.sectionSubtitle}>Ubicación</Text>
                            <HStack style={styles.locationBox}>
                                <Icon as={ICONS.MapPin} style={{ color: C.textSecondary, width: 16, height: 16, marginTop: 2 }} />
                                <Text style={styles.locationText}>{evento.lugar}</Text>
                            </HStack>
                            {evento.latitud !== undefined && evento.latitud !== null && evento.longitud !== undefined && evento.longitud !== null && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${evento.latitud},${evento.longitud}`;
                                        Linking.openURL(url).catch((err) => {
                                            Alert.alert('Error', 'No se pudo abrir Google Maps en este dispositivo.');
                                            console.error('Error opening maps URL:', err);
                                        });
                                    }}
                                    style={[styles.routeBtn, { borderColor: evento.accentColor }]}
                                >
                                    <Icon as={ICONS.MapPin} style={{ color: evento.accentColor, width: 13, height: 13 }} />
                                    <Text style={[styles.routeBtnText, { color: evento.accentColor }]}>Cómo llegar</Text>
                                </TouchableOpacity>
                            )}
                        </VStack>

                        {/* Etiquetas (Tags) */}
                        <VStack style={styles.sectionDivider}>
                            <Text style={styles.sectionSubtitle}>Etiquetas</Text>
                            <HStack style={styles.tagsContainer}>
                                {tags.map((tag) => (
                                    <View key={tag} style={styles.tagChip}>
                                        <Text style={styles.tagChipText}>{tag}</Text>
                                    </View>
                                ))}
                            </HStack>
                        </VStack>

                        {/* Organizador */}
                        <VStack style={styles.sectionDivider}>
                            <Text style={styles.sectionSubtitle}>Organizador</Text>
                            <View style={styles.organizerCard}>
                                <HStack style={{ gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                    <View style={[styles.orgIconCircle, { backgroundColor: C.accentLight }]}>
                                        <Icon as={ICONS.GraduationCap} style={{ color: C.accent, width: 20, height: 20 }} />
                                    </View>
                                    <VStack>
                                        <Text style={styles.orgName}>IEEE Computer Society</Text>
                                        <Text style={styles.orgSub}>Facultad de Ingeniería y Sistemas</Text>
                                    </VStack>
                                </HStack>

                                <View style={styles.orgDivider} />

                                <VStack style={{ gap: 8 }}>
                                    <HStack style={{ alignItems: 'center', gap: 8 }}>
                                        <Icon as={ICONS.Mail} style={{ color: C.textMuted, width: 14, height: 14 }} />
                                        <Text style={styles.orgContactText}>ieee@universidad.edu</Text>
                                    </HStack>
                                    <HStack style={{ alignItems: 'center', gap: 8 }}>
                                        <Icon as={ICONS.Phone} style={{ color: C.textMuted, width: 14, height: 14 }} />
                                        <Text style={styles.orgContactText}>+51 999 888 777</Text>
                                    </HStack>
                                </VStack>
                            </View>
                        </VStack>

                        {/* Control Asistencia QR (Admin/Docente) */}
                        {isAdminOrTeacher && (
                            <VStack style={styles.sectionDivider}>
                                <EventQrPanel 
                                    eventId={Number(evento.id)} 
                                    eventoTitulo={evento.titulo}
                                />
                            </VStack>
                        )}

                        {/* ── SECCIÓN DINÁMICA DE REGISTRO E INSIGNIAS (SOLO REGISTRADOS) ── */}
                        {isRegistered && (
                            <VStack style={styles.badgesSection}>
                                <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <Icon as={ICONS.Trophy} style={{ color: '#EAB308', width: 16, height: 16 }} />
                                    <Text style={styles.badgesSecTitle}>Asistencia & Insignias</Text>
                                </HStack>

                                <HStack style={styles.badgesRow}>
                                    {/* Insignia Ingreso */}
                                    <Animated.View style={[
                                        styles.insigniaBox,
                                        insignias.ingreso ? styles.insigniaUnlocked : styles.insigniaLocked,
                                        { transform: [{ scale: animIngreso }] }
                                    ]}>
                                        <Icon
                                            as={insignias.ingreso ? ICONS.CheckCircle : ICONS.Zap}
                                            style={{
                                                color: insignias.ingreso ? '#22C55E' : '#94A3B8',
                                                width: 14,
                                                height: 14
                                            }}
                                        />
                                        <Text style={[
                                            styles.insigniaText,
                                            insignias.ingreso ? styles.insigniaUnlockedText : styles.insigniaLockedText
                                        ]}>
                                            {insignias.ingreso ? 'Ingreso Registrado' : 'Ingreso Pendiente'}
                                        </Text>
                                    </Animated.View>

                                    {/* Insignia Salida */}
                                    <Animated.View style={[
                                        styles.insigniaBox,
                                        insignias.salida ? styles.insigniaUnlocked : styles.insigniaLocked,
                                        { transform: [{ scale: animSalida }] }
                                    ]}>
                                        <Icon
                                            as={insignias.salida ? ICONS.CheckCircle : ICONS.Trophy}
                                            style={{
                                                color: insignias.salida ? '#A82BFA' : '#94A3B8',
                                                width: 14,
                                                height: 14
                                            }}
                                        />
                                        <Text style={[
                                            styles.insigniaText,
                                            insignias.salida ? styles.insigniaUnlockedText : styles.insigniaLockedText
                                        ]}>
                                            {insignias.salida ? 'Salida Registrada' : 'Salida Pendiente'}
                                        </Text>
                                    </Animated.View>
                                </HStack>

                                {/* Botón de Constancia */}
                                {isCertUnlocked ? (
                                    <TouchableOpacity
                                        onPress={() => setIsCertOpen(true)}
                                        style={[
                                            styles.certBtn,
                                            hasDescargado ? styles.certBtnSuccess : styles.certBtnActive
                                        ]}
                                    >
                                        <Icon as={ICONS.GraduationCap} style={{ color: '#FFFFFF', width: 18, height: 18 }} />
                                        <Text style={styles.certBtnText}>
                                            {hasDescargado ? 'Ver Constancia Descargada ✓' : 'Descargar Constancia Oficial 🎓'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.certLockedBox}>
                                        <Icon as={ICONS.lock} style={{ color: '#94A3B8', width: 14, height: 14 }} />
                                        <Text style={styles.certLockedText}>
                                            Escanear ingreso y salida QR para desbloquear constancia académica oficial.
                                        </Text>
                                    </View>
                                )}
                            </VStack>
                        )}
                    </VStack>
                </ScrollView>

                {/* ── BARRA INFERIOR FIJA CON PRECIO Y ACCIÓN ── */}
                <Box style={[styles.bottomBar, { borderTopColor: C.cardBorder }]}>
                    <VStack>
                        <Text style={styles.bottomBarPriceLabel}>Precio</Text>
                        <Text style={[styles.bottomBarPriceValue, { color: evento.accentColor }]}>
                            {evento.precio}
                        </Text>
                    </VStack>

                    {isRegistered ? (
                        <View style={[styles.actionBtn, styles.actionBtnInscribed, isCertUnlocked && { backgroundColor: '#10B981', borderColor: '#059669' }]}>
                            <Icon as={isCertUnlocked ? ICONS.Trophy : ICONS.CheckCircle} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                            <Text style={styles.actionBtnInscribedText}>{isCertUnlocked ? 'Completado 🏆' : 'Inscrito ✓'}</Text>
                        </View>
                    ) : isFull ? (
                        <View style={[styles.actionBtn, { backgroundColor: '#9CA3AF', borderColor: '#6B7280' }]}>
                            <Icon as={ICONS.Users} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                            <Text style={styles.actionBtnInscribedText}>Aforo Completo</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={isRegistering}
                            style={[styles.actionBtn, { backgroundColor: isRegistering ? '#9CA3AF' : evento.accentColor }]}
                        >
                            {isRegistering
                                ? <ActivityIndicator size="small" color="#FFFFFF" />
                                : <Icon as={ICONS.PlusCircle} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                            }
                            <Text style={styles.actionBtnText}>{isRegistering ? 'Registrando...' : 'Inscribirse'}</Text>
                        </TouchableOpacity>
                    )}
                </Box>

                {/* ── MODAL DEL DIPLOMA ACADÉMICO PREMIUM ── */}
                <Modal
                    visible={isCertOpen}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setIsCertOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.certModalContainer}>
                            {/* Cabecera */}
                            <View style={styles.certHeader}>
                                <Text style={styles.certHeaderTitle}>Documento Académico</Text>
                                <TouchableOpacity onPress={() => setIsCertOpen(false)} style={styles.certCloseBtn}>
                                    <Icon as={ICONS.X} style={{ color: '#6B7280', width: 18, height: 18 }} />
                                </TouchableOpacity>
                            </View>

                            {/* Diploma Estilizado */}
                            <View style={styles.diplomaBox}>
                                <View style={styles.diplomaBorder}>
                                    <View style={styles.diplomaInnerBorder}>
                                        {/* Encabezado */}
                                        <Icon as={ICONS.GraduationCap} style={styles.diplomaIcon} />
                                        <Text style={styles.diplomaUniName}>SISTEMA UNIRADAR</Text>
                                        <Text style={styles.diplomaSub}>CONSTANCIA DE PARTICIPACIÓN</Text>

                                        <View style={styles.diplomaDivider} />

                                        <Text style={styles.diplomaConstName}>CONSTANCIA OFICIAL</Text>
                                        <Text style={styles.diplomaBodyText}>
                                            Se certifica que:
                                        </Text>

                                        <Text style={styles.diplomaStudent}>
                                            {(payload?.firstName && payload?.lastName)
                                                ? `${payload.firstName} ${payload.lastName}`.toUpperCase()
                                                : payload?.sub?.toUpperCase() ?? 'PARTICIPANTE'}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 8, textAlign: 'center' }}>
                                            @{payload?.sub}
                                        </Text>

                                        <Text style={styles.diplomaBodyText}>
                                            Por haber registrado su asistencia (Ingreso y Salida)
                                            y participado en el evento académico:
                                        </Text>

                                        <Text style={styles.diplomaEventTitle}>"{evento.titulo}"</Text>

                                        <Text style={styles.diplomaCredits}>
                                            {evento.lugar} · {evento.fecha} · {evento.hora}{"\n"}
                                            Organizado por @{eventoBackend?.createdByUsername ?? 'organizador'}
                                        </Text>

                                        {/* Sello decorativo */}
                                        <HStack style={styles.diplomaSignatures}>
                                            <VStack style={styles.signatureBox}>
                                                <View style={styles.signLine} />
                                                <Text style={styles.signName}>Firma del Organizador</Text>
                                                <Text style={styles.signRole}>@{eventoBackend?.createdByUsername ?? 'organizador'}</Text>
                                            </VStack>

                                            <View style={styles.diplomaSeal}>
                                                <Icon as={ICONS.Star} style={{ color: '#D97706', width: 16, height: 16 }} />
                                                <Text style={styles.sealText}>SELLO</Text>
                                            </View>

                                            <VStack style={styles.signatureBox}>
                                                <View style={styles.signLine} />
                                                <Text style={styles.signName}>Sistema UniRadar</Text>
                                                <Text style={styles.signRole}>Verificación Digital</Text>
                                            </VStack>
                                        </HStack>

                                        <Text style={styles.diplomaVerificationCode}>
                                            ID: {eventStateManager.getRegistrationMeta(evento.id)?.registrationId
                                                ? `REG-${eventStateManager.getRegistrationMeta(evento.id)!.registrationId}-EV-${evento.id}`
                                                : `EV-${evento.id}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Botón de Descarga PDF */}
                            <TouchableOpacity
                                onPress={handleDownloadCert}
                                style={[styles.certDownloadBtn, isExporting && { opacity: 0.7 }]}
                                disabled={isExporting}
                            >
                                {isExporting
                                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                                    : <Icon as={ICONS.FileText} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                }
                                <Text style={styles.certDownloadBtnText}>
                                    {isExporting ? 'Generando PDF...' : 'Descargar en PDF / Guardar Constancia'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL DE ALERTAS PERSONALIZADO */}
                <ConfirmModal
                    isOpen={alertConfig.isOpen}
                    onClose={closeAlert}
                    onConfirm={() => {
                        if (alertConfig.onConfirm) alertConfig.onConfirm();
                        closeAlert();
                    }}
                    title={alertConfig.title}
                    description={alertConfig.description}
                    confirmLabel={alertConfig.confirmLabel}
                    cancelLabel={alertConfig.cancelLabel}
                    hideCancel={alertConfig.hideCancel}
                    icon={
                        alertConfig.type === 'error' ? ICONS.AlertCircle : 
                        alertConfig.type === 'success' ? ICONS.CheckCircle : 
                        alertConfig.type === 'warning' ? ICONS.AlertCircle : ICONS.Info
                    }
                    iconColor={
                        alertConfig.type === 'error' ? '#EF4444' : 
                        alertConfig.type === 'success' ? '#10B981' : 
                        alertConfig.type === 'warning' ? '#F59E0B' : '#3B82F6'
                    }
                    confirmColor={
                        alertConfig.type === 'error' ? '#EF4444' : 
                        alertConfig.type === 'success' ? '#10B981' : 
                        alertConfig.type === 'warning' ? '#EF4444' : '#3B82F6'
                    }
                />
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    bannerContainer: {
        width: SW,
        height: SH * 0.32,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    overlayTop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    headerRow: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    headerCircleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    destacadoBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    infoContent: {
        padding: 20,
        gap: 12,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 28,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 8,
    },
    // Grid 2x2
    grid2x2: {
        gap: 10,
        marginVertical: 12,
    },
    gridRow: {
        gap: 10,
        justifyContent: 'space-between',
    },
    gridCell: {
        flex: 1,
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    gridIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCellLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 2,
    },
    gridCellValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    // Secciones con divisores
    sectionDivider: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 14,
        marginTop: 6,
        gap: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationBox: {
        alignItems: 'flex-start',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
        lineHeight: 18,
    },
    routeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
        backgroundColor: 'transparent',
    },
    routeBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    // Tags
    tagsContainer: {
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        backgroundColor: '#EEF2FF',
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    tagChipText: {
        color: '#4F46E5',
        fontSize: 11,
        fontWeight: '600',
    },
    // Organizador Card
    organizerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    orgIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orgName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    orgSub: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    orgDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    orgContactText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    // Asistencia & Insignias Section
    badgesSection: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 14,
        gap: 10,
        marginTop: 10,
    },
    badgesSecTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badgesRow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 10,
    },
    insigniaBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
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
        paddingVertical: 10,
        borderRadius: 12,
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
        fontSize: 13,
        fontWeight: '800',
    },
    certLockedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    certLockedText: {
        color: '#64748B',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    // Sticky bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    bottomBarPriceLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    bottomBarPriceValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 24,
        height: 46,
        borderRadius: 12,
        minWidth: 150,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    actionBtnInscribed: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
    },
    actionBtnInscribedText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    // Diploma modal overlays
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
