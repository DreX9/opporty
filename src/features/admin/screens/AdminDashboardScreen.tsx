import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator, LayoutAnimation, Platform, UIManager, useWindowDimensions } from 'react-native';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { INICIAL_USUARIOS } from '../constants';
import { AdminEvent, AdminUser } from '../types';
import { adminService } from '../services/adminService';
import { useEvents } from '@/src/features/event/hooks/useEvents';
import { eventService } from '@/src/features/event/services/eventService';

import { useAuthState } from '@/src/features/auth/state';
import StatsGrid from '../components/StatsGrid';
import RecentEvents from '../components/RecentEvents';
import EventManagement from '../components/EventManagement';
import UserManagement from '../components/UserManagement';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role } = useAuthState();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'eventos' | 'usuarios'>('dashboard');

  // ── Transición suave al rotar ──────────────────────────────────
  const { width: W } = useWindowDimensions();
  const prevW = useRef(W);
  useEffect(() => {
      if (prevW.current !== W) {
          LayoutAnimation.configureNext({
              duration: 280,
              create:  { type: 'easeInEaseOut', property: 'opacity' },
              update:  { type: 'easeInEaseOut' },
              delete:  { type: 'easeInEaseOut', property: 'opacity' },
          });
          prevW.current = W;
      }
  }, [W]);

  useEffect(() => {
    if (params.tab && (params.tab === 'dashboard' || params.tab === 'eventos' || params.tab === 'usuarios')) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  const { data: backendEvents, refetch: refetchEvents } = useEvents();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const eventos = useMemo(() => {
    if (!Array.isArray(backendEvents)) return [];
    return backendEvents.map(be => ({
      id: String(be.id),
      titulo: be.titulo,
      categoria: be.categories && be.categories.length > 0 ? be.categories.map(c => c.nombre).join(', ') : 'Sin categoría',
      estado: be.estado === 'PUBLISHED' ? 'Aprobado' as const
            : be.estado === 'PENDING' ? 'Pendiente' as const
            : be.estado === 'REJECTED' ? 'Rechazado' as const
            : be.estado === 'SCHEDULED' ? 'Programado' as const
            : be.estado === 'SUSPENDED' ? 'Suspendido' as const
            : be.estado === 'CANCELLED' ? 'Cancelado' as const
            : be.estado,
      fecha: be.fechaInicio,
      motivoRechazo: be.motivoRechazo,
      raw: be,
    }));
  }, [backendEvents]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await adminService.fetchUsers();
      setUsuarios(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudieron cargar los usuarios del servidor.';
      console.error('Error al cargar usuarios:', err);
      Alert.alert('Error', msg);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
    }
  }, [activeTab]);

  // Estadísticas calculadas dinámicamente
  const stats = useMemo(() => {
    const totalEventos = eventos.length;
    const activos = eventos.filter(e => e.estado === 'Aprobado').length;
    const pendientes = eventos.filter(e => e.estado === 'Pendiente').length;
    const totalUsuarios = usuarios.length;

    return {
      totalEventos,
      activos,
      pendientes,
      totalUsuarios
    };
  }, [eventos, usuarios]);

  // Acciones de administración de eventos
  const handleAprobarEvento = async (id: string) => {
    try {
      const original = backendEvents.find(e => String(e.id) === id);
      if (!original) return;

      const payload = {
        titulo: original.titulo,
        descripcion: original.descripcion || '',
        fechaInicio: original.fechaInicio,
        fechaFin: original.fechaFin,
        horaInicio: original.horaInicio,
        horaFin: original.horaFin,
        capacidad: original.capacidad,
        imagenUrl: original.imagenUrl,
        modalidad: original.modalidad,
        lugar: original.lugar,
        referencia: original.referencia,
        latitud: original.latitud,
        longitud: original.longitud,
        estado: 'SCHEDULED',
        requiresApproval: original.requiresApproval,
        allowQrAttendance: original.allowQrAttendance,
        edadMinima: original.edadMinima,
        requisitos: original.requisitos,
        categoryIds: original.categories.map(c => c.id),
        tagIds: original.tags.map(t => t.id),
        imageUrls: original.imageUrls || [],
        motivoRechazo: null,
      };

      await eventService.updateEvent(Number(id), payload);
      Alert.alert('✅ Éxito', `El evento "${original.titulo}" ha sido aprobado y ahora está programado.`);
      refetchEvents();
    } catch (error: unknown) {
      console.error('Error al aprobar evento:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo aprobar el evento.';
      Alert.alert('⚠️ Error', errMsg);
    }
  };

  const handleConfirmarInicio = async (id: string) => {
    try {
      const original = backendEvents.find(e => String(e.id) === id);
      if (!original) return;

      const payload = {
        titulo: original.titulo,
        descripcion: original.descripcion || '',
        fechaInicio: original.fechaInicio,
        fechaFin: original.fechaFin,
        horaInicio: original.horaInicio,
        horaFin: original.horaFin,
        capacidad: original.capacidad,
        imagenUrl: original.imagenUrl,
        modalidad: original.modalidad,
        lugar: original.lugar,
        referencia: original.referencia,
        latitud: original.latitud,
        longitud: original.longitud,
        estado: 'PUBLISHED',
        requiresApproval: original.requiresApproval,
        allowQrAttendance: original.allowQrAttendance,
        edadMinima: original.edadMinima,
        requisitos: original.requisitos,
        categoryIds: original.categories.map(c => c.id),
        tagIds: original.tags.map(t => t.id),
        imageUrls: original.imageUrls || [],
        motivoRechazo: original.motivoRechazo,
      };

      await eventService.updateEvent(Number(id), payload);
      Alert.alert('✅ Éxito', `El evento "${original.titulo}" ha sido iniciado y ahora es público.`);
      refetchEvents();
    } catch (error: unknown) {
      console.error('Error al iniciar evento:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo iniciar el evento.';
      Alert.alert('⚠️ Error', errMsg);
    }
  };

  const handleSuspenderEvento = async (id: string) => {
    try {
      const original = backendEvents.find(e => String(e.id) === id);
      if (!original) return;

      const payload = {
        titulo: original.titulo,
        descripcion: original.descripcion || '',
        fechaInicio: original.fechaInicio,
        fechaFin: original.fechaFin,
        horaInicio: original.horaInicio,
        horaFin: original.horaFin,
        capacidad: original.capacidad,
        imagenUrl: original.imagenUrl,
        modalidad: original.modalidad,
        lugar: original.lugar,
        referencia: original.referencia,
        latitud: original.latitud,
        longitud: original.longitud,
        estado: 'SUSPENDED',
        requiresApproval: original.requiresApproval,
        allowQrAttendance: original.allowQrAttendance,
        edadMinima: original.edadMinima,
        requisitos: original.requisitos,
        categoryIds: original.categories.map(c => c.id),
        tagIds: original.tags.map(t => t.id),
        imageUrls: original.imageUrls || [],
        motivoRechazo: original.motivoRechazo,
      };

      await eventService.updateEvent(Number(id), payload);
      Alert.alert('⏸️ Éxito', `El evento "${original.titulo}" ha sido suspendido.`);
      refetchEvents();
    } catch (error: unknown) {
      console.error('Error al suspender evento:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo suspender el evento.';
      Alert.alert('⚠️ Error', errMsg);
    }
  };

  const handleCancelarEvento = async (id: string) => {
    try {
      const original = backendEvents.find(e => String(e.id) === id);
      if (!original) return;

      const payload = {
        titulo: original.titulo,
        descripcion: original.descripcion || '',
        fechaInicio: original.fechaInicio,
        fechaFin: original.fechaFin,
        horaInicio: original.horaInicio,
        horaFin: original.horaFin,
        capacidad: original.capacidad,
        imagenUrl: original.imagenUrl,
        modalidad: original.modalidad,
        lugar: original.lugar,
        referencia: original.referencia,
        latitud: original.latitud,
        longitud: original.longitud,
        estado: 'CANCELLED',
        requiresApproval: original.requiresApproval,
        allowQrAttendance: original.allowQrAttendance,
        edadMinima: original.edadMinima,
        requisitos: original.requisitos,
        categoryIds: original.categories.map(c => c.id),
        tagIds: original.tags.map(t => t.id),
        imageUrls: original.imageUrls || [],
        motivoRechazo: original.motivoRechazo,
      };

      await eventService.updateEvent(Number(id), payload);
      Alert.alert('⏹️ Éxito', `El evento "${original.titulo}" ha sido cancelado.`);
      refetchEvents();
    } catch (error: unknown) {
      console.error('Error al cancelar evento:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo cancelar el evento.';
      Alert.alert('⚠️ Error', errMsg);
    }
  };

  const handleRechazarEvento = async (id: string, motivo: string) => {
    try {
      const original = backendEvents.find(e => String(e.id) === id);
      if (!original) return;

      const payload = {
        titulo: original.titulo,
        descripcion: original.descripcion || '',
        fechaInicio: original.fechaInicio,
        fechaFin: original.fechaFin,
        horaInicio: original.horaInicio,
        horaFin: original.horaFin,
        capacidad: original.capacidad,
        imagenUrl: original.imagenUrl,
        modalidad: original.modalidad,
        lugar: original.lugar,
        referencia: original.referencia,
        latitud: original.latitud,
        longitud: original.longitud,
        estado: 'REJECTED',
        requiresApproval: original.requiresApproval,
        allowQrAttendance: original.allowQrAttendance,
        edadMinima: original.edadMinima,
        requisitos: original.requisitos,
        categoryIds: original.categories.map(c => c.id),
        tagIds: original.tags.map(t => t.id),
        imageUrls: original.imageUrls || [],
        motivoRechazo: motivo.trim() || 'Rechazado por el Administrador',
      };

      await eventService.updateEvent(Number(id), payload);
      Alert.alert('❌ Solicitud Rechazada', `El evento "${original.titulo}" ha sido rechazado.`);
      refetchEvents();
    } catch (error: unknown) {
      console.error('Error al rechazar evento:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo rechazar el evento.';
      Alert.alert('⚠️ Error', errMsg);
    }
  };

  const handleEliminarEvento = (id: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este evento permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.deleteEvent(Number(id));
              Alert.alert('✅ Éxito', 'El evento ha sido eliminado permanentemente.');
              refetchEvents();
            } catch (error: unknown) {
              console.error('Error al eliminar evento:', error);
              const errMsg = error instanceof Error ? error.message : 'No se pudo eliminar el evento.';
              Alert.alert('⚠️ Error', errMsg);
            }
          }
        }
      ]
    );
  };

  // Acciones de administración de usuarios
  const handleCambiarRol = async (id: string, newRole: string) => {
    try {
      await adminService.updateUserRole(id, newRole);
      setUsuarios(prev =>
        prev.map(u => u.id === id ? { ...u, rol: newRole, emoji: newRole === 'ADMIN' ? '👑' : newRole === 'TEACHER' ? '🧑‍💻' : '👨🏻‍💻' } : u)
      );
      Alert.alert('Éxito', `El rol del usuario ha sido actualizado a ${newRole}.`);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'No se pudo actualizar el rol.')
        : (err instanceof Error ? err.message : 'Error desconocido al actualizar el rol.');
      Alert.alert('Error', msg);
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const newStatus: 'ACTIVE' | 'INACTIVE' = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = newStatus === 'INACTIVE' ? 'desactivar' : 'activar';
    const confirmMessage = newStatus === 'INACTIVE'
      ? '¿Estás seguro de que deseas desactivar este usuario? Ya no podrá iniciar sesión en el sistema.'
      : '¿Deseas activar nuevamente este usuario? Podrá volver a iniciar sesión.';

    Alert.alert(
      `${newStatus === 'INACTIVE' ? 'Desactivar' : 'Activar'} usuario`,
      confirmMessage,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: newStatus === 'INACTIVE' ? 'Desactivar' : 'Activar',
          style: newStatus === 'INACTIVE' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await adminService.updateUserStatus(id, newStatus);
              setUsuarios(prev =>
                prev.map(u => u.id === id ? { ...u, status: newStatus } : u)
              );
              Alert.alert('Éxito', `El usuario ha sido ${newStatus === 'INACTIVE' ? 'desactivado' : 'activado'} correctamente.`);
            } catch (err: unknown) {
              const msg = err && typeof err === 'object' && 'response' in err
                ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'No se pudo actualizar el estado.')
                : (err instanceof Error ? err.message : 'Error desconocido al actualizar el estado.');
              Alert.alert('Error', msg);
            }
          }
        }
      ]
    );
  };

  const handleNavigationToCreation = () => {
    if (activeTab === 'usuarios') {
      router.push('/tabs/admin/crear-usuario');
    } else {
      router.push('/tabs/admin/crear-evento');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F4F4FB]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* 🔴 HEADER CON GRADIENTE PREMIUM */}
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24 }}
      >
        <HStack className="justify-between items-center">
          <VStack>
            <Text className="text-white text-3xl font-extrabold tracking-tight">
              {role === 'ADMIN' ? 'Panel de Administrador' : role === 'MANAGER' ? 'Panel de Manager' : role === 'TEACHER' ? 'Panel de Docente' : 'Panel de Control'}
            </Text>
            <Text className="text-white/80 text-sm font-semibold mt-1">
              Gestión del sistema Echo
            </Text>
          </VStack>
          <Box className="bg-white/20 border border-white/30 rounded-full px-3 py-1">
            <Text className="text-white text-2xs font-extrabold tracking-widest uppercase">
              {role || 'USER'}
            </Text>
          </Box>
        </HStack>
      </LinearGradient>

      {/* 🧭 SUB-HEADER NAVIGATION TABS */}
      <HStack className="px-4 border-b border-gray-200 pb-3 mb-6" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-full border ${activeTab === 'dashboard' ? 'bg-indigo-50 border-indigo-600/30' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-xs font-bold tracking-wider ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'}`}>
            Dashboard
          </Text>
        </TouchableOpacity>

        {(role === 'ADMIN' || role === 'MANAGER') && (
          <TouchableOpacity
            onPress={() => setActiveTab('eventos')}
            className={`px-4 py-2 rounded-full border ${activeTab === 'eventos' ? 'bg-indigo-50 border-indigo-600/30' : 'bg-transparent border-transparent'}`}
          >
            <Text className={`text-xs font-bold tracking-wider ${activeTab === 'eventos' ? 'text-indigo-600' : 'text-gray-500'}`}>
              Eventos
            </Text>
          </TouchableOpacity>
        )}

        {role === 'ADMIN' && (
          <TouchableOpacity
            onPress={() => setActiveTab('usuarios')}
            className={`px-4 py-2 rounded-full border ${activeTab === 'usuarios' ? 'bg-indigo-50 border-indigo-600/30' : 'bg-transparent border-transparent'}`}
          >
            <Text className={`text-xs font-bold tracking-wider ${activeTab === 'usuarios' ? 'text-indigo-600' : 'text-gray-500'}`}>
              Usuarios
            </Text>
          </TouchableOpacity>
        )}

        {(role === 'ADMIN' || role === 'MANAGER') && (
          <TouchableOpacity
            onPress={handleNavigationToCreation}
            className="px-4 py-2 rounded-full bg-indigo-600 items-center justify-center ml-auto"
          >
            <Text className="text-white text-xs font-extrabold">
              {activeTab === 'usuarios' ? '+ Crear Us' : '+ Crear Ev'}
            </Text>
          </TouchableOpacity>
        )}
      </HStack>

      <Box className="px-4">
        {activeTab === 'dashboard' && (
          <VStack>
            <StatsGrid stats={stats} isAdmin={role === 'ADMIN'} />
            <RecentEvents eventos={eventos} />
          </VStack>
        )}

        {/* ==============================================
            VISTA 2: GESTIÓN DE EVENTOS
           ============================================== */}
        {activeTab === 'eventos' && (role === 'ADMIN' || role === 'MANAGER') && (
          <EventManagement
            eventos={eventos}
            onAprobar={handleAprobarEvento}
            onRechazar={handleRechazarEvento}
            onEliminar={handleEliminarEvento}
            onConfirmarInicio={handleConfirmarInicio}
            onSuspender={handleSuspenderEvento}
            onCancelar={handleCancelarEvento}
            initialReviewEventId={params.openEventId ? String(params.openEventId) : undefined}
          />
        )}

        {/* ==============================================
            VISTA 3: GESTIÓN DE USUARIOS
           ============================================== */}
        {activeTab === 'usuarios' && role === 'ADMIN' && (
          <UserManagement
            usuarios={usuarios}
            onCambiarRol={handleCambiarRol}
            onToggleStatus={handleToggleUserStatus}
            loading={loadingUsers}
          />
        )}
      </Box>
    </ScrollView>
  );
}
