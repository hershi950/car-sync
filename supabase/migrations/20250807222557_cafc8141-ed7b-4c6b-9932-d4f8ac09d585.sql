-- Create table for storing car location data
CREATE TABLE public.car_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  saved_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.car_locations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for all users
CREATE POLICY "Allow all operations on car_locations" 
ON public.car_locations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_car_locations_updated_at
BEFORE UPDATE ON public.car_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();