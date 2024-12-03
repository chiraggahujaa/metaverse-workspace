"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log('res', result);

      if (result?.ok) {
        router.push("/");
      } else {
        setError(result?.error || "");
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        "min-h-screen flex items-center justify-center transition-colors",
        isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"
      )}
    >
      <div
        className={clsx(
          "shadow-lg rounded-xl p-8 max-w-md w-full transition-all",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <button
            className={clsx(
              "p-2 rounded-full transition-all",
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            )}
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>
        </div>
        <p className="text-sm mb-6">
          Welcome back! Sign in to access your account.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => signIn("google")}
            className={clsx(
              "w-full flex items-center justify-center font-medium py-2 px-4 rounded-md transition-all",
              isDarkMode
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-500 hover:bg-red-400 text-white"
            )}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => signIn("facebook")}
            className={clsx(
              "w-full flex items-center justify-center font-medium py-2 px-4 rounded-md transition-all",
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-500 hover:bg-blue-400 text-white"
            )}
          >
            Sign in with Facebook
          </button>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-600"></div>
            <span className="px-2 text-gray-500">or</span>
            <div className="flex-grow h-px bg-gray-600"></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={clsx(
                  "mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 transition-all",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-gray-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-300"
                )}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={clsx(
                  "mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 transition-all",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-gray-500"
                    : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-300"
                )}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className={clsx(
                "w-full py-2 px-4 rounded-md font-medium transition-all",
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-400 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-white",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in with Credentials"}
            </button>
          </form>
        </div>
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a
            href="/auth/signup"
            className={clsx(
              "font-medium hover:underline transition-all",
              isDarkMode ? "text-blue-400" : "text-blue-500"
            )}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
