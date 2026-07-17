import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupNotificationChannel } from '@/src/utils/pushNotifications';
import { notificationService } from '@/src/features/profile/services/notificationService';
import { useAuthState } from '@/src/features/auth/state';
import { Animated, StyleSheet, Image, View, Text, TouchableOpacity } from 'react-native';

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
    shouldShowBanner: false, // Ocultar el del sistema en primer plano para usar nuestro banner animado
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

  // Estado para la notificación in-app activa
  const [activeNotif, setActiveNotif] = useState<{
    id: string;
    title: string;
    message: string;
    eventId?: string;
  } | null>(null);

  // Valor animado para la posición Y
  const translateY = useRef(new Animated.Value(-200)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = (title: string, message: string, eventId?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setActiveNotif({
      id: Math.random().toString(),
      title,
      message,
      eventId,
    });

    // Deslizar hacia abajo (entrada)
    Animated.spring(translateY, {
      toValue: 50, // Ubicación superior flotante
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    // Auto-ocultar tras 6 segundos
    timeoutRef.current = setTimeout(() => {
      hideBanner();
    }, 6000);
  };

  const hideBanner = () => {
    Animated.timing(translateY, {
      toValue: -200, // Deslizar hacia arriba (salida)
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveNotif(null);
    });
  };

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
      const title = notification.request.content.title || 'Nueva Notificación';
      const body = notification.request.content.body || '';
      const eventId = notification.request.content.data?.eventId;
      showBanner(title, body, eventId ? String(eventId) : undefined);
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authState.token]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <ThemeProvider value={MyDarkTheme}>
          <StatusBar style="light" />
          <Box className="flex-1 dark bg-background-500">
            <Slot />

            {/* Banner Flotante de Notificaciones In-App */}
            {activeNotif && (
              <Animated.View style={[styles.bannerContainer, { transform: [{ translateY }] }]}>
                {/* Cabecera (Estilo Push iOS) */}
                <View style={styles.bannerHeader}>
                  <View style={styles.bannerHeaderLeft}>
                    <View style={styles.bannerIconContainer}>
                      <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.bannerAppIcon}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.bannerAppName}>ECHO</Text>
                  </View>
                  <Text style={styles.bannerTime}>Ahora</Text>
                </View>

                {/* Cuerpo del Banner */}
                <View style={styles.bannerBody}>
                  <Text style={styles.bannerTitle} numberOfLines={1}>
                    {activeNotif.title}
                  </Text>
                  <Text style={styles.bannerDescription} numberOfLines={2}>
                    {activeNotif.message}
                  </Text>

                  {/* Botones de Acción */}
                  <View style={styles.bannerActions}>
                    <TouchableOpacity
                      onPress={hideBanner}
                      style={styles.bannerBtnSec}
                    >
                      <Text style={styles.bannerBtnSecText}>Entendido</Text>
                    </TouchableOpacity>

                    {activeNotif.eventId && (
                      <TouchableOpacity
                        onPress={() => {
                          hideBanner();
                          const eventIdStr = activeNotif.eventId;
                          const role = authState.role;
                          const hasAdminAccess = role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER';
                          router.push({
                            pathname: hasAdminAccess ? '/tabs/admin' : '/tabs/event',
                            params: hasAdminAccess 
                              ? { tab: 'eventos', openEventId: eventIdStr }
                              : { openEventId: eventIdStr }
                          });
                        }}
                        style={styles.bannerBtnPri}
                      >
                        <Text style={styles.bannerBtnPriText}>Revisar Detalle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}
          </Box>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    backgroundColor: '#A78BFA', // uniradar-violet
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 99999,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerAppIcon: {
    width: 16,
    height: 16,
  },
  bannerAppName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E1065', // violet-950
    letterSpacing: 1.2,
  },
  bannerTime: {
    fontSize: 11,
    color: '#4C1D95', // violet-800
    fontWeight: '600',
  },
  bannerBody: {
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1B4B', // indigo-950
    marginBottom: 4,
    lineHeight: 18,
  },
  bannerDescription: {
    fontSize: 13,
    color: '#312E81', // indigo-900
    lineHeight: 18,
    fontWeight: '500',
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  bannerBtnSec: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBtnSecText: {
    color: '#1E1B4B',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerBtnPri: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bannerBtnPriText: {
    color: '#2E1065',
    fontSize: 12,
    fontWeight: '800',
  },
});