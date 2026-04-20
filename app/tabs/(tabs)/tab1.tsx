import RadarRing from '@/components/animations/Radar';
import EditScreenInfo from '@/components/EditScreenInfo';
import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';

export default function Tab2() {
  return (
    <ScrollView
      className="flex-1 bg-[#070B17]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16, // Equivalente a px-4
        paddingTop: 32,        // Equivalente a pt-8
        paddingBottom: 40      // Espacio extra abajo para que no quede pegado al borde
      }}
    >

      {/* --- ZONA DEL RADAR ANIMADO --- */}
      {/* 2. Quitamos flex-[1] y usamos min-h-[380px] para asegurar que los anillos de 350px quepan */}
      <Box className="w-full min-h-[380px] relative items-center justify-center overflow-hidden mb-6">

        <RadarRing size={350} delay={0} />
        <RadarRing size={350} delay={1000} />
        <RadarRing size={350} delay={2000} />

        <Box className="w-12 h-12 rounded-full bg-[#0D182E] border-2 border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/50 z-10">
          <Icon as={ICONS.webhook} className="text-cyan-300 w-5 h-5" />
        </Box>

      </Box>

      {/* --- SECCIÓN DE OPORTUNIDADES --- */}
      {/* 3. Quitamos flex-1 del VStack para que tome su altura natural */}
      <VStack space="md" className="w-full">
        <Box className="mb-4">
          <Text className="text-white text-2xl font-bold">Eventos cerca</Text>
        </Box>

        {/* Card destacado */}
        <Box className="w-full rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-4 flex-row items-center justify-between shadow-sm">
          <HStack space="md" className="items-center flex-1">
            <Box className="w-12 h-12 rounded-2xl bg-[#2A163D] border border-[#5B2A86] items-center justify-center">
              <Text className="text-pink-400 text-base">⭐</Text>
            </Box>

            <VStack className="flex-1">
              <Text className="text-pink-500 text-xs font-bold tracking-wide">
                DESTACADO
              </Text>
              <Text className="text-gray-200 text-sm">
                Evento Tech Global en 200m
              </Text>
            </VStack>
          </HStack>
          <Text className="text-gray-500 text-lg">{'>'}</Text>
        </Box>

        {/* Grid */}
        <HStack className="w-full justify-between">
          <Box className="w-[48.5%] rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-5">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-lg">🛍️</Text>
                <Text className="text-[10px] font-bold text-lime-400">NUEVO</Text>
              </HStack>

              <Text className="text-white text-base font-semibold">
                2 Ofertas Pro
              </Text>

              <Text className="text-gray-500 text-xs">
                Suscripciones 40% OFF
              </Text>
            </VStack>
          </Box>

          <Box className="w-[48.5%] rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-5">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-lg">🌐</Text>
                <Text className="text-[10px] font-bold text-cyan-400">CERCA</Text>
              </HStack>

              <Text className="text-white text-base font-semibold">
                Networking
              </Text>

              <Text className="text-gray-500 text-xs">
                3 Perfiles activos
              </Text>
            </VStack>
          </Box>
        </HStack>
      </VStack>

    </ScrollView>
  );
}
