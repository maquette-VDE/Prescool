export interface UserEvent {
  id: number;
  user_id: number;
  title: string;
  start_time: string;
  end_time: string;
  event_type: 'presence' | 'absence' | 'formation' | 'mission' | 'meeting' | 'holiday' | 'request';
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  attendance_status: 'present' | 'absent' | 'late' | 'excused'| 'remote' | 'mission';
  all_day: boolean;
}

export interface EventsApiResponse {
  items: UserEvent[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  links: {
    first: string;
    last?: string;
    next?: string;
    prev?: string;
  };
}
