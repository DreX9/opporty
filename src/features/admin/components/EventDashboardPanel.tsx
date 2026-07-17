import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { eventService } from '../../event/services/eventService';
import { RegistrationBackend } from '../../event/types/api';

// Habilitar animaciones de diseño en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Iconos locales con Lucide
import {
  Users,
  CheckCircle,
  Clock,
  RotateCcw,
  Smile,
  LogOut,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react-native';

interface EventDashboardPanelProps {
  eventId: string | number;
}

type FilterStatus = 'ALL' | 'CHECKED_IN' | 'CHECKED_OUT' | 'PENDING' | 'INSIDE';

export default function EventDashboardPanel({ eventId }: EventDashboardPanelProps) {
  const [registrations, setRegistrations] = useState<RegistrationBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Estados para la lista colapsable y filtros
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const fetchStats = useCallback(async (showIndicator = false) => {
    if (showIndicator) setRefreshing(true);
    try {
      const data = await eventService.fetchEventRegistrations(Number(eventId));
      setRegistrations(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching event dashboard stats:', err);
      // Evitamos sobreescribir con error si ya teníamos datos cargados previamente
      if (registrations.length === 0) {
        setError('No se pudieron cargar las estadísticas de asistencia.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, registrations.length]);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh cada 15 segundos
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const toggleList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsListExpanded(!isListExpanded);
  };

  if (loading) {
    return (
      <Box style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando panel de control...</Text>
      </Box>
    );
  }

  // Filtrar cancelados y rechazados
  const activeRegistrations = registrations.filter(
    r => r.attendanceStatus !== 'CANCELLED' && r.attendanceStatus !== 'REJECTED'
  );

  // Cálculos de métricas
  const total = activeRegistrations.length;
  const checkedIn = activeRegistrations.filter(r => r.qrEntryScanned || r.attendanceStatus === 'CHECKED_IN' || r.attendanceStatus === 'COMPLETED').length;
  const checkedOut = activeRegistrations.filter(r => r.qrExitScanned || r.attendanceStatus === 'COMPLETED').length;
  const pending = total - checkedIn;
  const inside = checkedIn - checkedOut;

  // Porcentajes para las barras de progreso
  const entryPercentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const exitPercentage = checkedIn > 0 ? Math.round((checkedOut / checkedIn) * 100) : 0;

  // Filtrar lista de asistentes
  const filteredAttendees = activeRegistrations.filter(r => {
    const matchesSearch = 
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isEntry = r.qrEntryScanned || r.attendanceStatus === 'CHECKED_IN' || r.attendanceStatus === 'COMPLETED';
    const isExit = r.qrExitScanned || r.attendanceStatus === 'COMPLETED';

    if (filterStatus === 'CHECKED_IN') return isEntry;
    if (filterStatus === 'CHECKED_OUT') return isExit;
    if (filterStatus === 'PENDING') return !isEntry;
    if (filterStatus === 'INSIDE') return isEntry && !isExit;
    return true;
  });

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <VStack style={styles.container}>
      {/* Cabecera del Panel */}
      <HStack style={styles.header}>
        <VStack style={{ flex: 1 }}>
          <HStack style={{ alignItems: 'center', gap: 6 }}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>Panel de Asistencia en Vivo</Text>
          </HStack>
          <Text style={styles.headerSubtitle}>
            Act: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </VStack>
        <TouchableOpacity 
          onPress={() => fetchStats(true)} 
          style={styles.refreshBtn}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <RotateCcw size={15} color="#6366F1" />
          )}
        </TouchableOpacity>
      </HStack>

      {error ? (
        <Box style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchStats(); }} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </Box>
      ) : (
        <VStack style={{ gap: 14 }}>
          {/* Fila 1 de Métricas */}
          <HStack style={styles.gridRow}>
            <Box style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
              <Box style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
                <Users size={16} color="#6366F1" />
              </Box>
              <Text style={[styles.statValue, { color: '#6366F1' }]}>{total}</Text>
              <Text style={styles.statLabel}>Registrados</Text>
            </Box>

            <Box style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
              <Box style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle size={16} color="#10B981" />
              </Box>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{checkedIn}</Text>
              <Text style={styles.statLabel}>Ingresaron</Text>
            </Box>
          </HStack>

          {/* Fila 2 de Métricas */}
          <HStack style={styles.gridRow}>
            <Box style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
              <Box style={[styles.iconWrapper, { backgroundColor: '#F5F3FF' }]}>
                <LogOut size={16} color="#8B5CF6" />
              </Box>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{checkedOut}</Text>
              <Text style={styles.statLabel}>Salieron</Text>
            </Box>

            <Box style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
              <Box style={[styles.iconWrapper, { backgroundColor: '#FFFBEB' }]}>
                <Clock size={16} color="#F59E0B" />
              </Box>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pending}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </Box>
          </HStack>

          {/* Fila 3 - Único (Dentro del evento) */}
          <Box style={[styles.statCardSingle, { borderLeftColor: '#06B6D4' }]}>
            <HStack style={{ alignItems: 'center', gap: 12 }}>
              <Box style={[styles.iconWrapper, { backgroundColor: '#ECFEFF' }]}>
                <Smile size={18} color="#06B6D4" />
              </Box>
              <VStack style={{ flex: 1 }}>
                <Text style={styles.statLabelSingle}>Asistentes en Sala Activa</Text>
                <Text style={styles.statDescSingle}>Ingresaron pero no registran salida aún</Text>
              </VStack>
              <Text style={[styles.statValueSingle, { color: '#06B6D4' }]}>{inside}</Text>
            </HStack>
          </Box>

          {/* Barras de progreso */}
          <VStack style={styles.progressContainer}>
            <VStack style={{ gap: 4 }}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.progressLabel}>Porcentaje de Ingreso</Text>
                <Text style={styles.progressValue}>{entryPercentage}%</Text>
              </HStack>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${entryPercentage}%`, backgroundColor: '#10B981' }]} />
              </View>
            </VStack>

            <VStack style={{ gap: 4, marginTop: 6 }}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.progressLabel}>Retención / Salida</Text>
                <Text style={styles.progressValue}>{exitPercentage}%</Text>
              </HStack>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${exitPercentage}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
            </VStack>
          </VStack>

          {/* Lista Colapsable de Asistentes */}
          <VStack style={styles.attendeesBox}>
            <TouchableOpacity onPress={toggleList} style={styles.attendeesHeader} activeOpacity={0.7}>
              <HStack style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Text style={styles.attendeesHeaderTitle}>Lista de Asistentes ({filteredAttendees.length})</Text>
                {isListExpanded ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
              </HStack>
            </TouchableOpacity>

            {isListExpanded && (
              <VStack style={styles.attendeesContent}>
                {/* Buscador */}
                <HStack style={styles.searchBar}>
                  <Search size={14} color="#94A3B8" />
                  <TextInput
                    placeholder="Buscar alumno..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </HStack>

                {/* Filtros rápidos horizontales */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  <TouchableOpacity
                    onPress={() => setFilterStatus('ALL')}
                    style={[styles.filterChip, filterStatus === 'ALL' && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filterStatus === 'ALL' && styles.filterChipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterStatus('CHECKED_IN')}
                    style={[styles.filterChip, filterStatus === 'CHECKED_IN' && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filterStatus === 'CHECKED_IN' && styles.filterChipTextActive]}>Ingresaron</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterStatus('INSIDE')}
                    style={[styles.filterChip, filterStatus === 'INSIDE' && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filterStatus === 'INSIDE' && styles.filterChipTextActive]}>En Sala</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterStatus('CHECKED_OUT')}
                    style={[styles.filterChip, filterStatus === 'CHECKED_OUT' && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filterStatus === 'CHECKED_OUT' && styles.filterChipTextActive]}>Salieron</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterStatus('PENDING')}
                    style={[styles.filterChip, filterStatus === 'PENDING' && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filterStatus === 'PENDING' && styles.filterChipTextActive]}>Pendientes</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Lista de filas */}
                <VStack style={{ gap: 8, marginTop: 10, maxHeight: 220 }}>
                  <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {filteredAttendees.length > 0 ? (
                      filteredAttendees.map((attendee) => {
                        const hasEntry = attendee.qrEntryScanned || attendee.attendanceStatus === 'CHECKED_IN' || attendee.attendanceStatus === 'COMPLETED';
                        const hasExit = attendee.qrExitScanned || attendee.attendanceStatus === 'COMPLETED';

                        return (
                          <Box key={attendee.id} style={styles.attendeeRow}>
                            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <VStack style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.attendeeName}>{attendee.username}</Text>
                                <Text style={styles.attendeeEmail}>{attendee.userEmail}</Text>
                              </VStack>

                              {/* Status Badge */}
                              <Box style={[
                                styles.statusBadge,
                                hasExit ? { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' } :
                                hasEntry ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' } :
                                { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }
                              ]}>
                                <Text style={[
                                  styles.statusBadgeText,
                                  hasExit ? { color: '#7C3AED' } :
                                  hasEntry ? { color: '#059669' } :
                                  { color: '#D97706' }
                                ]}>
                                  {hasExit ? 'Salió' : hasEntry ? 'En sala' : 'Pendiente'}
                                </Text>
                              </Box>
                            </HStack>

                            {/* Horarios si existen */}
                            {(attendee.checkInAt || attendee.checkOutAt) && (
                              <HStack style={styles.rowTimes}>
                                {attendee.checkInAt && (
                                  <Text style={styles.rowTimeText}>
                                    Entrada: {formatTime(attendee.checkInAt)}
                                  </Text>
                                )}
                                {attendee.checkOutAt && (
                                  <Text style={styles.rowTimeText}>
                                    Salida: {formatTime(attendee.checkOutAt)}
                                  </Text>
                                )}
                              </HStack>
                            )}
                          </Box>
                        );
                      })
                    ) : (
                      <Box style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No se encontraron alumnos para los filtros aplicados.</Text>
                      </Box>
                    )}
                  </ScrollView>
                </VStack>
              </VStack>
            )}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    width: '100%',
  },
  loadingContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  loadingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 10,
  },
  statCardSingle: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 1,
  },
  statValueSingle: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabelSingle: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '800',
  },
  statDescSingle: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  progressValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  attendeesBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  attendeesHeader: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attendeesHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  attendeesContent: {
    padding: 10,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    fontSize: 11,
    color: '#1E293B',
    flex: 1,
    height: '100%',
    padding: 0,
  },
  filterScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#6366F1',
  },
  attendeeRow: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
  },
  attendeeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  attendeeEmail: {
    fontSize: 9,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rowTimes: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
    marginTop: 4,
    gap: 12,
  },
  rowTimeText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  }
});
