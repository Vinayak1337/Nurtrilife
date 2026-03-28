import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMealReminders(): Promise<void> {
  // Ensure the Android notification channel exists even if this is called
  // in a session where requestPermissions was skipped (already granted).
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = [
    { hour: 8, minute: 0, title: '🌅 Breakfast time!', body: 'Log your breakfast to start tracking your day.' },
    { hour: 12, minute: 30, title: '☀️ Lunch check-in', body: "Don't forget to log your lunch for accurate tracking." },
    { hour: 19, minute: 0, title: '🌙 Dinner reminder', body: 'Log your dinner to complete your daily nutrition log.' },
  ];

  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { type: 'meal-reminder' },
        // Required on Android 8+ to route the notification into our
        // custom channel (vibration pattern, importance level, etc.)
        ...(Platform.OS === 'android' && { channelId: 'meal-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledRemindersCount(): Promise<number> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}
