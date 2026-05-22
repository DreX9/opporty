import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

// Coordenadas iniciales por defecto (ej: Centro de Lima, Perú)
const LIMA_COORDS = {
    latitude: -12.046374,
    longitude: -77.042793,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
};

interface SelectorMapaProps {
    visible: boolean;
    onClose: () => void;
    onUbicacionSeleccionada: (datos: { direccion: string; coords: { lat: number; lng: number } }) => void;
}

export function SelectorMapaModal({ visible, onClose, onUbicacionSeleccionada }: SelectorMapaProps) {
    const [marcador, setMarcador] = useState<{ latitude: number; longitude: number } | null>(null);
    const [direccionTexto, setDireccionTexto] = useState('');
    const [cargandoDireccion, setCargandoDireccion] = useState(false);

    // Obtener el nombre de la calle/lugar a partir de las coordenadas (Geocoding Inverso)
    const obtenerDireccionTexto = async (lat: number, lng: number) => {
        setCargandoDireccion(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setDireccionTexto("Permiso de ubicación denegado");
                return;
            }

            const [resultado] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (resultado) {
                const calle = resultado.street || '';
                const numero = resultado.streetNumber ? ` ${resultado.streetNumber}` : '';
                const distrito = resultado.district ? `, ${resultado.district}` : '';

                const direccionCompleta = `${calle}${numero}${distrito}`.trim() || "Ubicación seleccionada en mapa";
                setDireccionTexto(direccionCompleta);
            }
        } catch (error) {
            setDireccionTexto("Coordenadas seleccionadas");
        } finally {
            setCargandoDireccion(false);
        }
    };

    const manejarPresionMapa = (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;
        setMarcador(coords);
        obtenerDireccionTexto(coords.latitude, coords.longitude);
    };

    const manejarConfirmar = () => {
        if (marcador) {
            onUbicacionSeleccionada({
                direccion: direccionTexto,
                coords: { lat: marcador.latitude, lng: marcador.longitude }
            });
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    initialRegion={LIMA_COORDS}
                    onPress={manejarPresionMapa}
                    showsUserLocation={true} // Muestra el punto azul del usuario si da permisos
                >
                    {marcador && (
                        <Marker
                            coordinate={marcador}
                            draggable
                            onDragEnd={(e) => {
                                const coords = e.nativeEvent.coordinate;
                                setMarcador(coords);
                                obtenerDireccionTexto(coords.latitude, coords.longitude);
                            }}
                        />
                    )}
                </MapView>

                {/* Panel Inferior con detalles y acciones */}
                <VStack style={styles.floatingPanel} space="md">
                    <Text className="text-white text-sm font-bold">
                        {marcador ? "Lugar seleccionado:" : "Toca el mapa para marcar el punto"}
                    </Text>

                    <Text className="text-gray-300 text-xs" numberOfLines={2}>
                        {cargandoDireccion ? "Buscando dirección..." : (direccionTexto || "Ninguna ubicación marcada todavía.")}
                    </Text>

                    <HStack style={{ gap: 10 }}>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/10" onPress={onClose}>
                            <ButtonText className="text-gray-300 font-bold uppercase tracking-wider text-xs">Cancelar</ButtonText>
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-cyan-400"
                            onPress={manejarConfirmar}
                            disabled={!marcador || cargandoDireccion}
                        >
                            <ButtonText className="text-[#070B17] font-extrabold uppercase tracking-wider text-xs">Confirmar</ButtonText>
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
        backgroundColor: '#0D1324',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 20,
    }
});