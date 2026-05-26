import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthState } from '@/src/features/auth/state';
import CrearUsuarioScreen from '@/src/features/admin/screens/CrearUsuarioScreen';

export default function CrearUsuario() {
  const { role } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== 'ADMIN') {
      router.replace('/tabs/radar');
    }
  }, [role, router]);

  if (role !== 'ADMIN') {
    return null;
  }

  return <CrearUsuarioScreen />;
}