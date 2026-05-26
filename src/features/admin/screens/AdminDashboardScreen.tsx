import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { INICIAL_EVENTOS, INICIAL_USUARIOS } from '../constants';
import { AdminEvent, AdminUser } from '../types';

import { useAuthState } from '@/src/features/auth/state';
import StatsGrid from '../components/StatsGrid';
import RecentEvents from '../components/RecentEvents';
import EventManagement from '../components/EventManagement';
import UserManagement from '../components/UserManagement';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { role } = useAuthState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'eventos' | 'usuarios'>('dashboard');
  const [eventos, setEventos] = useState<AdminEvent[]>(INICIAL_EVENTOS);
  const [usuarios, setUsuarios] = useState<AdminUser[]>(INICIAL_USUARIOS);

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
  const handleAprobarEvento = (id: string) => {
    setEventos(prev =>
      prev.map(e => e.id === id ? { ...e, estado: 'Aprobado' } : e)
    );
    Alert.alert('Éxito', 'El evento ha sido aprobado exitosamente.');
  };

  const handleRechazarEvento = (id: string) => {
    setEventos(prev =>
      prev.map(e => e.id === id ? { ...e, estado: 'Pendiente' } : e)
    );
    Alert.alert('Información', 'El evento ha sido marcado como pendiente.');
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
          onPress: () => {
            setEventos(prev => prev.filter(e => e.id !== id));
          }
        }
      ]
    );
  };

  // Acciones de administración de usuarios
  const handleCambiarRol = (id: string) => {
    setUsuarios(prev =>
      prev.map(u => u.id === id ? { ...u, rol: u.rol === 'Admin' ? 'Usuario' : 'Admin' } : u)
    );
    Alert.alert('Éxito', 'Rol de usuario actualizado.');
  };

  const handleEliminarUsuario = (id: string) => {
    Alert.alert(
      'Eliminar usuario',
      '¿Deseas revocar el acceso de este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revocar',
          style: 'destructive',
          onPress: () => {
            setUsuarios(prev => prev.filter(u => u.id !== id));
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
          />
        )}

        {/* ==============================================
            VISTA 3: GESTIÓN DE USUARIOS
           ============================================== */}
        {activeTab === 'usuarios' && role === 'ADMIN' && (
          <UserManagement
            usuarios={usuarios}
            onCambiarRol={handleCambiarRol}
            onEliminar={handleEliminarUsuario}
          />
        )}
      </Box>
    </ScrollView>
  );
}
