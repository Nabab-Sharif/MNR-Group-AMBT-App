import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Update match status with constraint handling
 * Maps custom statuses (today, tomorrow) to allowed database values
 */
export const updateMatchStatus = async (
  matchId: string,
  status: string,
  onSuccess?: () => void
) => {
  try {
    // Map custom statuses to allowed database values
    // Database only allows: 'upcoming', 'live', 'completed'
    let dbStatus = status;
    if (status === 'today' || status === 'tomorrow') {
      dbStatus = 'upcoming'; // Store as upcoming, UI filters by date
    }

    const { error } = await supabase
      .from('matches')
      .update({ status: dbStatus })
      .eq('id', matchId);
    
    if (error) {
      toast.error(`Failed to update match status: ${error.message}`);
      return false;
    }

    toast.success(`Match status updated to ${status}`);
    
    if (onSuccess) {
      onSuccess();
    }
    
    return true;
  } catch (err) {
    toast.error("Failed to update match status");
    return false;
  }
};

/**
 * Get display status based on match date and database status
 */
export const getDisplayStatus = (match: any) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (match.status === 'live') {
    return 'live';
  }

  if (match.status === 'completed') {
    return 'completed';
  }

  // Status is 'upcoming'
  if (match.date === today) {
    return 'today';
  }

  if (match.date === tomorrow) {
    return 'tomorrow';
  }

  return 'upcoming';
};
