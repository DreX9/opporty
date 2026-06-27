import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Radar, MapPin, Heart, Bell, Users, ChevronRight, Star, Calendar } from 'lucide-react-native';
import * as NavigationBar from 'expo-navigation-bar';

interface OnboardingScreenProps {
  onFinish: () => void;
  isModal?: boolean;
}

interface SlideData {
  id: number;
  gradient: string;
  colors: [string, string, ...string[]];
  accentColor: string;
  dotActive: string;
  illustration: React.ReactNode;
  tag: string;
  title: string;
  description: string;
}

function RadarIllustration() {
  const rings = [1, 2, 3];
  interface PingData {
    top: import('react-native').DimensionValue;
    left: import('react-native').DimensionValue;
    delay: number;
  }
  const pings: PingData[] = [
    { top: '20%', left: '65%', delay: 600 },
    { top: '60%', left: '25%', delay: 1200 },
    { top: '35%', left: '18%', delay: 1800 },
  ];

  return (
    <View className="relative w-64 h-64 items-center justify-center">
      {/* Radar rings */}
      {rings.map((i) => (
        <MotiView
          key={i}
          className="absolute rounded-full border-2 border-white/20"
          style={{ width: i * 72, height: i * 72 }}
          from={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.04, opacity: 0.2 }}
          transition={{
            type: 'timing',
            duration: 2400,
            delay: i * 300,
            loop: true,
            repeatReverse: true,
          }}
        />
      ))}
      
      {/* Sweep line container */}
      <MotiView
        className="absolute w-64 h-64 justify-center items-center"
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 3000,
          loop: true,
          repeatReverse: false,
          easing: Easing.linear,
        }}
      >
        {/* Sweep line gradient */}
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: 'absolute',
            width: '50%',
            left: '50%',
            height: 2,
          }}
        />
      </MotiView>

      {/* Center dot */}
      <View className="w-5 h-5 bg-white rounded-full z-10 shadow-lg shadow-black/20" />

      {/* Pings */}
      {pings.map((p, i) => (
        <MotiView
          key={i}
          className="absolute w-3 h-3 bg-white rounded-full shadow-md shadow-black/20"
          style={{ top: p.top, left: p.left }}
          from={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.3, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1800,
            delay: p.delay,
            loop: true,
            repeatReverse: true,
          }}
        />
      ))}

      {/* University icon */}
      <MotiView
        className="absolute bottom-4 right-6 bg-white/20 rounded-2xl p-3 border border-white/10"
        from={{ translateY: 0 }}
        animate={{ translateY: -6 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
          repeatReverse: true,
          easing: Easing.inOut(Easing.ease),
        }}
      >
        <Radar color="#FFFFFF" size={32} />
      </MotiView>
    </View>
  );
}

function EventsIllustration() {
  interface EventItem {
    id: number;
    icon: React.ReactNode;
    title: string;
    time: string;
    fav: boolean;
  }

  const events: EventItem[] = [
    { id: 1, icon: <Calendar color="#7C3AED" size={16} />, title: 'Hackathon STEM', time: 'Hoy · 3pm', fav: true },
    { id: 2, icon: <Users color="#2563EB" size={16} />, title: 'Feria de Ciencias', time: 'Mañana · 10am', fav: false },
    { id: 3, icon: <Star color="#D97706" size={16} />, title: 'Charla IA & Futuro', time: 'Vie · 5pm', fav: true },
  ];

  return (
    <View className="relative w-64 h-64 items-center justify-center">
      {/* Map background card */}
      <MotiView
        className="absolute inset-0 rounded-3xl bg-white/10 border border-white/20"
        from={{ scale: 1 }}
        animate={{ scale: 1.02 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
          repeatReverse: true,
        }}
      />
      <View className="z-10 w-full px-4" style={{ gap: 10 }}>
        {events.map((ev, i) => (
          <MotiView
            key={ev.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 200 + i * 150,
            }}
            className="flex-row items-center bg-white/95 rounded-2xl px-3 py-2.5 shadow-sm"
          >
            <View className="w-8 h-8 rounded-xl bg-purple-50 items-center justify-center">
              {ev.icon}
            </View>
            <View className="flex-1 min-w-0 ml-3">
              <Text className="text-gray-800 text-xs font-semibold" numberOfLines={1}>{ev.title}</Text>
              <Text className="text-gray-500 text-[10px] mt-0.5">{ev.time}</Text>
            </View>
            <MotiView
              from={{ scale: 1 }}
              animate={ev.fav ? { scale: 1.2 } : { scale: 1 }}
              transition={{
                type: 'timing',
                duration: 400,
                loop: ev.fav,
                repeatReverse: true,
                delay: 1000 + i * 300,
              }}
            >
              <Heart
                color={ev.fav ? '#EF4444' : '#D1D5DB'}
                fill={ev.fav ? '#EF4444' : 'none'}
                size={16}
              />
            </MotiView>
          </MotiView>
        ))}
      </View>
      {/* Floating location badge */}
      <MotiView
        className="absolute -top-2 right-4 bg-white rounded-2xl px-3 py-1.5 shadow-lg flex-row items-center"
        from={{ translateY: 0 }}
        animate={{ translateY: -5 }}
        transition={{
          type: 'timing',
          duration: 1200,
          loop: true,
          repeatReverse: true,
          easing: Easing.inOut(Easing.ease),
        }}
      >
        <MapPin color="#8B5CF6" size={14} />
        <Text className="text-[10px] font-semibold text-gray-700 ml-1">Campus Central</Text>
      </MotiView>
    </View>
  );
}

