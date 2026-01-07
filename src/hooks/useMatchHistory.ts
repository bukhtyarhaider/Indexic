import { useState, useCallback, useEffect } from "react";
import { MatchRecord } from "@/types/match";

const MATCH_HISTORY_KEY = "indexic_match_history";
const MAX_HISTORY_ITEMS = 50;

/**
 * Custom hook for managing match history
 * Handles persistence, CRUD operations, and sorting
 */
export const useMatchHistory = () => {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(MATCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MatchRecord[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load match history:", error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((records: MatchRecord[]) => {
    try {
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(records));
      setHistory(records);
    } catch (error) {
      console.error("Failed to save match history:", error);
    }
  }, []);

  // Add a new match record
  const addRecord = useCallback(
    (record: MatchRecord) => {
      const updatedHistory = [record, ...history].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updatedHistory);
    },
    [history, saveHistory]
  );

  // Update an existing record
  const updateRecord = useCallback(
    (recordId: string, updates: Partial<MatchRecord>) => {
      const updatedHistory = history.map((record) =>
        record.id === recordId ? { ...record, ...updates } : record
      );
      saveHistory(updatedHistory);
    },
    [history, saveHistory]
  );

  // Delete a record
  const deleteRecord = useCallback(
    (recordId: string) => {
      const updatedHistory = history.filter((record) => record.id !== recordId);
      saveHistory(updatedHistory);
      if (selectedRecordId === recordId) {
        setSelectedRecordId(null);
      }
    },
    [history, saveHistory, selectedRecordId]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([]);
    setSelectedRecordId(null);
  }, [saveHistory]);

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
