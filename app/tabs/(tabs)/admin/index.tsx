import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Alert, Dimensions, StatusBar } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Datos iniciales de simulación
const INICIAL_EVENTOS = [
  { id: '1', titulo: 'Hackathon Tech 2026', categoria: 'Tecnología', estado: 'Aprobado', fecha: '24 Abr', color: '#00E5FF' },
  { id: '2', titulo: 'Concierto Estudiantil', categoria: 'Música', estado: 'Pendiente', fecha: '02 May', color: '#FFB300' },
  { id: '3', titulo: 'Liga Universitaria eSports', categoria: 'Deporte', estado: 'Aprobado', fecha: '10 May', color: '#39FF14' },
  { id: '4', titulo: 'Feria del Amor', categoria: 'Social', estado: 'Pendiente', fecha: '18 May', color: '#FF00FF' },
];

const INICIAL_USUARIOS = [
  { id: '1', nombre: 'Alex Rivera', email: 'alex@test.com', rol: 'Usuario', emoji: '👨🏻‍💻' },
  { id: '2', nombre: 'Administrador principal', email: 'admin@admin.com', rol: 'Admin', emoji: '👑' },
  { id: '3', nombre: 'Carlos Gomez', email: 'carlos@test.com', rol: 'Usuario', emoji: '🧑‍🎓' },
  { id: '4', nombre: 'Sofia Rojas', email: 'sofia@test.com', rol: 'Usuario', emoji: '👩‍💻' },
  { id: '5', nombre: 'Juan Perez', email: 'juan@test.com', rol: 'Usuario', emoji: '🧑‍💻' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'eventos' | 'usuarios'>('dashboard');
  const [eventos, setEventos] = useState(INICIAL_EVENTOS);
  const [usuarios, setUsuarios] = useState(INICIAL_USUARIOS);

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

  return (
    <ScrollView
      className="flex-1 bg-[#070B17]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* 🔴 HEADER CON GRADIENTE PREMIUM */}
      <LinearGradient
        colors={['#1E1B4B', '#070B17']}
        style={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24 }}
      >
        <HStack className="justify-between items-center">
          <VStack>
            <Text className="text-white text-3xl font-extrabold tracking-tight">
              Panel de Administrador
            </Text>
            <Text className="text-cyan-400 text-sm font-semibold mt-1">
              Gestión del sistema Echo
            </Text>
          </VStack>
          <Box className="bg-cyan-500/10 border border-cyan-400/30 rounded-full px-3 py-1">
            <Text className="text-cyan-400 text-2xs font-extrabold tracking-widest uppercase">
              ADMIN
            </Text>
          </Box>
        </HStack>
      </LinearGradient>

      {/* 🧭 SUB-HEADER NAVIGATION TABS */}
      <HStack className="px-4 border-b border-white/5 pb-3 mb-6" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-full border ${activeTab === 'dashboard' ? 'bg-cyan-400/10 border-cyan-400' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-xs font-bold tracking-wider ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-gray-400'}`}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('eventos')}
          className={`px-4 py-2 rounded-full border ${activeTab === 'eventos' ? 'bg-cyan-400/10 border-cyan-400' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-xs font-bold tracking-wider ${activeTab === 'eventos' ? 'text-cyan-400' : 'text-gray-400'}`}>
            Eventos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded-full border ${activeTab === 'usuarios' ? 'bg-cyan-400/10 border-cyan-400' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-xs font-bold tracking-wider ${activeTab === 'usuarios' ? 'text-cyan-400' : 'text-gray-400'}`}>
            Usuarios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(activeTab === 'usuarios' ? '../crear-usuario' : '../crear-evento')}
          className="px-4 py-2 rounded-full bg-cyan-400 items-center justify-center ml-auto"
        >
          <Text className="text-[#070B17] text-xs font-extrabold">
            {activeTab === 'usuarios' ? '+ Crear Us' : '+ Crear Ev'}
          </Text>
        </TouchableOpacity>
      </HStack>

      <Box className="px-4">
        {/* ==============================================
            VISTA 1: DASHBOARD PRINCIPAL
           ============================================== */}
        {activeTab === 'dashboard' && (
          <VStack>
            {/* KPI STATS CARDS GRID (2x2) */}
            <HStack className="justify-between mb-4">
              {/* Card 1: Total Eventos */}
              <Box
                className="rounded-2xl p-4 bg-[#0D1324] border border-cyan-500/25 items-start relative overflow-hidden"
                style={{
                  width: '48.5%',
                  shadowColor: '#00E5FF',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Box className="p-2 rounded-lg bg-cyan-500/10 mb-3">
                  <Icon as={ICONS.CalendarDays} className="text-cyan-400 w-5 h-5" />
                </Box>
                <Text className="text-cyan-400 text-3xl font-extrabold tracking-tight">
                  {stats.totalEventos}
                </Text>
                <Text className="text-gray-400 text-xs font-bold mt-1">
                  Total Eventos
                </Text>
              </Box>

              {/* Card 2: Eventos Activos */}
              <Box
                className="rounded-2xl p-4 bg-[#0D1324] border border-emerald-500/25 items-start relative overflow-hidden"
                style={{
                  width: '48.5%',
                  shadowColor: '#39FF14',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Box className="p-2 rounded-lg bg-emerald-500/10 mb-3">
                  <Icon as={ICONS.CheckCircle} className="text-emerald-400 w-5 h-5" />
                </Box>
                <Text className="text-emerald-400 text-3xl font-extrabold tracking-tight">
                  {stats.activos}
                </Text>
                <Text className="text-gray-400 text-xs font-bold mt-1">
                  Eventos Activos
                </Text>
              </Box>
            </HStack>

            <HStack className="justify-between mb-6">
              {/* Card 3: Usuarios */}
              <Box
                className="rounded-2xl p-4 bg-[#0D1324] border border-fuchsia-500/25 items-start relative overflow-hidden"
                style={{
                  width: '48.5%',
                  shadowColor: '#FF00FF',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Box className="p-2 rounded-lg bg-fuchsia-500/10 mb-3">
                  <Icon as={ICONS.Users} className="text-fuchsia-400 w-5 h-5" />
                </Box>
                <Text className="text-fuchsia-400 text-3xl font-extrabold tracking-tight">
                  {stats.totalUsuarios}
                </Text>
                <Text className="text-gray-400 text-xs font-bold mt-1">
                  Usuarios
                </Text>
              </Box>

              {/* Card 4: Pendientes */}
              <Box
                className="rounded-2xl p-4 bg-[#0D1324] border border-amber-500/25 items-start relative overflow-hidden"
                style={{
                  width: '48.5%',
                  shadowColor: '#FFB300',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Box className="p-2 rounded-lg bg-amber-500/10 mb-3">
                  <Icon as={ICONS.AlertCircle} className="text-amber-400 w-5 h-5" />
                </Box>
                <Text className="text-amber-400 text-3xl font-extrabold tracking-tight">
                  {stats.pendientes}
                </Text>
                <Text className="text-gray-400 text-xs font-bold mt-1">
                  Pendientes
                </Text>
              </Box>
            </HStack>

            {/* LISTA DE EVENTOS RECIENTES */}
            <VStack space="md" className="w-full mt-2">
              <Box className="mb-2">
                <Text className="text-white text-xl font-bold tracking-wide">
                  Eventos Recientes
                </Text>
              </Box>

              {eventos.slice(0, 4).map((evento) => (
                <Box
                  key={evento.id}
                  className="w-full p-4 rounded-2xl bg-[#0D1324] border border-white/5 flex-row items-center justify-between"
                >
                  <VStack className="flex-1 mr-3">
                    <Text className="text-white text-base font-bold" numberOfLines={1}>
                      {evento.titulo}
                    </Text>
                    <Text className="text-gray-400 text-xs font-semibold mt-1">
                      {evento.categoria}
                    </Text>
                  </VStack>

                  <Box
                    className="px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: evento.estado === 'Aprobado' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 179, 0, 0.1)',
                      borderColor: evento.estado === 'Aprobado' ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 179, 0, 0.3)',
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: evento.estado === 'Aprobado' ? '#39FF14' : '#FFB300',
                      }}
                    >
                      {evento.estado}
                    </Text>
                  </Box>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}

        {/* ==============================================
            VISTA 2: GESTIÓN DE EVENTOS
           ============================================== */}
        {activeTab === 'eventos' && (
          <VStack space="md">
            <Box className="mb-2">
              <Text className="text-white text-xl font-bold">Gestión de Eventos</Text>
              <Text className="text-gray-400 text-xs mt-1">Revisa, aprueba o elimina eventos en el sistema</Text>
            </Box>

            {eventos.map((evento) => (
              <Box
                key={evento.id}
                className="w-full p-4 rounded-2xl bg-[#0D1324] border border-white/5"
              >
                <HStack className="justify-between items-start mb-2">
                  <VStack className="flex-1 mr-2">
                    <Text className="text-white text-base font-bold">{evento.titulo}</Text>
                    <Text className="text-gray-400 text-xs font-semibold mt-0.5">{evento.categoria}</Text>
                  </VStack>
                  <Box
                    className="px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: evento.estado === 'Aprobado' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 179, 0, 0.1)',
                      borderColor: evento.estado === 'Aprobado' ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 179, 0, 0.3)',
                    }}
                  >
                    <Text
                      className="text-2xs font-extrabold"
                      style={{ color: evento.estado === 'Aprobado' ? '#39FF14' : '#FFB300' }}
                    >
                      {evento.estado.toUpperCase()}
                    </Text>
                  </Box>
                </HStack>

                <HStack className="justify-end mt-3 border-t border-white/5 pt-3" style={{ gap: 8 }}>
                  {evento.estado === 'Pendiente' ? (
                    <TouchableOpacity
                      onPress={() => handleAprobarEvento(evento.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40"
                    >
                      <Text className="text-emerald-400 text-xs font-bold">Aprobar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleRechazarEvento(evento.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40"
                    >
                      <Text className="text-amber-400 text-xs font-bold">Pendiente</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleEliminarEvento(evento.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40"
                  >
                    <Text className="text-rose-400 text-xs font-bold">Eliminar</Text>
                  </TouchableOpacity>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* ==============================================
            VISTA 3: GESTIÓN DE USUARIOS
           ============================================== */}
        {activeTab === 'usuarios' && (
          <VStack space="md">
            <Box className="mb-2">
              <Text className="text-white text-xl font-bold">Gestión de Usuarios</Text>
              <Text className="text-gray-400 text-xs mt-1">Supervisa cuentas registradas y cambia privilegios</Text>
            </Box>

            {usuarios.map((usuario) => (
              <Box
                key={usuario.id}
                className="w-full p-4 rounded-2xl bg-[#0D1324] border border-white/5 flex-row items-center justify-between"
              >
                <HStack space="md" className="items-center flex-1 mr-2">
                  <Box className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                    <Text className="text-lg">{usuario.emoji}</Text>
                  </Box>
                  <VStack className="flex-1">
                    <Text className="text-white text-sm font-bold" numberOfLines={1}>{usuario.nombre}</Text>
                    <Text className="text-gray-400 text-2xs" numberOfLines={1}>{usuario.email}</Text>
                  </VStack>
                </HStack>

                <HStack space="sm" className="items-center">
                  <TouchableOpacity
                    onPress={() => handleCambiarRol(usuario.id)}
                    className={`px-3 py-1 rounded-full border ${usuario.rol === 'Admin' ? 'bg-fuchsia-500/20 border-fuchsia-400' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`text-2xs font-extrabold ${usuario.rol === 'Admin' ? 'text-fuchsia-400' : 'text-gray-400'}`}>
                      {usuario.rol.toUpperCase()}
                    </Text>
                  </TouchableOpacity>

                  {usuario.email !== 'admin@admin.com' && (
                    <TouchableOpacity
                      onPress={() => handleEliminarUsuario(usuario.id)}
                      className="p-1.5 rounded-full bg-rose-500/10 border border-rose-500/20"
                    >
                      <Icon as={ICONS.X} className="text-rose-400 w-3.5 h-3.5" />
                    </TouchableOpacity>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </ScrollView>
  );
}