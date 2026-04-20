import React, { useState } from 'react';
import Gradient from '@/assets/icons/Gradient';
import Logo from '@/assets/icons/Logo';
import { Box } from '@/components/ui/box';
import { ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input'
import { LinearGradient } from 'expo-linear-gradient'

//icon

import { Icon } from '@/components/ui/icon';

import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ICONS } from '@/components/icons';

// Modal
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@/components/ui/modal';

const MOCK_USERS = [
  { email: 'admin@admin.com', password: '123' },
  { email: 'alex@test.com', password: 'password' }
];

export default function Home() {
  const router = useRouter();

  // --- ESTADOS PARA LOS INPUTS ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- ESTADOS DEL MODAL DE REGISTRO ---
  const [showModal, setShowModal] = useState(false); // Controla si se ve el modal
  const [regName, setRegName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- LÓGICA DE LOGIN ---
  const handleLogin = () => {
    // 1. Validar que no envíen campos vacíos
    if (!email || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, ingresa tu usuario y contraseña."
      );
      return;
    }

    // 2. Buscar si el usuario existe en nuestro arreglo simulado
    const userFound = MOCK_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );

    // 3. Tomar decisión
    if (userFound) {
      // Limpiamos los campos (opcional, por si regresa a esta pantalla)
      setEmail('');
      setPassword('');
      // Redirigimos al radar
      router.push('/tabs/tab1');
    } else {
      // Mostramos la alerta de error tradicional de React Native
      Alert.alert(
        "Acceso Denegado",
        "El usuario o la contraseña no son correctos. Por favor, verifica tus datos e inténtalo de nuevo.",
        [{ text: "Entendido", style: "default" }]
      );
    }
  };

  // --- LÓGICA DE REGISTRO ---
  const handleRegister = () => {
    if (!regName || !regLastName || !regEmail || !regPassword) {
      Alert.alert("Campos incompletos", "Por favor, llena todos los datos para crear tu cuenta.");
      return;
    }
    // Aquí iría tu lógica real para guardar el usuario en la base de datos
    Alert.alert("¡Éxito!", `La cuenta para ${regName} ha sido creada.`);
    setShowModal(false); // Cerramos el modal

    // Limpiamos los campos de registro
    setRegName(''); setRegLastName(''); setRegEmail(''); setRegPassword('');
  };




  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="bg-white dark:bg-background-500"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24, // Equivale a px-6
          paddingVertical: 40    // Espacio extra para que se vea bien al hacer scroll en horizontal
        }}
      >
        {/* Contenedor centralizado y con ancho máximo para que no se estire feo en horizontal */}
        <Box className="w-full max-w-[400px] items-center">

          {/* 🔵 HEADER */}
          <Box className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center mb-4">
            <Icon as={ICONS.webhook} className="w-12 h-12 text-black dark:text-black" />
          </Box>

          <Text className="text-2xl font-bold text-black dark:text-white mb-6">
            ECHO <Text className="text-primary-500">EVENT</Text>
          </Text>

          {/* 🧱 CARD */}
          {/* NOTA: Eliminé flex-[0.5] para que la tarjeta tome su tamaño natural en horizontal */}
          <Box className="w-full p-6 bg-[#F1F5F9] dark:bg-background-600 justify-center" style={{
            borderRadius: 20,
            shadowColor: '#00ffff',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 5
          }}>

            {/* INPUT EMAIL */}
            <Box className='flex-row items-center mb-2'>
              <Icon as={ICONS.user} className='mr-2' />
              <Text className="text-gray-400">Usuario</Text>
            </Box>
            <Input className="mb-4 h-16 rounded-2xl">
              <InputField
                placeholder="ID / Email"
                value={email} // Vinculamos el estado
                onChangeText={setEmail} // Actualizamos el estado cuando escribe
                autoCapitalize="none" // Evita la mayúscula automática en el teclado
                keyboardType="email-address" // Muestra el teclado con el "@"
              />
            </Input>

            {/* INPUT PASSWORD */}
            <Box className='flex-row items-center mb-2'>
              <Icon as={ICONS.lock} className='mr-2' />
              <Text className="text-gray-400">Contraseña</Text>
            </Box>
            <Input className="mb-6 h-16 rounded-2xl">
              <InputField
                placeholder="••••••••••"
                secureTextEntry
                value={password} // Vinculamos el estado
                onChangeText={setPassword} // Actualizamos el estado cuando escribe
              />
            </Input>

            {/*  BOTÓN CON GRADIENT */}
            <LinearGradient
              colors={['#00E5FF', '#00B8D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <Button className="bg-transparent w-full"
                variant="solid" size="xl"
                onPress={handleLogin}
              >
                <ButtonText className="text-black font-bold">
                  Inicie Sesión
                </ButtonText>
              </Button>
            </LinearGradient>

          </Box>

          {/* FOOTER */}
          {/* FOOTER */}
          <Box className='flex-row items-center mt-6'>
            <Text className='mr-2 dark:text-gray-300'>¿No tiene una cuenta?</Text>
            {/* Al presionar este botón, cambiamos el estado para mostrar el Modal */}
            <Button variant="link" size="md" className="p-0" onPress={() => setShowModal(true)}>
              <ButtonText className='text-primary-500'>Crear cuenta</ButtonText>
            </Button>
          </Box>

        </Box>
      </ScrollView>
      {/* ===================================================
          MODAL FLOTANTE DE REGISTRO
      =================================================== */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent className="bg-[#0D1324] border border-white/10 rounded-3xl">

          <ModalHeader className="border-b border-white/5 pb-4">
            <Text className="text-white font-bold text-xl">Crear Nueva Cuenta</Text>
            <ModalCloseButton>
              <Icon as={ICONS.Heart} className="text-gray-400 w-5 h-5" />
            </ModalCloseButton>
          </ModalHeader>

          {/* Usamos un ScrollView dentro del body por si la pantalla del celular es muy pequeña */}
          <ModalBody className="pt-4">
            <ScrollView showsVerticalScrollIndicator={false}>

              <Box className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Nombre</Text>
                <Input className="h-12 rounded-xl">
                  <InputField placeholder="Ej. Alex" value={regName} onChangeText={setRegName} />
                </Input>
              </Box>

              <Box className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Apellido</Text>
                <Input className="h-12 rounded-xl">
                  <InputField placeholder="Ej. Rivera" value={regLastName} onChangeText={setRegLastName} />
                </Input>
              </Box>

              <Box className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Correo Electrónico</Text>
                <Input className="h-12 rounded-xl">
                  <InputField
                    placeholder="correo@ejemplo.com"
                    value={regEmail}
                    onChangeText={setRegEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </Input>
              </Box>

              <Box className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Contraseña</Text>
                <Input className="h-12 rounded-xl">
                  <InputField
                    placeholder="Crea una contraseña segura"
                    secureTextEntry
                    value={regPassword}
                    onChangeText={setRegPassword}
                  />
                </Input>
              </Box>

            </ScrollView>
          </ModalBody>

          <ModalFooter className="border-t border-white/5 pt-4">
            <Button
              variant="outline"
              action="secondary"
              className="mr-3 border-white/10"
              onPress={() => setShowModal(false)}
            >
              <ButtonText className="text-gray-300">Cancelar</ButtonText>
            </Button>
            <Button className="bg-cyan-400 rounded-xl px-6" onPress={handleRegister}>
              <ButtonText className="text-[#070B17] font-bold">Registrarse</ButtonText>
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </KeyboardAvoidingView>
  );
}

