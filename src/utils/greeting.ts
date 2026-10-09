export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export function getGreetingPeriod(date: Date = new Date()): GreetingPeriod {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 18) return 'evening';
  return 'night';
}

const GREETING_I18N_KEYS: Record<GreetingPeriod, string> = {
  morning: 'dashboard.greetingMorning',
  afternoon: 'dashboard.greetingAfternoon',
  evening: 'dashboard.greetingEvening',
  night: 'dashboard.greetingNight',
};

export function getGreetingKey(date: Date = new Date()): string {
  return GREETING_I18N_KEYS[getGreetingPeriod(date)];
}
