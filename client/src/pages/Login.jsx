import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Activity, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail("demo@sweety.com");
    setPassword("Password123!");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      showSuccess("Welcome back!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-[#E9ECE7] p-8 sm:p-9">
        {/* Header with Sweety Pulse Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#101310] text-[#C5F53C] rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-lg">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171917] tracking-tight">
            Welcome to Sweety
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium mt-1">
            Sign in to access your personal blood glucose logs
          </p>
        </div>

        {/* Demo Assessment Account Box */}
        <div className="mb-6 p-4 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-extrabold text-[#171917] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#101310]" />
              Demo Assessment Account
            </p>
            <p className="text-[#777D78] text-[11px] font-medium mt-0.5">
              demo@sweety.com • Password123!
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-3 py-1.5 bg-[#101310] hover:bg-black text-[#C5F53C] text-xs font-bold rounded-xl transition shadow-xs"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#F15B52]/10 border border-[#F15B52]/20 text-[#F15B52] rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold text-sm placeholder-[#777D78] focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold text-sm placeholder-[#777D78] focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#C5F53C] hover:bg-[#b8eb2f] disabled:opacity-60 text-[#101310] font-black rounded-2xl shadow-md transition active:scale-95 cursor-pointer text-sm"
          >
            <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E9ECE7] text-center">
          <p className="text-xs sm:text-sm text-[#777D78] font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="font-extrabold text-[#171917] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
