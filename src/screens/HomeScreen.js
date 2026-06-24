/**
 * HomeScreen.js — Tela principal do aplicativo.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { useFallDetection } from '../hooks/useFallDetection';
import StatusCard from '../components/StatusCard';
import SensorMeter from '../components/SensorMeter';
import SensitivitySelector from '../components/SensitivitySelector';
import EventLog from '../components/EventLog';
import FallAlertModal from '../components/FallAlertModal';

export default function HomeScreen() {
  const fd = useFallDetection();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.appTitle}>Estimativa de Queda</Text>
        <Text style={styles.appSub}>Detecção por acelerômetro + giroscópio</Text>

        <StatusCard status={fd.status} />

        {!fd.available && (
          <Text style={styles.warning}>
            Acelerômetro indisponível neste dispositivo. Use o botão "Simular queda" para testar.
          </Text>
        )}

        <View style={styles.card}>
          <SensorMeter title="Aceleração" value={fd.svm} unit="g" max={4} color={colors.primary} />
          <SensorMeter title="Rotação (giroscópio)" value={fd.gyroMag} unit="rad/s" max={6} color={colors.warning} />
          <SensorMeter title="Pico de impacto" value={fd.peakImpact} unit="g" max={6} color={colors.danger} />
        </View>

        <View style={styles.card}>
          <SensitivitySelector
            value={fd.sensitivity}
            onChange={fd.setSensitivity}
            disabled={fd.fallActive}
          />
        </View>

        <View style={styles.buttons}>
          {!fd.isMonitoring ? (
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={fd.start}>
              <Text style={styles.btnPrimaryText}>Iniciar monitoramento</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.btn, styles.btnStop]} onPress={fd.stop}>
              <Text style={styles.btnStopText}>Parar monitoramento</Text>
            </Pressable>
          )}

          <Pressable style={[styles.btn, styles.btnGhost]} onPress={fd.triggerTest}>
            <Text style={styles.btnGhostText}>Simular queda (teste)</Text>
          </Pressable>
        </View>

        <EventLog events={fd.events} />

        <Text style={styles.footer}>
          Trabalho acadêmico — protótipo. Não substitui dispositivos médicos de monitoramento.
        </Text>
      </ScrollView>

      <FallAlertModal
        visible={fd.fallActive}
        peakImpact={fd.lastFall ? fd.lastFall.peakImpact : fd.peakImpact}
        onSafe={() => fd.dismissAlarm(true)}
        onTimeout={fd.notifyContacts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  appTitle: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 8 },
  appSub: { color: colors.textDim, fontSize: 13, marginBottom: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  warning: { color: colors.warning, fontSize: 13, marginTop: 12, lineHeight: 18 },
  buttons: { marginTop: 18, gap: 12, marginBottom: 16 },
  btn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnStop: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.danger },
  btnStopText: { color: colors.danger, fontWeight: '800', fontSize: 16 },
  btnGhost: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  footer: { color: colors.textDim, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
