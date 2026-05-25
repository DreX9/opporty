import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AdminEvent } from '../types';

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
  return (
    <VStack space="md">
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold">Gestión de Eventos</Text>
        <Text className="text-gray-500 text-xs mt-1">Revisa, aprueba o elimina eventos en el sistema</Text>
      </Box>

      {eventos.map((evento) => (
        <Box
          key={evento.id}
          className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4]"
        >
          <HStack className="justify-between items-start mb-2">
            <VStack className="flex-1 mr-2">
              <Text className="text-[#111827] text-base font-bold">{evento.titulo}</Text>
              <Text className="text-gray-500 text-xs font-semibold mt-0.5">{evento.categoria}</Text>
            </VStack>
            <Box
              className="px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                borderColor: evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
              }}
            >
              <Text
                className="text-2xs font-extrabold"
                style={{ color: evento.estado === 'Aprobado' ? '#22C55E' : '#EAB308' }}
              >
                {evento.estado.toUpperCase()}
              </Text>
            </Box>
          </HStack>

          <HStack className="justify-end mt-3 border-t border-gray-100 pt-3" style={{ gap: 8 }}>
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
        </Box>
      ))}
    </VStack>
  );
}
