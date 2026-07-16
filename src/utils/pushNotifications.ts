import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Solicita permisos de notificaciones y obtiene el Expo Push Token.
 * 
 * Este token es el identificador único del dispositivo ante los servidores de Expo.
 * Se envía al backend para que pueda enviar push notifications a este dispositivo.
 * 
 * @returns El Expo Push Token o null si no se pudo obtener.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Las notificaciones push solo funcionan en dispositivos físicos
    if (!Device.isDevice) {
        console.warn('[Push] Las notificaciones push requieren un dispositivo físico.');
        return null;
    }

    // Verificar/solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('[Push] Permisos de notificación denegados.');
        return null;
    }

    // Obtener el token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });
        const token = tokenData.data;
        console.log('[Push] Expo Push Token obtenido:', token);
        return token;
    } catch (error) {
        console.error('[Push] Error al obtener el Expo Push Token:', error);
        return null;
    }
}

/**
 * Configura el canal de notificaciones para Android.
 * Los canales controlan el sonido, vibración y prioridad de las notificaciones.
 */
export async function setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Notificaciones',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#00E5FF',
            sound: 'default',
        });
    }
}
