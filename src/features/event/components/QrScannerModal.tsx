import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { eventStateManager, useEventState } from '../state';
import { useEvents } from '../hooks/useEvents';
import { mapBackendToEvento } from '../types';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

// ── Anulación de tipos para Reanimated si es necesario ──
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectEvent?: (eventId: string) => void;
}

const { width: SW } = Dimensions.get('window');

export default function QrScannerModal({ isOpen, onClose, onSelectEvent }: QrScannerModalProps) {
    const router = useRouter();
    const eventState = useEventState();
    const { data: backendEvents } = useEvents();
    const EVENTOS = Array.isArray(backendEvents) ? backendEvents.map(mapBackendToEvento) : [];
    const [manualCode, setManualCode] = useState('');
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [showSimulator, setShowSimulator] = useState(false);
    const isProcessingRef = useRef(false);

    // Animación de la línea láser
    const translateY = useSharedValue(0);

    useEffect(() => {
        if (isOpen) {
            isProcessingRef.current = false;
            translateY.value = 0;
            translateY.value = withRepeat(
                withTiming(200, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );
        }
    }, [isOpen]);

    const laserStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    if (!isOpen) return null;

    // Procesar el payload del QR (JSON o String o Token)
    const processQRData = async (dataStr: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            // El QR del backend contiene directamente el UUID del token.
            // Intentamos parsear como JSON por compatibilidad con simulador.
            let token = dataStr;
            try {
                const parsed = JSON.parse(dataStr);
                if (parsed.token) token = parsed.token;
            } catch (e) {
                // No es JSON, asumimos que es el token directo (caso real del backend)
            }

            // --- LLAMADA AL BACKEND REAL ---
            const { eventService } = require('../services/eventService');
            const registration = await eventService.scanQrCode(token);

            // El backend retorna EventRegistrationsViewDTO con todos los campos actualizados.
            // El DTO expone `eventId` directamente como Long (no como objeto anidado).
            const evId = String(registration?.eventId ?? '');

            if (!evId) {
                // Respuesta inesperada del backend, pero fue exitosa
                setScannedResult('✅ ¡Asistencia registrada!');
                setTimeout(() => { setScannedResult(null); onClose(); isProcessingRef.current = false; }, 1800);
                return;
            }

            // Determinar qué insignia se acaba de desbloquear:
            // - Si qrExitScanned == true → se registró la SALIDA
            // - Si qrEntryScanned == true y qrExitScanned == false → se registró el INGRESO
            const tipoDesbloqueado: 'ingreso' | 'salida' = registration.qrExitScanned ? 'salida' : 'ingreso';

            // Sincronizar estado local del frontend:
            // 1) Marcar al usuario como registrado en el evento (puede ser auto-registro)
            eventStateManager.registerToEvent(evId);
            // 2) Desbloquear la insignia correspondiente
            eventStateManager.unlockInsignia(evId, tipoDesbloqueado);
            // Si también ya tenía la de ingreso y ahora tiene la de salida, marcar las dos
            if (tipoDesbloqueado === 'salida' && registration.qrEntryScanned) {
                eventStateManager.unlockInsignia(evId, 'ingreso');
            }

            // Mostrar pantalla de éxito breve, luego navegar al evento
            const label = tipoDesbloqueado === 'ingreso' ? 'INGRESO 🏅' : 'SALIDA 🏆';
            setScannedResult(`¡Insignia de ${label} desbloqueada con éxito!`);
            setTimeout(() => {
                setScannedResult(null);
                onClose();
                router.push({
                    pathname: '/tabs/event',
                    params: { openEventId: evId, highlightAnim: tipoDesbloqueado }
                });
                isProcessingRef.current = false;
            }, 1800);

        } catch (error: any) {
            console.warn('Escaneo de QR rechazado por el servidor:', error?.response?.data?.message || error.message);
            const serverMsg: string = error?.response?.data?.message || error?.message || '';

            // Elegir un título y mensaje amigable según el contexto del error
            let titulo = '❌ Escaneo Rechazado';
            let mensaje = serverMsg || 'El código QR no es válido o ha expirado.';

            if (serverMsg.toLowerCase().includes('no puedes registrar salida')) {
                titulo = '⚠️ Ingreso No Registrado';
                mensaje = 'No puedes registrar tu salida porque aún no has registrado tu ingreso al evento. Escanea primero el QR de Entrada.';
            } else if (serverMsg.toLowerCase().includes('capacidad') || serverMsg.toLowerCase().includes('aforo')) {
                titulo = '🚫 Aforo Completo';
                mensaje = 'El evento ha alcanzado su capacidad máxima. No es posible registrar tu asistencia.';
            } else if (serverMsg.toLowerCase().includes('cancelada') || serverMsg.toLowerCase().includes('rechazada')) {
                titulo = '🚫 Inscripción No Válida';
                mensaje = 'Tu inscripción a este evento fue cancelada o rechazada. Contacta al organizador.';
            } else if (serverMsg.toLowerCase().includes('ya has escaneado')) {
                titulo = '✅ Ya Registrado';
                mensaje = 'Ya registraste esta acción anteriormente. Revisa el panel de insignias en el detalle del evento.';
            } else if (serverMsg.toLowerCase().includes('expirado') || serverMsg.toLowerCase().includes('inválido')) {
                titulo = '⏱ QR Expirado';
                mensaje = 'Este código QR ya no es válido o ha expirado. Solicita uno nuevo al organizador.';
            }

            Alert.alert(
                titulo,
                mensaje,
                [{
                    text: 'Entendido',
                    onPress: () => {
                        setTimeout(() => { isProcessingRef.current = false; }, 1500);
                    }
                }]
            );
        }
    };


    const handleSimulate = (eventId: string, tipo: 'ingreso' | 'salida') => {
        const ev = EVENTOS.find(e => String(e.id) === String(eventId));
        const payload = JSON.stringify({
            eventId,
            tipo,
            titulo: ev?.titulo || 'Evento'
        });
        processQRData(payload);
    };

    const handleManualSubmit = () => {
        if (!manualCode.trim()) return;
        processQRData(manualCode.trim());
        setManualCode('');
    };

    const renderCameraContent = () => {
        if (!isOpen) return null;

        if (!permission) {
            return (
                <View style={styles.cameraPlaceholder}>
                    <Text style={styles.scanText}>Cargando cámara...</Text>
                </View>
            );
        }

        if (!permission.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <Icon as={ICONS.Camera} style={{ color: '#6366F1', width: 44, height: 44, marginBottom: 8 }} />
                    <Text style={styles.permissionTitle}>Cámara Requerida</Text>
                    <Text style={styles.permissionText}>
                        Necesitamos acceso a la cámara para escanear los códigos QR de los eventos.
                    </Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
                        <Text style={styles.permissionBtnText}>Habilitar Cámara</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={({ data }) => {
                        if (data) {
                            processQRData(data);
                        }
                    }}
                />
                <View style={styles.scannerOverlay}>
                    {/* Esquinas del visor */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />

                    {/* Línea láser animada */}
                    <Animated.View style={[styles.laserLine, laserStyle]} />

                    <Text style={styles.scanText}>
                        Enfoque el código QR del evento
                    </Text>
                </View>
            </>
        );
    };

    // Obtener los eventos a los que el alumno está registrado
    const registradosInfo = EVENTOS.filter(ev => eventState.registrados.has(String(ev.id)));

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBg}>
                <View style={styles.container}>
                    {/* Cabecera */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.qrBadge}>
                                <Icon as={ICONS.radar} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                            </View>
                            <Text style={styles.headerTitle}>Lector QR Asistencia</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Icon as={ICONS.X} style={{ color: '#6B7280', width: 20, height: 20 }} />
                        </TouchableOpacity>
                    </View>

                    {scannedResult ? (
                        /* Vista de Éxito al Escanear */
                        <View style={styles.successContainer}>
                            <View style={styles.successCircle}>
                                <Icon as={ICONS.CheckCircle} style={{ color: '#22C55E', width: 56, height: 56 }} />
                            </View>
                            <Text style={styles.successTitle}>¡Escaneo Exitoso!</Text>
                            <Text style={styles.successText}>{scannedResult}</Text>
                        </View>
                    ) : (
                        /* Vista del Escáner Activo */
                        <View style={{ flex: 1 }}>
                            {/* Visor de Cámara Real */}
                            <View style={styles.cameraBox}>
                                {renderCameraContent()}
                            </View>

                            {/* Panel interactivo inferior */}
                            <View style={styles.actionsPanel}>
                                <TouchableOpacity
                                    onPress={() => setShowSimulator(!showSimulator)}
                                    style={styles.toggleSimBtn}
                                >
                                    <Icon as={showSimulator ? ICONS.ToggleRight : ICONS.ToggleLeft} style={{ color: '#6366F1', width: 20, height: 20 }} />
                                    <Text style={styles.toggleSimBtnText}>
                                        {showSimulator ? 'Ocultar Simulador de Pruebas' : 'Mostrar Simulador de Pruebas'}
                                    </Text>
                                </TouchableOpacity>

                                {showSimulator && (
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={styles.panelTitle}>Simulador de Escaneo Escolar</Text>
                                        <Text style={styles.panelSubtitle}>
                                            Selecciona una insignia para simular que escaneas el QR del administrador:
                                        </Text>

                                        {registradosInfo.length > 0 ? (
                                            <View style={styles.simulationList}>
                                                {registradosInfo.map((ev) => {
                                                    const ins = eventState.insignias[ev.id] || { ingreso: false, salida: false };
                                                    return (
                                                        <View key={ev.id} style={styles.simCard}>
                                                            <Text style={styles.simCardTitle} numberOfLines={1}>
                                                                {ev.titulo}
                                                            </Text>
                                                            <View style={styles.simBtnRow}>
                                                                <TouchableOpacity
                                                                    onPress={() => handleSimulate(String(ev.id), 'ingreso')}
                                                                    style={[
                                                                        styles.simBtn,
                                                                        ins.ingreso ? styles.simBtnDisabled : styles.simBtnIngreso
                                                                    ]}
                                                                    disabled={ins.ingreso}
                                                                >
                                                                    <Icon as={ins.ingreso ? ICONS.CheckCircle : ICONS.Zap} style={{ color: '#FFFFFF', width: 12, height: 12 }} />
                                                                    <Text style={styles.simBtnText}>
                                                                        {ins.ingreso ? 'Ingreso OK' : 'QR Ingreso'}
                                                                    </Text>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    onPress={() => handleSimulate(String(ev.id), 'salida')}
                                                                    style={[
                                                                        styles.simBtn,
                                                                        ins.salida ? styles.simBtnDisabled : styles.simBtnSalida
                                                                    ]}
                                                                    disabled={ins.salida}
                                                                >
                                                                    <Icon as={ins.salida ? ICONS.CheckCircle : ICONS.Trophy} style={{ color: '#FFFFFF', width: 12, height: 12 }} />
                                                                    <Text style={styles.simBtnText}>
                                                                        {ins.salida ? 'Salida OK' : 'QR Salida'}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        ) : (
                                            <View style={styles.noEventsBox}>
                                                <Icon as={ICONS.AlertCircle} style={{ color: '#9CA3AF', width: 22, height: 22 }} />
                                                <Text style={styles.noEventsText}>
                                                    Aún no te has registrado a ningún evento. Regístrate en la pestaña "Eventos" para poder simular la asistencia.
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Ingreso Manual de Payload */}
                                <View style={styles.manualInputRow}>
                                    <TextInput
                                        placeholder="Pegar payload de QR..."
                                        placeholderTextColor="#9CA3AF"
                                        value={manualCode}
                                        onChangeText={setManualCode}
                                        style={styles.manualInput}
                                    />
                                    <TouchableOpacity
                                        onPress={handleManualSubmit}
                                        style={styles.manualBtn}
                                    >
                                        <Text style={styles.manualBtnText}>Procesar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '90%',
        width: '100%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    qrBadge: {
        backgroundColor: '#6366F1',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    cameraBox: {
        height: 240,
        backgroundColor: '#0F172A',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    scannerOverlay: {
        width: 200,
        height: 200,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        position: 'relative',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 8,
    },
    laserLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#6366F1',
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanText: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    actionsPanel: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    panelTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    panelSubtitle: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 16,
        marginBottom: 12,
    },
    simulationList: {
        gap: 10,
        maxHeight: 190,
    },
    simCard: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    simCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        flex: 1,
    },
    simBtnRow: {
        flexDirection: 'row',
        gap: 6,
    },
    simBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    simBtnIngreso: {
        backgroundColor: '#6366F1',
    },
    simBtnSalida: {
        backgroundColor: '#A82BFA',
    },
    simBtnDisabled: {
        backgroundColor: '#94A3B8',
    },
    simBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    noEventsBox: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    noEventsText: {
        color: '#64748B',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 17,
    },
    manualInputRow: {
        flexDirection: 'row',
        marginTop: 'auto',
        marginBottom: 16,
        gap: 8,
    },
    manualInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 12,
        color: '#334155',
        height: 38,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    manualBtn: {
        backgroundColor: '#334155',
        borderRadius: 10,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        height: 38,
    },
    manualBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#15803D',
        marginBottom: 8,
    },
    successText: {
        fontSize: 14,
        color: '#3F6212',
        textAlign: 'center',
        lineHeight: 20,
    },
    cameraPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        width: '100%',
        height: '100%',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 24,
        width: '100%',
        height: '100%',
    },
    permissionTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    permissionText: {
        color: '#94A3B8',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 16,
    },
    permissionBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    permissionBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    toggleSimBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#E0E7FF',
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 6,
    },
    toggleSimBtnText: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: '700',
    },
});
