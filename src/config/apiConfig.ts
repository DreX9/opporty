import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determina el método de conexión preferido para el backend local.
// - "WIFI": Usa la IP detectada automáticamente por Expo (ideal para Expo Go sobre Wi-Fi).
// - "USB": Usa localhost (ideal para cable USB con 'adb reverse tcp:8080 tcp:8080').
// - "EMULATOR": Usa 10.0.2.2 (ideal para el emulador de Android Studio).
type ConnectionMethod = 'WIFI' | 'USB' | 'EMULATOR';

// MODO DE CONEXIÓN PREFERIDO:
// Puedes cambiar esto a 'USB' si usas cable con adb reverse, 'WIFI' para Expo Go sin cables,
// o dejarlo en 'AUTO' para detección inteligente.
const PREFERRED_METHOD: 'AUTO' | ConnectionMethod = 'AUTO';

const getBackendUrl = (): { url: string; method: string } => {
    // Si el usuario fuerza un método específico:
    if (PREFERRED_METHOD !== 'AUTO') {
        if (PREFERRED_METHOD === 'USB') {
            return { url: 'http://localhost:8080/api/v1', method: 'USB (Forzado)' };
        }
        if (PREFERRED_METHOD === 'EMULATOR') {
            return { url: 'http://10.0.2.2:8080/api/v1', method: 'Emulador Android (Forzado)' };
        }
        // Wifi
        const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
        const ip = hostUri ? hostUri.split(':')[0] : 'localhost';
        return { url: `http://${ip}:8080/api/v1`, method: 'Wi-Fi / Expo Go (Forzado)' };
    }

    // --- DETECCIÓN AUTOMÁTICA (AUTO) ---
    
    // 1. Si está ejecutándose mediante Expo Go (tanto Wi-Fi como cable),
    // expoConfig.hostUri contiene la IP local de la computadora (ej. 192.168.1.15:8081).
    // Esto funciona perfectamente en el 90% de los casos si están en la misma red Wi-Fi.
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
    
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        // Si la IP empieza con 127.0.0.1 o localhost, estamos en USB o simulador web/iOS
        if (ip === 'localhost' || ip === '127.0.0.1') {
            return { url: 'http://localhost:8080/api/v1', method: 'USB' };
        }
        return { url: `http://${ip}:8080/api/v1`, method: `Wi-Fi (Expo Go) en ${ip}` };
    }

    // 2. Si no hay hostUri y es Android, asumimos Emulador o USB reverse como fallback
    if (Platform.OS === 'android') {
        // En emulador estándar, 10.0.2.2 mapea a la PC host.
        // Si es un dispositivo real conectado por cable y corrieron `adb reverse tcp:8080 tcp:8080`,
        // localhost funcionará. Como adb reverse es sumamente común y recomendado para cable,
        // puedes usar localhost o 10.0.2.2.
        return { url: 'http://10.0.2.2:8080/api/v1', method: 'Emulador Android (Fallback)' };
    }

    // 3. iOS o Web
    return { url: 'http://localhost:8080/api/v1', method: 'USB / Localhost (Fallback)' };
};

const resolved = getBackendUrl();

export const API_URL = resolved.url;

console.log(`[API Config] Método: ${resolved.method} | Conectando con el backend en: ${API_URL}`);
