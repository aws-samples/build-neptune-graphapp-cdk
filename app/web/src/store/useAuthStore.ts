import { create } from "zustand";

export interface AuthStore {
  user: string | null; // an object that stores user information
  isAuth: boolean;
  signInStep: string;
  setUser: (user: string) => void; // a function to set user information
  setIsAuthenticated: (isAuth: boolean) => void;
  setSignInStep: (signInStep: string) => void;
}

interface CredentialStoreInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credentials: any; // an object that stores user information
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setCredential: (credential: any) => void; // a function to set user information
}
export const useAuthStore = create<AuthStore>((set) => ({
  user: "", // initial value of user property
  isAuth: false,
  signInStep: "",
  setUser: (user) => set({ user }), // function to set user information
  setIsAuthenticated: (isAuth) => set({ isAuth }),
  setSignInStep: (signInStep) => set({ signInStep }),
}));

export const useCredentialStore = create<CredentialStoreInterface>((set) => ({
  credentials: {}, // initial value of credential property
  setCredential: (credentials) => set({ credentials }), // function to credential
}));
