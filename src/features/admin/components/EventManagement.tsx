import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { AdminEvent } from '../types';
import { eventStateManager, useEventState } from '../../event/state';
import { useRouter } from 'expo-router';
import { useAuthState } from '../../auth/state';

function calcularDuracion(inicio: string | null, fin: string | null): string {
  if (!inicio || !fin) return 'No especificada';
  try {
    const partsIn = inicio.split(':');
    const partsOut = fin.split(':');
    const hIn = parseInt(partsIn[0], 10);
    const mIn = parseInt(partsIn[1], 10);
    const hOut = parseInt(partsOut[0], 10);
    const mOut = parseInt(partsOut[1], 10);

    let diffMins = (hOut * 60 + mOut) - (hIn * 60 + mIn);
    if (diffMins < 0) diffMins += 24 * 60; // Pasa de medianoche

    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hrs > 0 && mins > 0) {
      return `${hrs}h ${mins}m`;
    } else if (hrs > 0) {
      return `${hrs} hora${hrs !== 1 ? 's' : ''}`;
    } else {
      return `${mins} minuto${mins !== 1 ? 's' : ''}`;
    }
  } catch (e) {
    return 'No especificada';
  }
}

interface EventManagementProps {
  eventos: AdminEvent[];
  onAprobar: (id: string) => void;
  onRechazar: (id: string, motivo: string) => void;
  onEliminar: (id: string) => void;
  initialReviewEventId?: string;
  onConfirmarInicio?: (id: string) => void;
  onSuspender?: (id: string) => void;
  onCancelar?: (id: string) => void;
}

