"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => { await login(data); };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Welcome back</h1>
        <p className="text-slate-400">Sign in to your Resumiq account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-slate-600 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all",
              errors.email ? "border-red-500/60" : "border-white/10"
            )}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              {...register("password")}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-slate-600 text-sm pr-11",
                "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all",
                errors.password ? "border-red-500/60" : "border-white/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full justify-center py-3 text-base mt-2"
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
