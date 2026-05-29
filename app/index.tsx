import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { initSessionFromStorage } from '@/src/features/auth/state';
import LoginScreen from '@/src/features/auth/screens/LoginScreen';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    initSessionFromStorage()
      .then((hasSession) => {
        if (!active) return;
        if (hasSession) {
          router.replace('/tabs/radar');
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error al inicializar sesión:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <LoginScreen />;
}

