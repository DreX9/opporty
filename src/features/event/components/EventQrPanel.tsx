import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    TouchableOpacity,
    StyleSheet
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

interface EventQrPanelProps {
    eventId: number;
}

export default function EventQrPanel({ eventId }: EventQrPanelProps) {
    const [loadingEntry, setLoadingEntry] = useState(false);
    const [loadingExit, setLoadingExit] = useState(false);

    const [qrEntryBase64, setQrEntryBase64] = useState<string | null>(null);
    const [sessionEntry, setSessionEntry] = useState<QrSessionViewDTO | null>(null);
    const [timeLeftEntry, setTimeLeftEntry] = useState<number>(0);

    const [qrExitBase64, setQrExitBase64] = useState<string | null>(null);
    const [sessionExit, setSessionExit] = useState<QrSessionViewDTO | null>(null);
    const [timeLeftExit, setTimeLeftExit] = useState<number>(0);

    const timerEntryRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerExitRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    // Manejo de la cuenta regresiva para Entrada
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

    // Manejo de la cuenta regresiva para Salida
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

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <VStack space="lg" style={styles.container}>
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
                    <VStack style={styles.qrActiveContainer} space="sm">
                        <Image
                            source={{ uri: `data:image/png;base64,${qrEntryBase64}` }}
                            style={styles.qrImage}
                        />
                        <HStack style={styles.countdownContainer}>
                            <Icon as={ICONS.Clock} style={{ color: C.danger, width: 16, height: 16 }} />
                            <Text style={styles.countdownText}>
                                Expiración en: {formatTime(timeLeftEntry)}
                            </Text>
                        </HStack>
                        <Text style={styles.instruction}>
                            Indica a los estudiantes que escaneen este código desde su app para registrar su ingreso.
                        </Text>
                    </VStack>
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
                    <VStack style={styles.qrActiveContainer} space="sm">
                        <Image
                            source={{ uri: `data:image/png;base64,${qrExitBase64}` }}
                            style={styles.qrImage}
                        />
                        <HStack style={styles.countdownContainer}>
                            <Icon as={ICONS.Clock} style={{ color: C.danger, width: 16, height: 16 }} />
                            <Text style={styles.countdownText}>
                                Expiración en: {formatTime(timeLeftExit)}
                            </Text>
                        </HStack>
                        <Text style={styles.instruction}>
                            Indica a los estudiantes que escaneen este código al retirarse para registrar su salida.
                        </Text>
                    </VStack>
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
        paddingVertical: 12,
    },
    qrImage: {
        width: 180,
        height: 180,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: C.cardBorder,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    countdownText: {
        fontSize: 12,
        fontWeight: '700',
        color: C.danger,
    },
    instruction: {
        fontSize: 11,
        color: C.textMuted,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
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
}) as any;
