import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string; // e.g. '#6366F1' or '#EF4444'
  icon?: any; // e.g. ICONS.AlertCircle
  iconColor?: string;
  hideCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmColor = '#6366F1',
  icon = ICONS.AlertCircle,
  iconColor = '#6366F1',
  hideCancel = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <VStack style={styles.content}>
            {/* Círculo con Icono */}
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
              <Icon as={icon} style={[styles.icon, { color: iconColor }]} />
            </View>

            {/* Texto de información */}
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}

            {/* Botones de acción */}
            <HStack style={styles.buttonRow}>
              {!hideCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: confirmColor }]}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Overlay semi-translúcido claro/elegante
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Borde gris suave
    padding: 24,
    width: '100%',
    maxWidth: 340,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  buttonRow: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1', // Borde gris suave
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
