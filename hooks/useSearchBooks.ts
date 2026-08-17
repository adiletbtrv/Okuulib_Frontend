import { AllWorksDTO } from "@/interfaces/interfaces";
import { worksApi } from "@/lib/api";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSearchBooks() {
  const [items, setItems] = useState<AllWorksDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setItems([]);
      setLoading(false);
      return [];
    }

    // Cancel in-flight active request to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const result = await worksApi.search({ q: trimmed }, { signal: controller.signal });
      setItems(result.content);
      return result.content;
    } catch (error: unknown) {
      const err = error as { name?: string; code?: string };
      if (axios.isCancel(error) || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return [];
      }
      if (__DEV__) console.error("Error searching books:", error);
      setItems([]);
      return [];
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setItems([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return { items, search, clear, loading };
}
