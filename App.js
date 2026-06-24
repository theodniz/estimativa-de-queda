/**
 * App.js — Ponto de entrada do aplicativo "Estimativa de Queda".
 *
 * Configura as notificações ao iniciar e renderiza a tela principal.
 */
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import { setupNotifications } from './src/services/notifications';
import { colors } from './src/theme/colors';

export default function App() {
  useEffect(() => {
    // Solicita permissão de notificação e configura o canal (Android).
    setupNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
