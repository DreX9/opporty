import React from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Linking } from 'react-native';

interface EventVideoPlayerProps {
  url: string;
}

export default function EventVideoPlayer({ url }: EventVideoPlayerProps) {
  if (!url) return null;

  // Helper to parse YouTube URLs for embedding
  const getYoutubeEmbedId = (videoUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Helper to parse Vimeo URLs for embedding
  const getVimeoEmbedId = (videoUrl: string) => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/;
    const match = videoUrl.match(regExp);
    return match && match[3] ? match[3] : null;
  };

  const ytId = getYoutubeEmbedId(url);
  const vimeoId = getVimeoEmbedId(url);

  const openInBrowser = () => {
    Linking.openURL(url).catch((err) => console.error("Error opening URL:", err));
  };

  if (Platform.OS === 'web') {
    if (ytId) {
      return (
        <View style={styles.webContainer}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={styles.webIframe}
          />
        </View>
      );
    }

    if (vimeoId) {
      return (
        <View style={styles.webContainer}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={styles.webIframe}
          />
        </View>
      );
    }

    return (
      <View style={styles.webContainer}>
        <video controls style={styles.webVideo}>
          <source src={url} type="video/mp4" />
          Tu navegador no soporta reproducción de video.
        </video>
      </View>
    );
  }

  // On Native (Android/iOS)
  const isDirectVideo = ytId === null && vimeoId === null;

  try {
    if (ytId) {
      const YoutubePlayer = require('react-native-youtube-iframe').default;
      return (
        <View style={[styles.nativeContainer, { backgroundColor: '#000', justifyContent: 'center' }]}>
          <YoutubePlayer
            height={220}
            play={false}
            videoId={ytId}
          />
        </View>
      );
    } else if (isDirectVideo) {
      const { Video, ResizeMode } = require('expo-av');
      return (
        <View style={styles.nativeContainer}>
          <Video
            source={{ uri: url }}
            style={styles.webview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        </View>
      );
    } else {
      const { WebView } = require('react-native-webview');
      let embedUrl = url;
      if (vimeoId) {
        embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
      }

      return (
        <View style={styles.nativeContainer}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
          />
          <TouchableOpacity onPress={openInBrowser} style={styles.openLinkBtn}>
            <Text style={styles.openLinkText}>Abrir en pantalla completa ↗</Text>
          </TouchableOpacity>
        </View>
      );
    }
  } catch (error) {
    console.error("Error loading video player:", error);
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Video del evento disponible</Text>
        <TouchableOpacity onPress={openInBrowser} style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>▶ Reproducir Video</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  webIframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  webVideo: {
    width: '100%',
    height: '100%',
  },
  nativeContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  openLinkBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  openLinkText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '700',
    marginBottom: 10,
  },
  fallbackButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
