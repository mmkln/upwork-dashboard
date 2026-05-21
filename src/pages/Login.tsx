import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { Button, Card, FormField } from "../shared/ui";
import ubAppLogo from "../assets/ub-app-logo.svg";

const UpboardMark: React.FC = () => (
  <img
    src={ubAppLogo}
    alt=""
    aria-hidden="true"
    className="h-8 w-8"
  />
);

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

    if (!username.trim() || !password) {
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
    <main className="flex min-h-svh items-center justify-center bg-background px-app-gutter py-page">
      <Card className="w-full max-w-form p-card sm:p-panel">
        <div className="flex flex-col gap-panel">
          <header className="flex flex-col items-center gap-component text-center">
            <UpboardMark />
            <h1 className="text-heading text-text-primary">
              Sign in to Upboard
            </h1>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-control border border-destructive/20 bg-destructive-muted px-component py-control text-body text-destructive"
            >
              {error}
            </div>
          )}

          <form className="flex flex-col gap-card" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-component">
              <FormField
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                label="Username"
                value={username}
                onValueChange={(value) => {
                  setUsername(value);
                  setError(null);
                }}
                placeholder="Enter your username"
              />

              <FormField
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                label="Password"
                value={password}
                onValueChange={(value) => {
                  setPassword(value);
                  setError(null);
                }}
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-body text-text-muted">
            Need an account? Contact the administrator to get access.
          </p>
        </div>
      </Card>
    </main>
  );
};

export default Login;
