/**
 * SensorMeter.js — Leitura ao vivo de um sensor com uma barra proporcional.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * @param {string} title    rótulo (ex.: "Aceleração")
 * @param {number} value    valor atual
 * @param {string} unit     unidade (ex.: "g")
 * @param {number} max      valor que corresponde a 100% da barra
 * @param {string} color    cor da barra
 */
export default function SensorMeter({ title, value, unit, max = 4, color = colors.primary }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>
          {value.toFixed(2)} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 },
  title: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  value: { color: colors.text, fontSize: 16, fontWeight: '700' },
  unit: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  track: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
