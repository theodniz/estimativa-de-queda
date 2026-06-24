/**
 * alarm.js — Alarme do aplicativo via VIBRAÇÃO.
 *
 * Usa a API Vibration do próprio React Native (não exige nenhum arquivo de
 * áudio nem dependência extra), tocando um padrão repetido que simula um
 * alarme até ser cancelado.
 *
 * Observação: no iOS as durações do padrão são ignoradas (o aparelho apenas
 * vibra), mas o efeito de "alarme contínuo" funciona em ambas as plataformas.
 */
import { Vibration } from 'react-native';

// [espera, vibra, espera, vibra, ...] em ms.
const ALARM_PATTERN = [0, 600, 300, 600, 300];

/** Inicia o alarme (vibração repetida). */
export function startAlarm() {
  try {
    Vibration.vibrate(ALARM_PATTERN, true); // segundo parâmetro = repetir
  } catch (e) {
    // Em ambientes sem suporte a vibração, apenas ignora.
  }
}

/** Interrompe o alarme. */
export function stopAlarm() {
  try {
    Vibration.cancel();
  } catch (e) {
    // ignora
  }
}
