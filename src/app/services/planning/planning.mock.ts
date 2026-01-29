import { EventsApiResponse } from "../../interfaces/events";

export const PLANNING_MOCK: EventsApiResponse = {
  items: [
    // --- Lundi 12 Janvier ---
    { id: 101, user_id: 4, title: "Analyse Système", start_time: "2026-01-12T09:00:00Z", end_time: "2026-01-12T12:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },
    { id: 102, user_id: 10, title: "Présence Bureau (Retard)", start_time: "2026-01-12T09:15:00Z", end_time: "2026-01-12T17:30:00Z", event_type: "presence", status: "scheduled", attendance_status: "late", all_day: false }, // RETARD 15min
    { id: 103, user_id: 11, title: "Formation Sécurité", start_time: "2026-01-12T14:00:00Z", end_time: "2026-01-12T16:00:00Z", event_type: "formation", status: "scheduled", attendance_status: "present", all_day: false },

    // --- Mardi 13 Janvier ---
    { id: 104, user_id: 4, title: "Session Admin (Retard)", start_time: "2026-01-13T10:45:00Z", end_time: "2026-01-13T12:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "late", all_day: false }, // RETARD 45min
    { id: 105, user_id: 12, title: "Absence Congé", start_time: "2026-01-13T09:00:00Z", end_time: "2026-01-13T18:00:00Z", event_type: "holiday", status: "scheduled", attendance_status: "absent", all_day: true },
    { id: 106, user_id: 8, title: "Test Technique", start_time: "2026-01-13T15:00:00Z", end_time: "2026-01-13T17:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },

    // --- Mercredi 14 Janvier ---
    { id: 107, user_id: 4, title: "Pause Déjeuner", start_time: "2026-01-14T12:00:00Z", end_time: "2026-01-14T13:30:00Z", event_type: "holiday", status: "scheduled", attendance_status: "present", all_day: false },
    { id: 108, user_id: 11, title: "Briefing Emilie (Retard)", start_time: "2026-01-14T11:10:00Z", end_time: "2026-01-14T11:30:00Z", event_type: "presence", status: "scheduled", attendance_status: "late", all_day: false }, // RETARD 10min
    { id: 109, user_id: 12, title: "Formation Angular", start_time: "2026-01-14T14:00:00Z", end_time: "2026-01-14T17:30:00Z", event_type: "formation", status: "scheduled", attendance_status: "present", all_day: false },

    // --- Jeudi 15 Janvier ---
    { id: 110, user_id: 10, title: "Réunion Ahmed", start_time: "2026-01-15T09:00:00Z", end_time: "2026-01-15T17:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: true },
    { id: 111, user_id: 11, title: "Présence Bureau", start_time: "2026-01-15T08:00:00Z", end_time: "2026-01-15T18:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },
    { id: 112, user_id: 10, title: "Absence Médicale", start_time: "2026-01-15T09:00:00Z", end_time: "2026-01-15T17:00:00Z", event_type: "absence", status: "scheduled", attendance_status: "absent", all_day: false },
    { id: 113, user_id: 4, title: "Audit Logs", start_time: "2026-01-15T14:00:00Z", end_time: "2026-01-15T16:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },

    // --- Vendredi 16 Janvier ---
    { id: 114, user_id: 8, title: "Maintenance (Retard)", start_time: "2026-01-16T10:20:00Z", end_time: "2026-01-16T12:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "late", all_day: false }, // RETARD 20min
    { id: 115, user_id: 14, title: "Télétravail", start_time: "2026-01-16T09:00:00Z", end_time: "2026-01-16T18:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: true },
    { id: 116, user_id: 4, title: "Révision Code", start_time: "2026-01-16T15:00:00Z", end_time: "2026-01-16T17:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },

    // --- Lundi 19 Janvier & Mardi 20 Janvier ---
    { id: 117, user_id: 4, title: "Astreinte (Retard)", start_time: "2026-01-19T09:30:00Z", end_time: "2026-01-19T12:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "late", all_day: false },
    { id: 118, user_id: 10, title: "Weekend Guard", start_time: "2026-01-19T10:00:00Z", end_time: "2026-01-19T16:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },
    { id: 119, user_id: 11, title: "Support Client", start_time: "2026-01-20T10:00:00Z", end_time: "2026-01-20T14:00:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false },
    { id: 120, user_id: 14, title: "Update Serveur", start_time: "2026-01-20T22:00:00Z", end_time: "2026-01-20T23:59:00Z", event_type: "presence", status: "scheduled", attendance_status: "present", all_day: false }
  ],
  total: 20,
  page: 0,
  limit: 20,
  pages: 1,
  links: {
    first: "https://prez-cool-staging.appsolutions224.com/api/v1/events?page=0&limit=20"
  }
};