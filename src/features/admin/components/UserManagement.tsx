import React, { useState, useMemo } from 'react';
import { TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, SafeAreaView } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { AdminUser } from '../types';
import DropdownSelect from '@/components/DropdownSelect';
import { LISTA_CARRERAS, LISTA_CICLOS_REGISTRO } from '../../auth/components/RegisterModal';

const LISTA_CICLOS = [
  'Todos los ciclos',
  ...LISTA_CICLOS_REGISTRO
];

function fromIsoDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

interface UserManagementProps {
  usuarios: AdminUser[];
  onCambiarRol: (id: string, newRole: string) => void;
  onToggleStatus: (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => void;
  loading?: boolean;
}

const ESPECIALIDADES_LISTA = [
  'Todas las especialidades',
  'Backend',
  'Frontend',
  'Arquitectura de Software',
  'Redes',
  'IA',
  'Otro'
];

export default function UserManagement({
  usuarios,
  onCambiarRol,
  onToggleStatus,
  loading = false,
}: UserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT'>('ALL');
  const [filterCareer, setFilterCareer] = useState<string>('ALL');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('ALL');
  const [filterCycle, setFilterCycle] = useState<string>('ALL');

  // Filtrado dinámico y combinado de usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      // 1. Filtro por Estado (Activo/Inactivo)
      if (filterStatus !== 'ALL' && usuario.status !== filterStatus) {
        return false;
      }

      // 2. Filtro por Rol
      if (filterRole !== 'ALL' && usuario.rol !== filterRole) {
        return false;
      }

      // 3. Filtro por Carrera (solo estudiantes)
      if (filterRole === 'STUDENT' || filterRole === 'ALL') {
        if (filterCareer !== 'ALL') {
          if (usuario.rol !== 'STUDENT' || usuario.career !== filterCareer) {
            return false;
          }
        }
        if (filterCycle !== 'ALL') {
          const cicloNum = Number(filterCycle.replace('Ciclo ', ''));
          if (usuario.rol !== 'STUDENT' || usuario.ciclo !== cicloNum) {
            return false;
          }
        }
      }

      // 4. Filtro por Especialidad (profesores, managers, admins)
      if (filterRole !== 'STUDENT') {
        if (filterSpecialty !== 'ALL') {
          const predefinidas = ['Backend', 'Frontend', 'Arquitectura de Software', 'Redes', 'IA'];
          if (filterSpecialty === 'Otro') {
            // "Otro" son aquellas especialidades que no están en la lista predefinida
            if (
              usuario.rol === 'STUDENT' ||
              !usuario.specialty ||
              predefinidas.some((p) => usuario.specialty?.toLowerCase().includes(p.toLowerCase()))
            ) {
              return false;
            }
          } else {
            if (
              usuario.rol === 'STUDENT' ||
              !usuario.specialty ||
              !usuario.specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
            ) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }, [usuarios, filterStatus, filterRole, filterCareer, filterSpecialty, filterCycle]);

  // Obtener estilos de badge por rol
  const getRoleBgClass = (rol: string) => {
    switch (rol.toUpperCase()) {
      case 'ADMIN': return 'bg-fuchsia-50 border-fuchsia-200';
      case 'MANAGER': return 'bg-purple-50 border-purple-200';
      case 'TEACHER': return 'bg-blue-50 border-blue-200';
      case 'STUDENT': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRoleTextClass = (rol: string) => {
    switch (rol.toUpperCase()) {
      case 'ADMIN': return 'text-fuchsia-700';
      case 'MANAGER': return 'text-purple-700';
      case 'TEACHER': return 'text-blue-700';
      case 'STUDENT': return 'text-amber-700';
      default: return 'text-gray-500';
    }
  };

  return (
    <VStack space="md">
      {/* 🔴 TÍTULO Y DESCRIPCIÓN */}
      <Box className="mb-2">
        <Text className="text-[#111827] text-xl font-bold">Gestión de Usuarios</Text>
        <Text className="text-gray-500 text-xs mt-1">Supervisa cuentas registradas, gestiona roles y estados</Text>
      </Box>

      {/* 🧭 PANEL DE FILTROS PREMIUM */}
      <Box className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4] shadow-sm mb-2">
        <Text className="text-[#111827] text-2xs font-extrabold uppercase tracking-widest mb-3">Filtros de Búsqueda</Text>

        {/* 1. Selector de Estado (Activos / Inactivos / Todos) */}
        <HStack className="p-1 rounded-xl mb-4" style={{ backgroundColor: '#F3F4F6', gap: 4 }}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((statusOption) => {
            const isActive = filterStatus === statusOption;
            return (
              <TouchableOpacity
                key={statusOption}
                onPress={() => setFilterStatus(statusOption)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  // Shadow properties for iOS
                  shadowColor: '#000',
                  shadowOffset: isActive ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  shadowOpacity: isActive ? 0.12 : 0,
                  shadowRadius: isActive ? 1.0 : 0,
                  // Elevation for Android
                  elevation: isActive ? 1 : 0,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isActive ? '#4F46E5' : '#6B7280' }}
                >
                  {statusOption === 'ALL' ? 'Todos' : statusOption === 'ACTIVE' ? 'Activos' : 'Inactivos'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </HStack>

        {/* 2. Selector de Rol Scrollable */}
        <VStack space="xs" className="mb-3">
          <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider">Filtrar por Rol</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="xs" className="py-1">
              {(['ALL', 'ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'] as const).map((roleOption) => {
                const isActive = filterRole === roleOption;
                return (
                  <TouchableOpacity
                    key={roleOption}
                    onPress={() => {
                      setFilterRole(roleOption);
                      setFilterCareer('ALL');
                      setFilterSpecialty('ALL');
                      setFilterCycle('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-[#E9EAF4]'
                      }`}
                  >
                    <Text className={`text-3xs font-extrabold tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {roleOption === 'ALL' ? 'TODOS' : roleOption}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </HStack>
          </ScrollView>
        </VStack>

        {/* 3. Filtros avanzados condicionales */}
        {filterRole === 'STUDENT' && (
          <HStack style={{ gap: 12 }} className="mt-1 w-full">
            <VStack space="xs" style={{ flex: 1 }}>
              <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider">Carrera</Text>
              <DropdownSelect
                selectedValue={filterCareer === 'ALL' ? '' : filterCareer}
                onValueChange={(val) => setFilterCareer(val === 'Todas las carreras' ? 'ALL' : val)}
                options={['Todas las carreras', ...LISTA_CARRERAS]}
                placeholder="Todas las carreras"
                style={{ height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E9EAF4', borderWidth: 1 }}
                textStyle={{ fontSize: 13 }}
              />
            </VStack>
            <VStack space="xs" style={{ flex: 1 }}>
              <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider">Ciclo Académico</Text>
              <DropdownSelect
                selectedValue={filterCycle === 'ALL' ? '' : filterCycle}
                onValueChange={(val) => setFilterCycle(val === 'Todos los ciclos' ? 'ALL' : val)}
                options={LISTA_CICLOS}
                placeholder="Todos los ciclos"
                style={{ height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E9EAF4', borderWidth: 1 }}
                textStyle={{ fontSize: 13 }}
              />
            </VStack>
          </HStack>
        )}

        {(filterRole === 'TEACHER' || filterRole === 'ADMIN' || filterRole === 'MANAGER') && (
          <VStack space="xs" className="mt-1">
            <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider">Especialidad Técnica</Text>
            <DropdownSelect
              selectedValue={filterSpecialty === 'ALL' ? '' : filterSpecialty}
              onValueChange={(val) => setFilterSpecialty(val === 'Todas las especialidades' ? 'ALL' : val)}
              options={ESPECIALIDADES_LISTA}
              placeholder="Todas las especialidades"
              style={{ height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#E9EAF4', borderWidth: 1 }}
              textStyle={{ fontSize: 13 }}
            />
          </VStack>
        )}
      </Box>

      {/* 🔄 CARGANDO O LISTA DE USUARIOS */}
      {loading ? (
        <Box className="py-8 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-400 text-xs mt-2">Cargando usuarios...</Text>
        </Box>
      ) : usuariosFiltrados.length === 0 ? (
        <Box className="py-8 px-4 bg-white border border-[#E9EAF4] rounded-2xl items-center justify-center">
          <Icon as={ICONS.AlertCircle} className="text-gray-300 w-10 h-10 mb-2" />
          <Text className="text-gray-500 text-sm font-semibold text-center">No se encontraron usuarios</Text>
          <Text className="text-gray-400 text-2xs text-center mt-1">Prueba cambiando la configuración de los filtros.</Text>
        </Box>
      ) : (
        usuariosFiltrados.map((usuario) => (
          <Box
            key={usuario.id}
            className="w-full p-4 rounded-2xl bg-white border border-[#E9EAF4] flex-row items-center justify-between"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedUser(usuario)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              <HStack space="md" className="items-center flex-1 mr-2">
                <Box className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center border border-[#E9EAF4]">
                  <Text className="text-xl">{usuario.emoji}</Text>
                </Box>
                <VStack className="flex-1">
                  <Text className="text-[#111827] text-sm font-bold" numberOfLines={1}>
                    {usuario.nombre}
                  </Text>
                  <Text className="text-gray-500 text-2xs" numberOfLines={1}>
                    {usuario.email}
                  </Text>

                  {/* Mostrar especialidad o carrera si existe */}
                  {usuario.rol === 'STUDENT' && usuario.career ? (
                    <Text className="text-indigo-600 text-3xs font-extrabold uppercase mt-0.5" numberOfLines={1}>
                      🎓 {usuario.career} {usuario.ciclo ? `• Ciclo ${usuario.ciclo}` : ''}
                    </Text>
                  ) : null}
                  {usuario.rol !== 'STUDENT' && usuario.specialty ? (
                    <Text className="text-fuchsia-600 text-3xs font-extrabold uppercase mt-0.5" numberOfLines={1}>
                      💻 {usuario.specialty}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
            </TouchableOpacity>

            <HStack space="xs" className="items-center">
              {/* Badge de Rol */}
              <TouchableOpacity
                onPress={() => setSelectedUser(usuario)}
                className={`px-2.5 py-1 rounded-full border ${getRoleBgClass(usuario.rol)}`}
              >
                <Text className={`text-3xs font-extrabold tracking-wider ${getRoleTextClass(usuario.rol)}`}>
                  {usuario.rol.toUpperCase()}
                </Text>
              </TouchableOpacity>

              {/* Badge interactivo de Estado */}
              <Box
                className={`px-2 py-0.5 rounded-md border ${usuario.status === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                  }`}
              >
                <Text
                  className={`text-3xs font-extrabold ${usuario.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                >
                  {usuario.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </Box>

              {/* Botón de toggle de Estado (activo/inactivo) */}
              {usuario.email !== 'admin@admin.com' && (
                <TouchableOpacity
                  onPress={() => onToggleStatus(usuario.id, usuario.status || 'ACTIVE')}
                  className={`p-1.5 rounded-full border ${usuario.status === 'ACTIVE' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                    }`}
                >
                  <Icon
                    as={usuario.status === 'ACTIVE' ? ICONS.ToggleRight : ICONS.ToggleLeft}
                    className={`w-5 h-5 ${usuario.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                  />
                </TouchableOpacity>
              )}
            </HStack>
          </Box>
        ))
      )}

      {/* 👤 MODAL DE PERFIL DETALLADO */}
      <Modal
        visible={selectedUser !== null}
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F4FB' }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Cabecera / Botón Cerrar */}
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text className="text-xl font-extrabold text-[#111827]">Detalles del Perfil</Text>
              <TouchableOpacity
                onPress={() => setSelectedUser(null)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E9EAF4'
                }}
              >
                <Icon as={ICONS.X} className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </HStack>

            {selectedUser && (
              <VStack space="md">
                {/* 1. CARD PRINCIPAL (Avatar y nombres) */}
                <Box className="bg-white p-6 rounded-2xl border border-[#E9EAF4] shadow-sm items-center">
                  <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center border border-[#E9EAF4] mb-3 shadow-sm">
                    <Text className="text-4xl">{selectedUser.emoji}</Text>
                  </Box>
                  <Text className="text-[#111827] text-lg font-bold text-center">
                    {selectedUser.nombre}
                  </Text>
                  <Text className="text-indigo-600 text-xs font-bold mt-1">
                    @{selectedUser.username || selectedUser.email.split('@')[0]}
                  </Text>
                  
                  {/* Rol Badge / Dropdown */}
                  <Box className="mt-4 w-full border-t border-[#E9EAF4] pt-4 items-center">
                    <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider mb-2">Rol en el Sistema</Text>
                    {selectedUser.rol === 'STUDENT' ? (
                      <Box className="bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">
                        <Text className="text-amber-700 text-xs font-extrabold tracking-wider">ESTUDIANTE</Text>
                      </Box>
                    ) : (
                      <Box className="w-full max-w-[200px]">
                        <DropdownSelect
                          selectedValue={selectedUser.rol}
                          onValueChange={(newRole) => {
                            if (newRole === selectedUser.rol) return;
                            Alert.alert(
                              'Confirmar Cambio de Rol',
                              `¿Estás seguro de que deseas cambiar el rol de este usuario a ${newRole}?`,
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Cambiar',
                                  style: 'default',
                                  onPress: () => {
                                    onCambiarRol(selectedUser.id, newRole);
                                    const emoji = newRole === 'ADMIN' ? '👑' : newRole === 'TEACHER' ? '🧑‍💻' : '👨🏻‍💻';
                                    setSelectedUser(prev => prev ? { ...prev, rol: newRole, emoji } : null);
                                  }
                                }
                              ]
                            );
                          }}
                          options={['ADMIN', 'TEACHER', 'MANAGER']}
                          placeholder="Seleccionar rol..."
                          style={{ height: 42, borderRadius: 12, backgroundColor: '#F9FAFB', borderColor: '#E9EAF4', borderWidth: 1 }}
                          textStyle={{ fontSize: 13, fontWeight: '700', textAlign: 'center' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 2. CARD DE GESTIÓN (Activo/Inactivo) */}
                <Box className="bg-white p-5 rounded-2xl border border-[#E9EAF4] shadow-sm flex-row items-center justify-between">
                  <VStack>
                    <Text className="text-[#111827] text-sm font-bold">Estado de Cuenta</Text>
                    <Text className="text-gray-400 text-2xs mt-0.5">Determina si puede iniciar sesión</Text>
                  </VStack>
                  <HStack style={{ gap: 8 }} className="items-center">
                    <Box
                      className={`px-3 py-1 rounded-full border ${
                        selectedUser.status === 'ACTIVE'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <Text
                        className={`text-3xs font-extrabold ${
                          selectedUser.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {selectedUser.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                      </Text>
                    </Box>
                    {selectedUser.email !== 'admin@admin.com' && (
                      <TouchableOpacity
                        onPress={() => {
                          const current = selectedUser.status || 'ACTIVE';
                          const newStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                          Alert.alert(
                            `${newStatus === 'INACTIVE' ? 'Desactivar' : 'Activar'} usuario`,
                            newStatus === 'INACTIVE'
                              ? '¿Estás seguro de que deseas desactivar este usuario? Ya no podrá iniciar sesión en el sistema.'
                              : '¿Deseas activar nuevamente este usuario? Podrá volver a iniciar sesión.',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: newStatus === 'INACTIVE' ? 'Desactivar' : 'Activar',
                                style: newStatus === 'INACTIVE' ? 'destructive' : 'default',
                                onPress: () => {
                                  onToggleStatus(selectedUser.id, current);
                                  setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
                                }
                              }
                            ]
                          );
                        }}
                        style={{
                          padding: 6,
                          borderRadius: 20,
                          backgroundColor: selectedUser.status === 'ACTIVE' ? '#FEF2F2' : '#ECFDF5',
                          borderWidth: 1,
                          borderColor: selectedUser.status === 'ACTIVE' ? '#FEE2E2' : '#D1FAE5'
                        }}
                      >
                        <Icon
                          as={selectedUser.status === 'ACTIVE' ? ICONS.ToggleRight : ICONS.ToggleLeft}
                          className={`w-7 h-7 ${
                            selectedUser.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        />
                      </TouchableOpacity>
                    )}
                  </HStack>
                </Box>

                {/* 3. CARD DATOS PERSONALES */}
                <Box className="bg-white p-5 rounded-2xl border border-[#E9EAF4] shadow-sm">
                  <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider mb-4">Datos Personales</Text>
                  
                  <VStack space="md">
                    {/* Correo */}
                    <HStack style={{ gap: 12 }} className="items-center">
                      <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                        <Icon as={ICONS.Mail} className="w-4 h-4 text-indigo-600" />
                      </Box>
                      <VStack>
                        <Text className="text-gray-400 text-3xs font-semibold">Correo Electrónico</Text>
                        <Text className="text-[#111827] text-xs font-bold">{selectedUser.email}</Text>
                      </VStack>
                    </HStack>

                    {/* DNI */}
                    <HStack style={{ gap: 12 }} className="items-center">
                      <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                        <Icon as={ICONS.FileText} className="w-4 h-4 text-indigo-600" />
                      </Box>
                      <VStack>
                        <Text className="text-gray-400 text-3xs font-semibold">DNI</Text>
                        <Text className="text-[#111827] text-xs font-bold">{selectedUser.dni || 'No registrado'}</Text>
                      </VStack>
                    </HStack>

                    {/* Teléfono */}
                    <HStack style={{ gap: 12 }} className="items-center">
                      <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                        <Icon as={ICONS.Phone} className="w-4 h-4 text-indigo-600" />
                      </Box>
                      <VStack>
                        <Text className="text-gray-400 text-3xs font-semibold">Teléfono</Text>
                        <Text className="text-[#111827] text-xs font-bold">{selectedUser.phoneNumber || 'No registrado'}</Text>
                      </VStack>
                    </HStack>

                    {/* Fecha Nacimiento */}
                    <HStack style={{ gap: 12 }} className="items-center">
                      <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                        <Icon as={ICONS.CalendarDays} className="w-4 h-4 text-indigo-600" />
                      </Box>
                      <VStack>
                        <Text className="text-gray-400 text-3xs font-semibold">Fecha de Nacimiento</Text>
                        <Text className="text-[#111827] text-xs font-bold">
                          {selectedUser.fechaNacimiento ? fromIsoDate(selectedUser.fechaNacimiento) : 'No registrada'}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>

                {/* 4. CARD ACADÉMICA / PROFESIONAL */}
                {selectedUser.rol === 'STUDENT' ? (
                  <Box className="bg-white p-5 rounded-2xl border border-[#E9EAF4] shadow-sm">
                    <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider mb-4">Información Académica</Text>
                    
                    <VStack space="md">
                      <HStack style={{ gap: 12 }} className="items-center">
                        <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Icon as={ICONS.Laptop} className="w-4 h-4 text-indigo-600" />
                        </Box>
                        <VStack>
                          <Text className="text-gray-400 text-3xs font-semibold">Carrera</Text>
                          <Text className="text-[#111827] text-xs font-bold">{selectedUser.career || 'No registrado'}</Text>
                        </VStack>
                      </HStack>

                      <HStack style={{ gap: 12 }} className="items-center">
                        <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Icon as={ICONS.Layers} className="w-4 h-4 text-indigo-600" />
                        </Box>
                        <VStack>
                          <Text className="text-gray-400 text-3xs font-semibold">Ciclo Académico</Text>
                          <Text className="text-[#111827] text-xs font-bold">
                            {selectedUser.ciclo ? `Ciclo ${selectedUser.ciclo}` : 'No registrado'}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>
                ) : (
                  <Box className="bg-white p-5 rounded-2xl border border-[#E9EAF4] shadow-sm">
                    <Text className="text-gray-400 text-3xs font-bold uppercase tracking-wider mb-4">Información Profesional</Text>
                    
                    <VStack space="md">
                      <HStack style={{ gap: 12 }} className="items-center">
                        <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Icon as={ICONS.GraduationCap} className="w-4 h-4 text-indigo-600" />
                        </Box>
                        <VStack>
                          <Text className="text-gray-400 text-3xs font-semibold">Título Académico</Text>
                          <Text className="text-[#111827] text-xs font-bold">{selectedUser.titulo || 'No registrado'}</Text>
                        </VStack>
                      </HStack>

                      <HStack style={{ gap: 12 }} className="items-center">
                        <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Icon as={ICONS.Laptop} className="w-4 h-4 text-indigo-600" />
                        </Box>
                        <VStack>
                          <Text className="text-gray-400 text-3xs font-semibold">Especialidad</Text>
                          <Text className="text-[#111827] text-xs font-bold">{selectedUser.specialty || 'No registrada'}</Text>
                        </VStack>
                      </HStack>

                      <HStack style={{ gap: 12 }} className="items-center">
                        <Box className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Icon as={ICONS.CalendarDays} className="w-4 h-4 text-indigo-600" />
                        </Box>
                        <VStack>
                          <Text className="text-gray-400 text-3xs font-semibold">Fecha de Contratación</Text>
                          <Text className="text-[#111827] text-xs font-bold">
                            {selectedUser.hiringDate ? fromIsoDate(selectedUser.hiringDate) : 'No registrada'}
                          </Text>
                        </VStack>
                      </HStack>

                      <VStack space="xs" className="mt-2 pt-4 border-t border-gray-100">
                        <Text className="text-gray-400 text-3xs font-semibold">Biografía</Text>
                        <Box className="bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[60px]">
                          <Text className="text-gray-600 text-2xs leading-relaxed">
                            {selectedUser.biography || 'Sin biografía registrada'}
                          </Text>
                        </Box>
                      </VStack>
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </VStack>
  );
}
