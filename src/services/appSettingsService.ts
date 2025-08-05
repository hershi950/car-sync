import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppSetting = Database["public"]["Tables"]["app_settings"]["Row"];
type AppSettingInsert = Database["public"]["Tables"]["app_settings"]["Insert"];

export const appSettingsService = {
  async get(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    
    if (error) throw error;
    return data?.value || null;
  },

  async set(key: string, value: string): Promise<AppSetting> {
    const { data, error } = await supabase
      .from("app_settings")
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(): Promise<AppSetting[]> {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .order("key", { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};