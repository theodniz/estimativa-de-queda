/**
 * notifications.js — Notificações locais (expo-notifications).
 *
 * Ao confirmar uma queda (e o usuário não cancelar a tempo), enviamos uma
 * notificação local simulando o aviso a um contato de emergência.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Como as notificações devem se comportar quando o app está em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Campos exigidos por versões mais recentes do SDK:
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permissão e configura o canal de notificação no Android.
 * @returns {Promise<boolean>} true se a permissão foi concedida.
 */
export async function setupNotifications() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // No Android criamos/atualizamos o canal "default" com importância máxima
    // para que a notificação apareça como heads-up e com som.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Alarme de Queda',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 300, 500],
        sound: 'default',
        lightColor: '#F0533F',
      });
    }

    return finalStatus === 'granted';
  } catch (e) {
    return false;
  }
}

/**
 * Dispara a notificação de queda imediatamente.
 * @param {{peakImpact?:number}} evt
 */
export async function sendFallNotification(evt) {
  try {
    const g = evt && typeof evt.peakImpact === 'number' ? evt.peakImpact.toFixed(1) : '?';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Queda detectada!',
        body: `Possível queda registrada (impacto de ${g} g). Verifique se está tudo bem.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // imediato
    });
  } catch (e) {
    // ignora falhas de notificação (ex.: permissão negada)
  }
}
