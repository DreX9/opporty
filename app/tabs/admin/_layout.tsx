import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#6366F1',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#111827',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="crear-evento"
        options={{
          title: 'Crear Evento',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="crear-usuario"
        options={{
          title: 'Crear Usuario',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
