"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const getStrength = (v: string) => {
  if (!v) return { score: 0, label: "", color: "" };
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { score, label: "Medium", color: "#f59e0b" };
  return { score, label: "Strong", color: "#22c55e" };
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  const strength = getStrength(password);

  // Supabase sends the recovery token as a URL fragment (#access_token=...&type=recovery)
  // onAuthStateChange picks it up automatically and sets the session.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) return setError("Password is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated! Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: linear-gradient(135deg,#0f0c29,#302b63,#24243e); min-height: 100vh; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        input::placeholder { color: rgba(255,255,255,0.25); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1e1a3f inset !important;
          box-shadow: 0 0 0 1000px #1e1a3f inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        .wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'DM Sans','Segoe UI',sans-serif;
        }
        .card {
          width: 100%;
          max-width: 420px;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .inp {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 11px 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          transition: border-color 0.2s;
          color-scheme: dark;
        }
        .inp:focus { border-color: rgba(124,58,237,0.6); }
        .inp-err { border-color: rgba(239,68,68,0.5) !important; }
        .eye-btn {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 16px; line-height: 1; padding: 0;
          color: rgba(255,255,255,0.4);
        }
        .submit-btn {
          width: 100%; padding: 13px 0; border-radius: 12px; border: none;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
      `}</style>

      <div className="wrap">
        {/* Ambient orbs */}
        <div style={{ position:"fixed", top:"15%", left:"10%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"15%", right:"10%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div className="card">
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div
              style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:52, height:52, borderRadius:14,
                background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                marginBottom:"0.75rem",
                boxShadow:"0 8px 24px rgba(124,58,237,0.4)",
              }}
            >
              <span style={{ color:"#fff", fontSize:20, fontWeight:700 }}>L</span>
            </div>
            <h1 style={{ color:"#fff", fontSize:24, fontWeight:700, margin:0 }}>
              LearnTrack
            </h1>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginTop:4 }}>
              Set a new password
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background:"rgba(255,255,255,0.05)",
              backdropFilter:"blur(20px)",
              WebkitBackdropFilter:"blur(20px)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:20, padding:"1.5rem",
              boxShadow:"0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            <h2 style={{ color:"#fff", fontSize:18, fontWeight:700, marginBottom:"0.25rem" }}>
              Reset Password
            </h2>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:"1.25rem" }}>
              Choose a strong new password for your account.
            </p>

            {/* Not yet triggered warning */}
            {!sessionReady && !success && (
              <div
                style={{
                  background:"rgba(245,158,11,0.12)",
                  border:"1px solid rgba(245,158,11,0.25)",
                  color:"#fde68a", fontSize:13,
                  padding:"10px 14px", borderRadius:10, marginBottom:"1rem",
                  display:"flex", alignItems:"flex-start", gap:8,
                }}
              >
                <span style={{ fontSize:15, flexShrink:0 }}>ℹ</span>
                Waiting for the reset link to be verified… If this takes too long,
                please request a new reset email.
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  background:"rgba(239,68,68,0.12)",
                  border:"1px solid rgba(239,68,68,0.25)",
                  color:"#fca5a5", fontSize:13,
                  padding:"10px 14px", borderRadius:10, marginBottom:"1rem",
                  display:"flex", alignItems:"flex-start", gap:8,
                }}
              >
                <span style={{ fontSize:15, flexShrink:0 }}>⚠</span> {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                style={{
                  background:"rgba(34,197,94,0.12)",
                  border:"1px solid rgba(34,197,94,0.25)",
                  color:"#86efac", fontSize:13,
                  padding:"10px 14px", borderRadius:10, marginBottom:"1rem",
                  display:"flex", alignItems:"flex-start", gap:8,
                }}
              >
                <span style={{ fontSize:15, flexShrink:0 }}>✓</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* New password */}
              <div style={{ marginBottom:"0.75rem" }}>
                <label style={{ display:"block", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:500, marginBottom:6 }}>
                  New password
                </label>
                <div style={{ position:"relative" }}>
                  <input
                    className="inp"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight:44 }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          style={{
                            flex:1, height:3, borderRadius:2,
                            background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)",
                            transition:"background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span style={{ fontSize:11, color:strength.color, fontWeight:500 }}>
                        {strength.label} password
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div style={{ marginBottom:"1rem" }}>
                <label style={{ display:"block", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:500, marginBottom:6 }}>
                  Confirm new password
                </label>
                <div style={{ position:"relative" }}>
                  <input
                    className="inp"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    style={{ paddingRight:44 }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                  {confirm && confirm === password && (
                    <span style={{ position:"absolute", right:40, top:"50%", transform:"translateY(-50%)", color:"#22c55e", fontSize:14 }}>
                      ✓
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="submit-btn"
                style={{
                  background: (loading || !sessionReady)
                    ? "rgba(124,58,237,0.4)"
                    : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  color:"#fff",
                  boxShadow: (loading || !sessionReady) ? "none" : "0 4px 20px rgba(124,58,237,0.45)",
                  cursor: (loading || !sessionReady) ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width:16, height:16,
                        border:"2px solid rgba(255,255,255,0.3)",
                        borderTopColor:"#fff", borderRadius:"50%",
                        display:"inline-block",
                        animation:"spin 0.7s linear infinite",
                      }}
                    />
                    Updating…
                  </>
                ) : "Update Password"}
              </button>
            </form>

            <p style={{ textAlign:"center", color:"rgba(255,255,255,0.35)", fontSize:13, marginTop:"1rem" }}>
              Remember it?{" "}
              <button
                onClick={() => router.push("/login")}
                style={{ background:"none", border:"none", color:"#a78bfa", fontSize:13, fontWeight:600, cursor:"pointer", padding:0 }}
              >
                Back to sign in
              </button>
            </p>
          </div>

          <p style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:11, marginTop:"1rem" }}>
            By continuing you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
