import { cookies } from 'next/headers';
import { api } from './api';
import type { User } from '@/types/user';
import type { Note } from '@/types/note';
import type { FetchNotesResponse, FetchNotesParams } from './clientApi';

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

// Notes
export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const cookieHeader = await getCookieHeader();
  const response = await api.get<FetchNotesResponse>('/notes', {
    params,
    headers: { Cookie: cookieHeader },
  });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieHeader = await getCookieHeader();
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: { Cookie: cookieHeader },
  });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const cookieHeader = await getCookieHeader();
  const response = await api.get<User>('/users/me', {
    headers: { Cookie: cookieHeader },
  });
  return response.data;
};

export const checkSession = async (): Promise<{ success: boolean }> => {
  const cookieHeader = await getCookieHeader();
  const response = await api.get<{ success: boolean }>('/auth/session', {
    headers: { Cookie: cookieHeader },
  });
  return response.data;
};
