import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { AdminUser } from '../types';

interface UserManagementProps {
  usuarios: AdminUser[];
  onCambiarRol: (id: string) => void;
  onEliminar: (id: string) => void;
}

export default function UserManagement({
  usuarios,
  onCambiarRol,
  onEliminar,
}: UserManagementProps) {
  return (
    <VStack space="md">
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold">Gestión de Usuarios</Text>
        <Text className="text-gray-500 text-xs mt-1">Supervisa cuentas registradas y cambia privilegios</Text>
      </Box>

      {usuarios.map((usuario) => (
        <Box
          key={usuario.id}
          className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4] flex-row items-center justify-between"
        >
          <HStack space="md" className="items-center flex-1 mr-2">
            <Box className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Text className="text-lg">{usuario.emoji}</Text>
            </Box>
            <VStack className="flex-1">
              <Text className="text-[#111827] text-sm font-bold" numberOfLines={1}>{usuario.nombre}</Text>
              <Text className="text-gray-500 text-2xs" numberOfLines={1}>{usuario.email}</Text>
            </VStack>
          </HStack>

          <HStack space="sm" className="items-center">
            <TouchableOpacity
              onPress={() => onCambiarRol(usuario.id)}
              className={`px-3 py-1 rounded-full border ${usuario.rol === 'Admin' ? 'bg-fuchsia-50 border-fuchsia-200' : 'bg-gray-50 border-gray-200'}`}
            >
              <Text className={`text-2xs font-extrabold ${usuario.rol === 'Admin' ? 'text-fuchsia-700' : 'text-gray-500'}`}>
                {usuario.rol.toUpperCase()}
              </Text>
            </TouchableOpacity>

            {usuario.email !== 'admin@admin.com' && (
              <TouchableOpacity
                onPress={() => onEliminar(usuario.id)}
                className="p-1.5 rounded-full bg-rose-50 border border-rose-200"
              >
                <Icon as={ICONS.X} className="text-rose-600 w-3.5 h-3.5" />
              </TouchableOpacity>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}
