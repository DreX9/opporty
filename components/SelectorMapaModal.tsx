import React, { useState, useEffect, useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

// Coordenadas iniciales por defecto (ej: Centro de Lima, Perú)
const LIMA_COORDS = {
    latitude: -12.046374,
    longitude: -77.042793,
};

interface SelectorMapaProps {
    visible: boolean;
    onClose: () => void;
    onUbicacionSeleccionada: (datos: { direccion: string; coords: { lat: number; lng: number } }) => void;
    initialCoords?: { latitude: number; longitude: number } | null;
}

export function SelectorMapaModal({ visible, onClose, onUbicacionSeleccionada, initialCoords }: SelectorMapaProps) {
    const webviewRef = useRef<WebView | null>(null);
    const [marcador, setMarcador] = useState<{ latitude: number; longitude: number } | null>(null);
    const [direccionTexto, setDireccionTexto] = useState('');
    const [cargandoDireccion, setCargandoDireccion] = useState(false);
    const [mapaCargado, setMapaCargado] = useState(false);

    // Obtener el nombre de la calle usando Nominatim (OpenStreetMap gratuito)
    const obtenerDireccionTexto = async (lat: number, lng: number) => {
        setCargandoDireccion(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: {
                    'User-Agent': 'OpportyApp/1.0',
                    'Accept-Language': 'es'
                }
            });
            const resultado = await response.json();
            
            if (resultado && resultado.address) {
                const { road, house_number, suburb, city, town } = resultado.address;
                const calle = road || '';
                const numero = house_number ? ` ${house_number}` : '';
                const distrito = suburb || city || town ? `, ${suburb || city || town}` : '';

                const direccionCompleta = `${calle}${numero}${distrito}`.trim() || resultado.display_name || "Ubicación seleccionada en mapa";
                setDireccionTexto(direccionCompleta);
            } else {
                setDireccionTexto("Ubicación seleccionada en mapa");
            }
        } catch (error) {
            console.error("Error Nominatim:", error);
            setDireccionTexto("Coordenadas seleccionadas");
        } finally {
            setCargandoDireccion(false);
        }
    };

    const moverMapaAMarcador = (lat: number, lng: number) => {
        if (webviewRef.current && mapaCargado) {
            webviewRef.current.injectJavaScript(`
                moverMarcador(${lat}, ${lng});
                true;
            `);
        }
    };

    useEffect(() => {
        if (!visible || !mapaCargado) return;

        const inicializarUbicacion = async () => {
            const isLimaDefault = initialCoords && 
                                  Math.abs(initialCoords.latitude - LIMA_COORDS.latitude) < 0.0001 && 
                                  Math.abs(initialCoords.longitude - LIMA_COORDS.longitude) < 0.0001;

            if (initialCoords && initialCoords.latitude !== 0 && initialCoords.longitude !== 0 && !isLimaDefault) {
                setMarcador(initialCoords);
                obtenerDireccionTexto(initialCoords.latitude, initialCoords.longitude);
                moverMapaAMarcador(initialCoords.latitude, initialCoords.longitude);
                return;
            }

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    const currentCoords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                    setMarcador(currentCoords);
                    obtenerDireccionTexto(currentCoords.latitude, currentCoords.longitude);
                    moverMapaAMarcador(currentCoords.latitude, currentCoords.longitude);
                } else {
                    usarDefaultLocation();
                }
            } catch (error) {
                console.warn('Ubicación actual no disponible (GPS apagado o sin permisos), usando por defecto.');
                usarDefaultLocation();
            }
        };

        const usarDefaultLocation = () => {
            setMarcador(null);
            setDireccionTexto('');
            if (webviewRef.current && mapaCargado) {
                webviewRef.current.injectJavaScript(`
                    if (marker) {
                        map.removeLayer(marker);
                        marker = null;
                    }
                    map.setView([${LIMA_COORDS.latitude}, ${LIMA_COORDS.longitude}], 13);
                    true;
                `);
            }
        };

        inicializarUbicacion();
    }, [visible, initialCoords, mapaCargado]);

    const manejarMensajeWebView = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_LOADED') {
                setMapaCargado(true);
            } else if (data.type === 'COORDS_SELECTED') {
                const { lat, lng } = data;
                setMarcador({ latitude: lat, longitude: lng });
                obtenerDireccionTexto(lat, lng);
            }
        } catch (e) {
            console.error("Error parseando mensaje de webview", e);
        }
    };

    const manejarConfirmar = () => {
        if (marcador) {
            onUbicacionSeleccionada({
                direccion: direccionTexto,
                coords: { lat: marcador.latitude, lng: marcador.longitude }
            });
            onClose();
            setMapaCargado(false); // Resetear estado
        }
    };
    
    const manejarCerrar = () => {
        onClose();
        setMapaCargado(false); // Resetear estado
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100vw; }
            .leaflet-control-attribution { display: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${LIMA_COORDS.latitude}, ${LIMA_COORDS.longitude}], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            var marker = null;

            function moverMarcador(lat, lng) {
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                    
                    marker.on('dragend', function(e) {
                        var position = marker.getLatLng();
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'COORDS_SELECTED',
                            lat: position.lat,
                            lng: position.lng
                        }));
                    });
                }
                map.setView([lat, lng], 15);
            }

            map.on('click', function(e) {
                var lat = e.latlng.lat;
                var lng = e.latlng.lng;
                moverMarcador(lat, lng);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'COORDS_SELECTED',
                    lat: lat,
                    lng: lng
                }));
            });

            // Notificar que el mapa cargó
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_LOADED' }));
        </script>
    </body>
    </html>
    `;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={manejarCerrar}>
            <View style={styles.container}>
                <WebView
                    ref={webviewRef}
                    source={{ html: htmlContent }}
                    style={styles.map}
                    onMessage={manejarMensajeWebView}
                    javaScriptEnabled={true}
                    scrollEnabled={false}
                    bounces={false}
                />

                {/* Panel Inferior con detalles y acciones */}
                <VStack style={styles.floatingPanel} space="md">
                    <Text className="text-[#111827] text-sm font-bold">
                        {marcador ? "Lugar seleccionado:" : "Toca el mapa para marcar el punto"}
                    </Text>

                    <Text className="text-gray-500 text-xs" numberOfLines={2}>
                        {cargandoDireccion ? "Buscando dirección..." : (direccionTexto || "Ninguna ubicación marcada todavía.")}
                    </Text>

                    <HStack style={{ gap: 10 }}>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-[#E9EAF4] bg-white" onPress={manejarCerrar}>
                            <ButtonText className="text-gray-600 font-bold uppercase tracking-wider text-xs">Cancelar</ButtonText>
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-indigo-600"
                            onPress={manejarConfirmar}
                            disabled={!marcador || cargandoDireccion}
                        >
                            <ButtonText className="text-white font-extrabold uppercase tracking-wider text-xs">Confirmar</ButtonText>
                        </Button>
                    </HStack>
                </VStack>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    floatingPanel: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E9EAF4',
        borderRadius: 24,
        padding: 20,
    }
});