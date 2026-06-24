/**
 * SensitivitySelector.js — Botões para escolher a sensibilidade.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { SENSITIVITY_LABELS } from '../constants/thresholds';

const ORDER = ['low', 'medium', 'high'];

export default function SensitivitySelector({ value, onChange, disabled }) {
  return (
    <View>
      <Text style={styles.label}>Sensibilidade</Text>
      <View style={styles.row}>
        {ORDER.map((key) => {
          const active = value === key;
          return (
            <Pressable
              key={key}
              onPress={() => !disabled && onChange(key)}
              style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {SENSITIVITY_LABELS[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textDim, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDisabled: { opacity: 0.5 },
  chipText: { color: colors.textDim, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#fff' },
});
