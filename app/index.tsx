import React from 'react';
import Gradient from '@/assets/icons/Gradient';
import Logo from '@/assets/icons/Logo';
import { Box } from '@/components/ui/box';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="bg-white dark:bg-background-500"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24, // Equivale a px-6
          paddingVertical: 40    // Espacio extra para que se vea bien al hacer scroll en horizontal
        }}
      >
        {/* Contenedor centralizado y con ancho máximo para que no se estire feo en horizontal */}
        <Box className="w-full max-w-[400px] items-center">

          {/* 🔵 HEADER */}
          <Box className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-4">
            <Icon as={ICONS.webhook} className="w-12 h-12 text-black dark:text-black" />
          </Box>

          <Text className="text-2xl font-bold text-black dark:text-white mb-6">
            OPPORTY <Text className="text-primary-500">EVENT</Text>
          </Text>

          {/* 🧱 CARD */}
          {/* NOTA: Eliminé flex-[0.5] para que la tarjeta tome su tamaño natural en horizontal */}
          <Box className="w-full p-6 bg-[#F1F5F9] dark:bg-background-600 justify-center" style={{
            borderRadius: 20,
            shadowColor: '#00ffff',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 5
          }}>

            {/* INPUT EMAIL */}
            <Box className='flex-row items-center mb-2'>
              <Icon as={ICONS.user} className='mr-2' />
              <Text className="text-gray-400">Usuario</Text>
            </Box>
            <Input className="mb-4 h-16 rounded-2xl">
              <InputField placeholder="ID / Email" />
            </Input>

            {/* INPUT PASSWORD */}
            <Box className='flex-row items-center mb-2'>
              <Icon as={ICONS.lock} className='mr-2' />
              <Text className="text-gray-400">Contraseña</Text>
            </Box>
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

          {/* FOOTER */}
          <Box className='flex-row items-center mt-6'>
            <Text className='mr-2 dark:text-gray-300'>¿No tiene una cuenta?</Text>
            <Button variant="link" size="md" className="p-0">
              <ButtonText className='text-primary-500'>Crear cuenta</ButtonText>
            </Button>
          </Box>

        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

