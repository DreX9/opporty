// components/animations/RadarRing.tsx
import React from 'react';
import { MotiView } from 'moti';
import { ViewStyle } from 'react-native';

interface RadarRingProps {
    delay?: number;
    size?: number;
    color?: string;
}

export default function RadarRing({
    delay = 0,
    size = 300,
    color = '#6366F1',   // uniradar-indigo por defecto
}: RadarRingProps) {
    const ringStyle: ViewStyle = {
        position: 'absolute',
        borderWidth: 1,
        borderColor: color,
        borderRadius: size / 2,
        width: size,
        height: size,
    };

    return (
        <MotiView
            from={{ opacity: 0.6, scale: 0.15 }}
            animate={{ opacity: 0, scale: 1 }}
            transition={{
                type: 'timing',
                duration: 3200,
                loop: true,
                repeatReverse: false,
                delay,
            }}
            style={ringStyle}
        />
    );
}