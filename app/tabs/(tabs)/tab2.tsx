import { useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { ICONS } from '@/components/icons';
import { useTheme } from '@react-navigation/native';

const { width: SW } = Dimensions.get('window');

const A = { p: '#00E5FF', s: '#FF00FF', t: '#39FF14', g: '#FFD700' } as const;

interface Evento {
  id: string; titulo: string; fecha: string; hora: string; lugar: string;
  categoria: string; asistentes: number; rating: number; precio: string;
  destacado: boolean; descripcion: string; imagenUri: string;
  accentClass: string; accentHex: string;
  IconCategoria: React.ComponentType<{ size: number; color: string }>;
}

const EVENTOS: Evento[] = [
  {
    id: '1', titulo: 'Hackathon Tech 2025', fecha: '24 Abr', hora: '09:00 AM', lugar: 'Centro de Convenciones, Lima', categoria: 'Tecnología', asistentes: 342, rating: 4.8, precio: 'Gratis', destacado: true,
    descripcion: 'El hackathon más grande del Perú. 48 horas de innovación, networking y premios increíbles.',
    imagenUri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    accentClass: 'text-primary-500 border-primary-500', accentHex: A.p, IconCategoria: ICONS.Laptop
  },
  {
    id: '2', titulo: 'Festival Neon Beats', fecha: '02 May', hora: '07:00 PM', lugar: 'Anfiteatro del Parque, Miraflores', categoria: 'Música', asistentes: 1200, rating: 4.9, precio: 'S/ 80', destacado: true,
    descripcion: 'Una noche mágica con los mejores DJs del underground electrónico latinoamericano.',
    imagenUri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    accentClass: 'text-secondary-500 border-secondary-500', accentHex: A.s, IconCategoria: ICONS.Music2
  },
  {
    id: '3', titulo: 'Liga Universitaria eSports', fecha: '10 May', hora: '02:00 PM', lugar: 'Auditorio UTP, San Isidro', categoria: 'Deporte', asistentes: 580, rating: 4.6, precio: 'S/ 15', destacado: false,
    descripcion: 'Compite en League of Legends, Valorant y FIFA con los mejores equipos universitarios.',
    imagenUri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    accentClass: 'text-tertiary-500 border-tertiary-500', accentHex: A.t, IconCategoria: ICONS.Trophy
  },
  {
    id: '4', titulo: 'Workshop: React Native Pro', fecha: '18 May', hora: '10:00 AM', lugar: 'Online — Zoom', categoria: 'Tecnología', asistentes: 95, rating: 4.7, precio: 'S/ 45', destacado: false,
    descripcion: 'Aprende a construir apps móviles profesionales con React Native y Expo en 6 horas.',
    imagenUri: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    accentClass: 'text-primary-500 border-primary-500', accentHex: A.p, IconCategoria: ICONS.Zap
  },
  {
    id: '5', titulo: 'Feria del amor', fecha: '05 Mayo', hora: '17:00 PM', lugar: 'Online — Zoom', categoria: 'Social', asistentes: 95, rating: 4.7, precio: 'S/ 45', destacado: false,
    descripcion: 'Aprende a construir apps móviles profesionales con React Native y Expo en 6 horas.',
    imagenUri: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    accentClass: 'text-primary-500 border-primary-500', accentHex: A.p, IconCategoria: ICONS.Zap
  },
];

// Fila reutilizable: ícono + texto (evita repetir el mismo par de Views)
function InfoFila({ Icon, color, children, cls = '' }: { Icon: any; color: string; children: React.ReactNode; cls?: string }) {
  return (
    <View className={`flex-row items-center gap-1 ${cls}`}>
      <Icon size={13} color={color} />
      {children}
    </View>
  );
}

// ─── Componente reutilizable: EventCard (Semana 3 – Props) ────────────────────
interface EventCardProps { evento: Evento; favorito: boolean; onToggleFavorito: (id: string) => void; onVerDetalle: (evento: Evento) => void; }

function EventCard({ evento, favorito, onToggleFavorito, onVerDetalle }: EventCardProps) {
  const { dark: isDark } = useTheme();
  const tw = isDark
    ? { bg: 'bg-background-500', bd: 'border-outline-800', tp: 'text-typography-white', ts: 'text-typography-gray', gh: '#9BA1A6' }
    : { bg: 'bg-white', bd: 'border-[#E2E8F0]', tp: 'text-[#0F172A]', ts: 'text-[#64748B]', gh: '#64748B' };
  const [ac0, ac1] = evento.accentClass.split(' ');
  const badgeBg = evento.accentHex === A.p ? 'bg-primary-500' : evento.accentHex === A.s ? 'bg-secondary-500' : 'bg-tertiary-500';

  return (
    <View className={`${tw.bg} rounded-2xl overflow-hidden border ${tw.bd}`} style={[st.tarjeta, { width: SW - 32 }]}>
      <View className={evento.accentClass} style={st.lineaAcento} />
      <Image source={{ uri: evento.imagenUri }} style={st.imagenEvento} resizeMode="cover" />

      {evento.destacado && (
        <View className={badgeBg} style={st.badge}>
          <ICONS.Star size={10} color="#0B101B" fill="#0B101B" />
          <Text className="text-background-900 text-2xs font-extrabold tracking-widest">DESTACADO</Text>
        </View>
      )}

      <View className="p-3 gap-2">
        {/* Título + favorito */}
        <View className="flex-row justify-between items-start">
          <Text className={`flex-1 ${tw.tp} text-lg font-bold leading-tight mr-2`} numberOfLines={2}>{evento.titulo}</Text>
          <TouchableOpacity className="p-1" onPress={() => onToggleFavorito(evento.id)} accessibilityLabel={`Favorito ${evento.titulo}`}>
            <ICONS.Heart size={18} color={favorito ? A.s : tw.gh} fill={favorito ? A.s : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Categoría */}
        <View className="flex-row items-center gap-1">
          <evento.IconCategoria size={12} color={evento.accentHex} />
          <Text className={`text-2xs font-semibold uppercase tracking-widest ${ac0}`}>{evento.categoria}</Text>
        </View>

        <Text className={`${tw.ts} text-sm leading-tight`} numberOfLines={2}>{evento.descripcion}</Text>

        {/* Fecha / Hora / Precio */}
        <View className="flex-row flex-wrap gap-3">
          <InfoFila Icon={ICONS.CalendarDays} color={A.p}><Text className={`${tw.tp} text-xs font-medium`}>{evento.fecha}</Text></InfoFila>
          <InfoFila Icon={ICONS.Clock} color={A.p}><Text className={`${tw.tp} text-xs font-medium`}>{evento.hora}</Text></InfoFila>
          <InfoFila Icon={ICONS.Tag} color={evento.accentHex}><Text className={`text-xs font-semibold ${ac0}`}>{evento.precio}</Text></InfoFila>
        </View>

        {/* Lugar */}
        <InfoFila Icon={ICONS.MapPin} color={tw.gh}>
          <Text className={`${tw.ts} text-xs flex-1`} numberOfLines={1}>{evento.lugar}</Text>
        </InfoFila>

        {/* Pie */}
        <View className={`flex-row justify-between items-center flex-wrap gap-2 border-t ${tw.bd} pt-2 mt-1`}>
          <InfoFila Icon={ICONS.Users} color={tw.gh}><Text className={`${tw.ts} text-xs`}>{evento.asistentes.toLocaleString()} asistentes</Text></InfoFila>
          <InfoFila Icon={ICONS.Star} color={A.g}><Text className="text-xs font-bold" style={{ color: A.g }}>{evento.rating}</Text></InfoFila>
          <TouchableOpacity className={`flex-row items-center border rounded-full px-3 py-1 gap-1 ${ac1}`} onPress={() => onVerDetalle(evento)} accessibilityLabel={`Ver detalle ${evento.titulo}`}>
            <Text className={`text-xs font-semibold ${ac0}`}>Ver más</Text>
            <ICONS.ChevronRight size={13} color={evento.accentHex} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Pantalla principal: Tab2 – Eventos ──────────────────────────────────────
const CATS = ['Todos', 'Tecnología', 'Música', 'Deporte', 'Social', 'Cultural'];

export default function Tab2() {
  const { dark: isDark } = useTheme();
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [totalFavoritos, setTotalFavoritos] = useState(0);

  // Tokens de color agrupados en un objeto
  const T = isDark
    ? { bg9: 'bg-background-900', bg5: 'bg-background-500', bd: 'border-outline-800', tp: 'text-typography-white', ts: 'text-typography-gray', gh: '#9BA1A6', bh: '#0B101B', ph: '#9BA1A6', cb: '#131927', cBd: '#1E2A3A' }
    : { bg9: 'bg-[#F0F4F8]', bg5: 'bg-white', bd: 'border-[#E2E8F0]', tp: 'text-[#0F172A]', ts: 'text-[#64748B]', gh: '#64748B', bh: '#F0F4F8', ph: '#94A3B8', cb: '#FFFFFF', cBd: '#E2E8F0' };

  const filtrados = EVENTOS.filter(ev =>
    (ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) || ev.lugar.toLowerCase().includes(busqueda.toLowerCase())) &&
    (filtroActivo === 'Todos' || ev.categoria === filtroActivo)
  );

  const toggleFav = (id: string) => setFavoritos(prev => {
    const s = new Set(prev);
    s.has(id) ? (s.delete(id), setTotalFavoritos(t => t - 1)) : (s.add(id), setTotalFavoritos(t => t + 1));
    return s;
  });

  const verDetalle = (ev: Evento) =>
    Alert.alert(`📅 ${ev.titulo}`, `Categoría: ${ev.categoria}\nFecha: ${ev.fecha} — ${ev.hora}\nLugar: ${ev.lugar}\nPrecio: ${ev.precio}\n\n${ev.descripcion}`, [{ text: '¡Anotado!' }]);

  const cambiarFiltro = (cat: string) => { setFiltroActivo(cat); setBusqueda(''); };

  return (
    <View className={`flex-1 ${T.bg9}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bh} />

      {/* CABECERA (Semana 2) */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
        <View>
          <Text className={`${T.tp} text-3xl font-extrabold tracking-tight`}>Eventos</Text>
          <Text className={`${T.ts} text-sm mt-0.5`}>Descubre lo que pasa cerca de ti</Text>
        </View>
        <View className={`flex-row items-center ${T.bg5} border ${T.bd} rounded-full px-3 py-1.5 gap-1`}>
          <ICONS.Heart size={16} color={A.s} fill={totalFavoritos > 0 ? A.s : 'transparent'} />
          <Text className="text-secondary-500 font-bold text-sm">{totalFavoritos}</Text>
        </View>
      </View>

      {/* BUSCADOR – TextInput (Semana 4) */}
      <View className={`flex-row items-center mx-4 mb-3 ${T.bg5} border ${T.bd} rounded-xl`}>
        <ICONS.Search size={16} color={T.gh} style={{ marginLeft: 12 }} />
        <TextInput className={`flex-1 h-11 text-sm ${T.tp} px-2`} placeholder="Buscar eventos o lugares..." placeholderTextColor={T.ph} value={busqueda} onChangeText={setBusqueda} accessibilityLabel="Buscar eventos" />
        {busqueda.length > 0 && <TouchableOpacity onPress={() => setBusqueda('')} className="mr-3"><Text className="text-primary-500 text-xs font-semibold">Limpiar</Text></TouchableOpacity>}
      </View>

      {/* CHIPS DE CATEGORÍA (Semana 4 – TouchableOpacity) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, height: 60 }} contentContainerStyle={{ paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', height: 44 }}>
        {CATS.map((cat, i) => {
          const activo = filtroActivo === cat;
          return (
            <TouchableOpacity key={cat} onPress={() => cambiarFiltro(cat)} accessibilityLabel={`Filtrar ${cat}`}
              style={[st.chip, i < CATS.length - 1 && { marginRight: 8 }, { backgroundColor: activo ? A.p : T.cb, borderColor: activo ? A.p : T.cBd }]}>
              <Text style={[st.chipTxt, { color: activo ? '#0B101B' : T.gh, fontWeight: activo ? '700' : '500' }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* CONTADOR */}
      <View className="px-4 pb-2">
        <Text className={`${T.ts} text-xs`}>{filtrados.length} evento{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* LISTA DE EVENTOS (Semana 3 – Flexbox) */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.lista}>
        {filtrados.length > 0 ? (
          filtrados.map(ev => <EventCard key={ev.id} evento={ev} favorito={favoritos.has(ev.id)} onToggleFavorito={toggleFav} onVerDetalle={verDetalle} />)
        ) : (
          <View className="items-center pt-16 gap-3">
            <ICONS.Search size={48} color={T.gh} />
            <Text className={`${T.tp} text-xl font-bold`}>Sin resultados</Text>
            <Text className={`${T.ts} text-sm text-center px-8`}>No hay eventos que coincidan con "{busqueda}"</Text>
            <TouchableOpacity className="mt-2 bg-primary-500 rounded-full px-6 py-3" onPress={() => { setBusqueda(''); setFiltroActivo('Todos'); }}>
              <Text className="text-background-900 font-bold text-sm">Ver todos los eventos</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  tarjeta: { elevation: 4, position: 'relative' },
  lineaAcento: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, zIndex: 10, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  imagenEvento: { width: '100%', height: SW * 0.42 },
  badge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  lista: { alignItems: 'center', paddingHorizontal: 16, gap: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, height: 34, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  chipTxt: { fontSize: 14, lineHeight: 18, includeFontPadding: false },
}); 