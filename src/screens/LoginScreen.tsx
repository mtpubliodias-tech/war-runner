import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, getStoredUser } from "@/services/auth";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getStoredUser()) navigate("/home", { replace: true });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      navigate("/home");
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 py-12 justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold font-display tracking-tight text-primary neon-text">
          WA<span className="text-foreground">Runner</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-sm font-mono tracking-widest uppercase">
          Corra. Conquiste. Domine.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm mx-auto">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-display text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground font-display text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-destructive text-sm font-display text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-muted-foreground text-xs font-mono">
        v1.0 · WARunner
      </p>
    </div>
  );
};

export default LoginScreen;
