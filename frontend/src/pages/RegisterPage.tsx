import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { z } from "zod";
import {
  BookMarked,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { register as registerApi } from "@/services/authService";
import { queryClient } from "@/lib/query-client";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name must be 150 characters or fewer"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
    },
  });

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/author/dashboard"}
        replace
      />
    );
  }

  const onSubmit = async (values: RegisterForm) => {
    setIsPending(true);
    try {
      const newUser = await registerApi({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        city: values.city || undefined,
      });
      setUser(newUser);
      setInitialized(true);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Account created! Welcome to BookLeaf.");
      navigate("/author/dashboard", { replace: true });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      toast.error(apiErr?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsPending(false);
    }
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
            Join BookLeaf Publishing.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-100">
            Create your author account to manage your books, track royalties,
            and get dedicated publishing support — all from one portal.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { label: "Book management", desc: "View all your published titles and details." },
              { label: "Smart ticketing", desc: "Raise and track support requests easily." },
              { label: "Real-time updates", desc: "Get notified when your tickets are updated." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-brand-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-brand-300">
          © {new Date().getFullYear()} BookLeaf Publishing
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center overflow-y-auto p-6 lg:w-1/2">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
                <BookMarked className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-ink">BookLeaf</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-ink">Create your account</h2>
          <p className="mt-1.5 text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-700 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
            noValidate
          >
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name *</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  className="pl-8"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-danger-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address *</Label>
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="pl-8 pr-9"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password *</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="pl-8 pr-9"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Optional fields */}
            <div className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="mb-3 text-xs font-medium text-ink-2">
                Optional details
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className="pl-8"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-danger-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      placeholder="Mumbai, Delhi, Bangalore…"
                      className="pl-8"
                      {...register("city")}
                    />
                  </div>
                  {errors.city && (
                    <p className="text-xs text-danger-600">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create author account"
              )}
            </Button>

            <p className="text-center text-xs text-muted">
              By creating an account you confirm that you are an author
              registered with BookLeaf Publishing. Admin accounts are
              provisioned by the support team.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
