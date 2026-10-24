import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { Providers } from "@/app/providers";
import { router } from "@/app/router";
import { getCurrentUser } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, reset, setInitialized } = useAuthStore();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
        setInitialized(true);
      })
      .catch(() => {
        reset();
        setInitialized(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

function App() {
  return (
    <Providers>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </Providers>
  );
}

export default App;
