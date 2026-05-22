import RadarRing from '@/components/animations/RadarRing';
import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from 'react-native';

const RadarScreen = () => {
    return (

        <ScrollView
            className="flex-1 bg-[#070B17]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                // ESTILOS DEL CONTENEDOR INTERNO DEL SCROLL
                flexGrow: 1,
                paddingHorizontal: 16, // Equivalente a px-4
                paddingTop: 32,        // Equivalente a pt-8
                paddingBottom: 40      // Espacio extra abajo para que no quede pegado al borde
            }}
        >

            {/* --- ZONA DEL RADAR ANIMADO --- */}

            <Box className="w-full min-h-[380px] relative items-center justify-center overflow-hidden mb-6">

                <RadarRing size={350} delay={0} />
                <RadarRing size={350} delay={1000} />
                <RadarRing size={350} delay={2000} />

                <Box className="w-12 h-12 rounded-full bg-[#0D182E] border-2 border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/50 z-10">
                    <Icon as={ICONS.webhook} className="text-cyan-300 w-5 h-5" />
                </Box>

            </Box>

            {/* --- SECCIÓN DE OPORTUNIDADES --- */}
            {/* VStack (Vertical Stack) apila elementos de arriba hacia abajo automáticamente */}
            <VStack space="md" className="w-full">
                <Box className="mb-4">
                    {/* Título de la sección */}
                    <Text className="text-white text-2xl font-bold">Eventos cerca</Text>
                </Box>

                {/* CARD DESTACADO (Layout Horizontal) */}

                <Box className="w-full rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-4 flex-row items-center justify-between shadow-sm">
                    {/* HStack (Horizontal Stack) alinea icono y textos de izquierda a derecha */}
                    <HStack space="md" className="items-center flex-1">
                        <Box className="w-12 h-12 rounded-2xl bg-[#2A163D] border border-[#5B2A86] items-center justify-center">
                            <Text className="text-pink-400 text-base">⭐</Text>
                        </Box>
                        {/* Contenedor de Textos */}
                        <VStack className="flex-1">
                            <Text className="text-pink-500 text-xs font-bold tracking-wide">
                                DESTACADO
                            </Text>
                            <Text className="text-gray-200 text-sm">
                                A 200m • 50+ asistentes confirmados
                            </Text>
                        </VStack>
                    </HStack>
                    {/* Flecha indicadora de navegación */}
                    <Text className="text-gray-500 text-lg">{'>'}</Text>
                </Box>

                {/* GRID SECUNDARIO (Tarjetas divididas) */}
                <HStack className="w-full justify-between">
                    <Box className="w-[48.5%] rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-5">
                        {/* Tarjeta Izquierda (Ancho calculado al 48.5% para dejar un pequeño margen central) */}
                        <VStack space="sm">
                            <HStack className="items-center justify-between">
                                <Icon as={ICONS.shoppingBag} className="text-orange-300 w-5 h-5" />
                                <Text className="text-[10px] font-bold text-lime-400">NUEVO</Text>
                            </HStack>

                            <Text className="text-white text-base font-semibold">
                                Promoción Local
                            </Text>

                            <Text className="text-gray-500 text-xs">
                                2x1 en barra principal
                            </Text>
                        </VStack>
                    </Box>
                    {/* Tarjeta Derecha */}
                    <Box className="w-[48.5%] rounded-3xl border border-white/10 bg-[#0D1324] px-4 py-5">
                        <VStack space="sm">
                            <HStack className="items-center justify-between">
                                <Icon as={ICONS.wifi} className="text-cyan-300 w-5 h-5" />
                                <Text className="text-[10px] font-bold text-cyan-400">CERCA</Text>
                            </HStack>

                            <Text className="text-white text-base font-semibold">
                                Conexiones
                            </Text>

                            <Text className="text-gray-500 text-xs">
                                3 Inversores a tu alrededor
                            </Text>
                        </VStack>
                    </Box>
                </HStack>
            </VStack>

        </ScrollView>
    );
}
export default RadarScreen;