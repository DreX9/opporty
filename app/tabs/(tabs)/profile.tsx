import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';
import { Icon } from '@/components/ui/icon';
import ProfileScreen from '@/src/features/profile/screens/ProfileScreen';


export default function Profile() {
    return (
        <ProfileScreen />
    )

}
