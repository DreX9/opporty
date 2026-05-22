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

// ─── Paleta (tokens locales que mapean a uniradar en tailwind) ─────────────────
const C = {
    bg: '#F4F4FB',
    cardBg: '#FFFFFF',
    cardBorder: '#E9EAF4',
    heroBg: '#6366F1',          // indigo (fondo del banner de perfil)
    accent: '#6366F1',          // uniradar-indigo
    accentPurple: '#A82BFA',    // uniradar-purple
    accentLight: '#EEF2FF',     // uniradar-tagBg
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textWhite: '#FFFFFF',
    textWhite70: 'rgba(255,255,255,0.7)',
    badgeBg: '#EAB308',         // amarillo para el badge de rol
    badgeText: '#FFFFFF',
    interestActive: '#EEF2FF',
    interestActiveBorder: '#6366F1',
    interestInactiveText: '#374151',
    dotNotif: '#EF4444',
};

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Interes {
    id: number;
    nombre: string;
    emoji: string;
    activo: boolean;
}

interface MenuItem {
    id: string;
    icono: React.ComponentType;
    etiqueta: string;
    badge?: string;
    peligro?: boolean;
    info?: string;
}

// ─── Datos estáticos ───────────────────────────────────────────────────────────

const INTERESES_INICIAL: Interes[] = [
    { id: 1, nombre: 'Tecnología', emoji: '💻', activo: true },
    { id: 2, nombre: 'Música',     emoji: '🎵', activo: true },
    { id: 3, nombre: 'Deportes',   emoji: '⚽', activo: false },
    { id: 4, nombre: 'Arte',       emoji: '🎨', activo: true },
    { id: 5, nombre: 'Gastronomía',emoji: '🍕', activo: false },
    { id: 6, nombre: 'Emprendimiento', emoji: '💼', activo: true },
];

const MENU_ITEMS: MenuItem[] = [
    { id: 'eventos',    icono: ICONS.CalendarDays, etiqueta: 'Mis Eventos',           info: '5 eventos' },
    { id: 'notif',      icono: ICONS.radar,        etiqueta: 'Notificaciones',         badge: 'dot' },
    { id: 'privacidad', icono: ICONS.Shield,       etiqueta: 'Privacidad y Seguridad' },
];

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function InterestChip({
    interes,
    onToggle,
}: {
    interes: Interes;
    onToggle: (id: number) => void;
}) {
    return (
        <TouchableOpacity
            onPress={() => onToggle(interes.id)}
            activeOpacity={0.75}
            style={[
                styles.chip,
                {
                    backgroundColor: interes.activo ? C.interestActive : C.cardBg,
                    borderColor: interes.activo ? C.interestActiveBorder : C.cardBorder,
                },
            ]}
            accessibilityLabel={`Interés: ${interes.nombre}`}
            accessibilityRole="button"
        >
            <Text style={styles.chipEmoji}>{interes.emoji}</Text>
            <Text
                style={[
                    styles.chipLabel,
                    { color: interes.activo ? C.accent : C.interestInactiveText },
                ]}
            >
                {interes.nombre}
            </Text>
        </TouchableOpacity>
    );
}

function MenuRow({ item }: { item: MenuItem }) {
    return (
        <TouchableOpacity
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

// ─── Pantalla principal ────────────────────────────────────────────────────────

const ProfileScreen = () => {
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
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.75}
                    style={[styles.menuRow, { backgroundColor: C.dangerBg, borderColor: C.dangerBorder }]}
                    accessibilityLabel="Cerrar sesión"
                    accessibilityRole="button"
                >
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBox, { backgroundColor: C.dangerBg }]}>
                            <Icon as={ICONS.arrrowDownUp} style={{ color: C.danger, width: 18, height: 18 }} />
                        </View>
                        <Text style={[styles.menuLabel, { color: C.danger }]}>Cerrar Sesión</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>UniRadar v1.0.0</Text>
                <Text style={styles.footerSub}>Descubre eventos universitarios</Text>
            </View>
        </ScrollView>
    );
};

// ─── Estilos ───────────────────────────────────────────────────────────────────

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
    chip: {
        width: '47%',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    chipEmoji: {
        fontSize: 26,
    },
    chipLabel: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Menú
    menuContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
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

export default ProfileScreen;