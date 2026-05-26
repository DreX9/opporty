import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthState } from '@/src/features/auth/state';
import CrearEventoScreen from '@/src/features/admin/screens/CrearEventoScreen';

export default function CrearEvento() {
  const { role } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== 'ADMIN' && role !== 'MANAGER') {
      router.replace('/tabs/radar');
    }
  }, [role, router]);

  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return null;
  }

  return <CrearEventoScreen />;
}