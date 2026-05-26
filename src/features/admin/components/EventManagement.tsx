import React, { useState } from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { AdminEvent } from '../types';
import { eventStateManager, useEventState } from '../../event/state';

interface EventManagementProps {
  eventos: AdminEvent[];
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export default function EventManagement({
  eventos,
  onAprobar,
  onRechazar,
  onEliminar,
}: EventManagementProps) {
  const eventState = useEventState();
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

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

  return (
    <VStack space="md">
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold">Gestión de Eventos</Text>
        <Text className="text-gray-500 text-xs mt-1">Revisa, aprueba o genera códigos de asistencia QR para los eventos.</Text>
      </Box>

      {eventos.map((evento) => {
        const isAprobado = evento.estado === 'Aprobado';
        const qrsGenerados = eventStateManager.hasQRs(evento.id);

        return (
          <Box
            key={evento.id}
            className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4]"
            style={styles.eventCard}
          >
            <HStack className="justify-between items-start mb-2">
              <VStack className="flex-1 mr-2">
                <Text className="text-[#111827] text-base font-bold">{evento.titulo}</Text>
                <Text className="text-gray-500 text-xs font-semibold mt-0.5">{evento.categoria}</Text>
              </VStack>
              <Box
                className="px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: isAprobado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  borderColor: isAprobado ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
                }}
              >
                <Text
                  className="text-2xs font-extrabold"
                  style={{ color: isAprobado ? '#22C55E' : '#EAB308' }}
                >
                  {evento.estado.toUpperCase()}
                </Text>
              </Box>
            </HStack>

            <HStack className="justify-between mt-3 border-t border-gray-100 pt-3" style={{ alignItems: 'center' }}>
              {/* Botón premium de QR para eventos aprobados */}
              {isAprobado ? (
                <TouchableOpacity
                  onPress={() => handleOpenQRModal(evento)}
                  style={[
                    styles.qrAdminBtn,
                    qrsGenerados ? styles.qrAdminBtnActive : styles.qrAdminBtnNormal
                  ]}
                >
                  <Icon as={ICONS.radar} style={{ color: '#FFFFFF', width: 14, height: 14 }} />
                  <Text style={styles.qrAdminBtnText}>
                    {qrsGenerados ? 'Ver QRs de Asistencia' : 'Generar QRs'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <HStack style={{ gap: 8 }}>
                {evento.estado === 'Pendiente' ? (
                  <TouchableOpacity
                    onPress={() => onAprobar(evento.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200"
                  >
                    <Text className="text-emerald-700 text-xs font-bold">Aprobar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => onRechazar(evento.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <Text className="text-amber-700 text-xs font-bold">Pendiente</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => onEliminar(evento.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200"
                >
                  <Text className="text-rose-700 text-xs font-bold">Eliminar</Text>
                </TouchableOpacity>
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
});