function JoinIllustration() {
  const avatarColors = [
    { bg: '#60A5FA', label: 'A' }, // blue-400
    { bg: '#C084FC', label: 'B' }, // purple-400
    { bg: '#F472B6', label: 'C' }, // rose-400
    { bg: '#FBBF24', label: 'D' }, // amber-400
    { bg: '#2DD4BF', label: 'E' }, // teal-400
  ];

  return (
    <View className="relative w-64 h-64 items-center justify-center">
      {/* Background glow */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
        style={{ position: 'absolute', width: 160, height: 160, borderRadius: 80 }}
      />
      {/* Central badge */}
      <MotiView
        className="z-10 w-28 h-28 bg-white/20 rounded-3xl border border-white/30 items-center justify-center shadow-xl shadow-black/20"
        from={{ scale: 1 }}
        animate={{ scale: 1.04 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
          repeatReverse: true,
        }}
      >
        <Users color="#FFFFFF" size={40} />
        <Text className="text-white text-xs font-bold mt-1.5">+248 inscritos</Text>
      </MotiView>

      {/* Orbiting avatars */}
      {avatarColors.map((avatar, i) => {
        const angle = (i / avatarColors.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const r = 90; // orbit radius
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        
        return (
          <MotiView
            key={i}
            className="absolute w-10 h-10 rounded-full border-2 border-white items-center justify-center shadow-md shadow-black/15"
            style={{
              backgroundColor: avatar.bg,
              left: 128 + x - 20, // 128 is center, 20 is half of avatar size
              top: 128 + y - 20,
            }}
            from={{ scale: 1 }}
            animate={{ scale: 1.15 }}
            transition={{
              type: 'timing',
              duration: 1000,
              delay: i * 200,
              loop: true,
              repeatReverse: true,
            }}
          >
            <Text className="text-white text-xs font-bold">{avatar.label}</Text>
          </MotiView>
        );
      })}

      {/* Bell badge */}
      <MotiView
        className="absolute top-2 right-4 bg-white rounded-2xl px-3 py-1.5 shadow-lg flex-row items-center"
        from={{ rotate: '-8deg' }}
        animate={{ rotate: '8deg' }}
        transition={{
          type: 'timing',
          duration: 600,
          delay: 1000,
          loop: true,
          repeatReverse: true,
        }}
      >
        <Bell color="#14B8A6" size={14} />
        <Text className="text-[10px] font-semibold text-gray-700 ml-1">Notificación</Text>
      </MotiView>
    </View>
  );
}

const slides: SlideData[] = [
  {
    id: 1,
    gradient: 'from-blue-500 via-blue-600 to-violet-600',
    colors: ['#3B82F6', '#2563EB', '#7C3AED'],
    accentColor: 'bg-blue-400',
    dotActive: 'bg-white',
    illustration: <RadarIllustration />,
    tag: 'Bienvenido a UniRadar',
    title: 'Descubre eventos universitarios',
    description:
      'Crea tu cuenta con tu correo universitario y accede a todos los eventos que ocurren cerca de ti en tiempo real.',
  },
  {
    id: 2,
    gradient: 'from-purple-500 via-violet-600 to-purple-700',
    colors: ['#A855F7', '#7C3AED', '#7E22CE'],
    accentColor: 'bg-purple-400',
    dotActive: 'bg-white',
    illustration: <EventsIllustration />,
    tag: 'Explora y guarda',
    title: 'Eventos a un toque de distancia',
    description:
      'Navega el mapa radar, filtra por categoría y guarda tus eventos favoritos para no perderte nada de tu universidad.',
  },
  {
    id: 3,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    colors: ['#10B981', '#14B8A6', '#0891B2'],
    accentColor: 'bg-emerald-400',
    dotActive: 'bg-white',
    illustration: <JoinIllustration />,
    tag: 'Únete y participa',
    title: 'Conéctate con tu comunidad',
    description:
      'Inscríbete a talleres, charlas y actividades. Recibe notificaciones y sé parte activa de la vida universitaria.',
  },
];

export default function OnboardingScreen({ onFinish, isModal = false }: OnboardingScreenProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 500);
  };

  const next = () => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      handleFinish();
    }
  };

  const skip = () => {
    handleFinish();
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  // --- CONFIGURACIÓN DINÁMICA DE LA NAV BAR (ANDROID) ---
  useEffect(() => {
    if (Platform.OS === 'android') {
      const bottomColor = slide.colors[slide.colors.length - 1];
      NavigationBar.setBackgroundColorAsync(bottomColor).catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, [current, slide]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android') {
        if (isModal) {
          NavigationBar.setBackgroundColorAsync('#F4F4FB').catch(() => {});
          NavigationBar.setButtonStyleAsync('dark').catch(() => {});
        } else {
          NavigationBar.setBackgroundColorAsync('#A82BFA').catch(() => {});
          NavigationBar.setButtonStyleAsync('light').catch(() => {});
        }
      }
    };
  }, [isModal]);

  return (
    <MotiView
      animate={{ opacity: isFadingOut ? 0 : 1 }}
      transition={{ type: 'timing', duration: 450 }}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={slide.colors}
        style={{ flex: 1, justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
      >
        {/* Skip button */}
        <View className="flex-row justify-end px-6 pt-12 pb-4">
          {!isLast && (
            <TouchableOpacity
              onPress={skip}
              activeOpacity={0.7}
              className="py-1 px-3"
            >
              <Text className="text-white/70 text-sm font-semibold">Omitir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Slide content container */}
        <View className="flex-1 justify-center items-center px-8">
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={current}
              from={{
                opacity: 0,
                translateX: direction > 0 ? 150 : -150,
              }}
              animate={{
                opacity: 1,
                translateX: 0,
              }}
              exit={{
                opacity: 0,
                translateX: direction > 0 ? -150 : 150,
              }}
              transition={{
                type: 'timing',
                duration: 350,
              }}
              className="items-center justify-center w-full"
              style={{ gap: 24 }}
            >
              {/* Illustration container */}
              <View className="items-center justify-center h-64 w-64">
                {slide.illustration}
              </View>

              {/* Text block */}
              <View className="items-center" style={{ gap: 12 }}>
                <View className="bg-white/10 px-3.5 py-1 rounded-full items-center">
                  <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                    {slide.tag}
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center leading-snug px-2">
                  {slide.title}
                </Text>
                <Text className="text-white/75 text-sm text-center leading-relaxed max-w-[280px]">
                  {slide.description}
                </Text>
              </View>
            </MotiView>
          </AnimatePresence>
        </View>

        {/* Bottom controls */}
        <View className="px-8 pt-4 items-center" style={{ gap: 20 }}>
          {/* Dot indicators */}
          <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
            {slides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goTo(i)}
                activeOpacity={0.7}
                className="py-2 px-1"
              >
                <View
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/35'
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Finish button */}
          <TouchableOpacity
            onPress={next}
            activeOpacity={0.85}
            className="w-full py-4 bg-white rounded-2xl shadow-lg flex-row items-center justify-center"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 }}
          >
            <Text
              className="font-bold text-base text-center"
              style={{ color: isLast ? '#10B981' : '#3B82F6' }}
            >
              {isLast ? 'Comenzar ahora' : 'Siguiente'}
            </Text>
            {!isLast && (
              <ChevronRight
                color="#3B82F6"
                size={20}
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>

          {/* Step counter */}
          <Text className="text-white/50 text-xs">
            {current + 1} de {slides.length}
          </Text>
        </View>
      </LinearGradient>
    </MotiView>
  );
}
