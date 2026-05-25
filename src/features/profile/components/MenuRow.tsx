import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ICONS } from '@/components/icons';
import { MenuRowProps } from '../types';
import { C } from '../constants';

export default function MenuRow({ item, onPress }: MenuRowProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.menuRow,
                {
                    backgroundColor: item.peligro ? C.dangerBg : C.cardBg,
                    borderColor: item.peligro ? C.dangerBorder : C.cardBorder,
                },
            ]}
            accessibilityLabel={item.etiqueta}
            accessibilityRole="button"
        >
            <View style={styles.menuLeft}>
                <View
                    style={[
                        styles.menuIconBox,
                        { backgroundColor: item.peligro ? C.dangerBg : C.accentLight },
                    ]}
                >
                    <Icon
                        as={item.icono}
                        style={{
                            color: item.peligro ? C.danger : C.accent,
                            width: 18,
                            height: 18,
                        }}
                    />
                </View>
                <Text
                    style={[
                        styles.menuLabel,
                        { color: item.peligro ? C.danger : C.textPrimary },
                    ]}
                >
                    {item.etiqueta}
                </Text>
            </View>

            {/* Lado derecho */}
            <View style={styles.menuRight}>
                {item.badge === 'dot' && (
                    <View style={[styles.notifDot, { backgroundColor: C.dotNotif }]} />
                )}
                {item.info !== undefined && (
                    <Text style={{ color: C.textSecondary, fontSize: 12 }}>{item.info}</Text>
                )}
                {!item.peligro && (
                    <Icon
                        as={ICONS.ChevronRight}
                        style={{ color: C.textSecondary, width: 16, height: 16, marginLeft: 6 }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    notifDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
});
