import { AllWorksDTO } from "@/interfaces/interfaces";
import { worksApi } from "@/lib/api";
import { useCallback, useState } from "react";

export function useSearchBooks() {
  const [items, setItems] = useState<AllWorksDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setItems([]);
        return [];
      }
      setLoading(true);
      try {
        const result = await worksApi.search({ q: query });
        setItems(result.content);
        return result.content;
      } catch (error) {
        if (__DEV__) console.error("Error searching books:", error);
        setItems([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return { items, search, clear, loading };
}
