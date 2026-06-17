import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Color Palette ────────────────────────────────────────────────
const COLORS = {
  bg: "#050505",
  bgElevated: "#0a0a0a",
  card: "#111111",
  cardBorder: "rgba(255,255,255,0.06)",
  accent: "#D4A853",      // Gold/amber
  accent2: "#6B3FA0",     // Deep purple
  accent2Light: "rgba(107,63,160,0.15)",
  accentLight: "rgba(212,168,83,0.12)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.45)",
  textDim: "rgba(255,255,255,0.2)",
  success: "#22c55e",
  error: "#ef4444",
};

const ACCENT = COLORS.accent;
const POST_URL = "https://x.com/i/status/2066563991925932501";
const FOLLOW_URL = "https://x.com/DuskyLads";
const LS_KEY = "dusky_submitted";

// ── Particle Canvas ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let animId: number;

    interface Particle {
      x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string;
    }

    const particles: Particle[] = [];
    const count = Math.min(80, Math.floor(w * h / 15000));

    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.6;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: isGold ? "#D4A853" : Math.random() > 0.5 ? "#6B3FA0" : "#ffffff",
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.alpha;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = "rgba(212,168,83,0.08)";
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

// ── Global Styles ────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${COLORS.bg}; }
  ::selection { background: ${COLORS.accent}; color: #000; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,83,0.4); }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(212,168,83,0.15); }
    50% { box-shadow: 0 0 40px rgba(212,168,83,0.3); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .slide-up { animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .fade-in { animation: fadeIn 0.6s ease both; }
  .scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

  .task-card {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: ${COLORS.accent} !important;
    box-shadow: 0 0 0 3px rgba(212,168,83,0.1) !important;
  }

  .btn-primary {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-primary:hover::after {
    opacity: 1;
    animation: shimmer 1.5s infinite;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(212,168,83,0.3);
  }

  .btn-task {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .btn-task:hover {
    background: rgba(212,168,83,0.15) !important;
    border-color: ${COLORS.accent} !important;
    transform: translateY(-1px);
  }

  .social-icon {
    transition: all 0.3s ease;
  }
  .social-icon:hover {
    color: ${COLORS.accent} !important;
    transform: translateY(-3px);
  }
`;

// ── Field Component ──────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  as = "input",
  rows = 3,
  onBlur,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  as?: "input" | "textarea";
  rows?: number;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const shared: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${error ? COLORS.error : "rgba(255,255,255,0.08)"}`,
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    padding: "13px 16px",
    fontFamily: "'Space Grotesk', sans-serif",
    resize: "none",
    display: "block",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        color: COLORS.textMuted, marginBottom: 8,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={shared} onBlur={onBlur} onKeyDown={onKeyDown} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={shared} onBlur={onBlur} onKeyDown={onKeyDown} />
      )}
      {error && <p style={{ color: COLORS.error, fontSize: 12, marginTop: 6, fontWeight: 500 }}>{error}</p>}
    </div>
  );
}

// ── Done Badge ───────────────────────────────────────────────────
function DoneBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: COLORS.accentLight, border: `1px solid rgba(212,168,83,0.25)`,
      borderRadius: 8, padding: "5px 12px", fontSize: 10,
      fontWeight: 800, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      COMPLETED
    </span>
  );
}

// ── Task Card ────────────────────────────────────────────────────
function TaskCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="task-card" style={{
      animationDelay: `${delay}ms`,
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 16,
      padding: "24px 26px",
      backdropFilter: "blur(10px)",
    }}>
      {children}
    </div>
  );
}

