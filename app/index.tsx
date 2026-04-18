import React from 'react';
import Gradient from '@/assets/icons/Gradient';
import Logo from '@/assets/icons/Logo';
import { Box } from '@/components/ui/box';
import { ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';

//icon

import { Icon } from '@/components/ui/icon';

import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ICONS } from '@/components/icons';

export default function Home() {
  const router = useRouter();
  return (
    <Box className="flex-1 bg-white dark:bg-background-500 items-center justify-center gap-6">

      {/* 🔵 Icono */}
      <Box className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center">
        <Icon as={ICONS.webhook} className="w-12 h-12 text-black dark:text-black" />
      </Box>

      {/* 🔘 Botón */}
      <Button
        className="bg-primary-500 px-6 py-2 rounded-full"
        onPress={() => router.push('/tabs/tab1')}
      >
        <ButtonText className="text-black dark:text-black">
          Ir a Tabs
        </ButtonText>
      </Button>

    </Box>
  );
}
