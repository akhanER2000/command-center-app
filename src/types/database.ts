export type Profile = {
  id: string; // uuid
  display_name: string | null;
  updated_at: string | null;
};

export type Project = {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  description: string | null;
  deadline: string | null; // date
  status: 'planificado' | 'en_progreso' | 'completado' | 'pausado';
  color: string | null;
  created_at: string | null;
};

export type Task = {
  id: string; // uuid
  project_id: string; // uuid
  user_id: string; // uuid
  name: string;
  is_completed: boolean;
  completed_at: string | null;
  position: number;
  created_at: string | null;
};

export type Pomodoro = {
  id: string; // uuid
  user_id: string; // uuid
  project_id: string | null; // uuid
  start_time: string | null;
  end_time: string | null;
  duration: number; // seconds
  type: 'work' | 'short_break' | 'long_break';
};

export type Tag = {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  color: string | null;
};

export type Note = {
  id: string; // uuid
  user_id: string; // uuid
  project_id: string | null; // uuid
  title: string;
  content: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NoteTag = {
  note_id: string; // uuid
  tag_id: string; // uuid
};

export type ActivityLog = {
  id: string; // uuid
  user_id: string; // uuid
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  created_at: string | null;
};
