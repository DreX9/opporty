import React, { useState } from 'react';
import {
    ScrollView,
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ICONS } from '@/components/icons';

import { C, INTERESES_INICIAL, MENU_ITEMS } from '../constants';
import { Interes } from '../types';
import InterestChip from '../components/InterestChip';
import MenuRow from '../components/MenuRow';

export default function ProfileScreen() {
    const [intereses, setIntereses] = useState<Interes[]>(INTERESES_INICIAL);

    const totalActivos = intereses.filter((i) => i.activo).length;

    const toggleInteres = (id: number) => {
        setIntereses((prev) =>
            prev.map((i) => (i.id === id ? { ...i, activo: !i.activo } : i))
        );
    };

    const handleLogout = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: () => {} },
        ]);
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: C.bg }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 48 }}
        >
            {/* ── Banner de perfil (degradado índigo → púrpura) ─────────────── */}
            <View style={styles.heroBanner}>
                {/* Botón de ajustes */}
                <TouchableOpacity
                    style={styles.settingsBtn}
                    accessibilityLabel="Ajustes"
                    accessibilityRole="button"
                >
                    <Icon as={ICONS.edit2} style={{ color: C.accent, width: 20, height: 20 }} />
                </TouchableOpacity>

                {/* Avatar */}
                <View style={styles.avatarRing}>
                    <View style={styles.avatarInner}>
                        <Icon as={ICONS.user} style={{ color: C.accent, width: 44, height: 44 }} />
                    </View>
                </View>

                {/* Nombre y email */}
                <Text style={styles.heroName}>Administrador</Text>
                <Text style={styles.heroEmail}>admin@admin.com</Text>

                {/* Badge de rol */}
                <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Administrador</Text>
                </View>
            </View>

            {/* ── Tarjeta universidad / facultad ───────────────────────────── */}
            <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                    <View style={[styles.infoIconBox, { backgroundColor: C.accentLight }]}>
                        <Icon as={ICONS.Laptop} style={{ color: C.accent, width: 18, height: 18 }} />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Universidad</Text>
                        <Text style={styles.infoValue}>Sistema UniRadar</Text>
                    </View>
                </View>

                <View style={[styles.infoDivider, { backgroundColor: C.cardBorder }]} />

                <View style={styles.infoItem}>
                    <View style={[styles.infoIconBox, { backgroundColor: '#F5F3FF' }]}>
                        <Icon as={ICONS.Zap} style={{ color: C.accentPurple, width: 18, height: 18 }} />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Facultad</Text>
                        <Text style={styles.infoValue}>Administración</Text>
                    </View>
                </View>
            </View>

            {/* ── Sección Intereses ─────────────────────────────────────────── */}
            <View style={[styles.section, { backgroundColor: C.cardBg, borderColor: C.cardBorder }]}>
                {/* Header */}
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon as={ICONS.Heart} style={{ color: C.danger, width: 18, height: 18 }} />
                        <Text style={styles.sectionTitle}>Intereses</Text>
                    </View>
                    <Text style={{ color: C.textSecondary, fontSize: 13 }}>
                        {totalActivos} seleccionados
                    </Text>
                </View>

                {/* Grid 2 columnas */}
                <View style={styles.chipGrid}>
                    {intereses.map((item) => (
                        <InterestChip key={item.id} interes={item} onToggle={toggleInteres} />
                    ))}
                </View>
            </View>

            {/* ── Menú de opciones ─────────────────────────────────────────── */}
            <View style={styles.menuContainer}>
                {MENU_ITEMS.map((item) => (
                    <MenuRow key={item.id} item={item} />
                ))}

                {/* Cerrar sesión (separado para énfasis) */}
                <MenuRow
                    item={{
                        id: 'logout',
                        icono: ICONS.arrrowDownUp,
                        etiqueta: 'Cerrar Sesión',
                        peligro: true,
                    }}
                    onPress={handleLogout}
                />
            </View>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>UniRadar v1.0.0</Text>
                <Text style={styles.footerSub}>Descubre eventos universitarios</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Hero banner
    heroBanner: {
        backgroundColor: '#6366F1',
        paddingTop: 24,
        paddingBottom: 32,
        alignItems: 'center',
        position: 'relative',
    },
    settingsBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatarInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },
    heroEmail: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#EAB308',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    roleBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Info card universidad
    infoCard: {
        marginHorizontal: 16,
        marginTop: -18,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E9EAF4',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        color: '#9CA3AF',
        fontSize: 11,
        marginBottom: 1,
    },
    infoValue: {
        color: '#111827',
        fontSize: 13,
        fontWeight: '700',
    },
    infoDivider: {
        width: 1,
        height: 40,
    },

    // Sección genérica (card con borde)
    section: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
    },

    // Grid de intereses
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    // Menú
    menuContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Footer
    footer: {
        alignItems: 'center',
        marginTop: 28,
        gap: 3,
    },
    footerTitle: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
    },
    footerSub: {
        color: '#D1D5DB',
        fontSize: 11,
    },
});