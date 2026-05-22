import React from 'react';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { View } from 'react-native';

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
function HeaderTitle({ label }: { label: string }) {
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

// ─── Avatar de usuario (cabecera derecha del Radar) ──────────────────────────
function UserAvatar() {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}
    >
      <Icon as={ICONS.user} style={{ color: '#FFFFFF', width: 18, height: 18 }} />
    </View>
  );
}

// ─── Opciones compartidas de header ──────────────────────────────────────────
const sharedHeaderOptions = {
  headerStyle: { backgroundColor: C.headerBg },
  headerShadowVisible: false,
  headerTitleAlign: 'left' as const,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        // ── Tab bar ──────────────────────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: C.tabBg,
          borderTopColor: C.headerBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
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
          headerTitle: () => <HeaderTitle label="Hola, Administrador" />,
          headerRight: () => <UserAvatar />,
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
          tabBarIcon: ({ color }) => (
            <Icon as={ICONS.Search} style={{ color, width: 22, height: 22 }} />
          ),
        }}
      />

      {/* ── ADMIN ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="admin"
        options={{
          tabBarLabel: 'Admin',
          ...sharedHeaderOptions,
          headerTitle: () => <HeaderTitle label="Administrar" />,
          tabBarIcon: ({ color }) => (
            <Icon as={ICONS.badgePlus} style={{ color, width: 22, height: 22 }} />
          ),
        }}
      />

      {/* ── PERFIL ────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Perfil',
          ...sharedHeaderOptions,
          headerTitle: () => <HeaderTitle label="Mi Perfil" />,
          tabBarIcon: ({ color }) => (
            <Icon as={ICONS.user} style={{ color, width: 22, height: 22 }} />
          ),
        }}
      />
    </Tabs>
  );
}
