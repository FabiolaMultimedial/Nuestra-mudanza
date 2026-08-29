import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, CheckCircle2 } from "lucide-react";

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-6"
      style={{ background: "#EDEDE7", fontFamily: FONT }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <div
        className="w-full max-w-sm p-8 rounded-[32px] text-center"
        style={{ background: "#FFFFFF", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}
      >
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#171717" }}>Mi mudanza</h1>
        <p className="text-sm mb-6" style={{ color: "#737373" }}>Entrá con el email que te invitaron.</p>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 size={32} style={{ color: "#3E9169" }} />
            <p className="text-sm" style={{ color: "#171717" }}>
              Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-full" style={{ background: "#F3F3F0" }}>
              <Mail size={16} style={{ color: "#737373" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "#171717" }}
              />
            </div>
            {error && <p className="text-xs" style={{ color: "#C17347" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-bold"
              style={{ background: "#171717", color: "#fff", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Enviando..." : "Enviarme el link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
