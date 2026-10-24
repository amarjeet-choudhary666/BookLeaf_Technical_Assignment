import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/query-client";

export function useInitAuth() {
  const { setUser, reset, isInitialized } = useAuthStore();

  useEffect(() => {
    const handler = () => {
      reset();
      queryClient.clear();
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [reset]);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) setUser(query.data);
    else if (query.isError) reset();
  }, [query.isSuccess, query.isError, query.data, setUser, reset]);

  return {
    isLoading: !isInitialized && query.isLoading,
    isInitialized: isInitialized || query.isError,
  };
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (user) => setUser(user),
  });
}

export function useLogout() {
  const reset = useAuthStore((s) => s.reset);
  return useMutation({
    mutationFn: logoutApi,
    onMutate: () => {
      reset();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useRequireRole() {
  const role = useAuthStore((s) => s.role);
  return useCallback(() => role, [role]);
}
