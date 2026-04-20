import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={18} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="tab1"
        options={{
          tabBarLabel: 'Radar',
          // funcion para el titulo y sus estilos
          headerTitle: () => (
            <HStack className="items-center">
              {/* Icono */}

              <Icon as={ICONS.radio} size="xl" className='text-cyan-400' />
              {/* Estilo del Texto */}
              <Text style={{
                fontFamily: 'Orbitron', // (o la fuente que instales)
                color: '#22d3ee',
                fontWeight: 'bold',
                fontSize: 16,
                letterSpacing: 3, // Esto separa las letras (efecto tracking)
                marginLeft: 8, // Separación entre el icono y el texto
                textShadowColor: 'rgba(34, 211, 238, 0.5)', // Brillo neón
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              }}>
                {/* Nombre del texto */}
                RADAR ACTIVO
              </Text>
            </HStack>
          ),
          tabBarIcon: ({ color }) => <Icon as={ICONS.radar} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tab2"
        options={{
          title: 'Tab 2',
          tabBarIcon: ({ color }) => <TabBarIcon name="star-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tab3"
        options={{
          title: 'Tab 3',
          tabBarIcon: ({ color }) => <TabBarIcon name="star-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tab4"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Icon as={ICONS.user} color={color} />,
        }}
      />
    </Tabs>
  );
}
