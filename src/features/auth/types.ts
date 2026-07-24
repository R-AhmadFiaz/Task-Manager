export interface AuthFormState {
  error: string | null;
  info: string | null;
}

export const initialAuthFormState: AuthFormState = { error: null, info: null };
