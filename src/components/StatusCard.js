/**
 * StatusCard.js — Cartão grande que mostra o estado atual do monitoramento.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Status } from '../hooks/useFallDetection';

const MAP = {
  [Status.IDLE]: { label: 'Parado', sub: 'Toque em iniciar para monitorar', color: colors.textDim },
  [Status.MONITORING]: { label: 'Monitorando', sub: 'Tudo normal', color: colors.success },
  [Status.ANALYZING]: { label: 'Analisando…', sub: 'Possível evento detectado', color: colors.warning },
  [Status.ALARM]: { label: 'QUEDA DETECTADA', sub: 'Alarme ativo', color: colors.danger },
};

export default function StatusCard({ status }) {
  const info = MAP[status] || MAP[Status.IDLE];
  return (
    <View style={[styles.card, { borderColor: info.color }]}>
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
      <Text style={styles.sub}>{info.sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 10 },
  label: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  sub: { fontSize: 13, color: colors.textDim, marginTop: 6 },
});
