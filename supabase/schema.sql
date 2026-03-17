-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT CHECK (status IN ('planificado', 'en_progreso', 'completado', 'pausado')) DEFAULT 'planificado',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pomodoros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL, -- in seconds
  type TEXT CHECK (type IN ('work', 'short_break', 'long_break')) NOT NULL
);

CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6'
);

CREATE TABLE note_tags (
  note_id UUID REFERENCES notes ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies

-- Profiles: users can see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users can manage their own projects
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Tasks: users can manage their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Pomodoros: users can manage their own pomodoros
CREATE POLICY "Users can manage own pomodoros" ON pomodoros FOR ALL USING (auth.uid() = user_id);

-- Notes: users can manage their own notes
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- Tags: users can manage their own tags
CREATE POLICY "Users can manage own tags" ON tags FOR ALL USING (auth.uid() = user_id);

-- Note Tags: users can manage their own note tags (via note ownership)
CREATE POLICY "Users can manage own note tags" ON note_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid()));

-- Activity Log: users can view and create their own activity log
CREATE POLICY "Users can manage own activity log" ON activity_log FOR ALL USING (auth.uid() = user_id);

-- Trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
