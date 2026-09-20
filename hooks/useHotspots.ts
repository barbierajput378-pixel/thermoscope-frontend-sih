"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FilterState, Hotspot } from "@/lib/types";

const POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

export function useHotspots(filters: FilterState) {
  const [allHotspots, setAllHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
    POLL_INTERVAL_MS / 1000
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHotspots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supaErr } = await supabase
        .from("hotspots")
        .select("*")
        .order("created_at", { ascending: false });

      if (supaErr) throw supaErr;
      setAllHotspots((data as Hotspot[]) ?? []);
      setLastRefreshed(new Date());
      setSecondsUntilRefresh(POLL_INTERVAL_MS / 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch hotspots");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + poll
  useEffect(() => {
    fetchHotspots();

    intervalRef.current = setInterval(fetchHotspots, POLL_INTERVAL_MS);

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      setSecondsUntilRefresh((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchHotspots]);

  // Apply client-side filters
  const hotspots = allHotspots.filter((h) => {
    if (filters.classification !== "all" && h.classification !== filters.classification)
      return false;
    if (filters.priority !== "all" && h.priority !== filters.priority) return false;
    if (!filters.showDemo && h.is_demo) return false;
    return true;
  });

  const demoCount = allHotspots.filter((h) => h.is_demo).length;
  const liveCount = allHotspots.filter((h) => !h.is_demo).length;

  return {
    hotspots,
    allHotspots,
    demoCount,
    liveCount,
    loading,
    error,
    lastRefreshed,
    secondsUntilRefresh,
    refresh: fetchHotspots,
  };
}
