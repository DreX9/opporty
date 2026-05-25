import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AdminEvent } from '../types';

interface RecentEventsProps {
  eventos: AdminEvent[];
}

export default function RecentEvents({ eventos }: RecentEventsProps) {
  return (
    <VStack space="md" className="w-full mt-2">
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold tracking-wide">
          Eventos Recientes
        </Text>
      </Box>

      {eventos.slice(0, 4).map((evento) => (
        <Box
          key={evento.id}
          className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4] flex-row items-center justify-between"
        >
          <VStack className="flex-1 mr-3">
            <Text className="text-[#111827] text-base font-bold" numberOfLines={1}>
              {evento.titulo}
            </Text>
            <Text className="text-gray-500 text-xs font-semibold mt-1">
              {evento.categoria}
            </Text>
          </VStack>

          <Box
            className="px-3 py-1 rounded-full border"
            style={{
              backgroundColor: evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              borderColor: evento.estado === 'Aprobado' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{
                color: evento.estado === 'Aprobado' ? '#22C55E' : '#EAB308',
              }}
            >
              {evento.estado}
            </Text>
          </Box>
        </Box>
      ))}
    </VStack>
  );
}
