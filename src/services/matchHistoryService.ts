import { supabase } from "@/lib/supabase";
import { MatchRecord, RecommendationResult } from "@/types/match";
import {
  MatchHistoryRow,
  MatchHistoryInsert,
  MatchHistoryUpdate,
} from "@/types/database";

/**
 * Match History Service
 * Handles Supabase database operations for match history
 */

/**
 * Convert database row to MatchRecord
 */
const dbRowToMatchRecord = (row: MatchHistoryRow): MatchRecord => {
  return {
    id: row.id,
    timestamp: row.timestamp,
    requirements: row.requirements,
    clientName: row.client_name || undefined,
    recommendations:
      (row.recommendations as unknown as RecommendationResult[]) || [],
    selectedProjectIds: row.selected_project_ids || [],
    proposal: row.proposal || undefined,
    senderType: (row.sender_type as "agency" | "individual") || "agency",
  };
};

/**
 * Convert MatchRecord to database insert format
 */
const matchRecordToDbInsert = (
  record: MatchRecord,
  userId: string
): MatchHistoryInsert => {
  return {
    // id is omitted - Supabase will generate it with gen_random_uuid()
    user_id: userId,
    timestamp: record.timestamp, // Keep as Unix timestamp (number)
    requirements: record.requirements,
    client_name: record.clientName || null,
    recommendations: record.recommendations as any,
    selected_project_ids: record.selectedProjectIds,
    proposal: record.proposal || null,
    sender_type: record.senderType,
  };
};

/**
 * Convert partial MatchRecord to database update format
 */
const matchRecordToDbUpdate = (
  updates: Partial<MatchRecord>
): MatchHistoryUpdate => {
  const dbUpdate: MatchHistoryUpdate = {};

  if (updates.timestamp !== undefined) dbUpdate.timestamp = updates.timestamp; // Keep as Unix timestamp (number)
  if (updates.requirements !== undefined)
    dbUpdate.requirements = updates.requirements;
  if (updates.clientName !== undefined)
    dbUpdate.client_name = updates.clientName || null;
  if (updates.recommendations !== undefined)
    dbUpdate.recommendations = updates.recommendations as any;
  if (updates.selectedProjectIds !== undefined)
    dbUpdate.selected_project_ids = updates.selectedProjectIds;
  if (updates.proposal !== undefined)
    dbUpdate.proposal = updates.proposal || null;
  if (updates.senderType !== undefined)
    dbUpdate.sender_type = updates.senderType;

  dbUpdate.updated_at = new Date().toISOString();

  return dbUpdate;
};

/**
 * Fetch all match history for a user
 */
export const fetchMatchHistory = async (
  userId: string
): Promise<MatchRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("match_history")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching match history:", error);
      throw error;
    }

    return (data || []).map(dbRowToMatchRecord);
  } catch (error) {
    console.error("Failed to fetch match history:", error);
    throw error;
  }
};

/**
 * Create a new match history record
 */
export const createMatchHistory = async (
  record: MatchRecord,
  userId: string
): Promise<MatchRecord> => {
  try {
    const dbRecord = matchRecordToDbInsert(record, userId);

    const { data, error } = await supabase
      .from("match_history")
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error("Error creating match history:", error);
      throw error;
    }

    return dbRowToMatchRecord(data);
  } catch (error) {
    console.error("Failed to create match history:", error);
    throw error;
  }
};

/**
 * Update an existing match history record
 */
export const updateMatchHistory = async (
  recordId: string,
  updates: Partial<MatchRecord>,
  userId: string
): Promise<MatchRecord> => {
  try {
    const dbUpdate = matchRecordToDbUpdate(updates);

    const { data, error } = await supabase
      .from("match_history")
      .update(dbUpdate)
      .eq("id", recordId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating match history:", error);
      throw error;
    }

    return dbRowToMatchRecord(data);
  } catch (error) {
    console.error("Failed to update match history:", error);
    throw error;
  }
};

/**
 * Delete a match history record
 */
export const deleteMatchHistory = async (
  recordId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("match_history")
      .delete()
      .eq("id", recordId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting match history:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete match history:", error);
    throw error;
  }
};

/**
 * Clear all match history for a user
 */
export const clearAllMatchHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("match_history")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing match history:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to clear match history:", error);
    throw error;
  }
};
