import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CarSchedule = Database["public"]["Tables"]["car_schedules"]["Row"];
type CarScheduleInsert = Database["public"]["Tables"]["car_schedules"]["Insert"];

export const carScheduleService = {
  async list(): Promise<CarSchedule[]> {
    const { data, error } = await supabase
      .from("car_schedules")
      .select("*")
      .order("start_time", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(schedule: Omit<CarScheduleInsert, "id" | "created_at" | "updated_at">): Promise<CarSchedule> {
    const { data, error } = await supabase
      .from("car_schedules")
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("car_schedules")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  async update(id: string, updates: Partial<CarScheduleInsert>): Promise<CarSchedule> {
    const { data, error } = await supabase
      .from("car_schedules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};