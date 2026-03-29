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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const inputClass = (hasError: boolean) => cn(
  "w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-slate-600 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all",
  hasError ? "border-red-500/60" : "border-white/10"
);

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await signup({ name: data.name, email: data.email, password: data.password });
  };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Create account</h1>
        <p className="text-slate-400">Start building your perfect resume today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
          <input type="text" autoComplete="name" placeholder="Abhishek Saklani"
            {...register("name")} className={inputClass(!!errors.name)} />
          {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email</label>
          <input type="email" autoComplete="email" placeholder="you@example.com"
            {...register("email")} className={inputClass(!!errors.email)} />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              {...register("password")}
              className={cn(inputClass(!!errors.password), "pr-11")}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
          <input type={showPassword ? "text" : "password"} autoComplete="new-password"
            placeholder="Repeat your password"
            {...register("confirmPassword")} className={inputClass(!!errors.confirmPassword)} />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isLoading}
          className="btn-primary w-full justify-center py-3 text-base mt-2">
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            : <>Create Account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-5">
        By signing up you agree to our{" "}
        <span className="text-slate-400 underline cursor-pointer">Terms</span> &{" "}
        <span className="text-slate-400 underline cursor-pointer">Privacy Policy</span>
      </p>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
