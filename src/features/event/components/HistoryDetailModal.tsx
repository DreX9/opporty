import React from 'react';
import { StyleSheet, Dimensions, Image, TouchableOpacity, Modal, View, ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { Evento } from '../types';
import { eventStateManager } from '../state';
import EventVideoPlayer from './EventVideoPlayer';
import { exportConstanciaPDF } from '../services/constanciaService';
import { authStateManager } from '../../auth/state';
import { Alert, ActivityIndicator } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

interface HistoryDetailModalProps {
  visible: boolean;
  evento: Evento | null;
  onClose: () => void;
}

export default function HistoryDetailModal({ visible, evento, onClose }: HistoryDetailModalProps) {
  if (!evento) return null;

  const insignias = eventStateManager.getInsignias(evento.id);
  const grabacionUrl = evento.raw?.grabacionUrl || (evento as any).grabacionUrl;
  const hasConstancia = eventStateManager.isCertificateUnlocked(evento.id);

  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadConstancia = async () => {
    if (!evento) return;
    try {
      setIsExporting(true);
      const regMeta = eventStateManager.getRegistrationMeta(evento.id);

      const authState = authStateManager.getState();
      const payload = authState.payload;
      if (!payload) throw new Error('No token found');

      const nombreCompleto = (payload.firstName && payload.lastName)
          ? `${payload.firstName} ${payload.lastName}`
          : '';

      const constanciaData = {
          participanteNombre: nombreCompleto,
          participanteUsername: payload.sub,
          eventoId: evento.id,
          eventoTitulo: evento.titulo,
          eventoFecha: evento.fecha,
          eventoHora: evento.hora,
          eventoLugar: evento.lugar,
          eventoModalidad: evento.raw?.modalidad ?? 'PRESENCIAL',
          eventoCategoria: evento.categoria,
          organizadorUsername: evento.raw?.createdByUsername ?? 'organizador',
          registrationId: regMeta?.registrationId ?? 0,
          checkInAt: regMeta?.checkInAt ?? null,
          checkOutAt: regMeta?.checkOutAt ?? null,
      };

      await exportConstanciaPDF(constanciaData);
      eventStateManager.descargarConstancia(evento.id);
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <VStack style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {evento.titulo}
              </Text>
              <Text style={styles.headerSubtitle}>
                {evento.modalidad} • {evento.categoria}
              </Text>
            </VStack>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75}>
              <Icon as={ICONS.X} style={{ color: '#475569', width: 20, height: 20 }} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Event Main Image */}
            {evento.imagenUri ? (
              <Image source={{ uri: evento.imagenUri }} style={styles.eventImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon as={ICONS.ImageIcon} style={{ color: '#94A3B8', width: 40, height: 40 }} />
              </View>
            )}

            {/* Attendance Status / Badges */}
            <VStack style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Registro de Asistencia</Text>
              <HStack style={{ gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <View style={[styles.badge, insignias.ingreso ? styles.badgeSuccess : styles.badgeFailed]}>
                  <Icon as={insignias.ingreso ? ICONS.CheckCircle : ICONS.X} style={[styles.badgeIcon, { color: insignias.ingreso ? '#10B981' : '#EF4444' }]} />
                  <Text style={[styles.badgeText, { color: insignias.ingreso ? '#065F46' : '#991B1B' }]}>
                    {insignias.ingreso ? 'Ingreso Registrado' : 'Ingreso Pendiente'}
                  </Text>
                </View>
                <View style={[styles.badge, insignias.salida ? styles.badgeSuccess : styles.badgeFailed]}>
                  <Icon as={insignias.salida ? ICONS.CheckCircle : ICONS.X} style={[styles.badgeIcon, { color: insignias.salida ? '#10B981' : '#EF4444' }]} />
                  <Text style={[styles.badgeText, { color: insignias.salida ? '#065F46' : '#991B1B' }]}>
                    {insignias.salida ? 'Salida Registrada' : 'Salida Pendiente'}
                  </Text>
                </View>
              </HStack>
              {insignias.ingreso && insignias.salida && (
                <View style={styles.totalSuccessBox}>
                  <Text style={styles.totalSuccessText}>🏆 ¡Asistencia completa acreditada!</Text>
                </View>
              )}
              {hasConstancia && (
                <TouchableOpacity 
                  style={styles.downloadBtn}
                  onPress={handleDownloadConstancia}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <HStack style={{ alignItems: 'center', gap: 6 }}>
                      <Icon as={ICONS.Download} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
                      <Text style={styles.downloadBtnText}>Descargar Constancia</Text>
                    </HStack>
                  )}
                </TouchableOpacity>
              )}
            </VStack>

            {/* Mini Video Player Section */}
            {grabacionUrl && (
              <VStack style={styles.sectionCard}>
                <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon as={ICONS.Play} style={{ color: '#4F46E5', width: 16, height: 16 }} />
                  <Text style={styles.sectionTitle}>Grabación del Evento</Text>
                </HStack>
                <EventVideoPlayer url={grabacionUrl} />
              </VStack>
            )}

            {/* Basic Info */}
            <VStack style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Detalles del Evento</Text>
              <VStack style={{ gap: 10, marginTop: 10 }}>
                <HStack style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{evento.fecha}</Text>
                </HStack>
                <HStack style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horario:</Text>
                  <Text style={styles.detailValue}>
                    {evento.raw?.horaInicio?.slice(0, 5) || '19:00'} - {evento.raw?.horaFin?.slice(0, 5) || '21:00'}
                  </Text>
                </HStack>
                <HStack style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lugar:</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {evento.raw?.lugar || 'Auditorio Central'}
                  </Text>
                </HStack>
                {evento.raw?.referencia ? (
                  <HStack style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Referencia:</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {evento.raw.referencia}
                    </Text>
                  </HStack>
                ) : null}
              </VStack>
            </VStack>

            {/* Description */}
            {evento.raw?.descripcion ? (
              <VStack style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>
                  {evento.raw.descripcion}
                </Text>
              </VStack>
            ) : null}
          </ScrollView>

          {/* Close button footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.closeFooterBtn} activeOpacity={0.8}>
              <Text style={styles.closeFooterText}>Cerrar Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  eventImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  badgeFailed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  badgeIcon: {
    width: 14,
    height: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalSuccessBox: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalSuccessText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '800',
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeFooterBtn: {
    backgroundColor: '#6366F1',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  closeFooterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
