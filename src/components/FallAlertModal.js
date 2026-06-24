/**
 * FallAlertModal.js
 * ----------------------------------------------------------------------------
 * Sobreposição em tela cheia exibida quando uma queda é detectada.
 *
 * Fluxo:
 *   - Mostra a mensagem de alerta + contagem regressiva.
 *   - "Estou bem"  -> cancela o alarme (onSafe).
 *   - Se a contagem zerar sem cancelar -> notifica os contatos (onTimeout) e
 *     mantém o alarme até o usuário tocar em "Parar alarme".
 */
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { COUNTDOWN_SECONDS } from '../constants/thresholds';

export default function FallAlertModal({ visible, peakImpact, onSafe, onTimeout }) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const [notified, setNotified] = useState(false);
  const intervalRef = useRef(null);

  // Controla a contagem regressiva sempre que o modal abre/fecha.
  useEffect(() => {
    if (!visible) {
      setRemaining(COUNTDOWN_SECONDS);
      setNotified(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setRemaining(COUNTDOWN_SECONDS);
    setNotified(false);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [visible]);

  // Quando a contagem chega a zero, notifica uma única vez.
  useEffect(() => {
    if (visible && remaining === 0 && !notified) {
      setNotified(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onTimeout && onTimeout();
    }
  }, [remaining, visible, notified, onTimeout]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onSafe && onSafe()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Queda detectada!</Text>

          {!notified ? (
            <>
              <Text style={styles.text}>
                Detectamos uma possível queda
                {typeof peakImpact === 'number' ? ` (impacto ${peakImpact.toFixed(1)} g)` : ''}.
              </Text>
              <Text style={styles.text}>
                Os contatos de emergência serão avisados em:
              </Text>
              <Text style={styles.countdown}>{remaining}s</Text>
            </>
          ) : (
            <Text style={[styles.text, { color: colors.warning, fontWeight: '700' }]}>
              Contato de emergência notificado.
            </Text>
          )}

          <Pressable style={styles.safeBtn} onPress={() => onSafe && onSafe()}>
            <Text style={styles.safeBtnText}>
              {notified ? 'Parar alarme' : 'Estou bem ✓'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(91,22,16,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.danger,
    padding: 26,
    alignItems: 'center',
  },
  icon: { fontSize: 54, marginBottom: 8 },
  title: { color: colors.danger, fontSize: 26, fontWeight: '900', marginBottom: 14 },
  text: { color: colors.text, fontSize: 15, textAlign: 'center', marginBottom: 6 },
  countdown: { color: colors.danger, fontSize: 56, fontWeight: '900', marginVertical: 8, fontVariant: ['tabular-nums'] },
  safeBtn: {
    marginTop: 18,
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  safeBtnText: { color: '#06281F', fontSize: 18, fontWeight: '800' },
});
