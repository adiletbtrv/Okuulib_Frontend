import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { worksApi } from "../lib/api";
import { AllWorksDTO, WorkSearchParams } from "../types";

export function useSearchBooks() {
  const [items, setItems] = useState<AllWorksDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string, filterParams?: Omit<WorkSearchParams, "q">) => {
      const trimmed = query.trim();
      if (!trimmed && !filterParams?.genreIds?.length && !filterParams?.authorId) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setItems([]);
        setLoading(false);
        return [];
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      try {
        const result = await worksApi.search(
          { q: trimmed, ...filterParams },
          { signal: controller.signal }
        );
        setItems(result.content);
        return result.content;
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string };
        if (
          axios.isCancel(error) ||
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return [];
        }
        setItems([]);
        return [];
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    []
  );

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
