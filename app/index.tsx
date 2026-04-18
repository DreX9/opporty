import React from 'react';
import Gradient from '@/assets/icons/Gradient';
import Logo from '@/assets/icons/Logo';
import { Box } from '@/components/ui/box';
import { ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input'
import { LinearGradient } from 'expo-linear-gradient'

//icon

import { Icon } from '@/components/ui/icon';

import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ICONS } from '@/components/icons';

export default function Home() {
  const router = useRouter();
  return (
    <Box className="flex-1 bg-background-500 items-center justify-center px-6">

      {/* 🔵 HEADER */}
      <Text className="text-2xl font-bold text-white mb-6">
        AETHERIS <Text className="text-primary-500">PULSE</Text>
      </Text>

      {/* 🧱 CARD */}
      <Box className="w-full bg-[#1A2235] p-6 rounded-3xl flex-[0.5] justify-center">

        {/* INPUT EMAIL */}
        <Box className='flex-row'>
          <Icon as={ICONS.lock} className='pr-10'/>
        <Text className="text-gray-400 mb-2">Operator Identity</Text>
        </Box>
        <Input className="mb-4 h-16 rounded-2xl">
          <InputField placeholder="ID / Email" />
        </Input>

        {/* INPUT PASSWORD */}
        <Text className="text-gray-400 mb-2">Access Protocol</Text>
        <Input className="mb-6 h-16 rounded-2xl">
          <InputField placeholder="••••••••••" secureTextEntry />
        </Input>

        {/* 🔥 BOTÓN CON GRADIENT */}
        <LinearGradient
          colors={['#00E5FF', '#00B8D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
           borderRadius: 8,
  overflow: 'hidden',
          }}
        >
          <Button className="bg-transparent w-full"
          variant="solid" size="xl"
          onPress={() => router.push('/tabs/tab1')}

          
          >
            <ButtonText className="text-black font-bold">
              Inicie Sesión
            </ButtonText>
          </Button>
        </LinearGradient>
          
      </Box>
      <Text className='p-6'>Net to the radar network?</Text>

    </Box>
  );
}
