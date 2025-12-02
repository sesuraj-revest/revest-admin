"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import { signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/core/lib/store";
import { axiosInstance } from "@/core/service/api";

interface UserContextType {
  accessToken: string;
}

const UserContext = createContext<UserContextType>({
  accessToken: "",
});

export const useUser = () => useContext(UserContext);

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { setUser, logout, refetchUser } = useAuthStore();

  // Extract access token from session
  const accessToken = (session?.user as any)?.accessToken || "";

  // Setup Axios Interceptors
  useLayoutEffect(() => {
    // Request Interceptor: Attach Token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          // If we get a 401, it means the token is invalid/expired
          // We should sign out the user
          await signOut({ redirect: false });
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, logout]);

  // Sync Session with Store
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user as any);

      // Optionally refetch fresh user data from API
      if (accessToken) {
        refetchUser();
      }
    } else if (status === "unauthenticated") {
      logout();
    }
  }, [session, status, setUser, logout, accessToken, refetchUser]);

  return (
    <UserContext.Provider value={{ accessToken }}>
      {children}
    </UserContext.Provider>
  );
}
