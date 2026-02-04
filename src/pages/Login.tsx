import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { Button, Input } from "../shared/ui";

const Login: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ??
    "/upwork-dashboard";

  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, navigate, from]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      setError("Please provide both username and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFDFF] px-4">
      <div className="flex flex-col gap-11 w-full max-w-[468px] p-11 bg-white rounded-[10px] border border-[#EFEFEF]">
        <div className="flex justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="mb-6"
          >
            <path
              d="M24.748 17.5652C23.2787 17.5652 21.9013 16.934 20.6493 15.9067L20.9533 14.4523L20.964 14.3956C21.24 12.8506 22.096 10.2595 24.7493 10.2595C26.7387 10.2595 28.3533 11.8977 28.3533 13.913C28.352 15.9257 26.7373 17.5652 24.748 17.5652ZM24.748 6.56265C21.3627 6.56265 18.7347 8.79155 17.668 12.464C16.0413 9.98507 14.804 7.0087 14.0853 4.5H10.4373V14.1131C10.4347 16.0135 8.916 17.5544 7.04133 17.5571C5.168 17.5544 3.65067 16.0122 3.648 14.1131V4.5H0V14.1131C0 18.0518 3.16 21.281 7.04133 21.281C10.9253 21.281 14.0853 18.0518 14.0853 14.1131V12.5046C14.7907 14.0009 15.6613 15.5175 16.7173 16.8583L14.4867 27.5H18.216L19.8333 19.782C21.2507 20.6998 22.88 21.281 24.748 21.281C28.748 21.281 32 17.9667 32 13.9144C32 9.85937 28.748 6.56265 24.748 6.56265Z"
              fill="#0B106F"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-9">
          <div className="text-center">
            <h1 className="text-2xl font-normal text-[#141414]">
              Sign in to Upboard
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mt-6 px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-9" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-[#575757]"
                >
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="focus:ring-4"
                  placeholder="Enter your username..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#575757]"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password..."
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-xs font-normal text-center text-[#6B7280]">
            Need an account? Contact the administrator to get access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
