// Archivo: components/RadarRing.tsx
import React from 'react';
import { MotiView } from 'moti';

// Interfaz para definir qué propiedades (props) acepta el componente
interface RadarRingProps {
    delay?: number;
    size?: number;
}

export default function RadarRing({ delay = 0, size = 300 }: RadarRingProps) {
    return (
        <MotiView
            from={{
                opacity: 0.8,
                scale: 0.2,
            }}
            animate={{
                opacity: 0,
                scale: 1,
            }}
            transition={{
                type: 'timing',
                duration: 3000,
                loop: true,
                repeatReverse: false,
                delay: delay,
            }}
            style={{
                position: 'absolute',
                borderWidth: 1.5,
                borderColor: '#22d3ee',
                borderRadius: size / 2,
                width: size,
                height: size,
                shadowColor: '#22d3ee',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
            }}
        />
    );
}