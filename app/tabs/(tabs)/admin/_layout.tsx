import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#070B17',
        },
        headerTintColor: '#00E5FF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
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
