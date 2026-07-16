import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupNotificationChannel } from '@/src/utils/pushNotifications';
import { notificationService } from '@/src/features/profile/services/notificationService';
import { useAuthState } from '@/src/features/auth/state';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

// Configurar cómo se muestran las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

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
  const router = useRouter();
  const authState = useAuthState();

  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Solo registrar push cuando el usuario está autenticado
    if (!authState.token) {
      return;
    }

    // Configurar canal de notificaciones en Android
    setupNotificationChannel();

    // Registrar para push y enviar token al backend
    registerForPushNotificationsAsync().then((pushToken) => {
      if (pushToken) {
        notificationService.savePushToken(pushToken);
      }
    });

    // Listener: cuando llega una notificación y la app está abierta (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Push] Notificación recibida en foreground:', notification.request.content.title);
    });

    // Listener: cuando el usuario PRESIONA la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[Push] Usuario presionó notificación. Data:', data);

      // Redirigir según los datos de la notificación
      if (data?.eventId) {
        // Navegar a la pantalla de evento
        router.push('/tabs/(tabs)/event');
      } else if (data?.screen === 'notifications') {
        router.push('/tabs/(tabs)/profile');
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [authState.token]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <ThemeProvider value={MyDarkTheme}>
          <StatusBar style="light" />
          <Box className="flex-1 dark bg-background-500">
            <Slot />
          </Box>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}