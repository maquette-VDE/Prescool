interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'present' | 'absent' | 'late' | 'generic';
}