export default function EventManagement({
  eventos,
  onAprobar,
  onRechazar,
  onEliminar,
  initialReviewEventId,
  onConfirmarInicio,
  onSuspender,
  onCancelar,
}: EventManagementProps) {
  const router = useRouter();
  const eventState = useEventState();
  const { role, payload } = useAuthState();
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [reviewingEvent, setReviewingEvent] = useState<AdminEvent | null>(null);
  const [subTab, setSubTab] = useState<'aprobados' | 'solicitudes' | 'borradores'>('aprobados');
  const [lastProcessedEventId, setLastProcessedEventId] = useState<string | null>(null);

  // Carousel states for dynamic responsiveness
  const [containerWidth, setContainerWidth] = useState<number>(340);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Reset index when reviewingEvent changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [reviewingEvent]);

  // Open review modal automatically if initialReviewEventId is passed
  useEffect(() => {
    if (initialReviewEventId && initialReviewEventId !== lastProcessedEventId) {
      const found = eventos.find(e => e.id === initialReviewEventId);
      if (found) {
        setReviewingEvent(found);
        setLastProcessedEventId(initialReviewEventId);
        if (found.estado === 'Rechazado') {
          setSubTab('borradores');
        } else if (found.estado === 'Pendiente') {
          setSubTab('solicitudes');
        } else {
          setSubTab('aprobados');
        }
      }
    }
  }, [initialReviewEventId, eventos, lastProcessedEventId]);

  // Rejection reason state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectEventId, setRejectEventId] = useState<string | null>(null);
  const [motivoRechazoText, setMotivoRechazoText] = useState('');

  const handleTriggerRechazo = (id: string) => {
    setRejectEventId(id);
    setMotivoRechazoText('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmRechazo = () => {
    if (!motivoRechazoText.trim()) {
      Alert.alert('Motivo requerido', 'Por favor ingresa un motivo para el rechazo.');
      return;
    }
    if (rejectEventId) {
      onRechazar(rejectEventId, motivoRechazoText);
    }
    setIsRejectModalOpen(false);
    setRejectEventId(null);
  };

  const handleOpenQRModal = (evento: AdminEvent) => {
    // Generamos los QRs en el estado global para sincronizar con el alumno
    eventStateManager.generateQRs(evento.id, evento.titulo);
    setSelectedEvent(evento);
  };

  const handleShareQR = (tipo: 'ingreso' | 'salida') => {
    Alert.alert(
      'Compartir Código QR',
      `El código QR de ${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} para "${selectedEvent?.titulo}" ha sido compartido y guardado en tu galería de administrador.`,
      [{ text: 'Excelente' }]
    );
  };

  // Payloads de los códigos QR
  const getQRUrls = (evento: AdminEvent) => {
    const ingresoPayload = JSON.stringify({
      eventId: evento.id,
      tipo: 'ingreso',
      titulo: evento.titulo,
    });
    const salidaPayload = JSON.stringify({
      eventId: evento.id,
      tipo: 'salida',
      titulo: evento.titulo,
    });

    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=';
    return {
      ingreso: `${baseUrl}${encodeURIComponent(ingresoPayload)}`,
      salida: `${baseUrl}${encodeURIComponent(salidaPayload)}`,
      ingresoPayload,
      salidaPayload,
    };
  };

  const filteredEventos = eventos.filter((evento) => {
    if (subTab === 'aprobados') return evento.estado === 'Aprobado' || evento.estado === 'Programado';
    if (subTab === 'solicitudes') return evento.estado === 'Pendiente';
    return evento.estado !== 'Aprobado' && evento.estado !== 'Programado' && evento.estado !== 'Pendiente';
  });

  return (
    <VStack space="md">
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold">Gestión de Eventos</Text>
        <Text className="text-gray-500 text-xs mt-1">Revisa, aprueba o genera códigos de asistencia QR para los eventos.</Text>
      </Box>

      {/* 🧭 NAVEGACIÓN INTERNA DE SUB-TABS */}
      <HStack style={{ gap: 10, marginVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E9EAF4', paddingBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setSubTab('aprobados')}
          style={[
            styles.subTabButton,
            subTab === 'aprobados' ? styles.subTabActive : styles.subTabInactive
          ]}
        >
          <Text style={subTab === 'aprobados' ? styles.subTabTextActive : styles.subTabTextInactive}>
            Públicos ({eventos.filter(e => e.estado === 'Aprobado' || e.estado === 'Programado').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubTab('solicitudes')}
          style={[
            styles.subTabButton,
            subTab === 'solicitudes' ? styles.subTabActive : styles.subTabInactive
          ]}
        >
          <HStack style={{ alignItems: 'center', gap: 4 }}>
            <Text style={subTab === 'solicitudes' ? styles.subTabTextActive : styles.subTabTextInactive}>
              Solicitudes ({eventos.filter(e => e.estado === 'Pendiente').length})
            </Text>
            {eventos.filter(e => e.estado === 'Pendiente').length > 0 && (
              <View style={styles.tabBadge} />
            )}
          </HStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubTab('borradores')}
          style={[
            styles.subTabButton,
            subTab === 'borradores' ? styles.subTabActive : styles.subTabInactive
          ]}
        >
          <Text style={subTab === 'borradores' ? styles.subTabTextActive : styles.subTabTextInactive}>
            Otros ({eventos.filter(e => e.estado !== 'Aprobado' && e.estado !== 'Programado' && e.estado !== 'Pendiente').length})
          </Text>
        </TouchableOpacity>
      </HStack>

      {filteredEventos.length === 0 && (
        <Box className="py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 items-center justify-center">
          <Icon as={ICONS.CalendarDays} style={{ color: '#94A3B8', width: 44, height: 44, marginBottom: 8 }} />
          <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700' }}>
            No hay eventos en esta sección.
          </Text>
        </Box>
      )}

      {filteredEventos.map((evento) => {
        const isAprobado = evento.estado === 'Aprobado';
        const qrsGenerados = eventStateManager.hasQRs(evento.id);

        return (
          <Box
            key={evento.id}
            className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4]"
            style={styles.eventCard}
          >
            <TouchableOpacity onPress={() => setReviewingEvent(evento)} activeOpacity={0.75}>
              <HStack className="justify-between items-start mb-2">
                <VStack className="flex-1 mr-2">
                  <HStack style={{ alignItems: 'center', gap: 6 }}>
                    <Text className="text-[#111827] text-base font-bold" numberOfLines={1}>{evento.titulo}</Text>
                    <Icon as={ICONS.ChevronRight} style={{ color: '#94A3B8', width: 14, height: 14 }} />
                  </HStack>
                  <Text className="text-gray-500 text-xs font-semibold mt-0.5">{evento.categoria}</Text>
                </VStack>
                <Box
                  className="px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor:
                      evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.1)' :
                        evento.estado === 'Pendiente' ? 'rgba(234, 179, 8, 0.1)' :
                          evento.estado === 'Rechazado' ? 'rgba(239, 68, 68, 0.1)' :
                            evento.estado === 'Programado' ? 'rgba(99, 102, 241, 0.1)' :
                              evento.estado === 'Suspendido' ? 'rgba(249, 115, 22, 0.1)' :
                                evento.estado === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    borderColor:
                      evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.3)' :
                        evento.estado === 'Pendiente' ? 'rgba(234, 179, 8, 0.3)' :
                          evento.estado === 'Rechazado' ? 'rgba(239, 68, 68, 0.3)' :
                            evento.estado === 'Programado' ? 'rgba(99, 102, 241, 0.3)' :
                              evento.estado === 'Suspendido' ? 'rgba(249, 115, 22, 0.3)' :
                                evento.estado === 'Cancelado' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.3)',
                  }}
                >
                  <Text
                    className="text-2xs font-extrabold"
                    style={{
                      color:
                        evento.estado === 'Aprobado' ? '#22C55E' :
                          evento.estado === 'Pendiente' ? '#EAB308' :
                            evento.estado === 'Rechazado' ? '#EF4444' :
                              evento.estado === 'Programado' ? '#6366F1' :
                                evento.estado === 'Suspendido' ? '#F97316' :
                                  evento.estado === 'Cancelado' ? '#EF4444' : '#64748B'
                    }}
                  >
                    {evento.estado.toUpperCase()}
                  </Text>
                </Box>
              </HStack>

              {/* Fecha y Duración en la tarjeta */}
              <HStack style={{ alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 2 }}>
                <HStack style={{ alignItems: 'center', gap: 4 }}>
                  <Icon as={ICONS.CalendarDays} style={{ color: '#94A3B8', width: 12, height: 12 }} />
                  <Text style={{ fontSize: 11, color: '#64748B' }}>{evento.fecha}</Text>
                </HStack>
                {evento.raw?.horaInicio && evento.raw?.horaFin && (
                  <HStack style={{ alignItems: 'center', gap: 4 }}>
                    <Icon as={ICONS.Clock} style={{ color: '#94A3B8', width: 12, height: 12 }} />
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      Duración: {calcularDuracion(evento.raw.horaInicio, evento.raw.horaFin)}
                    </Text>
                  </HStack>
                )}
              </HStack>

              {/* Muestra el motivo del rechazo en la tarjeta si está rechazado */}
              {evento.estado === 'Rechazado' && evento.motivoRechazo && (
                <Box style={styles.rejectionReasonBox}>
                  <Text style={styles.rejectionReasonLabel}>Motivo del Rechazo:</Text>
                  <Text style={styles.rejectionReasonText}>{evento.motivoRechazo}</Text>
                </Box>
              )}
            </TouchableOpacity>

            <HStack className="justify-between mt-3 border-t border-gray-100 pt-3" style={{ alignItems: 'center' }}>
              {/* Botón de QR removido a petición del usuario */}

              <HStack style={{ gap: 8, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {role === 'ADMIN' && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        router.push({
                          pathname: '/tabs/admin/crear-evento',
                          params: { id: evento.id }
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200"
                    >
                      <Text className="text-indigo-700 text-xs font-bold">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onEliminar(evento.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200"
                    >
                      <Text className="text-rose-700 text-xs font-bold">Eliminar</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Acciones específicas de estado */}
                {evento.estado === 'Programado' && (
                  (role === 'ADMIN' || (role === 'MANAGER' && payload?.sub && evento.raw?.createdByUsername === payload.sub)) ? (
                    <>
                      <TouchableOpacity
                        onPress={() => onConfirmarInicio?.(evento.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600"
                      >
                        <Text className="text-white text-xs font-bold">Iniciar Evento</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => onSuspender?.(evento.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200"
                      >
                        <Text className="text-amber-700 text-xs font-bold">Suspender Evento</Text>
                      </TouchableOpacity>
                    </>
                  ) : null
                )}

                {evento.estado === 'Pendiente' && (
                  role === 'ADMIN' ? (
                    <>
                      <TouchableOpacity
                        onPress={() => onAprobar(evento.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200"
                      >
                        <Text className="text-emerald-700 text-xs font-bold">Aprobar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleTriggerRechazo(evento.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200"
                      >
                        <Text className="text-rose-700 text-xs font-bold">Rechazar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text className="text-amber-600 text-xs font-bold mr-2">En Revisión</Text>
                  )
                )}
              </HStack>
            </HStack>
          </Box>
        );
      })}

      {/* ── MODAL GENERADOR Y VISUALIZADOR DE CÓDIGOS QR ── */}
      {selectedEvent && (
        <Modal
          visible={!!selectedEvent}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedEvent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Cabecera */}
              <View style={styles.modalHeader}>
                <View style={{ gap: 2 }}>
                  <Text style={styles.modalHeaderTitle}>Administrador de Asistencia</Text>
                  <Text style={styles.modalHeaderSubtitle} numberOfLines={1}>
                    {selectedEvent.titulo}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.closeBtn}>
                  <Icon as={ICONS.X} style={{ color: '#64748B', width: 22, height: 22 }} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.qrScrollContent} showsVerticalScrollIndicator={false}>
                {/* Info */}
                <View style={styles.infoAlert}>
                  <Icon as={ICONS.AlertCircle} style={{ color: '#4F46E5', width: 18, height: 18 }} />
                  <Text style={styles.infoAlertText}>
                    Estos códigos QR son leídos por la cámara de los alumnos registrados para acreditar su ingreso y salida.
                  </Text>
                </View>

                {(() => {
                  const urls = getQRUrls(selectedEvent);
                  return (
                    <VStack style={{ gap: 20 }}>
                      {/* CARD QR 1: INGRESO */}
                      <View style={styles.qrCard}>
                        <View style={[styles.qrHeaderTag, { backgroundColor: '#ECFDF5' }]}>
                          <Icon as={ICONS.Zap} style={{ color: '#059669', width: 14, height: 14 }} />
                          <Text style={[styles.qrHeaderTagText, { color: '#059669' }]}>INGRESO AL EVENTO</Text>
                        </View>

                        <View style={styles.qrImageContainer}>
                          <Image
                            source={{ uri: urls.ingreso }}
                            style={styles.qrImage}
                            resizeMode="contain"
                          />
                        </View>

                        <Text style={styles.qrPayloadLabel}>Payload QR Ingreso:</Text>
                        <Text style={styles.qrPayloadText} numberOfLines={1}>{urls.ingresoPayload}</Text>

                        <TouchableOpacity
                          onPress={() => handleShareQR('ingreso')}
                          style={[styles.shareBtn, { backgroundColor: '#10B981' }]}
                        >
                          <Icon as={ICONS.PlusCircle} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                          <Text style={styles.shareBtnText}>Compartir QR Ingreso</Text>
                        </TouchableOpacity>
                      </View>

                      {/* CARD QR 2: SALIDA */}
                      <View style={styles.qrCard}>
                        <View style={[styles.qrHeaderTag, { backgroundColor: '#F5F3FF' }]}>
                          <Icon as={ICONS.Trophy} style={{ color: '#7C3AED', width: 14, height: 14 }} />
                          <Text style={[styles.qrHeaderTagText, { color: '#7C3AED' }]}>SALIDA DEL EVENTO</Text>
                        </View>

                        <View style={styles.qrImageContainer}>
                          <Image
                            source={{ uri: urls.salida }}
                            style={styles.qrImage}
                            resizeMode="contain"
                          />
                        </View>

                        <Text style={styles.qrPayloadLabel}>Payload QR Salida:</Text>
                        <Text style={styles.qrPayloadText} numberOfLines={1}>{urls.salidaPayload}</Text>

                        <TouchableOpacity
                          onPress={() => handleShareQR('salida')}
                          style={[styles.shareBtn, { backgroundColor: '#8B5CF6' }]}
                        >
                          <Icon as={ICONS.PlusCircle} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                          <Text style={styles.shareBtnText}>Compartir QR Salida</Text>
                        </TouchableOpacity>
                      </View>
                    </VStack>
                  );
                })()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ── MODAL DE PREVISUALIZACIÓN DETALLADA PARA ADMINISTRADOR ── */}
      {reviewingEvent && reviewingEvent.raw && (
        <Modal
          visible={!!reviewingEvent}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setReviewingEvent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { maxHeight: '88%', width: '100%', maxWidth: 420 }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <VStack style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', lineHeight: 22 }}>
                    {reviewingEvent.titulo}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 3 }}>
                    ID Evento: #{reviewingEvent.id}
                  </Text>
                </VStack>
                <TouchableOpacity
                  onPress={() => setReviewingEvent(null)}
                  style={{
                    padding: 6,
                    borderRadius: 12,
                    backgroundColor: '#F1F5F9',
                  }}
                  activeOpacity={0.7}
                >
                  <Icon as={ICONS.X} style={{ color: '#475569', width: 18, height: 18 }} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Galería de Imágenes Responsive con Dots */}
                {(() => {
                  const imageList = [reviewingEvent.raw?.imagenUrl, ...(reviewingEvent.raw?.imageUrls || [])]
                    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0);

                  if (imageList.length > 0) {
                    return (
                      <VStack
                        onLayout={(e) => {
                          const w = e.nativeEvent.layout.width;
                          if (w > 0) setContainerWidth(w);
                        }}
                        style={{ width: '100%', position: 'relative' }}
                      >
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          onScroll={(e) => {
                            const scrollOffset = e.nativeEvent.contentOffset.x;
                            const idx = Math.round(scrollOffset / containerWidth);
                            setActiveImageIndex(idx);
                          }}
                          scrollEventThrottle={16}
                          style={{ height: 190, backgroundColor: '#F8FAFC' }}
                        >
                          {imageList.map((url, index) => (
                            <View key={index} style={{ width: containerWidth, height: 190 }}>
                              <Image
                                source={{ uri: url }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            </View>
                          ))}
                        </ScrollView>

                        {/* Indicadores de página */}
                        <HStack style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 0,
                          right: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          {imageList.map((_, index) => (
                            <View
                              key={index}
                              style={{
                                width: activeImageIndex === index ? 16 : 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: activeImageIndex === index ? '#6366F1' : 'rgba(255, 255, 255, 0.7)',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 1,
                                elevation: 1,
                              }}
                            />
                          ))}
                        </HStack>

                        <View style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'rgba(15, 23, 42, 0.7)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                            {activeImageIndex + 1} / {imageList.length}
                          </Text>
                        </View>
                      </VStack>
                    );
                  } else {
                    return (
                      <Box style={{
                        height: 140,
                        backgroundColor: '#F8FAFC',
                        borderColor: '#E2E8F0',
                        borderWidth: 1,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        margin: 16,
                      }}>
                        <Icon as={ICONS.ImageIcon} style={{ color: '#94A3B8', width: 36, height: 36 }} />
                        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>
                          Sin imágenes cargadas para este evento
                        </Text>
                      </Box>
                    );
                  }
                })()}

                <VStack style={{ paddingHorizontal: 16, paddingTop: 16, gap: 14 }}>

                  {/* Estado actual de la solicitud & Modalidad */}
                  <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                      style={{
                        backgroundColor:
                          reviewingEvent.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.1)' :
                            reviewingEvent.estado === 'Pendiente' ? 'rgba(234, 179, 8, 0.1)' :
                              reviewingEvent.estado === 'Rechazado' ? 'rgba(239, 68, 68, 0.1)' :
                                reviewingEvent.estado === 'Programado' ? 'rgba(99, 102, 241, 0.1)' :
                                  reviewingEvent.estado === 'Suspendido' ? 'rgba(249, 115, 22, 0.1)' :
                                    reviewingEvent.estado === 'Cancelado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        borderColor:
                          reviewingEvent.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.3)' :
                            reviewingEvent.estado === 'Pendiente' ? 'rgba(234, 179, 8, 0.3)' :
                              reviewingEvent.estado === 'Rechazado' ? 'rgba(239, 68, 68, 0.3)' :
                                reviewingEvent.estado === 'Programado' ? 'rgba(99, 102, 241, 0.3)' :
                                  reviewingEvent.estado === 'Suspendido' ? 'rgba(249, 115, 22, 0.3)' :
                                    reviewingEvent.estado === 'Cancelado' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.3)',
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color:
                            reviewingEvent.estado === 'Aprobado' ? '#22C55E' :
                              reviewingEvent.estado === 'Pendiente' ? '#CA8A04' :
                                reviewingEvent.estado === 'Rechazado' ? '#EF4444' :
                                  reviewingEvent.estado === 'Programado' ? '#6366F1' :
                                    reviewingEvent.estado === 'Suspendido' ? '#F97316' :
                                      reviewingEvent.estado === 'Cancelado' ? '#EF4444' : '#64748B'
                        }}
                      >
                        • ESTADO: {reviewingEvent.estado.toUpperCase()}
                      </Text>
                    </Box>

                    <Box style={[
                      styles.modalityBadge,
                      {
                        backgroundColor:
                          reviewingEvent.raw.modalidad === 'PRESENCIAL' ? '#ECFDF5' :
                            reviewingEvent.raw.modalidad === 'VIRTUAL' ? '#EFF6FF' : '#FDF2F8',
                        borderColor:
                          reviewingEvent.raw.modalidad === 'PRESENCIAL' ? '#A7F3D0' :
                            reviewingEvent.raw.modalidad === 'VIRTUAL' ? '#BFDBFE' : '#FBCFE8',
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }
                    ]}>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color:
                          reviewingEvent.raw.modalidad === 'PRESENCIAL' ? '#059669' :
                            reviewingEvent.raw.modalidad === 'VIRTUAL' ? '#2563EB' : '#DB2777'
                      }}>
                        {reviewingEvent.raw.modalidad}
                      </Text>
                    </Box>
                  </HStack>

                  {/* Sección: Organizador Card */}
                  <View style={{
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 12,
                  }}>
                    <HStack style={{ alignItems: 'center', gap: 10 }}>
                      <View style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: '#EEF2FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E0E7FF'
                      }}>
                        <Icon as={ICONS.user} style={{ color: '#6366F1', width: 18, height: 18 }} />
                      </View>
                      <VStack style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Solicitado por
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                          @{reviewingEvent.raw.createdByUsername}
                        </Text>
                      </VStack>
                      <View style={{
                        backgroundColor: '#F1F5F9',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#475569' }}>MANAGER</Text>
                      </View>
                    </HStack>
                  </View>

                  {/* Sección: Programación */}
                  <VStack style={styles.reviewSectionCard}>
                    <HStack style={styles.reviewSectionHeader}>
                      <Icon as={ICONS.CalendarDays} style={{ color: '#6366F1', width: 15, height: 15 }} />
                      <Text style={styles.reviewSectionTitle}>Programación y Fechas</Text>
                    </HStack>
                    <VStack style={{ gap: 8, marginTop: 6 }}>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Fecha Inicio:</Text>
                        <Text style={styles.reviewFieldValue}>{reviewingEvent.raw.fechaInicio}</Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Fecha Fin:</Text>
                        <Text style={styles.reviewFieldValue}>{reviewingEvent.raw.fechaFin}</Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Horario:</Text>
                        <Text style={styles.reviewFieldValue}>
                          {reviewingEvent.raw.horaInicio?.slice(0, 5) || 'No especificada'} - {reviewingEvent.raw.horaFin?.slice(0, 5) || 'No especificada'}
                        </Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Duración:</Text>
                        <Text style={[styles.reviewFieldValue, { color: '#6366F1', fontWeight: '800' }]}>
                          {calcularDuracion(reviewingEvent.raw.horaInicio, reviewingEvent.raw.horaFin)}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  {/* Sección: Ubicación */}
                  <VStack style={styles.reviewSectionCard}>
                    <HStack style={styles.reviewSectionHeader}>
                      <Icon as={ICONS.MapPin} style={{ color: '#EC4899', width: 15, height: 15 }} />
                      <Text style={styles.reviewSectionTitle}>Lugar y Ubicación</Text>
                    </HStack>
                    <VStack style={{ gap: 8, marginTop: 6 }}>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Lugar:</Text>
                        <Text style={styles.reviewFieldValue}>{reviewingEvent.raw.lugar || 'No especificado'}</Text>
                      </HStack>
                      {reviewingEvent.raw.referencia && (
                        <HStack style={styles.reviewFieldRow}>
                          <Text style={styles.reviewFieldLabel}>Referencia:</Text>
                          <Text style={styles.reviewFieldValue}>{reviewingEvent.raw.referencia}</Text>
                        </HStack>
                      )}
                      {reviewingEvent.raw.latitud && reviewingEvent.raw.longitud && (
                        <HStack style={styles.reviewFieldRow}>
                          <Text style={styles.reviewFieldLabel}>Coordenadas:</Text>
                          <Text style={[styles.reviewFieldValue, { fontFamily: 'monospace', fontSize: 10, color: '#475569' }]}>
                            {reviewingEvent.raw.latitud.toFixed(6)}, {reviewingEvent.raw.longitud.toFixed(6)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>

                  {/* Sección: Aforo y Parámetros */}
                  <VStack style={styles.reviewSectionCard}>
                    <HStack style={styles.reviewSectionHeader}>
                      <Icon as={ICONS.Users} style={{ color: '#F59E0B', width: 15, height: 15 }} />
                      <Text style={styles.reviewSectionTitle}>Aforo y Parámetros</Text>
                    </HStack>
                    <VStack style={{ gap: 8, marginTop: 6 }}>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Capacidad máxima:</Text>
                        <Text style={styles.reviewFieldValue}>
                          {reviewingEvent.raw.capacidad ? `${reviewingEvent.raw.capacidad} personas` : 'Sin límite'}
                        </Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Edad mínima:</Text>
                        <Text style={styles.reviewFieldValue}>
                          {reviewingEvent.raw.edadMinima ? `${reviewingEvent.raw.edadMinima} años` : 'Todo público'}
                        </Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Acreditación QR:</Text>
                        <Text style={styles.reviewFieldValue}>
                          {reviewingEvent.raw.allowQrAttendance ? 'Sí, requiere escaneo' : 'No requiere'}
                        </Text>
                      </HStack>
                      <HStack style={styles.reviewFieldRow}>
                        <Text style={styles.reviewFieldLabel}>Aprobación de Registro:</Text>
                        <Text style={styles.reviewFieldValue}>
                          {reviewingEvent.raw.requiresApproval ? 'Sí, validación manual' : 'Automático'}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>

                  {/* Sección: Categorías y Etiquetas */}
                  <VStack style={styles.reviewSectionCard}>
                    <HStack style={styles.reviewSectionHeader}>
                      <Icon as={ICONS.Tag} style={{ color: '#10B981', width: 15, height: 15 }} />
                      <Text style={styles.reviewSectionTitle}>Categorías y Etiquetas</Text>
                    </HStack>
                    <VStack style={{ gap: 12, marginTop: 8 }}>
                      {/* Categorías */}
                      <VStack style={{ gap: 4 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Categorías:
                        </Text>
                        <HStack style={{ flexWrap: 'wrap', gap: 6 }}>
                          {reviewingEvent.raw.categories && reviewingEvent.raw.categories.length > 0 ? (
                            reviewingEvent.raw.categories.map((cat) => (
                              <View key={cat.id} style={{
                                backgroundColor: '#F5F3FF',
                                borderColor: '#DDD6FE',
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 10,
                                paddingVertical: 4
                              }}>
                                <Text style={{ color: '#7C3AED', fontSize: 10, fontWeight: '700' }}>{cat.nombre}</Text>
                              </View>
                            ))
                          ) : (
                            <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Sin categorías asignadas</Text>
                          )}
                        </HStack>
                      </VStack>

                      {/* Tags */}
                      <VStack style={{ gap: 4 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Etiquetas (Tags):
                        </Text>
                        <HStack style={{ flexWrap: 'wrap', gap: 6 }}>
                          {reviewingEvent.raw.tags && reviewingEvent.raw.tags.length > 0 ? (
                            reviewingEvent.raw.tags.map((tag) => (
                              <View key={tag.id} style={{
                                backgroundColor: '#F1F5F9',
                                borderColor: '#E2E8F0',
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 8,
                                paddingVertical: 3
                              }}>
                                <Text style={{ color: '#475569', fontSize: 9, fontWeight: '600' }}>#{tag.nombre}</Text>
                              </View>
                            ))
                          ) : (
                            <Text style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Sin etiquetas asignadas</Text>
                          )}
                        </HStack>
                      </VStack>
                    </VStack>
                  </VStack>

                  {/* Sección: Requisitos */}
                  {reviewingEvent.raw.requisitos && reviewingEvent.raw.requisitos.trim().length > 0 && (
                    <VStack style={styles.reviewSectionCard}>
                      <HStack style={styles.reviewSectionHeader}>
                        <Icon as={ICONS.AlertCircle} style={{ color: '#EF4444', width: 15, height: 15 }} />
                        <Text style={styles.reviewSectionTitle}>Requisitos Especiales</Text>
                      </HStack>
                      <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 4 }}>
                        {reviewingEvent.raw.requisitos}
                      </Text>
                    </VStack>
                  )}

                  {/* Sección: Descripción */}
                  <VStack style={styles.reviewSectionCard}>
                    <HStack style={styles.reviewSectionHeader}>
                      <Icon as={ICONS.FileText} style={{ color: '#64748B', width: 15, height: 15 }} />
                      <Text style={styles.reviewSectionTitle}>Descripción del Evento</Text>
                    </HStack>
                    <Text style={{ fontSize: 12, color: '#334155', lineHeight: 19, marginTop: 4 }}>
                      {reviewingEvent.raw.descripcion || 'Sin descripción provista.'}
                    </Text>
                  </VStack>

                  {/* Motivo de Rechazo (si ya está rechazado) */}
                  {reviewingEvent.estado === 'Rechazado' && reviewingEvent.motivoRechazo && (
                    <Box style={[styles.rejectionReasonBox, { marginTop: 4 }]}>
                      <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon as={ICONS.AlertCircle} style={{ color: '#EF4444', width: 14, height: 14 }} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }}>
                          Observación del Administrador:
                        </Text>
                      </HStack>
                      <Text style={styles.rejectionReasonText}>{reviewingEvent.motivoRechazo}</Text>
                    </Box>
                  )}
                </VStack>
              </ScrollView>

              {/* Footer Acciones */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: '#E2E8F0',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'flex-end',
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 5,
              }}>
                {/* Botones de acción dinámicos según el Rol del usuario y estado del evento */}
                {role === 'ADMIN' && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        const eventId = reviewingEvent.id;
                        setReviewingEvent(null);
                        setTimeout(() => {
                          onEliminar(eventId);
                        }, 300);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        backgroundColor: '#FEF2F2',
                        borderColor: '#FEE2E2',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      }}
                      activeOpacity={0.75}
                    >
                      <Icon as={ICONS.Trash2} style={{ color: '#EF4444', width: 14, height: 14 }} />
                      <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>Eliminar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const eventId = reviewingEvent.id;
                        setReviewingEvent(null);
                        router.push({
                          pathname: '/tabs/admin/crear-evento',
                          params: { id: eventId }
                        });
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        backgroundColor: '#EEF2FF',
                        borderColor: '#E0E7FF',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      }}
                      activeOpacity={0.75}
                    >
                      <Icon as={ICONS.edit2} style={{ color: '#4F46E5', width: 14, height: 14 }} />
                      <Text style={{ color: '#4F46E5', fontSize: 13, fontWeight: '700' }}>Editar</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Acciones específicas según estado para administrador */}
                {reviewingEvent.estado === 'Pendiente' && role === 'ADMIN' && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        const eventId = reviewingEvent.id;
                        setReviewingEvent(null);
                        // Breve retraso para evitar solapamiento de Modales en iOS/Android
                        setTimeout(() => {
                          handleTriggerRechazo(eventId);
                        }, 300);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        backgroundColor: '#FFF1F2',
                        borderColor: '#FFE4E6',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                      }}
                      activeOpacity={0.75}
                    >
                      <Icon as={ICONS.X} style={{ color: '#F43F5E', width: 14, height: 14 }} />
                      <Text style={{ color: '#F43F5E', fontSize: 13, fontWeight: '700' }}>Rechazar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        onAprobar(reviewingEvent.id);
                        setReviewingEvent(null);
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 14,
                        backgroundColor: '#10B981',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                      activeOpacity={0.8}
                    >
                      <Icon as={ICONS.CheckCircle} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Aprobar Evento</Text>
                    </TouchableOpacity>
                  </>
                )}

                {reviewingEvent.estado === 'Programado' && (
                  (role === 'ADMIN' || (role === 'MANAGER' && payload?.sub && reviewingEvent.raw?.createdByUsername === payload.sub)) ? (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          onConfirmarInicio?.(reviewingEvent.id);
                          setReviewingEvent(null);
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 14,
                          backgroundColor: '#6366F1',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                          shadowColor: '#6366F1',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        activeOpacity={0.8}
                      >
                        <Icon as={ICONS.CheckCircle} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Iniciar Evento</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          onSuspender?.(reviewingEvent.id);
                          setReviewingEvent(null);
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 14,
                          backgroundColor: '#FFFBEB',
                          borderColor: '#FDE68A',
                          borderWidth: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={{ color: '#D97706', fontSize: 13, fontWeight: '700' }}>Suspender Evento</Text>
                      </TouchableOpacity>
                    </>
                  ) : null
                )}

                {/* Botón de cierre siempre presente */}
                <TouchableOpacity
                  onPress={() => setReviewingEvent(null)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 14,
                    backgroundColor: '#F1F5F9',
                    borderColor: '#E2E8F0',
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>
                    Cerrar Vista
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── MODAL PARA INGRESAR EL MOTIVO DE RECHAZO ── */}
      <Modal
        visible={isRejectModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsRejectModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { padding: 20, maxWidth: 360, maxHeight: 320 }]}>
            <View style={[styles.modalHeader, { paddingHorizontal: 0, paddingVertical: 10, borderBottomWidth: 0, marginBottom: 8 }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B' }}>Rechazar Solicitud</Text>
              <TouchableOpacity onPress={() => setIsRejectModalOpen(false)} style={styles.closeBtn}>
                <Icon as={ICONS.X} style={{ color: '#64748B', width: 20, height: 20 }} />
              </TouchableOpacity>
            </View>

            <VStack style={{ gap: 14, width: '100%' }}>
              <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
                Por favor, ingresa el motivo del rechazo para enviarlo al manager:
              </Text>

              <TextInput
                placeholder="Ej. Falta mejorar la calidad de las imágenes o corregir la dirección..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={motivoRechazoText}
                onChangeText={setMotivoRechazoText}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 12,
                  color: '#1E293B',
                  textAlignVertical: 'top',
                  minHeight: 80,
                }}
              />

              <HStack style={{ gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => setIsRejectModalOpen(false)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: '#F1F5F9',
                  }}
                >
                  <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700' }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmRechazo}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: '#EF4444',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Confirmar</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </View>
        </View>
      </Modal>
    </VStack>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  qrAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  qrAdminBtnNormal: {
    backgroundColor: '#6366F1',
  },
  qrAdminBtnActive: {
    backgroundColor: '#10B981',
  },
  qrAdminBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    maxWidth: 280,
  },
  closeBtn: {
    padding: 4,
  },
  qrScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoAlertText: {
    color: '#3730A3',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  qrCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  qrHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14,
  },
  qrHeaderTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrImageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 12,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  qrPayloadLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  qrPayloadText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    width: '100%',
    padding: 6,
    borderRadius: 6,
    textAlign: 'center',
    marginBottom: 14,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  subTabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  subTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  subTabInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  subTabTextActive: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '700',
  },
  subTabTextInactive: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  tabBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  rejectionReasonBox: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
    padding: 10,
  },
  rejectionReasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 2,
  },
  rejectionReasonText: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  sectionReviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewSectionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    width: '100%',
  },
  reviewSectionHeader: {
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    marginBottom: 6,
  },
  reviewSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  reviewFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewFieldValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  modalityBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
});
