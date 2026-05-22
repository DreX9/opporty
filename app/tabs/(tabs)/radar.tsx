import RadarRing from '@/components/animations/RadarRing';
import { ICONS } from '@/components/icons';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import RadarScreen from '@/src/features/radar/screens/RadarScreen';
import { ScrollView } from 'react-native';

/**
 * PANTALLA PRINCIPAL DEL RADAR (Tab2)
 * Propósito: Muestra un escáner animado simulando la búsqueda de eventos cercanos,
 * seguido de una lista de oportunidades recomendadas (Networking, Promociones).
 */

export default function Radar() {
  return (
    <RadarScreen />
  );
}
