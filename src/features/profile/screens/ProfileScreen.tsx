import React, { useState, useEffect, useMemo, useRef } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import {
    ScrollView,
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
    useWindowDimensions,
} from 'react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ICONS } from '@/components/icons';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { useAuthState, authStateManager } from '../../auth/state';
import * as Clipboard from 'expo-clipboard';
import OnboardingScreen from '../../auth/screens/OnboardingScreen';

import { C, MENU_ITEMS } from '../constants';
import { Interes } from '../types';
import InterestChip from '../components/InterestChip';
import MenuRow from '../components/MenuRow';
import EditProfileModal from '../components/EditProfileModal';
import { eventStateManager, useEventState } from '../../event/state';
import { useEvents, resetEventsCache } from '../../event/hooks/useEvents';
import { Evento, mapBackendToEvento, getCategoryAccentColor, getCategoryIcon } from '../../event/types';
import { eventService } from '../../event/services/eventService';
import { EventoBackend } from '../../event/types/api';
import { exportConstanciaPDF, ConstanciaData } from '../../event/services/constanciaService';
import { useCategories } from '../../event/hooks/useCategories';
import { loadInterests, saveInterests } from '../state/interestsState';



export default function ProfileScreen() {
    const router = useRouter();
    const { payload, role } = useAuthState();
    const isAdmin = role === 'ADMIN';

    // ── Transición suave al rotar ───────────────────────────────────
    const { width: W } = useWindowDimensions();
    const prevW = useRef(W);
    useEffect(() => {
        if (prevW.current !== W) {
            LayoutAnimation.configureNext({
                duration: 280,
                create:  { type: 'easeInEaseOut', property: 'opacity' },
                update:  { type: 'easeInEaseOut' },
                delete:  { type: 'easeInEaseOut', property: 'opacity' },
            });
            prevW.current = W;
        }
    }, [W]);

    const eventState = useEventState();
    const { data: backendEvents, refetch: refetchEvents } = useEvents();
    const EVENTOS = Array.isArray(backendEvents) ? backendEvents.map(mapBackendToEvento) : [];

    const { categorias, loading: categoriasLoading } = useCategories();
    const [intereses, setIntereses] = useState<Interes[]>([]);
    const [selectedConstanciaEvento, setSelectedConstanciaEvento] = useState<Evento | null>(null);
    const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // ── Cargar intereses persistidos al montar ─────────────────────────────────
    useEffect(() => {
        if (payload?.sub) {
            loadInterests(payload.sub).then(() => {
                // El estado se actualiza via el listener en interestsState
            });
        }
    }, [payload?.sub]);

    // ── Construir chips desde categorías reales del backend ───────────────────
    useEffect(() => {
        if (categorias.length === 0) return;

        // Reconstruir la lista de intereses manteniendo las selecciones persistidas
        loadInterests(payload?.sub || 'guest').then(() => {
            // Importar el estado global directamente
            import('../state/interestsState').then(({ useInterests: _ }) => {
                // Leemos el AsyncStorage directamente para hidratar
                import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
                    const key = `@uniradar:interests:${payload?.sub || 'guest'}`;
                    AsyncStorage.getItem(key).then(stored => {
                        const activeCats: string[] = stored ? JSON.parse(stored) : [];
                        const emojisDefault: Record<string, string> = {
                            tecnol: '💻', músic: '🎵', music: '🎵', deport: '⚽',
                            arte: '🎨', social: '💬', cultur: '🎭',
                        };
                        const nuevoIntereses: Interes[] = categorias.map((cat, idx) => {
                            const normNombre = cat.nombre.toLowerCase();
                            const emojiKey = Object.keys(emojisDefault).find(k => normNombre.includes(k));
                            const emoji = emojiKey ? emojisDefault[emojiKey] : '🌟';
                            const isActive = activeCats.some(ac =>
                                normNombre.includes(ac.toLowerCase()) || ac.toLowerCase().includes(normNombre)
                            );
                            return {
                                id: cat.id,
                                nombre: cat.nombre,
                                emoji,
                                activo: isActive,
                                color: getCategoryAccentColor(cat.nombre),
                                Icon: getCategoryIcon(cat.nombre),
                            };
                        });
                        setIntereses(nuevoIntereses);
                    });
                });
            });
        });
    }, [categorias, payload?.sub]);

    const [serverNotifications, setServerNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const { notificationService } = require('../services/notificationService');
                const notifs = await notificationService.getMyNotifications();
                setServerNotifications(notifs.filter((n: any) => !n.isRead));
            } catch (e) {
                console.log('Error fetching notifs', e);
            }
        };

        // Fetch inicial
        fetchNotifs();

        const interval = setInterval(() => {
            refetchEvents?.();
            fetchNotifs();
        }, 5000);
        return () => clearInterval(interval);
    }, [refetchEvents]);

    const handleConfirmarInicioNotification = async (event: EventoBackend) => {
        try {
            const payloadWrite = {
                titulo: event.titulo,
                descripcion: event.descripcion || '',
                fechaInicio: event.fechaInicio,
                fechaFin: event.fechaFin,
                horaInicio: event.horaInicio,
                horaFin: event.horaFin,
                capacidad: event.capacidad,
                imagenUrl: event.imagenUrl,
                modalidad: event.modalidad,
                lugar: event.lugar,
                referencia: event.referencia,
                latitud: event.latitud,
                longitud: event.longitud,
                estado: 'PUBLISHED',
                requiresApproval: event.requiresApproval,
                allowQrAttendance: event.allowQrAttendance,
                edadMinima: event.edadMinima,
                requisitos: event.requisitos,
                categoryIds: event.categories.map(c => c.id),
                tagIds: event.tags.map(t => t.id),
                imageUrls: event.imageUrls || [],
                motivoRechazo: event.motivoRechazo,
            };

            await eventService.updateEvent(event.id, payloadWrite);
            Alert.alert('✅ Éxito', `El evento "${event.titulo}" ha sido iniciado.`);
            refetchEvents?.();
        } catch (error: unknown) {
            console.error('Error al iniciar evento:', error);
            const errMsg = error instanceof Error ? error.message : 'No se pudo iniciar el evento.';
            Alert.alert('⚠️ Error', errMsg);
        }
    };

    const handleSuspenderNotification = async (event: EventoBackend) => {
        try {
            const payloadWrite = {
                titulo: event.titulo,
                descripcion: event.descripcion || '',
                fechaInicio: event.fechaInicio,
                fechaFin: event.fechaFin,
                horaInicio: event.horaInicio,
                horaFin: event.horaFin,
                capacidad: event.capacidad,
                imagenUrl: event.imagenUrl,
                modalidad: event.modalidad,
                lugar: event.lugar,
                referencia: event.referencia,
                latitud: event.latitud,
                longitud: event.longitud,
                estado: 'SUSPENDED',
                requiresApproval: event.requiresApproval,
                allowQrAttendance: event.allowQrAttendance,
                edadMinima: event.edadMinima,
                requisitos: event.requisitos,
                categoryIds: event.categories.map(c => c.id),
                tagIds: event.tags.map(t => t.id),
                imageUrls: event.imageUrls || [],
                motivoRechazo: event.motivoRechazo,
            };

            await eventService.updateEvent(event.id, payloadWrite);
            Alert.alert('⏸️ Éxito', `El evento "${event.titulo}" ha sido suspendido.`);
            refetchEvents?.();
        } catch (error: unknown) {
            console.error('Error al suspender evento:', error);
            const errMsg = error instanceof Error ? error.message : 'No se pudo suspender el evento.';
            Alert.alert('⚠️ Error', errMsg);
        }
    };

    const listaSolicitudes = [
        ...serverNotifications.map(n => ({
            id: `server-${n.id}`,
            type: 'SERVER_ALERT' as const,
            title: n.title,
            description: n.message,
            originalId: n.id,
            eventId: n.eventId
        }))
    ];
    const solicitudesPendientes = listaSolicitudes.length;

    const menuWithBadges = MENU_ITEMS.map((item) => {
        if (item.id === 'notif') {
            return {
                ...item,
                badge: solicitudesPendientes > 0 ? ('dot' as const) : undefined,
                info: solicitudesPendientes > 0 ? `${solicitudesPendientes} pendiente(s)` : undefined,
            };
        }
        return item;
    });

    const handleMenuPress = (id: string) => {
        if (id === 'notif') {
            setIsNotifOpen(true);
        } else if (id === 'eventos') {
            router.push('/tabs/event');
        } else if (id === 'tutorial') {
            setIsOnboardingOpen(true);
        } else if (id === 'privacidad') {
            Alert.alert('Privacidad', 'Esta sección se habilitará próximamente.');
        }
    };


    const totalActivos = intereses.filter((i) => i.activo).length;

    const copyUsername = async () => {
        if (payload?.sub) {
            await Clipboard.setStringAsync(payload.sub);
            Alert.alert('¡Copiado! 📋', 'El nombre de usuario ha sido copiado al portapapeles.');
        }
    };

    const toggleInteres = (id: number) => {
        const actualizado = intereses.map((i) => (i.id === id ? { ...i, activo: !i.activo } : i));
        setIntereses(actualizado);

        // Persistir los nombres y IDs activos
        const activosNombres = actualizado
            .filter(i => i.activo)
            .map(i => i.nombre.toLowerCase());

        const activosIds = actualizado
            .filter(i => i.activo)
            .map(i => i.id);

        saveInterests(payload?.sub || 'guest', activosNombres, activosIds);
    };

    const handleDownloadCert = async (evento: Evento) => {
        if (!payload) return;
        setIsExporting(true);
        try {
            // Extrae la meta de inscripción del usuario autenticado para este evento.
            // GARANTÍA DE SESIÓN: registrationMeta solo contiene datos del
            // usuario cuyo Bearer token fue usado al llamar fetchMyRegistrations.
            const regMeta = eventStateManager.getRegistrationMeta(evento.id);

            // Busca el EventoBackend para obtener el username del organizador
            const eventoBackend = Array.isArray(backendEvents)
                ? backendEvents.find(e => String(e.id) === String(evento.id))
                : undefined;

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
            setIsDiplomaOpen(false);
        } catch (err) {
            console.error('Error exportando constancia:', err);
            Alert.alert(
                'Error al exportar',
                'No se pudo generar el PDF. Por favor intenta nuevamente.',
                [{ text: 'Aceptar' }]
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handleOpenDiploma = (evento: Evento) => {
        setSelectedConstanciaEvento(evento);
        setIsDiplomaOpen(true);
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
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
                    <Text style={styles.roleBadgeText}>
                        {role === 'ADMIN' ? 'Administrador' : role === 'MANAGER' ? 'Manager' : role === 'TEACHER' ? 'Docente' : 'Alumno UTP'}
                    </Text>
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
                        <Text style={styles.infoValue}>ECHO</Text>
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

                {/* Grid 2 columnas — con spinner mientras cargan las categorías del backend */}
                {categoriasLoading ? (
                    <VStack style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
                        <ActivityIndicator size="small" color={C.accent} />
                        <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                            Cargando categorías...
                        </Text>
                    </VStack>
                ) : intereses.length === 0 ? (
                    <Text style={{ color: C.textSecondary, fontSize: 12, paddingVertical: 12, textAlign: 'center' }}>
                        No hay categorías disponibles en el sistema.
                    </Text>
                ) : (
                    <View style={styles.chipGrid}>
                        {intereses.map((item) => (
                            <InterestChip key={item.id} interes={item} onToggle={toggleInteres} />
                        ))}
                    </View>
                )}
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
                {menuWithBadges.map((item) => (
                    <MenuRow key={item.id} item={item} onPress={() => handleMenuPress(item.id)} />
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
                                        <Text style={styles.diplomaUniName}>ECHO</Text>
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
                                            Por haber participado en el evento académico:
                                        </Text>

                                        <Text style={styles.diplomaEventTitle}>"{selectedConstanciaEvento.titulo}"</Text>

                                        <Text style={styles.diplomaCredits}>
                                            {selectedConstanciaEvento.lugar} · {selectedConstanciaEvento.fecha} · {selectedConstanciaEvento.hora}{"\n"}
                                            Organizado por @{(Array.isArray(backendEvents)
                                                ? backendEvents.find(e => String(e.id) === String(selectedConstanciaEvento.id))
                                                : undefined)?.createdByUsername ?? 'organizador'}
                                        </Text>

                                        {/* Sello decorativo */}
                                        <HStack style={styles.diplomaSignatures}>
                                            <VStack style={styles.signatureBox}>
                                                <View style={styles.signLine} />
                                                <Text style={styles.signName}>Firma del Organizador</Text>
                                                <Text style={styles.signRole}>
                                                    @{(Array.isArray(backendEvents)
                                                        ? backendEvents.find(e => String(e.id) === String(selectedConstanciaEvento.id))
                                                        : undefined)?.createdByUsername ?? 'organizador'}
                                                </Text>
                                            </VStack>

                                            <View style={styles.diplomaSeal}>
                                                <Icon as={ICONS.Star} style={{ color: '#D97706', width: 16, height: 16 }} />
                                                <Text style={styles.sealText}>SELLO</Text>
                                            </View>
                                        </HStack>

                                        <Text style={styles.diplomaVerificationCode}>
                                            {eventStateManager.getRegistrationMeta(selectedConstanciaEvento.id)?.registrationId
                                                ? `REG-${eventStateManager.getRegistrationMeta(selectedConstanciaEvento.id)!.registrationId}-EV-${selectedConstanciaEvento.id}`
                                                : `EV-${selectedConstanciaEvento.id}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Botón de Descarga PDF */}
                            <TouchableOpacity
                                onPress={() => handleDownloadCert(selectedConstanciaEvento)}
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
            )}

            {/* ── MODAL DE EDICIÓN DE PERFIL ── */}
            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onProfileUpdated={() => {
                    // La reactividad de authStateManager actualiza automáticamente los datos locales
                }}
            />

            {/* ── MODAL DE NOTIFICACIONES ── */}
            <Modal
                visible={isNotifOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsNotifOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.certModalContainer, { padding: 20 }]}>
                        {/* Cabecera */}
                        <View style={styles.certHeader}>
                            <Text style={styles.certHeaderTitle}>Notificaciones</Text>
                            <TouchableOpacity onPress={() => setIsNotifOpen(false)} style={styles.certCloseBtn}>
                                <Icon as={ICONS.X} style={{ color: '#6B7280', width: 20, height: 20 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Botón de Marcar todo como leído */}
                        {listaSolicitudes.length > 0 && (
                            <HStack style={{ justifyContent: 'flex-end', marginBottom: 12, paddingHorizontal: 4, width: '100%' }}>
                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            const { notificationService } = require('../services/notificationService');
                                            await notificationService.markAllAsRead();
                                            setServerNotifications([]);
                                        } catch (e) {
                                            console.error('Error al marcar todo como leído:', e);
                                        }
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        backgroundColor: '#F1F5F9',
                                        borderRadius: 8,
                                        paddingVertical: 6,
                                        paddingHorizontal: 12,
                                        borderWidth: 1,
                                        borderColor: '#E2E8F0',
                                    }}
                                >
                                    <Icon as={ICONS.CheckCircle} style={{ color: '#475569', width: 14, height: 14 }} />
                                    <Text style={{ fontSize: 12, color: '#475569', fontWeight: '700' }}>
                                        Marcar todo como leído
                                    </Text>
                                </TouchableOpacity>
                            </HStack>
                        )}

                        {/* Listado de Solicitudes/Notificaciones */}
                        {listaSolicitudes.length > 0 ? (
                            <ScrollView style={{ width: '100%', maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                                <View style={{ gap: 12, paddingVertical: 10 }}>
                                    {listaSolicitudes.map((notif) => (
                                        <View key={notif.id} style={{
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#E2E8F0',
                                            padding: 12,
                                            gap: 6
                                        }}>
                                            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                                <HStack style={{ alignItems: 'center', gap: 6 }}>
                                                    <Icon as={ICONS.Bell} style={{ color: '#F59E0B', width: 16, height: 16 }} />
                                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#D97706' }}>
                                                        {notif.title}
                                                    </Text>
                                                </HStack>
                                            </HStack>
                                            <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>
                                                {notif.description}
                                            </Text>
                                            <HStack style={{ gap: 8, marginTop: 4 }}>
                                                <TouchableOpacity
                                                    onPress={async () => {
                                                        try {
                                                            const { notificationService } = require('../services/notificationService');
                                                            await notificationService.markAsRead(notif.originalId);
                                                            setServerNotifications(prev => prev.filter((n: any) => n.id !== notif.originalId));
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: '#FFFBEB',
                                                        borderColor: '#FCD34D',
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                        paddingVertical: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '700' }}>
                                                        Entendido
                                                    </Text>
                                                </TouchableOpacity>

                                                {notif.eventId && (
                                                    <TouchableOpacity
                                                        onPress={async () => {
                                                            setIsNotifOpen(false);
                                                            try {
                                                                const { notificationService } = require('../services/notificationService');
                                                                await notificationService.markAsRead(notif.originalId);
                                                                setServerNotifications(prev => prev.filter((n: any) => n.id !== notif.originalId));
                                                            } catch (e) {
                                                                console.error('Error marking as read:', e);
                                                            }
                                                            router.push({
                                                                pathname: '/tabs/admin',
                                                                params: { tab: 'eventos', openEventId: String(notif.eventId) }
                                                            });
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor: '#EEF2FF',
                                                            borderColor: '#6366F1',
                                                            borderWidth: 1,
                                                            borderRadius: 8,
                                                            paddingVertical: 8,
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Text style={{ color: '#4F46E5', fontSize: 11, fontWeight: '700' }}>
                                                            Revisar Detalle
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </HStack>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        ) : (
                            <View style={{ alignItems: 'center', paddingVertical: 32, gap: 10 }}>
                                <Icon as={ICONS.CheckCircle} style={{ color: '#10B981', width: 44, height: 44 }} />
                                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                                    No tienes notificaciones pendientes. Todo al día.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal de Cierre de Sesión */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => {
                    // 1. Limpiar todo el estado de eventos y forzar recarga
                    eventStateManager.resetState();
                    resetEventsCache();
                    // 2. Limpiar la sesión de autenticación y redirigir al login.
                    authStateManager.clearSession();
                    router.replace('/');
                }}
                title="¿Deseas cerrar sesión?"
                description="Tendrás que volver a iniciar sesión para acceder nuevamente a tu cuenta."
                confirmLabel="Cerrar sesión"
                cancelLabel="Cancelar"
                confirmColor="#EF4444"
                icon={ICONS.arrrowDownUp}
                iconColor="#EF4444"
            />

            {/* ── MODAL DEL TUTORIAL DE BIENVENIDA ── */}
            <Modal
                visible={isOnboardingOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOnboardingOpen(false)}
            >
                <OnboardingScreen onFinish={() => setIsOnboardingOpen(false)} isModal={true} />
            </Modal>
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