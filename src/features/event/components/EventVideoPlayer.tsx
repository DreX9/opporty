import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ICONS } from '@/components/icons';

interface EventVideoPlayerProps {
  url: string;
}

export default function EventVideoPlayer({ url }: EventVideoPlayerProps) {
  if (!url) return null;

  const openInBrowser = () => {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    Linking.openURL(cleanUrl).catch((err) => console.error("Error opening URL:", err));
  };

  return (
    <TouchableOpacity 
      onPress={openInBrowser} 
      style={styles.container} 
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.buttonText} numberOfLines={1}>
            Abrir video en el navegador
          </Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <Icon as={ICONS.ChevronRight} style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 11,
    color: '#6366F1',
    opacity: 0.8,
  },
  arrowIcon: {
    color: '#4F46E5',
    width: 20,
    height: 20,
  },
});
