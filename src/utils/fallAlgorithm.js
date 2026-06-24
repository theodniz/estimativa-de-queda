/**
 * fallAlgorithm.js
 * ----------------------------------------------------------------------------
 * Núcleo da detecção de queda, implementado como uma MÁQUINA DE ESTADOS.
 *
 * Uma queda real costuma ter quatro fases bem características quando observadas
 * pelo acelerômetro:
 *
 *   1) NORMAL ......... aparelho parado, módulo da aceleração ~1 g (só gravidade)
 *   2) QUEDA LIVRE .... durante a queda o corpo acelera para baixo e o módulo
 *                       da aceleração cai (tende a 0 g)
 *   3) IMPACTO ........ ao bater no chão há um PICO de aceleração (2,5 g a 6 g)
 *   4) IMOBILIDADE .... após o impacto a pessoa tende a ficar parada no chão
 *
 * O giroscópio é usado como SENSOR AUXILIAR: uma queda normalmente envolve
 * rotação significativa do aparelho, o que ajuda a aumentar a precisão e a
 * reduzir falsos positivos (ex.: apenas largar o celular na mesa).
 *
 * A confirmação final combina os sinais em uma pontuação de confiança
 * (ver _confirm()), evitando depender de um único limiar.
 */

import { SENSITIVITY_PRESETS } from '../constants/thresholds';

/** Estados internos da máquina de detecção. */
export const DetectorState = {
  IDLE: 'IDLE', // monitorando, nada acontecendo
  FREE_FALL: 'FREE_FALL', // possível queda livre em andamento
  IMPACT_WAIT: 'IMPACT_WAIT', // impacto ocorreu, aguardando estabilizar
  POST_IMPACT: 'POST_IMPACT', // medindo imobilidade após o impacto
};

/** Tipos de evento devolvidos por process(). */
export const EventType = {
  FREE_FALL: 'FREE_FALL',
  IMPACT: 'IMPACT',
  FALL: 'FALL',
  RESET: 'RESET',
};

/** Módulo (magnitude) de um vetor 3D. */
const magnitude = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

export class FallDetector {
  constructor(sensitivity = 'medium') {
    this.setSensitivity(sensitivity);
    this.reset();
  }

  /** Troca o conjunto de limiares conforme a sensibilidade escolhida. */
  setSensitivity(level) {
    this.cfg = SENSITIVITY_PRESETS[level] || SENSITIVITY_PRESETS.medium;
  }

  /** Volta ao estado inicial, zerando os marcadores do evento atual. */
  reset() {
    this.state = DetectorState.IDLE;
    this.freeFallStart = 0;
    this.impactTime = 0;
    this.inactivityStart = 0;
    this.peakImpact = 0;
    this.peakGyro = 0;
    this.hadFreeFall = false;
  }

  /**
   * Processa uma amostra dos sensores.
   * @param {{accel:{x,y,z}, gyro:{x,y,z}|null, timestamp:number}} sample
   * @returns {object|null} evento detectado, ou null se nada relevante ocorreu.
   */
  process({ accel, gyro, timestamp }) {
    const svm = magnitude(accel); // Signal Vector Magnitude da aceleração (g)
    const gyroMag = gyro ? magnitude(gyro) : 0; // rotação total (rad/s)
    const now = timestamp;
    const cfg = this.cfg;

    // Enquanto um evento está em andamento, guardamos os picos observados.
    if (this.state !== DetectorState.IDLE) {
      this.peakImpact = Math.max(this.peakImpact, svm);
      this.peakGyro = Math.max(this.peakGyro, gyroMag);
    }

    switch (this.state) {
      // ---------------------------------------------------------------
      case DetectorState.IDLE:
        // Caminho 1: começa por uma queda livre (aceleração cai para ~0 g).
        if (svm < cfg.freeFall) {
          this.state = DetectorState.FREE_FALL;
          this.freeFallStart = now;
          this.hadFreeFall = true;
          this.peakImpact = svm;
          this.peakGyro = gyroMag;
          return { type: EventType.FREE_FALL, svm, timestamp: now };
        }
        // Caminho 2: impacto forte sem queda livre clara (ex.: tropeço).
        if (svm > cfg.hardImpact) {
          this.state = DetectorState.IMPACT_WAIT;
          this.impactTime = now;
          this.hadFreeFall = false;
          this.peakImpact = svm;
          this.peakGyro = gyroMag;
          return { type: EventType.IMPACT, svm, timestamp: now };
        }
        return null;

      // ---------------------------------------------------------------
      case DetectorState.FREE_FALL:
        // Queda livre sem impacto em tempo hábil -> provável falso alarme.
        if (now - this.freeFallStart > cfg.freeFallWindowMs) {
          this.reset();
          return { type: EventType.RESET, reason: 'freefall_timeout', timestamp: now };
        }
        // Impacto detectado logo após a queda livre.
        if (svm > cfg.impact) {
          this.state = DetectorState.IMPACT_WAIT;
          this.impactTime = now;
          return { type: EventType.IMPACT, svm, timestamp: now };
        }
        return null;

      // ---------------------------------------------------------------
      case DetectorState.IMPACT_WAIT:
        // Pequena janela para o aparelho estabilizar após o impacto.
        if (now - this.impactTime > cfg.settleMs) {
          this.state = DetectorState.POST_IMPACT;
          this.inactivityStart = now;
        }
        return null;

      // ---------------------------------------------------------------
      case DetectorState.POST_IMPACT: {
        const movement = Math.abs(svm - 1); // desvio em relação à gravidade
        // Ainda há movimento -> a pessoa provavelmente não caiu / se recuperou.
        if (movement > cfg.inactivity) {
          this.inactivityStart = now;
        }
        // Imobilidade sustentada após o impacto -> confirma a queda.
        if (now - this.inactivityStart >= cfg.inactivityMs) {
          const confirmed = this._confirm();
          const result = confirmed
            ? {
                type: EventType.FALL,
                peakImpact: this.peakImpact,
                peakGyro: this.peakGyro,
                hadFreeFall: this.hadFreeFall,
                timestamp: now,
              }
            : { type: EventType.RESET, reason: 'low_confidence', timestamp: now };
          this.reset();
          return result;
        }
        // Evento longo demais sem confirmar -> descarta.
        if (now - this.impactTime > cfg.maxEventMs) {
          this.reset();
          return { type: EventType.RESET, reason: 'event_timeout', timestamp: now };
        }
        return null;
      }

      // ---------------------------------------------------------------
      default:
        this.reset();
        return null;
    }
  }

  /**
   * Regra de confirmação: soma uma pontuação a partir dos sinais coletados
   * e compara com o mínimo exigido pela sensibilidade (cfg.minScore).
   * Isso evita que um único limiar dispare a queda sozinho.
   */
  _confirm() {
    const cfg = this.cfg;
    let score = 0;
    if (this.peakImpact >= cfg.impact) score += 2; // houve impacto
    if (this.peakImpact >= cfg.hardImpact) score += 1; // impacto forte
    if (this.hadFreeFall) score += 1; // houve queda livre
    if (this.peakGyro >= cfg.gyro) score += 1; // houve rotação relevante (giroscópio)
    return score >= cfg.minScore;
  }
}
