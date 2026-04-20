import EditScreenInfo from '@/components/EditScreenInfo';
import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';
import { Icon } from '@/components/ui/icon';


const INTERESES = [
    { id: 1, name: 'TECNOLOGÍA', icon: ICONS.cpu, active: true, color: 'text-cyan-400', borderColor: 'border-cyan-400' },
    { id: 2, name: 'ARTE', icon: ICONS.palette, active: false, color: 'text-gray-400', borderColor: 'border-white/10' },
    { id: 3, name: 'GASTRONOMÍA', icon: ICONS.utensils, active: true, color: 'text-green-400', borderColor: 'border-green-400' },
    { id: 4, name: 'EMPRENDIMIENTO', icon: ICONS.rocket, active: true, color: 'text-pink-500', borderColor: 'border-pink-500' },
    { id: 5, name: 'MÚSICA', icon: ICONS.music, active: false, color: 'text-gray-400', borderColor: 'border-white/10' },
    { id: 6, name: 'AÑADIR', icon: ICONS.plus, active: false, color: 'text-gray-500', borderColor: 'border-white/5', isDashed: true },
];

export default function Tab4() {
    const [radius, setRadius] = useState(25);
    return (
        <ScrollView
            className="flex-1 bg-[#070B17]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 60 }}
        >
            {/* --- TOP BAR --- */}


            {/* --- SECCIÓN DE PERFIL --- */}
            <VStack className="items-center mb-10 w-full">
                <Box className="relative mb-4">
                    <Box className="w-28 h-28 rounded-full border-2 border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/30 bg-[#0D1324]">
                        <Text className="text-5xl">👨🏻‍💻</Text>
                    </Box>

                    <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan-400 items-center justify-center border-2 border-[#070B17]">
                        {/* Icono de Editar actualizado */}
                        <ICONS.radio color="#22d3ee" size={18} strokeWidth={2.5} />
                    </TouchableOpacity>
                </Box>

                <Text className="text-white text-2xl font-bold mb-1">Alex Rivera</Text>
                <Text className="text-gray-400 text-sm">Conectando realidades digitales</Text>
            </VStack>

            {/* --- SECCIÓN INTERESES --- */}
            <VStack className="w-full mb-8">
                <HStack className="justify-between items-end mb-4">
                    <Text className="text-cyan-400 font-bold tracking-widest text-xs">
                        INTERESES DE PULSO
                    </Text>
                    <Text className="text-gray-500 text-[10px] font-bold tracking-widest">
                        5 SELECCIONADOS
                    </Text>
                </HStack>

                <HStack className="flex-wrap justify-between" style={{ gap: 12 }}>
                    {INTERESES.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className={`w-[48%] py-4 rounded-2xl items-center justify-center bg-[#0D1324] border ${item.borderColor} ${item.isDashed ? 'border-dashed' : 'border-solid'}`}
                        >
                            <Icon
                                as={item.icon}
                                className={`mb-2 w-5 h-5 ${item.color}`}
                            />
                            <Text className={`text-[10px] font-bold tracking-widest uppercase ${item.color}`}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>
            </VStack>

            {/* --- SECCIÓN DEL SLIDER --- */}
            <Box className="w-full bg-[#0D1324] rounded-3xl p-6 border border-white/5 mb-8 shadow-sm">
                <HStack className="items-center mb-6">
                    {/* Icono de Crosshair actualizado */}
                    <Icon as={ICONS.crosshair} color="#22d3ee" className="w-[18px] h-[18px] mr-2" />
                    <Text className="text-white font-bold text-base flex-1">Radio de Búsqueda</Text>
                    <HStack className="items-baseline">
                        <Text className="text-cyan-400 font-bold text-2xl mr-1">{radius}</Text>
                        <Text className="text-gray-500 font-bold text-xs tracking-widest">KM</Text>
                    </HStack>
                </HStack>

                <Slider
                    value={radius}
                    onChange={(v) => setRadius(Math.floor(v))}
                    minValue={1}
                    maxValue={100}
                    size="md"
                    orientation="horizontal"
                    className="mb-4"
                >
                    <SliderTrack className="bg-white/10 rounded-full h-1">
                        <SliderFilledTrack className="bg-cyan-400" />
                    </SliderTrack>
                    <SliderThumb className="bg-cyan-400 border-4 border-[#0D1324] w-6 h-6 shadow-md shadow-cyan-400/50" />
                </Slider>

                <HStack className="justify-between">
                    <Text className="text-gray-500 text-[9px] font-bold tracking-widest">CERCANO</Text>
                    <Text className="text-gray-500 text-[9px] font-bold tracking-widest">REGIONAL</Text>
                    <Text className="text-gray-500 text-[9px] font-bold tracking-widest">GLOBAL</Text>
                </HStack>
            </Box>

            {/* --- BOTONES DE ACCIÓN --- */}
            <VStack space="md" className="w-full">
                <Button
                    size="xl"
                    className="w-full bg-cyan-400 rounded-2xl shadow-lg shadow-cyan-400/30"
                >
                    <ButtonText className="text-[#070B17] font-bold tracking-widest text-sm">
                        GUARDAR CONFIGURACIÓN
                    </ButtonText>
                </Button>

                <Button
                    variant="link"
                    size="lg"
                    className="w-full"
                >
                    <ButtonText className="text-gray-400 font-bold tracking-widest text-xs">
                        RESTABLECER VALORES
                    </ButtonText>
                </Button>
            </VStack>
        </ScrollView>
    );
}
