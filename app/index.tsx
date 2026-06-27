import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initSessionFromStorage } from '@/src/features/auth/state';
import LoginScreen from '@/src/features/auth/screens/LoginScreen';
import OnboardingScreen from '@/src/features/auth/screens/OnboardingScreen';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const checkOnboardingAndSession = async () => {
      try {
        const completed = await AsyncStorage.getItem('@uniradar:onboarding_completed');
        const hasSession = await initSessionFromStorage();

        if (!active) return;

        if (hasSession) {
          router.replace('/tabs/radar');
        } else {
          setIsOnboardingCompleted(completed === 'true');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al inicializar la aplicación:', err);
        if (active) {
          setIsOnboardingCompleted(false);
          setLoading(false);
        }
      }
    };

    checkOnboardingAndSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@uniradar:onboarding_completed', 'true');
    } catch (err) {
      console.error('Error al guardar estado de onboarding:', err);
    }
    setIsOnboardingCompleted(true);
  };

  if (loading || isOnboardingCompleted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131927' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!isOnboardingCompleted) {
    return <OnboardingScreen onFinish={handleFinishOnboarding} />;
  }

  return <LoginScreen />;
}


