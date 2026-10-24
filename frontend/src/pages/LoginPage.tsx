import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { z } from "zod";
import { BookMarked, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import type { NormalizedApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as { from?: string } | null)?.from;

  if (user) {
    const dest = from ?? (user.role === "admin" ? "/admin/dashboard" : "/author/dashboard");
    return <Navigate to={dest} replace />;
  }

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: (u) => {
        const dest = from ?? (u.role === "admin" ? "/admin/dashboard" : "/author/dashboard");
        navigate(dest, { replace: true });
      },
      onError: (err: unknown) => {
        const apiErr = err as NormalizedApiError;
        toast.error(apiErr?.message ?? "Login failed. Please try again.");
      },
    });
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-800 to-brand-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <BookMarked className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">BookLeaf</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-white">
            Author support, simplified.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-100">
            Manage your books, raise support tickets, and get AI-assisted
            responses from our publishing team — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-brand-200">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
            Book management
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
            Smart ticketing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
            Real-time updates
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
                <BookMarked className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-ink">BookLeaf</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted">
            Sign in to your BookLeaf account to continue.{" "}
            <Link to="/register" className="font-medium text-brand-700 hover:underline">
              Create account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-8"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-8 pr-8"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 rounded-lg border border-border bg-surface-2 p-4">
            <p className="text-xs font-medium text-ink-2">Demo credentials</p>
            <div className="mt-2 space-y-1.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => fillDemo(cred.email, cred.password)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-surface-3"
                >
                  <span className="font-medium text-ink-2">{cred.label}</span>
                  <span className="text-muted">{cred.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.7rem] text-faint">
              Click to fill — then press Sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
