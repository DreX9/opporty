import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Icon } from '@/components/ui/icon';
import { useAuthState } from '@/src/features/auth/state';
import { ICONS } from '@/components/icons';
import { useEvents } from '@/src/features/event/hooks/useEvents';
import { useEventState } from '@/src/features/event/state';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { View, TouchableOpacity } from 'react-native';
import QrScannerModal from '@/src/features/event/components/QrScannerModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Paleta de la app ────────────────────────────────────────────────────────
const C = {
  headerBg: '#FFFFFF',
  headerBorder: '#F0F0F8',
  headerText: '#111827',
  accent: '#6366F1',          // uniradar-indigo
  tabBg: '#FFFFFF',
  tabActive: '#6366F1',       // uniradar-indigo
  tabInactive: '#9CA3AF',
};

// ─── Título de header reutilizable ───────────────────────────────────────────
function HeaderTitle({ label, subtitle }: { label: string; subtitle?: string }) {
  if (subtitle) {
    return (
      <View style={{ gap: 2, paddingLeft: 4 }}>
        <Text style={{ color: C.headerText, fontWeight: '800', fontSize: 20 }}>
          {label}
        </Text>
        <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13 }}>
          {subtitle}
        </Text>
      </View>
    );
  }
  
  return (
    <HStack style={{ alignItems: 'center', gap: 8 }}>
      <Icon
        as={ICONS.radar}
        style={{ color: C.accent, width: 22, height: 22 }}
      />
      <Text style={{ color: C.headerText, fontWeight: '700', fontSize: 17 }}>
        {label}
      </Text>
    </HStack>
  );
}

// ─── Cabecera derecha con botón QR y Avatar ──────────────────────────────────
function HeaderRightButtons({ onQrPress }: { onQrPress: () => void }) {
  return (
    <HStack style={{ alignItems: 'center', gap: 10, marginRight: 16 }}>
      {/* Botón Lector QR */}
      <TouchableOpacity
        onPress={onQrPress}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#EEF2FF', // light indigo background
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#E0E7FF',
        }}
      >
        <Icon as={ICONS.radar} style={{ color: '#6366F1', width: 18, height: 18 }} />
      </TouchableOpacity>

      {/* Avatar */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: C.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon as={ICONS.user} style={{ color: '#FFFFFF', width: 16, height: 16 }} />
      </View>
    </HStack>
  );
}

// ─── Opciones compartidas de header ──────────────────────────────────────────
const sharedHeaderOptions = {
  headerStyle: { backgroundColor: C.headerBg },
  headerShadowVisible: false,
  headerTitleAlign: 'left' as const,
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { role, payload } = useAuthState();
  const hasAdminAccess = role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER';
  const isAdmin = role === 'ADMIN';

  const { data: backendEvents } = useEvents();
  const eventState = useEventState();
  const solicitudesPendientes = React.useMemo(() => {
    if (!Array.isArray(backendEvents)) return 0;
    if (isAdmin) {
      return backendEvents.filter(e => e.estado === 'PENDING').length;
    }
    if (role === 'MANAGER' && payload?.sub) {
      return backendEvents.filter(e => 
        e.createdByUsername === payload.sub && 
        (e.estado === 'PUBLISHED' || e.estado === 'REJECTED') && 
        !eventState.readNotifications.has(String(e.id))
      ).length;
    }
    return 0;
  }, [backendEvents, isAdmin, role, payload?.sub, eventState.readNotifications]);

  const displayName = payload?.firstName && payload?.lastName
    ? `${payload.firstName} ${payload.lastName}`
    : (payload?.sub || 'Usuario');


  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: useClientOnlyValue(false, true),
          // ── Tab bar ──────────────────────────────────────────────────────────
          tabBarStyle: {
            backgroundColor: C.tabBg,
            borderTopColor: C.headerBorder,
            borderTopWidth: 1,
            height: 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
          tabBarActiveTintColor: C.tabActive,
          tabBarInactiveTintColor: C.tabInactive,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        {/* ── RADAR ─────────────────────────────────────────────────────────── */}
        <Tabs.Screen
          name="radar"
          options={{
            tabBarLabel: 'Radar',
            ...sharedHeaderOptions,
            headerTitle: () => <HeaderTitle label={`Hola, ${displayName}`} subtitle={isAdmin ? "Panel Administrador" : "Universidad Demo"} />,
            headerRight: () => <HeaderRightButtons onQrPress={() => setIsQrOpen(true)} />,
            tabBarIcon: ({ color }) => (
              <Icon as={ICONS.radar} style={{ color, width: 22, height: 22 }} />
            ),
          }}
        />

        {/* ── EVENTOS ───────────────────────────────────────────────────────── */}
        <Tabs.Screen
          name="event"
          options={{
            tabBarLabel: 'Eventos',
            ...sharedHeaderOptions,
            headerTitle: () => <HeaderTitle label="Buscar Eventos" />,
            headerRight: () => <HeaderRightButtons onQrPress={() => setIsQrOpen(true)} />,
            tabBarIcon: ({ color }) => (
              <Icon as={ICONS.Search} style={{ color, width: 22, height: 22 }} />
            ),
          }}
        />

        {/* ── ADMIN ─────────────────────────────────────────────────────────── */}
        <Tabs.Screen
          name="admin"
          options={{
            href: hasAdminAccess ? undefined : null,
            tabBarLabel: 'Admin',

            ...sharedHeaderOptions,
            headerTitle: () => <HeaderTitle label="Administrar" />,
            tabBarIcon: ({ color }) => (
              <Icon as={ICONS.badgePlus} style={{ color, width: 22, height: 22 }} />
            ),
          }}
        />

// ─── PERFIL ──────────────────────────────────────────────────────────
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Perfil',
            ...sharedHeaderOptions,
            headerTitle: () => <HeaderTitle label="Mi Perfil" />,
            tabBarIcon: ({ color }) => (
              <View style={{ position: 'relative' }}>
                <Icon as={ICONS.user} style={{ color, width: 22, height: 22 }} />
                {solicitudesPendientes > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#EF4444',
                    borderWidth: 1,
                    borderColor: '#FFFFFF',
                  }} />
                )}
              </View>
            ),
          }}
        />
      </Tabs>

      {/* Modal Lector QR global */}
      <QrScannerModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onSelectEvent={(eventId) => {
          setSelectedEventId(eventId);
          // Puedes despachar eventos o pasar callbacks si es necesario
        }}
      />
    </>
  );
}
