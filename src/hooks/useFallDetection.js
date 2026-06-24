/**
 * useFallDetection.js
 * ----------------------------------------------------------------------------
 * Hook que conecta tudo:
 *   - assina o acelerômetro e o giroscópio (expo-sensors);
 *   - alimenta o algoritmo (FallDetector) a cada amostra;
 *   - dispara o alarme (vibração) quando uma queda é confirmada;
 *   - expõe estado pronto para a interface (status, leituras, histórico).
 *
 * Usamos "refs" para os valores lidos dentro do callback do sensor, evitando
 * closures desatualizados e re-assinaturas desnecessárias a cada render.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';

import { FallDetector, EventType } from '../utils/fallAlgorithm';
import { startAlarm, stopAlarm } from '../services/alarm';
import { sendFallNotification } from '../services/notifications';
import { UPDATE_INTERVAL_MS } from '../constants/thresholds';

const magnitude = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

/** Status de alto nível para a interface. */
export const Status = {
  IDLE: 'IDLE', // parado (não monitorando)
  MONITORING: 'MONITORING', // monitorando, tudo normal
  ANALYZING: 'ANALYZING', // evento em análise (queda livre/impacto)
  ALARM: 'ALARM', // queda confirmada, alarme ativo
};

export function useFallDetection() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sensitivity, setSensitivity] = useState('medium');
  const [status, setStatus] = useState(Status.IDLE);
  const [svm, setSvm] = useState(1); // aceleração atual (g)
  const [gyroMag, setGyroMag] = useState(0); // rotação atual (rad/s)
  const [peakImpact, setPeakImpact] = useState(0);
  const [fallActive, setFallActive] = useState(false);
  const [lastFall, setLastFall] = useState(null);
  const [events, setEvents] = useState([]);
  const [available, setAvailable] = useState(true);

  // Refs auxiliares (lidos dentro do callback do sensor).
  const detectorRef = useRef(new FallDetector('medium'));
  const gyroRef = useRef({ x: 0, y: 0, z: 0 });
  const fallActiveRef = useRef(false);
  const accelSubRef = useRef(null);
  const gyroSubRef = useRef(null);

  // Mantém a sensibilidade do detector sincronizada com o estado.
  useEffect(() => {
    detectorRef.current.setSensitivity(sensitivity);
  }, [sensitivity]);

  // Mantém o ref espelhando o estado fallActive.
  useEffect(() => {
    fallActiveRef.current = fallActive;
  }, [fallActive]);

  const pushEvent = useCallback((evt) => {
    setEvents((prev) => [evt, ...prev].slice(0, 50));
  }, []);

  /** Chamado quando uma queda é confirmada (real ou de teste). */
  const handleFall = useCallback(
    (evt) => {
      if (fallActiveRef.current) return; // já há um alarme ativo
      fallActiveRef.current = true;
      setFallActive(true);
      setStatus(Status.ALARM);
      setLastFall(evt);
      startAlarm();
      pushEvent({
        id: `${evt.timestamp}-fall`,
        kind: 'FALL',
        label: 'Queda detectada',
        detail: `Impacto ${Number(evt.peakImpact || 0).toFixed(1)} g`,
        time: new Date(),
      });
    },
    [pushEvent]
  );

  /** Callback do acelerômetro: processa cada amostra. */
  const onAccel = useCallback(
    (accel) => {
      const now = Date.now();
      const gyro = gyroRef.current;
      const sAccel = magnitude(accel);
      const sGyro = magnitude(gyro);

      setSvm(sAccel);
      setGyroMag(sGyro);

      const result = detectorRef.current.process({ accel, gyro, timestamp: now });
      setPeakImpact(detectorRef.current.peakImpact);

      // Atualiza o status intermediário (a não ser que já haja alarme ativo).
      if (!fallActiveRef.current) {
        setStatus(
          detectorRef.current.state === 'IDLE' ? Status.MONITORING : Status.ANALYZING
        );
      }

      if (!result) return;

      if (result.type === EventType.FALL) {
        handleFall(result);
      } else if (result.type === EventType.FREE_FALL) {
        pushEvent({
          id: `${now}-ff`,
          kind: 'INFO',
          label: 'Queda livre detectada',
          detail: `${sAccel.toFixed(2)} g`,
          time: new Date(),
        });
      } else if (result.type === EventType.IMPACT) {
        pushEvent({
          id: `${now}-im`,
          kind: 'INFO',
          label: 'Impacto detectado',
          detail: `${sAccel.toFixed(2)} g`,
          time: new Date(),
        });
      }
    },
    [handleFall, pushEvent]
  );

  /** Inicia o monitoramento (assina os sensores). */
  const start = useCallback(async () => {
    const ok = await Accelerometer.isAvailableAsync();
    setAvailable(ok);
    if (!ok) return;

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    Gyroscope.setUpdateInterval(UPDATE_INTERVAL_MS);

    detectorRef.current.reset();

    gyroSubRef.current = Gyroscope.addListener((data) => {
      gyroRef.current = data;
    });
    accelSubRef.current = Accelerometer.addListener(onAccel);

    setIsMonitoring(true);
    setStatus(Status.MONITORING);
  }, [onAccel]);

  /** Para o monitoramento e limpa tudo. */
  const stop = useCallback(() => {
    accelSubRef.current && accelSubRef.current.remove();
    gyroSubRef.current && gyroSubRef.current.remove();
    accelSubRef.current = null;
    gyroSubRef.current = null;
    stopAlarm();
    detectorRef.current.reset();
    fallActiveRef.current = false;
    setFallActive(false);
    setIsMonitoring(false);
    setStatus(Status.IDLE);
    setPeakImpact(0);
  }, []);

  /**
   * Encerra o alarme atual.
   * @param {boolean} safe true se o usuário confirmou que está bem.
   */
  const dismissAlarm = useCallback(
    (safe) => {
      stopAlarm();
      detectorRef.current.reset();
      fallActiveRef.current = false;
      setFallActive(false);
      setStatus(isMonitoring ? Status.MONITORING : Status.IDLE);
      pushEvent({
        id: `${Date.now()}-dismiss`,
        kind: safe ? 'OK' : 'NOTIFY',
        label: safe ? 'Usuário confirmou que está bem' : 'Contato de emergência notificado',
        detail: '',
        time: new Date(),
      });
    },
    [isMonitoring, pushEvent]
  );

  /** Dispara o envio da notificação (usado quando a contagem zera). */
  const notifyContacts = useCallback(() => {
    sendFallNotification(lastFall || { peakImpact });
  }, [lastFall, peakImpact]);

  /** Simula uma queda (para demonstração/teste sem precisar derrubar o aparelho). */
  const triggerTest = useCallback(() => {
    handleFall({
      type: EventType.FALL,
      peakImpact: 3.6,
      peakGyro: 3.0,
      hadFreeFall: true,
      timestamp: Date.now(),
      simulated: true,
    });
  }, [handleFall]);

  // Limpeza ao desmontar.
  useEffect(() => {
    return () => {
      accelSubRef.current && accelSubRef.current.remove();
      gyroSubRef.current && gyroSubRef.current.remove();
      stopAlarm();
    };
  }, []);

  return {
    // estado
    isMonitoring,
    sensitivity,
    status,
    svm,
    gyroMag,
    peakImpact,
    fallActive,
    lastFall,
    events,
    available,
    // ações
    start,
    stop,
    dismissAlarm,
    notifyContacts,
    triggerTest,
    setSensitivity,
  };
}
