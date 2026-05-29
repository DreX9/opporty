import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    View,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { eventService } from '../services/eventService';
import { QrSessionViewDTO } from '../types/api';
import { C } from '../constants';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const { width: SW } = Dimensions.get('window');
// El QR se mostrará al 85% del ancho de pantalla, con un máximo razonable
const QR_SIZE = Math.min(SW * 0.85, 340);

interface EventQrPanelProps {
    eventId: number;
    eventoTitulo?: string;
}

export default function EventQrPanel({ eventId, eventoTitulo }: EventQrPanelProps) {
    const [loadingEntry, setLoadingEntry] = useState(false);
    const [loadingExit, setLoadingExit] = useState(false);
    const [sharingEntry, setSharingEntry] = useState(false);
    const [sharingExit, setSharingExit] = useState(false);

    const [qrEntryBase64, setQrEntryBase64] = useState<string | null>(null);
    const [sessionEntry, setSessionEntry] = useState<QrSessionViewDTO | null>(null);
    const [timeLeftEntry, setTimeLeftEntry] = useState<number>(0);

    const [qrExitBase64, setQrExitBase64] = useState<string | null>(null);
    const [sessionExit, setSessionExit] = useState<QrSessionViewDTO | null>(null);
    const [timeLeftExit, setTimeLeftExit] = useState<number>(0);

    // Modal de visualización ampliada
    const [expandedQr, setExpandedQr] = useState<{
        base64: string;
        tipo: 'ENTRADA' | 'SALIDA';
        color: string;
        timeLeft: number;
    } | null>(null);

    const timerEntryRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerExitRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Refs para exportar la imagen con texto debajo
    const qrExportRefEntry = useRef<View>(null);
    const qrExportRefExit = useRef<View>(null);

    const checkActiveSessions = async () => {
        try {
            const entryRes = await eventService.fetchActiveQrSession(eventId, 'ENTRY');
            if (entryRes && entryRes.session && entryRes.session.active) {
                setSessionEntry(prev => {
                    if (!prev || prev.id !== entryRes.session.id) {
                        setQrEntryBase64(entryRes.qrCodeBase64);
                        return entryRes.session;
                    }
                    return prev;
                });
            } else {
                setSessionEntry(prev => {
                    if (prev) {
                        setQrEntryBase64(null);
                        return null;
                    }
                    return prev;
                });
            }

            const exitRes = await eventService.fetchActiveQrSession(eventId, 'EXIT');
            if (exitRes && exitRes.session && exitRes.session.active) {
                setSessionExit(prev => {
                    if (!prev || prev.id !== exitRes.session.id) {
                        setQrExitBase64(exitRes.qrCodeBase64);
                        return exitRes.session;
                    }
                    return prev;
                });
            } else {
                setSessionExit(prev => {
                    if (prev) {
                        setQrExitBase64(null);
                        return null;
                    }
                    return prev;
                });
            }
        } catch (error: unknown) {
            console.error('Error al verificar sesiones de QR activas:', error);
        }
    };

    useEffect(() => {
        checkActiveSessions();
        const pollInterval = setInterval(checkActiveSessions, 10000);
        return () => {
            clearInterval(pollInterval);
        };
    }, [eventId]);

    // Cuenta regresiva para Entrada
    useEffect(() => {
        if (sessionEntry && sessionEntry.active) {
            const expires = new Date(sessionEntry.expiresAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expires - now) / 1000));
                setTimeLeftEntry(diff);

                if (diff <= 0) {
                    setSessionEntry(prev => prev ? { ...prev, active: false } : null);
                    setQrEntryBase64(null);
                    if (timerEntryRef.current) clearInterval(timerEntryRef.current);
                }
            };

            updateTimer();
            timerEntryRef.current = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timerEntryRef.current) clearInterval(timerEntryRef.current);
        };
    }, [sessionEntry]);

    // Cuenta regresiva para Salida
    useEffect(() => {
        if (sessionExit && sessionExit.active) {
            const expires = new Date(sessionExit.expiresAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expires - now) / 1000));
                setTimeLeftExit(diff);

                if (diff <= 0) {
                    setSessionExit(prev => prev ? { ...prev, active: false } : null);
                    setQrExitBase64(null);
                    if (timerExitRef.current) clearInterval(timerExitRef.current);
                }
            };

            updateTimer();
            timerExitRef.current = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timerExitRef.current) clearInterval(timerExitRef.current);
        };
    }, [sessionExit]);

    const activarQr = async (type: 'ENTRY' | 'EXIT') => {
        const isEntry = type === 'ENTRY';
        const setLoader = isEntry ? setLoadingEntry : setLoadingExit;
        const setSession = isEntry ? setSessionEntry : setSessionExit;
        const setQr = isEntry ? setQrEntryBase64 : setQrExitBase64;
        const duration = isEntry ? 15 : 5;

        setLoader(true);
        try {
            const response = await eventService.generateQrSession({
                eventId,
                type,
                durationMinutes: duration
            });
            setSession(response.session);
            setQr(response.qrCodeBase64);
        } catch (error: unknown) {
            console.error(`Error generando QR de ${type}:`, error);
            let msg = 'No se pudo generar la sesión de QR.';
            if (error && typeof error === 'object') {
                const errObj = error as Record<string, unknown>;
                if (errObj.response && typeof errObj.response === 'object') {
                    const respObj = errObj.response as Record<string, unknown>;
                    if (respObj.data && typeof respObj.data === 'object') {
                        const dataObj = respObj.data as Record<string, unknown>;
                        if (typeof dataObj.message === 'string') {
                            msg = dataObj.message;
                        }
                    }
                } else if (typeof errObj.message === 'string') {
                    msg = errObj.message;
                }
            }
            Alert.alert('⚠️ Error al generar QR', msg);
        } finally {
            setLoader(false);
        }
    };

    /**
     * Comparte el QR capturando una vista oculta (con texto y QR) como imagen.
     */
    const compartirQr = async (
        tipo: 'ENTRADA' | 'SALIDA',
        setSharingState: (v: boolean) => void
    ) => {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
            Alert.alert('Compartir no disponible', 'Este dispositivo no soporta la opción de compartir.');
            return;
        }

        const targetRef = tipo === 'ENTRADA' ? qrExportRefEntry : qrExportRefExit;

        if (!targetRef.current) return;

        setSharingState(true);
        try {
            // Captura la vista oculta como un archivo temporal PNG
            const uri = await captureRef(targetRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile'
            });

            const labelEvento = eventoTitulo ? `\n📌 Evento: ${eventoTitulo}` : '';
            const dialogTitle =
                tipo === 'ENTRADA'
                    ? `✅ QR de Registro de ENTRADA${labelEvento}`
                    : `🚪 QR de Registro de SALIDA${labelEvento}`;

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle,
                UTI: 'public.png',
            });
        } catch (err) {
            console.error('Error al compartir QR:', err);
            Alert.alert('Error', 'No se pudo compartir el código QR.');
        } finally {
            setSharingState(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    /** Renderiza la tarjeta de QR activo (grande + botón compartir) */
    const renderQrCard = (
        tipo: 'ENTRADA' | 'SALIDA',
        base64: string,
        timeLeft: number,
        accentColor: string,
        sharingState: boolean,
        setSharingState: (v: boolean) => void
    ) => (
        <VStack style={styles.qrActiveContainer} space="sm">
            {/* Etiqueta de tipo */}
            <View style={[styles.tipoBadge, { backgroundColor: tipo === 'ENTRADA' ? '#DCFCE7' : '#EDE9FE' }]}>
                <Text style={[styles.tipoBadgeText, { color: tipo === 'ENTRADA' ? '#16A34A' : '#7C3AED' }]}>
                    {tipo === 'ENTRADA' ? '✅ QR de ENTRADA' : '🚪 QR de SALIDA'}
                </Text>
            </View>

            {/* Imagen del QR — grande */}
            <TouchableOpacity
                onPress={() => setExpandedQr({ base64, tipo, color: accentColor, timeLeft })}
                activeOpacity={0.9}
                style={styles.qrImageWrapper}
            >
                <Image
                    source={{ uri: `data:image/png;base64,${base64}` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                />
                <View style={styles.qrTapHint}>
                    <Icon as={ICONS.Zap} style={{ color: '#6B7280', width: 11, height: 11 }} />
                    <Text style={styles.qrTapHintText}>Toca para ampliar</Text>
                </View>
            </TouchableOpacity>

            {/* Cuenta regresiva */}
            <HStack style={styles.countdownContainer}>
                <Icon as={ICONS.Clock} style={{ color: C.danger, width: 16, height: 16 }} />
                <Text style={styles.countdownText}>
                    Expira en: {formatTime(timeLeft)}
                </Text>
            </HStack>

            {/* Instrucción */}
            <Text style={styles.instruction}>
                {tipo === 'ENTRADA'
                    ? 'Muestra este QR para que los asistentes registren su ingreso.'
                    : 'Muestra este QR para que los asistentes registren su salida.'}
            </Text>

            {/* Botón Compartir */}
            <TouchableOpacity
                onPress={() => compartirQr(tipo, setSharingState)}
                disabled={sharingState}
                style={[styles.shareBtn, { borderColor: accentColor, opacity: sharingState ? 0.6 : 1 }]}
            >
                {sharingState ? (
                    <ActivityIndicator size="small" color={accentColor} />
                ) : (
                    <Icon as={ICONS.Share} style={{ color: accentColor, width: 16, height: 16 }} />
                )}
                <Text style={[styles.shareBtnText, { color: accentColor }]}>
                    {sharingState ? 'Compartiendo...' : `Compartir QR de ${tipo}`}
                </Text>
            </TouchableOpacity>
        </VStack>
    );

    return (
        <VStack space="lg" style={styles.container}>
            {/* Vistas ocultas para exportación de imágenes */}
            {qrEntryBase64 && (
                <View style={styles.offscreenContainer}>
                    <View ref={qrExportRefEntry} style={styles.exportCard} collapsable={false}>
                        <Image source={{ uri: `data:image/png;base64,${qrEntryBase64}` }} style={styles.exportQr} />
                        <View style={styles.exportFooter}>
                            <Text style={styles.exportTitle}>{eventoTitulo || `Evento #${eventId}`}</Text>
                            <Text style={[styles.exportType, { color: '#16A34A' }]}>QR DE ENTRADA</Text>
                        </View>
                    </View>
                </View>
            )}

            {qrExitBase64 && (
                <View style={styles.offscreenContainer}>
                    <View ref={qrExportRefExit} style={styles.exportCard} collapsable={false}>
                        <Image source={{ uri: `data:image/png;base64,${qrExitBase64}` }} style={styles.exportQr} />
                        <View style={styles.exportFooter}>
                            <Text style={styles.exportTitle}>{eventoTitulo || `Evento #${eventId}`}</Text>
                            <Text style={[styles.exportType, { color: '#7C3AED' }]}>QR DE SALIDA</Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.title}>Control de Asistencia por QR</Text>
            <Text style={styles.subtitle}>
                Como organizador, puedes generar códigos QR para registrar la entrada y salida de los estudiantes de forma presencial.
            </Text>

            {/* SECCIÓN REGISTRO DE ENTRADA (ENTRY) */}
            <VStack style={styles.qrSection} space="md">
                <HStack style={styles.sectionHeader}>
                    <HStack style={{ gap: 8, alignItems: 'center' }}>
                        <Icon as={ICONS.CheckCircle} style={{ color: C.green, width: 18, height: 18 }} />
                        <Text style={styles.sectionTitle}>QR de Registro de Entrada</Text>
                    </HStack>
                    <Text style={styles.durationBadge}>15 mins</Text>
                </HStack>

                {sessionEntry?.active && qrEntryBase64 ? (
                    renderQrCard('ENTRADA', qrEntryBase64, timeLeftEntry, C.green, sharingEntry, setSharingEntry)
                ) : (
                    <TouchableOpacity
                        onPress={() => activarQr('ENTRY')}
                        disabled={loadingEntry}
                        style={[styles.button, { backgroundColor: C.accent }]}
                    >
                        {loadingEntry ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <HStack style={{ gap: 8, alignItems: 'center' }}>
                                <Icon as={ICONS.Zap} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                <Text style={styles.buttonText}>Activar QR de Entrada</Text>
                            </HStack>
                        )}
                    </TouchableOpacity>
                )}
            </VStack>

            {/* SECCIÓN REGISTRO DE SALIDA (EXIT) */}
            <VStack style={styles.qrSection} space="md">
                <HStack style={styles.sectionHeader}>
                    <HStack style={{ gap: 8, alignItems: 'center' }}>
                        <Icon as={ICONS.CheckCircle} style={{ color: C.green, width: 18, height: 18 }} />
                        <Text style={styles.sectionTitle}>QR de Registro de Salida</Text>
                    </HStack>
                    <Text style={styles.durationBadge}>5 mins</Text>
                </HStack>

                {sessionExit?.active && qrExitBase64 ? (
                    renderQrCard('SALIDA', qrExitBase64, timeLeftExit, C.accentPurple, sharingExit, setSharingExit)
                ) : (
                    <TouchableOpacity
                        onPress={() => activarQr('EXIT')}
                        disabled={loadingExit}
                        style={[styles.button, { backgroundColor: C.accentPurple }]}
                    >
                        {loadingExit ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <HStack style={{ gap: 8, alignItems: 'center' }}>
                                <Icon as={ICONS.Zap} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                                <Text style={styles.buttonText}>Activar QR de Salida</Text>
                            </HStack>
                        )}
                    </TouchableOpacity>
                )}
            </VStack>

            {/* ── MODAL DE VISUALIZACIÓN AMPLIADA ── */}
            <Modal
                visible={!!expandedQr}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setExpandedQr(null)}
            >
                <View style={styles.expandedOverlay}>
                    <View style={styles.expandedCard}>
                        {/* Cabecera */}
                        <HStack style={styles.expandedHeader}>
                            <View style={[
                                styles.expandedTypeBadge,
                                { backgroundColor: expandedQr?.tipo === 'ENTRADA' ? '#DCFCE7' : '#EDE9FE' }
                            ]}>
                                <Text style={[
                                    styles.expandedTypeBadgeText,
                                    { color: expandedQr?.tipo === 'ENTRADA' ? '#16A34A' : '#7C3AED' }
                                ]}>
                                    {expandedQr?.tipo === 'ENTRADA' ? '✅ QR de ENTRADA' : '🚪 QR de SALIDA'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setExpandedQr(null)} style={styles.expandedCloseBtn}>
                                <Icon as={ICONS.X} style={{ color: '#6B7280', width: 20, height: 20 }} />
                            </TouchableOpacity>
                        </HStack>

                        {/* QR a pantalla completa */}
                        {expandedQr && (
                            <Image
                                source={{ uri: `data:image/png;base64,${expandedQr.base64}` }}
                                style={styles.expandedQrImage}
                                resizeMode="contain"
                            />
                        )}

                        {/* Cuenta regresiva en modal */}
                        <HStack style={styles.countdownContainer}>
                            <Icon as={ICONS.Clock} style={{ color: C.danger, width: 16, height: 16 }} />
                            <Text style={styles.countdownText}>
                                Expira en: {expandedQr ? formatTime(
                                    expandedQr.tipo === 'ENTRADA' ? timeLeftEntry : timeLeftExit
                                ) : '00:00'}
                            </Text>
                        </HStack>

                        {/* Botón compartir en modal */}
                        {expandedQr && (
                            <TouchableOpacity
                                onPress={() => compartirQr(
                                    expandedQr.tipo,
                                    expandedQr.tipo === 'ENTRADA' ? setSharingEntry : setSharingExit
                                )}
                                disabled={expandedQr.tipo === 'ENTRADA' ? sharingEntry : sharingExit}
                                style={[styles.shareBtn, {
                                    borderColor: expandedQr.color,
                                    marginTop: 12,
                                    opacity: (expandedQr.tipo === 'ENTRADA' ? sharingEntry : sharingExit) ? 0.6 : 1
                                }]}
                            >
                                <Icon as={ICONS.Share} style={{ color: expandedQr.color, width: 16, height: 16 }} />
                                <Text style={[styles.shareBtnText, { color: expandedQr.color }]}>
                                    Compartir QR de {expandedQr.tipo}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </VStack>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: C.textPrimary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: C.textSecondary,
        lineHeight: 16,
        marginBottom: 12,
    },
    qrSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.cardBorder,
        padding: 16,
    },
    sectionHeader: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.textPrimary,
    },
    durationBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: C.textSecondary,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    qrActiveContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 10,
    },
    tipoBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 999,
        marginBottom: 4,
    },
    tipoBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    qrImageWrapper: {
        alignItems: 'center',
        gap: 4,
    },
    qrImage: {
        width: QR_SIZE,
        height: QR_SIZE,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: C.cardBorder,
    },
    qrTapHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    qrTapHintText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
    },
    countdownText: {
        fontSize: 13,
        fontWeight: '700',
        color: C.danger,
    },
    instruction: {
        fontSize: 11,
        color: C.textMuted,
        textAlign: 'center',
        paddingHorizontal: 8,
        lineHeight: 15,
    },
    // Botón compartir
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        width: '100%',
        marginTop: 4,
    },
    shareBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    button: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    // ── MODAL EXPANDIDO ──
    expandedOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    expandedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        width: '100%',
        maxWidth: 420,
        gap: 12,
    },
    expandedHeader: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 4,
    },
    expandedTypeBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    expandedTypeBadgeText: {
        fontSize: 13,
        fontWeight: '800',
    },
    expandedCloseBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedQrImage: {
        width: SW * 0.78,
        height: SW * 0.78,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    // ── EXPORTACIÓN (Vistas ocultas) ──
    offscreenContainer: {
        position: 'absolute',
        top: -9999,
        left: -9999,
        // IMPORTANTE: No usar opacity: 0, causa capturas en blanco en react-native-view-shot
    },
    exportCard: {
        backgroundColor: '#FFFFFF',
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        width: 500,
    },
    exportQr: {
        width: 436,
        height: 436,
        marginBottom: 24,
    },
    exportFooter: {
        alignItems: 'center',
        gap: 8,
    },
    exportTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        lineHeight: 34,
    },
    exportType: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
}) as any;
