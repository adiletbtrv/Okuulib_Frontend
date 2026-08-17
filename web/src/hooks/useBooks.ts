import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorsApi, bookmarksApi, genresApi, worksApi } from "../lib/api";
import { CreateBookmarkRequest, PaginationParams, WorkSearchParams } from "../types";

export function useWorks(params?: PaginationParams) {
  return useQuery({
    queryKey: ["works", params],
    queryFn: () => worksApi.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookDetails(id: number) {
  return useQuery({
    queryKey: ["work", id],
    queryFn: () => worksApi.getById(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => genresApi.getAll(),
    staleTime: 1000 * 60 * 60,
  });
}

export function useAuthor(id: number) {
  return useQuery({
    queryKey: ["author", id],
    queryFn: () => authorsApi.getById(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useBookmarks(params?: PaginationParams) {
  return useQuery({
    queryKey: ["bookmarks", params],
    queryFn: () => bookmarksApi.getAll(params),
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookmarkRequest) => bookmarksApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookmarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
