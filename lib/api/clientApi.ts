import { api } from './api';
import type { User } from '@/types/user';
import type { Note, NoteTag } from '@/types/note';

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tag: NoteTag;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface UpdateMeData {
  username?: string;
  avatar?: string;
}

interface SessionResponse {
  success: boolean;
}

// Notes
export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const response = await api.get<FetchNotesResponse>('/notes', { params });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (data: CreateNoteData): Promise<Note> => {
  const response = await api.post<Note>('/notes', data);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
};

// Auth
export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.post<User>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const checkSession = async (): Promise<SessionResponse> => {
  const response = await api.get<SessionResponse>('/auth/session');
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

export const updateMe = async (data: UpdateMeData): Promise<User> => {
  const response = await api.patch<User>('/users/me', data);
  return response.data;
};
