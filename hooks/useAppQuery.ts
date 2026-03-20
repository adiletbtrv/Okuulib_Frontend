import type {
  AllWorksDTO,
  BookmarkResponse,
  ChangePasswordRequest,
  ChatSessionDTO,
  ChatSessionWithMessages,
  CreateBookmarkRequest,
  GenreDTO,
  JWTResponse,
  PaginatedResponse,
  PaginationParams,
  RegisterRequest,
  UserDTO,
  WorkResponse,
  WorkSearchParams,
} from "@/interfaces/interfaces";
import {
  authApi,
  bookmarksApi,
  chatSessionsApi,
  genresApi,
  worksApi,
} from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useAppQuery<TData, TError = unknown>(
  key: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, typeof key>, "queryKey" | "queryFn">
) {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn,
    ...(options ?? {}),
  });
}

export function useAppMutation<TData, TVariables = void, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...(options ?? {}),
  });
}

export function useBooks() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useAppQuery<AllWorksDTO[]>(
    ["books"] as const,
    async () => {
      const result = await worksApi.getAll({ size: 50 });
      return result.content;
    },
    {
      enabled: isHydrated,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    }
  );
}
export function useBookDetail(workId?: number) {
  return useAppQuery<WorkResponse>(
    ["work", workId] as const,
    () => worksApi.getById(workId!),
    { enabled: !!workId }
  );
}

export function useSearchWorks(params?: WorkSearchParams) {
  return useAppQuery<PaginatedResponse<AllWorksDTO>>(
    ["works-search", params] as const,
    () => worksApi.search(params ?? { q: "" }),
    { enabled: !!params?.q }
  );
}

export function useLoginMutation() {
  return useAppMutation<JWTResponse, { username: string; password: string }>(
    (payload) => authApi.login(payload)
  );
}

export function useRegisterMutation() {
  return useAppMutation<JWTResponse, RegisterRequest>(
    (payload) => authApi.register(payload) as unknown as Promise<JWTResponse>
  );
}

export function useProfileQuery() {
  return useAppQuery<UserDTO>(["me"], () => authApi.me());
}

export function useChangePasswordMutation() {
  return useAppMutation<void, ChangePasswordRequest>(
    (payload) => authApi.changePassword(payload)
  );
}

export function useUploadProfilePhotoMutation() {
  const qc = useQueryClient();
  return useAppMutation<{ url: string }, FormData>(
    (formData) => authApi.uploadProfilePhoto(formData),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }) }
  );
}

export function useDeleteProfilePhotoMutation() {
  const qc = useQueryClient();
  return useAppMutation<void, void>(
    () => authApi.deleteProfilePhoto(),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }) }
  );
}

export function useGenres() {
  return useAppQuery<GenreDTO[]>(["genres"], () => genresApi.getAll());
}

export function useBookmarks(params?: PaginationParams) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      if (accessToken) qc.invalidateQueries({ queryKey: ["bookmarks"] });
    }, [accessToken, qc])
  );

  return useAppQuery<BookmarkResponse[]>(
    ["bookmarks", params] as const,
    async () => {
      const result = await bookmarksApi.getAll(params);
      return result.content;
    },
    { enabled: !!accessToken }
  );
}

export function useCreateBookmarkMutation() {
  const qc = useQueryClient();
  return useAppMutation<BookmarkResponse, CreateBookmarkRequest>(
    (payload) => bookmarksApi.create(payload),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }) }
  );
}

export function useDeleteBookmarkMutation() {
  const qc = useQueryClient();
  return useAppMutation<void, number>(
    (id) => bookmarksApi.delete(id),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }) }
  );
}

export function useClearAllBookmarksMutation() {
  const qc = useQueryClient();
  return useAppMutation<void, void>(
    () => bookmarksApi.clearAll(),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }) }
  );
}

export function useChatSessions(params?: PaginationParams) {
  return useAppQuery<ChatSessionDTO[]>(
    ["chat-sessions", params] as const,
    async () => {
      const result = await chatSessionsApi.getAll(params);
      return result.content;
    }
  );
}

export function useChatSessionDetail(sessionId?: number) {
  return useAppQuery<ChatSessionWithMessages>(
    ["chat-session", sessionId] as const,
    () => chatSessionsApi.getById(sessionId!),
    { enabled: !!sessionId }
  );
}

export function useCreateChatSessionMutation() {
  const qc = useQueryClient();
  return useAppMutation<ChatSessionDTO, { title: string }>(
    (payload) => chatSessionsApi.create(payload),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-sessions"] }) }
  );
}

export function useDeleteChatSessionMutation() {
  const qc = useQueryClient();
  return useAppMutation<void, number>(
    (id) => chatSessionsApi.delete(id),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-sessions"] }) }
  );
}