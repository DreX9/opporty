import React, { useState } from 'react';
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
import LoginScreen from '@/src/features/auth/screens/LoginScreen';

const MOCK_USERS = [
  { email: 'admin@admin.com', password: '123' },
  { email: 'alex@test.com', password: 'password' }
];

export default function Home() {
  return (
    <LoginScreen />
  )
}

