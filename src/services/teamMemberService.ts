import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"];

export const teamMemberService = {
  async list(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(member: Omit<TeamMemberInsert, "id" | "created_at">): Promise<TeamMember> {
    const { data, error } = await supabase
      .from("team_members")
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};