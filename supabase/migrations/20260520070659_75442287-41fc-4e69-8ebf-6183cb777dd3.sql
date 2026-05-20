
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.car_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  saved_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.car_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public write app_settings" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update app_settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Public delete app_settings" ON public.app_settings FOR DELETE USING (true);

CREATE POLICY "Public read car_locations" ON public.car_locations FOR SELECT USING (true);
CREATE POLICY "Public write car_locations" ON public.car_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update car_locations" ON public.car_locations FOR UPDATE USING (true);
CREATE POLICY "Public delete car_locations" ON public.car_locations FOR DELETE USING (true);

CREATE POLICY "Public read car_schedules" ON public.car_schedules FOR SELECT USING (true);
CREATE POLICY "Public write car_schedules" ON public.car_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update car_schedules" ON public.car_schedules FOR UPDATE USING (true);
CREATE POLICY "Public delete car_schedules" ON public.car_schedules FOR DELETE USING (true);

CREATE POLICY "Public read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public write team_members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update team_members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Public delete team_members" ON public.team_members FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_app_settings_updated BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_car_locations_updated BEFORE UPDATE ON public.car_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_car_schedules_updated BEFORE UPDATE ON public.car_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
