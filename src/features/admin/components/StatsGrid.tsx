import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

interface Stats {
  totalEventos: number;
  activos: number;
  pendientes: number;
  totalUsuarios: number;
}

interface StatsGridProps {
  stats: Stats;
  isAdmin?: boolean;
}

export default function StatsGrid({ stats, isAdmin = false }: StatsGridProps) {
  return (
    <VStack>
      <HStack className="justify-between mb-4">
        <Box
          className="rounded-2xl p-4 bg-white border border-[#E9EAF4] items-start relative overflow-hidden"
          style={{
            width: '48.5%',
            shadowColor: '#6366F1',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <Box className="p-2 rounded-lg bg-indigo-50 mb-3">
            <Icon as={ICONS.CalendarDays} className="text-indigo-600 w-5 h-5" />
          </Box>
          <Text className="text-indigo-600 text-3xl font-extrabold tracking-tight">
            {stats.totalEventos}
          </Text>
          <Text className="text-gray-500 text-xs font-bold mt-1">
            Total Eventos
          </Text>
        </Box>

        <Box
          className="rounded-2xl p-4 bg-white border border-[#E9EAF4] items-start relative overflow-hidden"
          style={{
            width: '48.5%',
            shadowColor: '#6366F1',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <Box className="p-2 rounded-lg bg-emerald-50 mb-3">
            <Icon as={ICONS.CheckCircle} className="text-emerald-600 w-5 h-5" />
          </Box>
          <Text className="text-emerald-600 text-3xl font-extrabold tracking-tight">
            {stats.activos}
          </Text>
          <Text className="text-gray-500 text-xs font-bold mt-1">
            Eventos Activos
          </Text>
        </Box>
      </HStack>

      {isAdmin ? (
        <HStack className="justify-between mb-6">
          <Box
            className="rounded-2xl p-4 bg-white border border-[#E9EAF4] items-start relative overflow-hidden"
            style={{
              width: '48.5%',
              shadowColor: '#6366F1',
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Box className="p-2 rounded-lg bg-fuchsia-50 mb-3">
              <Icon as={ICONS.Users} className="text-fuchsia-600 w-5 h-5" />
            </Box>
            <Text className="text-fuchsia-600 text-3xl font-extrabold tracking-tight">
              {stats.totalUsuarios}
            </Text>
            <Text className="text-gray-500 text-xs font-bold mt-1">
              Usuarios
            </Text>
          </Box>

          <Box
            className="rounded-2xl p-4 bg-white border border-[#E9EAF4] items-start relative overflow-hidden"
            style={{
              width: '48.5%',
              shadowColor: '#6366F1',
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Box className="p-2 rounded-lg bg-amber-50 mb-3">
              <Icon as={ICONS.AlertCircle} className="text-amber-600 w-5 h-5" />
            </Box>
            <Text className="text-amber-600 text-3xl font-extrabold tracking-tight">
              {stats.pendientes}
            </Text>
            <Text className="text-gray-500 text-xs font-bold mt-1">
              Pendientes
            </Text>
          </Box>
        </HStack>
      ) : (
        <HStack className="justify-between mb-6">
          <Box
            className="rounded-2xl p-4 bg-white border border-[#E9EAF4] items-start relative overflow-hidden"
            style={{
              width: '100%',
              shadowColor: '#6366F1',
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Box className="p-2 rounded-lg bg-amber-50 mb-3">
              <Icon as={ICONS.AlertCircle} className="text-amber-600 w-5 h-5" />
            </Box>
            <Text className="text-amber-600 text-3xl font-extrabold tracking-tight">
              {stats.pendientes}
            </Text>
            <Text className="text-gray-500 text-xs font-bold mt-1">
              Pendientes
            </Text>
          </Box>
        </HStack>
      )}
    </VStack>
  );
}