// ── Task Header ──────────────────────────────────────────────────
function TaskHeader({ num, title, subtitle, done }: { num: string; title: string; subtitle: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: done ? 0 : 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: done ? COLORS.accentLight : "rgba(255,255,255,0.03)",
          border: `1px solid ${done ? "rgba(212,168,83,0.3)" : "rgba(255,255,255,0.08)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800,
          color: done ? ACCENT : COLORS.textDim,
          flexShrink: 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {done
            ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : num}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: done ? ACCENT : "#fff", transition: "color 0.3s" }}>{title}</div>
          <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2, fontWeight: 400 }}>{subtitle}</div>
        </div>
      </div>
      {done && <DoneBadge />}
    </div>
  );
}

// ── Success Screen ───────────────────────────────────────────────
function SuccessScreen({ wallet, xUsername }: { wallet: string; xUsername: string }) {
  return (
    <div className="fade-in" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: COLORS.bg, padding: 24, textAlign: "center",
    }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 420 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: COLORS.accentLight, border: `1px solid rgba(212,168,83,0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: 32,
          animation: "float 3s ease-in-out infinite",
        }}>
          🎩
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Welcome to the crew.
        </h2>
        <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 32 }}>
          Your whitelist spot is locked in. We'll reach out when it's time to mint your Dusky Lad.
        </p>
        <div style={{
          background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12, padding: "18px 22px", fontSize: 13,
          color: COLORS.textMuted, wordBreak: "break-all", textAlign: "left", marginBottom: 12,
        }}>
          <span style={{ color: COLORS.textDim, fontSize: 10, display: "block", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 700 }}>WALLET ADDRESS</span>
          <span style={{ fontFamily: "monospace", color: "#fff", fontSize: 13 }}>{wallet}</span>
        </div>
        {xUsername && (
          <div style={{ fontSize: 13, color: COLORS.textDim, marginTop: 4 }}>@{xUsername.replace(/^@/, "")}</div>
        )}
      </div>
    </div>
  );
}

