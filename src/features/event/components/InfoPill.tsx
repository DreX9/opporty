import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { InfoPillProps } from '../types';
import { C } from '../constants';

export default function InfoPill({
    icono,
    label,
    color = C.textSecondary,
}: InfoPillProps) {
    return (
        <HStack style={{ alignItems: 'center', gap: 3 }}>
            <Icon as={icono} style={{ color, width: 12, height: 12 }} />
            <Text style={{ color, fontSize: 11, fontWeight: '500' }}>{label}</Text>
        </HStack>
    );
}
