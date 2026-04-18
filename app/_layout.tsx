import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fab, FabIcon } from '@/components/ui/fab';
import { MoonIcon, SunIcon, SlashIcon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#131927',
    card: '#0B101B',
    text: '#FFFFFF',
    primary: '#00E5FF',
  },
};

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#111111',
    primary: '#00E5FF',
  },
};



export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // const [styleLoaded, setStyleLoaded] = useState(false);
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const pathname = usePathname();
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>('system');

  // Determine effective color scheme
  const effectiveColorScheme = mode === 'system'
    ? (systemColorScheme ?? 'light')
    : mode;

  const handleToggleTheme = () => {
    if (mode === 'system') {
      setMode('light');
    } else if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('system');
    }
  };

  return (
    <GluestackUIProvider mode={mode}>
      <ThemeProvider value={effectiveColorScheme === 'dark' ? MyDarkTheme : MyLightTheme}>
        <Box
          className={`flex-1 ${effectiveColorScheme === 'dark'
              ? 'dark bg-background-500'
              : 'bg-white'
            }`}
        >
          <Slot />
        </Box>
        {pathname === '/' && (
          <Fab
            onPress={handleToggleTheme}
            className="m-6"
            size="lg"
          >
            <FabIcon as={mode === 'system' ? SlashIcon : (effectiveColorScheme === 'dark' ? MoonIcon : SunIcon)} />
          </Fab>
        )}
      </ThemeProvider>
    </GluestackUIProvider>
  );
}