import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { InfoPillProps } from '../types';
import { C } from '../constants';

export default function InfoPill({ icon, label }: InfoPillProps) {
    return (
        <HStack style={{ alignItems: 'center', gap: 3 }}>
            <Icon as={icon} style={{ color: C.textSecondary, width: 12, height: 12 }} />
            <Text style={{ color: C.textSecondary, fontSize: 11 }}>{label}</Text>
        </HStack>
    );
}
