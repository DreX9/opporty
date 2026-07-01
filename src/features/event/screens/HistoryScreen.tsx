import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

import { Evento, mapBackendToEvento } from '../types';
import EventCard from '../components/EventCard';
import HistoryDetailModal from '../components/HistoryDetailModal';
import { useEvents } from '../hooks/useEvents';
import { useCategories } from '../hooks/useCategories';
import { eventStateManager } from '../state';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: backendEvents, loading: loadingEvents, refetch: refetchEvents } = useEvents();
  const { categorias } = useCategories();

  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [filtroConstancia, setFiltroConstancia] = useState<string>('Todos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [refrescar, setRefrescar] = useState<boolean>(false);

  // Filter and sort registered events
  const eventos = Array.isArray(backendEvents)
    ? [...backendEvents]
        .filter((ev) => eventStateManager.isRegistered(String(ev.id)))
        .sort((a, b) => new Date(b.fechaFin).getTime() - new Date(a.fechaFin).getTime())
        .map(mapBackendToEvento)
    : [];

  const filtrados = eventos.filter((ev) => {
      const matchBusqueda = (ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ev.lugar.toLowerCase().includes(busqueda.toLowerCase()) ||
        ev.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
      
      let matchEstado = false;
      if (filtroEstado === 'Todos') matchEstado = true;
      else if (filtroEstado === 'Próximos') matchEstado = ev.raw?.estado === 'SCHEDULED';
      else if (filtroEstado === 'En curso') matchEstado = ev.raw?.estado === 'PUBLISHED';
      else if (filtroEstado === 'Finalizados') matchEstado = ev.raw?.estado === 'FINISHED';
      
      let matchConstancia = true;
      if (filtroEstado === 'Finalizados' && filtroConstancia !== 'Todos') {
         const hasConstancia = eventStateManager.isCertificateUnlocked(ev.id);
         if (filtroConstancia === 'Con constancia') matchConstancia = hasConstancia;
         else if (filtroConstancia === 'Sin constancia') matchConstancia = !hasConstancia;
      }
      
      return matchBusqueda && matchEstado && matchConstancia;
  });

  const handleRefresh = async () => {
    setRefrescar(true);
    await refetchEvents();
    setRefrescar(false);
  };

  const listaFiltrosEstado = ['Todos', 'Próximos', 'En curso', 'Finalizados'];
  const listaFiltrosConstancia = ['Todos', 'Con constancia', 'Sin constancia'];
  const cargando = loadingEvents && backendEvents.length === 0;

  const { width: W } = useWindowDimensions();
  const numColumns = W >= 900 ? 3 : W >= 600 ? 2 : 1;
  const GAP = 12;
  const HPAD = 16;
  const cardWidth = numColumns === 1
    ? W - HPAD * 2
    : (W - HPAD * 2 - GAP * (numColumns - 1)) / numColumns;

  return (
    <Box className="flex-1 bg-[#F8FAFC]">
      {/* Search Header */}
      <VStack className="bg-white border-b border-slate-100 px-4 pt-10 pb-4" style={{ gap: 12 }}>
        <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <VStack>
            <Text className="text-[#0F172A] text-2xl font-extrabold tracking-tight">Historial de Eventos</Text>
            <Text className="text-slate-500 text-xs font-medium">Revisa las grabaciones y asistencias de eventos pasados</Text>
          </VStack>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Icon as={ICONS.ChevronLeft} style={{ color: '#475569', width: 20, height: 20 }} />
          </TouchableOpacity>
        </HStack>

        {/* Search Input */}
        <HStack className="bg-slate-50 border border-slate-200 rounded-xl px-3 items-center h-11" style={{ gap: 8 }}>
          <Icon as={ICONS.Search} style={{ color: '#94A3B8', width: 18, height: 18 }} />
          <TextInput
            placeholder="Buscar eventos del historial..."
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Icon as={ICONS.X} style={{ color: '#94A3B8', width: 16, height: 16 }} />
            </TouchableOpacity>
          )}
        </HStack>
      </VStack>

      {/* Categories Horizontal Scroll */}
      <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8 }}
        >
          {listaFiltrosEstado.map((cat) => {
            const activo = filtroEstado === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setFiltroEstado(cat);
                  setBusqueda('');
                }}
                style={[styles.categoryBadge, activo && styles.categoryBadgeActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryBadgeText, activo && styles.categoryBadgeTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {filtroEstado === 'Finalizados' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8, marginTop: 10 }}
          >
            {listaFiltrosConstancia.map((cat) => {
              const activo = filtroConstancia === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFiltroConstancia(cat)}
                  style={[styles.categoryBadge, activo && styles.categoryBadgeActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryBadgeText, activo && styles.categoryBadgeTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Main List */}
      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : filtrados.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refrescar} onRefresh={handleRefresh} colors={['#6366F1']} />}
        >
          <Icon as={ICONS.CalendarDays} style={{ color: '#CBD5E1', width: 48, height: 48, marginBottom: 12 }} />
          <Text style={styles.emptyText}>No tienes eventos registrados</Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: HPAD, paddingTop: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refrescar} onRefresh={handleRefresh} colors={['#6366F1']} />}
        >
          <View style={styles.gridContainer}>
            {filtrados.map((ev) => {
              const insignias = eventStateManager.getInsignias(ev.id);
              const hasVideo = !!(ev.raw?.grabacionUrl || (ev as any).grabacionUrl);

              return (
                <View key={ev.id} style={{ width: cardWidth, marginBottom: GAP }}>
                  <TouchableOpacity onPress={() => setEventoSeleccionado(ev)} activeOpacity={0.9}>
                    <EventCard 
                      evento={ev} 
                      favorito={false} 
                      onToggleFavorito={() => {}} 
                      onVerDetalle={(evento) => setEventoSeleccionado(evento)}
                      style={{ borderBottomWidth: 0 }}
                    />
                    {/* Add a finished indicator overlay / footer */}
                    <View style={styles.cardFooter}>
                      <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <HStack style={{ gap: 4, alignItems: 'center' }}>
                          <View style={[styles.dot, (insignias.ingreso && insignias.salida) ? styles.dotGreen : styles.dotGray]} />
                          <Text style={styles.statusText}>
                            {(insignias.ingreso && insignias.salida) ? 'Asistencia Completa' : (ev.estado === 'FINISHED' ? 'Finalizado' : 'Inscrito')}
                          </Text>
                        </HStack>
                        {hasVideo && (
                          <HStack style={{ gap: 4, alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Icon as={ICONS.Play} style={{ color: '#4F46E5', width: 10, height: 10 }} />
                            <Text style={styles.videoText}>Grabación</Text>
                          </HStack>
                        )}
                      </HStack>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Details Modal */}
      <HistoryDetailModal
        visible={!!eventoSeleccionado}
        evento={eventoSeleccionado}
        onClose={() => setEventoSeleccionado(null)}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
    padding: 0,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBadgeActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryBadgeTextActive: {
    color: '#4F46E5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  cardFooter: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
    marginTop: -10, // Adjust overlap with EventCard container spacing
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotGray: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  videoText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
});