// ── Already Submitted Screen ─────────────────────────────────────
function AlreadySubmitted() {
  return (
    <div className="fade-in" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: COLORS.bg, padding: 24, textAlign: "center",
    }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 380 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: COLORS.accentLight, border: `1px solid rgba(212,168,83,0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: 32,
        }}>
          🎩
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Already in the crew.</h2>
        <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>
          You've already secured your whitelist spot. No need to submit again.
        </p>
      </div>
    </div>
  );
}

// ── Whitelist Modal ──────────────────────────────────────────────
function WhitelistModal({ onClose }: { onClose: () => void }) {
  const [xUsername, setXUsername] = useState("");
  const [quoteLink, setQuoteLink] = useState("");
  const [commentLink, setCommentLink] = useState("");
  const [wallet, setWallet] = useState("");

  const [usernameLocked, setUsernameLocked] = useState(false);
  const [followDone, setFollowDone] = useState(false);
  const [likeQuoteDone, setLikeQuoteDone] = useState(false);
  const [commentDone, setCommentDone] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const step1Visible = true;
  const step2Visible = usernameLocked;
  const step3Visible = step2Visible && followDone;
  const step4Visible = step3Visible && likeQuoteDone;
  const step5Visible = step4Visible && commentDone;

  const openAndMark = (url: string, onDone: () => void) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(onDone, 1200);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!xUsername.trim()) e.xUsername = "Enter your X username.";
    if (!followDone) e.follow = "Follow @DuskyLads first.";
    if (!likeQuoteDone) e.likeQuote = "Like and quote the post first.";
    if (!quoteLink.trim()) e.quoteLink = "Paste your quote link.";
    if (!commentDone) e.comment = "Submit a comment first.";
    if (!commentLink.trim()) e.commentLink = "Paste your comment link.";
    if (!wallet.trim()) e.wallet = "Enter your EVM wallet address.";
    else if (!/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) e.wallet = "Invalid address — must be 0x + 40 hex chars.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from("dusky").insert({
        x_username: xUsername.trim().replace(/^@/, ""),
        quote_link: quoteLink.trim(),
        comment_link: commentLink.trim(),
        wallet: wallet.trim().toLowerCase(),
        follow_done: followDone,
        like_quote_done: likeQuoteDone,
        comment_done: commentDone,
      });
      if (error) throw error;
      localStorage.setItem(LS_KEY, "1");
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("dusky_wallet_idx")) {
        setErrors({ submit: "This wallet is already on the whitelist." });
      } else if (msg.includes("dusky_x_username_idx")) {
        setErrors({ submit: "This X username is already on the whitelist." });
      } else {
        setErrors({ submit: msg || "Something went wrong. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="scale-in" style={{
        background: COLORS.card, borderRadius: 20, border: `1px solid ${COLORS.cardBorder}`,
        padding: "40px 32px", textAlign: "center", maxWidth: 440, width: "100%",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: COLORS.accentLight, border: `1px solid rgba(212,168,83,0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 28,
        }}>
          🎩
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Welcome to the crew!</h3>
        <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7 }}>
          Your whitelist spot is secured. We'll reach out when it's time to mint.
        </p>
      </div>
    );
  }

  return (
    <div className="scale-in" style={{
      background: COLORS.card, borderRadius: 20, border: `1px solid ${COLORS.cardBorder}`,
      padding: "32px 28px", maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto",
      position: "relative",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "transparent", border: "none",
          color: COLORS.textDim, fontSize: 22, cursor: "pointer",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8, transition: "all 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        ✕
      </button>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
          Whitelist Application
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Join the Lads</h2>
        <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
          Complete each step below. The next unlocks when you finish the last.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Step 1 */}
        {step1Visible && (
          <TaskCard delay={0}>
            <TaskHeader num="01" title="Your X username" subtitle="So we know who you are" done={usernameLocked} />
            {!usernameLocked && (
              <Field
                label=""
                value={xUsername}
                onChange={v => { setXUsername(v); setErrors(e => ({ ...e, xUsername: "" })); }}
                placeholder="@yourhandle"
                error={errors.xUsername}
                onBlur={() => { if (xUsername.trim()) setUsernameLocked(true); }}
                onKeyDown={e => { if (e.key === "Enter" && xUsername.trim()) setUsernameLocked(true); }}
              />
            )}
          </TaskCard>
        )}

        {/* Step 2 */}
        {step2Visible && (
          <TaskCard delay={60}>
            <TaskHeader num="02" title="Follow @DuskyLads on X" subtitle="Join the crew" done={followDone} />
            {!followDone && (
              <button
                className="btn-task"
                onClick={() => openAndMark(FOLLOW_URL, () => setFollowDone(true))}
                style={{
                  width: "100%", padding: "12px 0",
                  background: COLORS.accentLight,
                  border: `1px solid rgba(212,168,83,0.25)`,
                  borderRadius: 10, color: ACCENT,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                Follow on X →
              </button>
            )}
            {errors.follow && <p style={{ color: COLORS.error, fontSize: 12, marginTop: 8 }}>{errors.follow}</p>}
          </TaskCard>
        )}

        {/* Step 3 */}
        {step3Visible && (
          <TaskCard delay={60}>
            <TaskHeader num="03" title="Like & Quote Tweet" subtitle="Like and quote the pinned post" done={likeQuoteDone} />
            {!likeQuoteDone ? (
              <>
                <button
                  className="btn-task"
                  onClick={() => openAndMark(POST_URL, () => setLikeQuoteDone(true))}
                  style={{
                    width: "100%", padding: "12px 0", marginBottom: 14,
                    background: COLORS.accentLight,
                    border: `1px solid rgba(212,168,83,0.25)`,
                    borderRadius: 10, color: ACCENT,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  View Post →
                </button>
                <Field
                  label="Paste your quote link"
                  value={quoteLink}
                  onChange={v => { setQuoteLink(v); setErrors(e => ({ ...e, quoteLink: "" })); }}
                  placeholder="https://x.com/..."
                  error={errors.quoteLink}
                />
              </>
            ) : (
              <Field
                label="Paste your quote link"
                value={quoteLink}
                onChange={v => { setQuoteLink(v); setErrors(e => ({ ...e, quoteLink: "" })); }}
                placeholder="https://x.com/..."
                error={errors.quoteLink}
              />
            )}
          </TaskCard>
        )}

        {/* Step 4 */}
        {step4Visible && (
          <TaskCard delay={60}>
            <TaskHeader num="04" title="Comment & tag 2 frens" subtitle="Reply and mention 2 people" done={commentDone} />
            {!commentDone ? (
              <>
                <button
                  className="btn-task"
                  onClick={() => setCommentModalOpen(true)}
                  style={{
                    width: "100%", padding: "12px 0", marginBottom: 14,
                    background: COLORS.accentLight,
                    border: `1px solid rgba(212,168,83,0.25)`,
                    borderRadius: 10, color: ACCENT,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  Write your comment →
                </button>
                {errors.comment && <p style={{ color: COLORS.error, fontSize: 12 }}>{errors.comment}</p>}
              </>
            ) : (
              <Field
                label="Paste your comment link"
                value={commentLink}
                onChange={v => { setCommentLink(v); setErrors(e => ({ ...e, commentLink: "" })); }}
                placeholder="https://x.com/..."
                error={errors.commentLink}
              />
            )}
          </TaskCard>
        )}

        {/* Step 5 */}
        {step5Visible && (
          <TaskCard delay={60}>
            <TaskHeader num="05" title="EVM Wallet Address" subtitle="Where your Lad will land" done={false} />
            <Field
              label=""
              value={wallet}
              onChange={v => { setWallet(v); setErrors(e => ({ ...e, wallet: "" })); }}
              placeholder="0x..."
              error={errors.wallet}
            />
          </TaskCard>
        )}

        {/* Submit */}
        {step5Visible && (
          <div className="task-card" style={{ animationDelay: "80ms", marginTop: 4 }}>
            {errors.submit && (
              <p style={{ color: COLORS.error, fontSize: 13, marginBottom: 14, textAlign: "center", fontWeight: 500 }}>{errors.submit}</p>
            )}
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%", padding: "16px",
                background: ACCENT, borderRadius: 12,
                border: "none", color: "#000",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 14,
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 24px rgba(212,168,83,0.25)",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Securing your spot..." : "Secure My Spot"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: COLORS.textDim, marginTop: 12 }}>
              Double-check your wallet before submitting.
            </p>
          </div>
        )}
      </div>

      {/* Comment Modal inside whitelist modal */}
      {commentModalOpen && (
        <div
          className="fade-in"
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setCommentModalOpen(false); }}
        >
          <div className="scale-in" style={{
            background: "#151515", borderRadius: 16,
            border: `1px solid ${COLORS.cardBorder}`,
            padding: "28px 24px", width: "100%", maxWidth: 440,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: "#fff" }}>Comment on the post</h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
              Write your comment, then post it on X — make sure to tag 2 frens.
            </p>

            <div style={{ marginBottom: 14 }}>
              <Field
                label="Your comment"
                value={commentText}
                onChange={setCommentText}
                placeholder="Excited for Dusky Lads! @fren1 @fren2"
                as="textarea"
                rows={3}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button
                onClick={() => {
                  const text = encodeURIComponent(commentText || "Excited for Dusky Lads!");
                  window.open(`https://x.com/intent/tweet?in_reply_to=2066563991925932501&text=${text}`, "_blank", "noopener,noreferrer");
                }}
                className="btn-task"
                style={{
                  flex: 1, padding: "11px 0",
                  background: COLORS.accentLight,
                  border: `1px solid rgba(212,168,83,0.25)`,
                  borderRadius: 10, color: ACCENT,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Post on X →
              </button>
            </div>

            <Field
              label="Paste your comment link after posting"
              value={commentLink}
              onChange={v => { setCommentLink(v); setErrors(e => ({ ...e, commentLink: "" })); }}
              placeholder="https://x.com/..."
              error={errors.commentLink}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button
                onClick={() => setCommentModalOpen(false)}
                style={{
                  flex: 1, padding: "11px 0",
                  background: "transparent",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 10, color: COLORS.textDim,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = COLORS.textDim; }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!commentLink.trim()) {
                    setErrors(e => ({ ...e, commentLink: "Paste your comment link first." }));
                    return;
                  }
                  setCommentDone(true);
                  setCommentModalOpen(false);
                }}
                className="btn-primary"
                style={{
                  flex: 2, padding: "11px 0",
                  background: ACCENT,
                  border: "none",
                  borderRadius: 10, color: "#000",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800, fontSize: 13, cursor: "pointer",
                }}
              >
                Confirm Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Home() {
  const [alreadyDone] = useState(() => !!localStorage.getItem(LS_KEY));
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (alreadyDone) return <AlreadySubmitted />;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>
      <style>{globalStyles}</style>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(5,5,5,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.cardBorder}` : "1px solid transparent",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.4s ease",
      }}>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.1em", color: "#fff" }}>
          DUSKY<span style={{ color: ACCENT }}>LADS</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: COLORS.success,
            boxShadow: "0 0 8px rgba(34,197,94,0.8)",
            display: "inline-block",
          }} />
          <span style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.1em", fontWeight: 700 }}>WHITELIST OPEN</span>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px", textAlign: "center",
        overflow: "hidden",
      }}>
        <ParticleCanvas />

        {/* Gradient overlay for depth */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to top, #050505, transparent)",
          zIndex: 2, pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 3, maxWidth: 600 }}>
          {/* Hero Image */}
          <div className="slide-up" style={{
            width: 280, height: 280, margin: "0 auto 32px",
            borderRadius: 24,
            background: `linear-gradient(135deg, ${COLORS.accent2}22, ${COLORS.accent}15)`,
            border: `1px solid rgba(255,255,255,0.06)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,168,83,0.08)",
            animationDelay: "0ms",
          }}>
            <img
              src="/hero.png"
              alt="Dusky Lads"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 24 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) parent.innerHTML = "<span style=\'font-size:64px\'>🎩</span>";
              }}
            />
          </div>

          <div className="slide-up" style={{ animationDelay: "150ms" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: ACCENT,
              letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16,
            }}>
              1,555 Unique Lads · Ethereum
            </p>
          </div>

          <h1 className="slide-up" style={{
            fontSize: "clamp(42px, 8vw, 72px)", fontWeight: 800,
            lineHeight: 1.05, color: "#fff", marginBottom: 20,
            letterSpacing: "-0.03em",
            animationDelay: "250ms",
          }}>
            Dusky<br /><span style={{ color: ACCENT }}>Lads</span>
          </h1>

          <p className="slide-up" style={{
            fontSize: 16, color: COLORS.textMuted, lineHeight: 1.75,
            maxWidth: 420, margin: "0 auto 36px",
            animationDelay: "350ms",
          }}>
            A collection of 1,555 hand-crafted lads living on Ethereum.
            Join the crew and secure your whitelist spot.
          </p>

          <div className="slide-up" style={{ animationDelay: "450ms" }}>
            <button
              className="btn-primary"
              onClick={() => setShowModal(true)}
              style={{
                padding: "16px 48px",
                background: ACCENT, borderRadius: 14,
                border: "none", color: "#000",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800, fontSize: 15,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(212,168,83,0.25)",
              }}
            >
              Join the Lads →
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="fade-in" style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 3, animationDelay: "1s",
        }}>
          <div style={{
            width: 24, height: 36, borderRadius: 12,
            border: `1px solid rgba(255,255,255,0.15)`,
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: 6,
          }}>
            <div style={{
              width: 4, height: 8, borderRadius: 2,
              background: ACCENT,
              animation: "slideDown 1.5s ease-in-out infinite",
            }} />
          </div>
        </div>
      </section>

      {/* ── About Section ──────────────────────────────────────── */}
      <section style={{
        padding: "100px 24px", position: "relative",
        background: "linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="slide-up" style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: ACCENT,
              letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14,
            }}>
              About
            </p>
            <h2 style={{
              fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800,
              color: "#fff", marginBottom: 16, letterSpacing: "-0.02em",
            }}>
              What are <span style={{ color: ACCENT }}>Dusky Lads?</span>
            </h2>
            <p style={{
              fontSize: 16, color: COLORS.textMuted, lineHeight: 1.8,
              maxWidth: 560, margin: "0 auto",
            }}>
              Dusky Lads is a curated NFT collection of 1,555 unique characters,
              each with their own personality, style, and story. Built on Ethereum,
              designed for the culture.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {[
              { icon: "🎨", title: "Hand-Crafted Art", desc: "Every Lad is uniquely designed with meticulous attention to detail and character." },
              { icon: "🔗", title: "Ethereum Native", desc: "Built on the most secure and decentralized blockchain for true digital ownership." },
              { icon: "👥", title: "Community First", desc: "Join a tight-knit crew of collectors, artists, and Web3 enthusiasts." },
              { icon: "🎁", title: "Holder Perks", desc: "Exclusive drops, early access, and special rewards for loyal Lads holders." },
            ].map((item, i) => (
              <div key={i} className="slide-up" style={{
                background: "rgba(255,255,255,0.015)",
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: "28px 24px",
                transition: "all 0.3s ease",
                animationDelay: `${i * 100}ms`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.2)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.cardBorder;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: COLORS.accentLight,
                  border: `1px solid rgba(212,168,83,0.2)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 16,
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.cardBorder}`,
        borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        <div className="slide-up" style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
            color: "#fff", marginBottom: 14, letterSpacing: "-0.02em",
          }}>
            Ready to join the <span style={{ color: ACCENT }}>crew?</span>
          </h2>
          <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 28 }}>
            Spots are limited. Complete the whitelist tasks to secure your place.
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
            style={{
              padding: "16px 48px",
              background: ACCENT, borderRadius: 14,
              border: "none", color: "#000",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 15,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(212,168,83,0.25)",
            }}
          >
            Join the Lads →
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        padding: "60px 24px 40px",
        background: COLORS.bg,
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "0.1em", color: "#fff", display: "block", marginBottom: 8 }}>
            DUSKY<span style={{ color: ACCENT }}>LADS</span>
          </span>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 28 }}>
            1,555 unique lads. One crew.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            {[
              { name: "X", url: "https://x.com/DuskyLads", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              )},
              { name: "Discord", url: "#", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              )},
            ].map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${COLORS.cardBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.textMuted, textDecoration: "none",
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 11, color: COLORS.textDim, letterSpacing: "0.08em" }}>
            DUSKY LADS · 2026 · ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>

      {/* ── Whitelist Modal Overlay ────────────────────────────── */}
      {showModal && (
        <div
          className="fade-in"
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <WhitelistModal onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
