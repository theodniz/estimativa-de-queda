/**
 * thresholds.js
 * ----------------------------------------------------------------------------
 * Limiares (thresholds) do algoritmo de detecção de queda.
 *
 * Unidades:
 *  - Aceleração: em "g" (1 g = 9,81 m/s²). Com o aparelho parado, o módulo do
 *    vetor de aceleração medido pelo acelerômetro fica em torno de 1 g, pois
 *    apenas a gravidade está atuando.
 *  - Rotação (giroscópio): em rad/s.
 *
 * Existem três níveis de sensibilidade para que o usuário ajuste o equilíbrio
 * entre "detectar mais quedas" (e ter mais falsos positivos) e "detectar menos"
 * (e ter menos falsos positivos).
 *
 * Campos de cada preset:
 *  - freeFall:         abaixo desse módulo (g) consideramos QUEDA LIVRE.
 *  - impact:           acima desse módulo (g) consideramos IMPACTO.
 *  - hardImpact:       impacto forte; permite detectar queda mesmo sem uma fase
 *                      de queda livre clara (ex.: tropeço).
 *  - gyro:             rotação (rad/s) considerada relevante para confirmar.
 *  - freeFallWindowMs: tempo máximo entre a queda livre e o impacto.
 *  - settleMs:         pequena janela após o impacto antes de medir a imobilidade.
 *  - inactivity:       desvio máximo de 1 g para o aparelho ser considerado parado.
 *  - inactivityMs:     tempo de imobilidade necessário para confirmar a queda.
 *  - maxEventMs:       tempo máximo de um evento; passou disso, descarta.
 *  - minScore:         pontuação mínima de confiança para confirmar (ver
 *                      fallAlgorithm.js -> _confirm()).
 */

export const SENSITIVITY_PRESETS = {
  // Mais sensível: bom para demonstração, detecta com facilidade.
  high: {
    freeFall: 0.6,
    impact: 2.2,
    hardImpact: 3.0,
    gyro: 2.0,
    freeFallWindowMs: 900,
    settleMs: 400,
    inactivity: 0.3,
    inactivityMs: 1000,
    maxEventMs: 4000,
    minScore: 2,
  },

  // Equilíbrio padrão entre sensibilidade e falsos positivos.
  medium: {
    freeFall: 0.5,
    impact: 2.6,
    hardImpact: 3.4,
    gyro: 2.6,
    freeFallWindowMs: 800,
    settleMs: 500,
    inactivity: 0.25,
    inactivityMs: 1200,
    maxEventMs: 4000,
    minScore: 3,
  },

  // Menos sensível: exige impacto forte + corroboração. Menos falsos positivos.
  low: {
    freeFall: 0.4,
    impact: 3.0,
    hardImpact: 3.8,
    gyro: 3.2,
    freeFallWindowMs: 700,
    settleMs: 600,
    inactivity: 0.2,
    inactivityMs: 1500,
    maxEventMs: 4500,
    minScore: 4,
  },
};

export const SENSITIVITY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

// Frequência de amostragem dos sensores (em ms). ~25 Hz.
export const UPDATE_INTERVAL_MS = 40;

// Tempo (s) que o usuário tem para cancelar o alarme antes de "notificar contatos".
export const COUNTDOWN_SECONDS = 20;
