import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useDerivedValue,
    SharedValue,
} from 'react-native-reanimated';

interface RadarBlipProps {
    id: string;
    titulo: string;
    top: number;
    left: number;
    isFavorite: boolean;
    accentColor: string;
    onPress: () => void;
    sweepRotation: SharedValue<number>;
    pulseScale: SharedValue<number>;
}

export default function RadarBlip({
    titulo,
    top,
    left,
    isFavorite,
    accentColor,
    onPress,
    sweepRotation,
    pulseScale,
}: RadarBlipProps) {
    // 1. Entrada de blips mediante escala con efecto muelle (resorte)
    const entryScale = useSharedValue(0);

    useEffect(() => {
        entryScale.value = withSpring(1, {
            damping: 15,
            stiffness: 120,
        });
    }, []);

    // 2. Calcular ángulo del blip en relación al centro (0.5, 0.5) en sentido horario (0° a 360°)
    const angleDeg = React.useMemo(() => {
        const dx = left - 0.5;
        const dy = top - 0.5;
        const angleRad = Math.atan2(dy, dx);
        let deg = (angleRad * 180) / Math.PI;
        if (deg < 0) deg += 360;
        return deg;
    }, [left, top]);

    // 3. Diferencia entre el barrido y el blip (0 a 360 grados)
    const diff = useDerivedValue(() => {
        return (sweepRotation.value - angleDeg + 360) % 360;
    });

    // 4. Factor de escaneo (estela del blip)
    // El efecto dura un sector de 60 grados tras el paso del brazo del radar
    const scanFactor = useDerivedValue(() => {
        if (diff.value >= 0 && diff.value <= 60) {
            // Decaimiento lineal de 1.0 (máxima detección) a 0.0
            return 1 - diff.value / 60;
        }
        return 0;
    });

    // 5. Estilo animado para el cuerpo principal del blip (escala y brillo)
    const animatedBlipStyle = useAnimatedStyle(() => {
        const scale = entryScale.value * (1 + scanFactor.value * 0.25);
        return {
            transform: [{ scale }],
        };
    });

    // 6. Estilo animado para el halo de escaneo (glow)
    const animatedGlowStyle = useAnimatedStyle(() => {
        const scale = 1 + scanFactor.value * 1.6;
        const opacity = scanFactor.value * 0.5;
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    // 7. Estilo animado para el halo de pulso permanente (favoritos/recomendados)
    const animatedPulseStyle = useAnimatedStyle(() => {
        if (!isFavorite) return { opacity: 0, transform: [{ scale: 1 }] };
        return {
            transform: [{ scale: pulseScale.value }],
            opacity: 0.35,
        };
    });

    // Detección del tamaño del blip
    const blipSize = isFavorite ? 24 : 16;

    return (
        <Reanimated.View
            style={[
                styles.container,
                {
                    top: `${top * 100}%`,
                    left: `${left * 100}%`,
                    width: blipSize,
                    height: blipSize,
                    transform: [
                        { translateX: -(blipSize / 2) },
                        { translateY: -(blipSize / 2) },
                    ],
                    zIndex: isFavorite ? 20 : 10,
                },
                animatedBlipStyle,
            ]}
        >
            {/* Halo pulsante permanente si es favorito o recomendado */}
            {isFavorite && (
                <Reanimated.View
                    style={[
                        styles.pulseHalo,
                        {
                            width: blipSize * 1.8,
                            height: blipSize * 1.8,
                            borderRadius: (blipSize * 1.8) / 2,
                            backgroundColor: accentColor,
                        },
                        animatedPulseStyle,
                    ]}
                />
            )}

            {/* Halo de escaneo (glow) que se activa cuando pasa el barrido */}
            <Reanimated.View
                style={[
                    styles.scanGlow,
                    {
                        width: blipSize,
                        height: blipSize,
                        borderRadius: blipSize / 2,
                        backgroundColor: accentColor,
                    },
                    animatedGlowStyle,
                ]}
            />

            {/* Cuerpo del blip (Diseño de Target para Favoritos y Punto Sólido para normales) */}
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={[
                    styles.blipTouch,
                    isFavorite
                        ? {
                              borderColor: accentColor,
                              borderWidth: 1.5,
                              borderRadius: blipSize / 2,
                              padding: 3,
                          }
                        : {
                              borderRadius: blipSize / 2,
                          },
                ]}
                accessibilityLabel={`Ver detalles de ${titulo}`}
                accessibilityRole="button"
            >
                {isFavorite ? (
                    // Target interior
                    <Reanimated.View
                        style={[
                            styles.blipInner,
                            {
                                backgroundColor: accentColor,
                                borderRadius: (blipSize - 10) / 2,
                            },
                        ]}
                    />
                ) : (
                    // Punto sólido estándar
                    <Reanimated.View
                        style={[
                            styles.blipSolid,
                            {
                                backgroundColor: accentColor,
                                borderRadius: blipSize / 2,
                            },
                        ]}
                    />
                )}
            </TouchableOpacity>
        </Reanimated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseHalo: {
        position: 'absolute',
    },
    scanGlow: {
        position: 'absolute',
    },
    blipTouch: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    blipInner: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    blipSolid: {
        width: 10,
        height: 10,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});
