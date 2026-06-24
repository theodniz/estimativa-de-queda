/**
 * EventLog.js — Lista o histórico de eventos detectados.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const COLOR_BY_KIND = {
  FALL: colors.danger,
  NOTIFY: colors.warning,
  OK: colors.success,
  INFO: colors.primary,
};

function formatTime(date) {
  try {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return '';
  }
}

export default function EventLog({ events }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Histórico</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>Nenhum evento registrado ainda.</Text>
      ) : (
        events.map((e) => (
          <View key={e.id} style={styles.item}>
            <View style={[styles.bar, { backgroundColor: COLOR_BY_KIND[e.kind] || colors.textDim }]} />
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>{e.label}</Text>
              {!!e.detail && <Text style={styles.itemDetail}>{e.detail}</Text>}
            </View>
            <Text style={styles.itemTime}>{formatTime(e.time)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { color: colors.textDim, fontSize: 13 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  bar: { width: 4, height: 30, borderRadius: 2, marginRight: 12 },
  itemBody: { flex: 1 },
  itemLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  itemDetail: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  itemTime: { color: colors.textDim, fontSize: 12, fontVariant: ['tabular-nums'] },
});
