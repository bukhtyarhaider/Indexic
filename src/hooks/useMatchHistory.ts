import { useState, useCallback, useEffect } from "react";
import { MatchRecord } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMatchHistory,
  createMatchHistory,
  updateMatchHistory,
  deleteMatchHistory,
  clearAllMatchHistory,
} from "@/services/matchHistoryService";

const MATCH_HISTORY_KEY = "indexic_match_history";
const MAX_HISTORY_ITEMS = 50;

/**
 * Custom hook for managing match history
 * Handles persistence with Supabase and localStorage fallback, CRUD operations, and sorting
 */
export const useMatchHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history from Supabase or localStorage on mount
  useEffect(() => {
    loadHistory();
  }, [user]);

  // Load history from Supabase (or localStorage as fallback)
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Load from Supabase
        const records = await fetchMatchHistory(user.id);
        setHistory(records);
      } else {
        // Fallback to localStorage when not authenticated
        const stored = localStorage.getItem(MATCH_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as MatchRecord[];
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load match history:", error);
      setError("Failed to load match history");
      // Fallback to localStorage on error
      try {
        const stored = localStorage.getItem(MATCH_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as MatchRecord[];
          setHistory(parsed);
        }
      } catch (e) {
        setHistory([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((records: MatchRecord[]) => {
    try {
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, []);

  // Add a new match record
  const addRecord = useCallback(
    async (record: MatchRecord) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          // Save to Supabase
          const savedRecord = await createMatchHistory(record, user.id);
          const updatedHistory = [savedRecord, ...history].slice(
            0,
            MAX_HISTORY_ITEMS
          );
          setHistory(updatedHistory);
          saveToLocalStorage(updatedHistory);
        } else {
          // Fallback to localStorage
          const updatedHistory = [record, ...history].slice(
            0,
            MAX_HISTORY_ITEMS
          );
          setHistory(updatedHistory);
          saveToLocalStorage(updatedHistory);
        }
      } catch (error) {
        console.error("Failed to add match record:", error);
        setError("Failed to save match history");
        // Fallback to localStorage on error
        const updatedHistory = [record, ...history].slice(0, MAX_HISTORY_ITEMS);
        setHistory(updatedHistory);
        saveToLocalStorage(updatedHistory);
      } finally {
        setIsLoading(false);
      }
    },
    [history, user, saveToLocalStorage]
  );

  // Update an existing record
  const updateRecord = useCallback(
    async (recordId: string, updates: Partial<MatchRecord>) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          // Update in Supabase
          const updatedRecord = await updateMatchHistory(
            recordId,
            updates,
            user.id
          );
          const updatedHistory = history.map((record) =>
            record.id === recordId ? updatedRecord : record
          );
          setHistory(updatedHistory);
          saveToLocalStorage(updatedHistory);
        } else {
          // Fallback to localStorage
          const updatedHistory = history.map((record) =>
            record.id === recordId ? { ...record, ...updates } : record
          );
          setHistory(updatedHistory);
          saveToLocalStorage(updatedHistory);
        }
      } catch (error) {
        console.error("Failed to update match record:", error);
        setError("Failed to update match history");
        // Fallback to localStorage on error
        const updatedHistory = history.map((record) =>
          record.id === recordId ? { ...record, ...updates } : record
        );
        setHistory(updatedHistory);
        saveToLocalStorage(updatedHistory);
      } finally {
        setIsLoading(false);
      }
    },
    [history, user, saveToLocalStorage]
  );

  // Delete a record
  const deleteRecord = useCallback(
    async (recordId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (user) {
          // Delete from Supabase
          await deleteMatchHistory(recordId, user.id);
        }

        // Update local state
        const updatedHistory = history.filter(
          (record) => record.id !== recordId
        );
        setHistory(updatedHistory);
        saveToLocalStorage(updatedHistory);

        if (selectedRecordId === recordId) {
          setSelectedRecordId(null);
        }
      } catch (error) {
        console.error("Failed to delete match record:", error);
        setError("Failed to delete match history");
        // Still remove from local state on error
        const updatedHistory = history.filter(
          (record) => record.id !== recordId
        );
        setHistory(updatedHistory);
        saveToLocalStorage(updatedHistory);

        if (selectedRecordId === recordId) {
          setSelectedRecordId(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [history, user, selectedRecordId, saveToLocalStorage]
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Clear from Supabase
        await clearAllMatchHistory(user.id);
      }

      setHistory([]);
      saveToLocalStorage([]);
      setSelectedRecordId(null);
    } catch (error) {
      console.error("Failed to clear match history:", error);
      setError("Failed to clear match history");
      // Still clear local state on error
      setHistory([]);
      saveToLocalStorage([]);
      setSelectedRecordId(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, saveToLocalStorage]);

  // Get sorted history (newest first)
  const getSortedHistory = useCallback(() => {
    return [...history].sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  // Get selected record
  const getSelectedRecord = useCallback(() => {
    return history.find((record) => record.id === selectedRecordId) || null;
  }, [history, selectedRecordId]);

  // Get records with proposals only
  const getProposalRecords = useCallback(() => {
    return history.filter((record) => !!record.proposal);
  }, [history]);

  // Get records without proposals (search only)
  const getSearchRecords = useCallback(() => {
    return history.filter((record) => !record.proposal);
  }, [history]);

  return {
    history,
    selectedRecordId,
    setSelectedRecordId,
    addRecord,
    updateRecord,
    deleteRecord,
    clearHistory,
    getSortedHistory,
    getSelectedRecord,
    getProposalRecords,
    getSearchRecords,
    loadHistory,
  };
};
