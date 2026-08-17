export type WorkStatus = 'PENDING' | 'APPROVED';
export type ChunkType = 'html' | 'image';

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
}

export interface JWTResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface UserDTO {
  id?: number;
  email?: string;
  username: string;
  password?: string;
  profilePhotoUrl?: string;
}

export interface ProfilePhotoUploadResponse {
  url: string;
}

export interface GenreDTO {
  id: number;
  name: string;
}

export interface CreateGenreRequest {
  name: string;
}

export interface AuthorResponse {
  id: number;
  name: string;
}

export interface AuthorFullResponse extends AuthorResponse {
  bio?: string;
  wiki?: string;
  dateOfBirth?: string;
  profilePhotoUrl?: string;
  works?: WorkSummaryDTO[];
}

export interface WorkSummaryDTO {
  id: number;
  title: string;
  description?: string;
}

export interface AllWorksDTO {
  id: number;
  title: string;
  description?: string;
  authorName: string;
  genres: GenreDTO[];
  imageUrl?: string;
}

export interface ChunkResponse {
  chunkId: number;
  chunkNumber: number;
  chunkType: ChunkType;
  text: string;
}

export interface ChapterResponse {
  chapterNumber: number;
  chapterTitle: string;
  chunks: ChunkResponse[];
}

export interface OtherWorksByAuthorResponse {
  id: number;
  title: string;
  coverUrl?: string;
}

export interface WorkResponse {
  workId: number;
  title: string;
  description: string;
  coverUrl?: string;
  author: AuthorResponse | null;
  genres: GenreDTO[];
  chapters: ChapterResponse[];
  otherWorks?: OtherWorksByAuthorResponse[];
}

export interface WorkSearchParams extends PaginationParams {
  q?: string;
  authorId?: number;
  genreIds?: number[];
  status?: WorkStatus;
  createdFrom?: string;
  createdTo?: string;
}

export interface CreateBookmarkRequest {
  workId: number;
  chapterId: number;
  chunkId: number;
  startOffset: number;
  endOffset: number;
  userNote?: string;
  workNote?: string;
}

export interface BookmarkResponse {
  id: number;
  workId: number;
  workTitle?: string;
  chapterId: number;
  chapterTitle?: string;
  chunkId: number;
  userNote?: string;
  workNote?: string;
  startOffset: number;
  endOffset: number;
  createdAt?: string;
  workImageUrl?: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface ChatSessionDTO {
  id: number;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatSessionWithMessages extends ChatSessionDTO {
  messages?: ChatMessage[];
}

export interface CreateChatSessionRequest {
  title: string;
}

export interface WebSocketChatMessage {
  query: string;
  bookName: string;
  sessionId: number;
}

export interface WebSocketChatResponse {
  text: string;
  sender: string;
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

export type Book = AllWorksDTO;

export function isWorkResponse(value: unknown): value is WorkResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'workId' in value &&
    typeof (value as WorkResponse).workId === 'number'
  );
}

export function isAllWorksDTO(value: unknown): value is AllWorksDTO {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'authorName' in value
  );
}

export function getCoverUrl(work?: WorkResponse | AllWorksDTO | null): string {
  if (!work) return '/images/default-cover.png';
  if ('coverUrl' in work && work.coverUrl) return work.coverUrl;
  if ('imageUrl' in work && work.imageUrl) return work.imageUrl;
  return '/images/default-cover.png';
}
