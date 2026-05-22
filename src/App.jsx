import { useEffect, useState, useCallback, useRef } from "react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBUrRK1CxFLiA9MXo7TJH3bnS9d9pJN7R0",
  authDomain: "calc-gpa-3cc87.firebaseapp.com",
  projectId: "calc-gpa-3cc87",
  storageBucket: "calc-gpa-3cc87.firebasestorage.app",
  messagingSenderId: "311166071670",
  appId: "1:311166071670:web:1b3aa2aa1746d3b2548057",
  measurementId: "G-LMCWHSE517"
};

const ADMIN_EMAIL = "mustafaroshid99@gmail.com";

const DEFAULT_GRADING = [
  { min:80, gp:5,   grade:"A+" },
  { min:70, gp:4,   grade:"A"  },
  { min:60, gp:3.5, grade:"A-" },
  { min:50, gp:3,   grade:"B"  },
  { min:40, gp:2,   grade:"C"  },
  { min:33, gp:1,   grade:"D"  },
  { min:0,  gp:0,   grade:"F"  },
];

const makeGetGP = (scale) => (pct) => {
  const s = scale || DEFAULT_GRADING;
  for (const r of [...s].sort((a,b)=>b.min-a.min)) if (pct >= r.min) return r.gp;
  return 0;
};
const makeGetGrade = (scale) => (gp) => {
  const s = scale || DEFAULT_GRADING;
  for (const r of [...s].sort((a,b)=>b.gp-a.gp)) if (gp >= r.gp) return r.grade;
  return "F";
};

const gradeColor = (g) =>
  g==="A+"?"#0ea5e9":g==="A"?"#0284c7":g==="A-"?"#0369a1"
  :g==="B"?"#6366f1":g==="C"?"#f59e0b":g==="D"?"#fb923c":"#ef4444";

const getMeritRank = (students) =>
  [...students]
    .sort((a,b) => b.gpa - a.gpa || b.total - a.total)
    .reduce((acc,s,i) => { acc[s.roll] = i+1; return acc; }, {});

// ─── CSS ─────────────────────────────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       ${dark ? "#060d19" : "#f0f4f9"};
      --surface:  ${dark ? "#0d1626" : "#ffffff"};
      --surface2: ${dark ? "#111e30" : "#f5f8fc"};
      --surface3: ${dark ? "#172338" : "#eaeff6"};
      --border:   ${dark ? "#1e2f47" : "#dde4ef"};
      --text:     ${dark ? "#e2e8f5" : "#0b1729"};
      --text2:    ${dark ? "#5b7299" : "#7a8ea8"};
      --text3:    ${dark ? "#354d6e" : "#a8b8cc"};
      --sky:      #0ea5e9;
      --sky2:     #38bdf8;
      --sky3:     #0284c7;
      --sky4:     #075985;
      --indigo:   #6366f1;
      --green:    #10b981;
      --red:      #ef4444;
      --yellow:   #f59e0b;
      --amber:    #f97316;
      --glow:     ${dark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.1)"};
      --font-sans: 'Sora', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: var(--font-sans); min-height: 100vh;
      transition: background 0.4s, color 0.4s;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    input[type="text"], input[type="number"], input[type="email"], input[type="password"], input:not([type]) {
      width: 100%; padding: 11px 14px; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface2);
      color: var(--text); font-family: var(--font-sans); font-size: 13.5px;
      font-weight: 400; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    input:focus { border-color: var(--sky); background: var(--surface); box-shadow: 0 0 0 3px var(--glow); }
    input::placeholder { color: var(--text3); }
    button { cursor: pointer; font-family: var(--font-sans); }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: var(--surface2); color: var(--text2);
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; padding: 10px 14px; text-align: left;
      white-space: nowrap; border-bottom: 1.5px solid var(--border);
    }
    td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: color-mix(in srgb, var(--sky) 4%, transparent); }
    @keyframes up { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
    @keyframes splashIn { 0%{opacity:0;transform:scale(0.6);}60%{transform:scale(1.06);}100%{opacity:1;transform:scale(1);} }
    @keyframes splashOut { 0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.3);} }
    @keyframes toastPop { 0%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.92);}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);} }
    @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes badgePop { 0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);} }
    @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
    @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(14,165,233,0);}50%{box-shadow:0 0 20px 6px rgba(14,165,233,0.18);} }
    @keyframes orbit { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes counterOrbit { from{transform:rotate(0deg);}to{transform:rotate(-360deg);} }
    @keyframes floatUp { 0%,100%{transform:translateY(0px);}50%{transform:translateY(-6px);} }
    .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .project-card { transition: all 0.2s; }
    .project-card:hover { border-color: color-mix(in srgb, var(--sky) 40%, var(--border)) !important; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    select {
      width: 100%; padding: 11px 14px; border-radius: 10px;
      border: 1.5px solid var(--border); background: var(--surface2);
      color: var(--text); font-family: var(--font-sans); font-size: 13.5px;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none; cursor: pointer;
    }
    select:focus { border-color: var(--sky); background: var(--surface); box-shadow: 0 0 0 3px var(--glow); }
  `;
  return <style>{css}</style>;
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const Card = ({ children, style={}, animate, glass }) => (
  <div style={{
    background: glass ? "color-mix(in srgb, var(--surface) 88%, transparent)" : "var(--surface)",
    border: "1.5px solid var(--border)", borderRadius: 18, padding: 20,
    animation: animate ? "up 0.3s ease" : "none",
    backdropFilter: glass ? "blur(16px)" : "none", ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    color: "var(--text2)", marginBottom: 8
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled, loading, size="md" }) => {
  const sizes = {
    sm: { padding:"6px 13px", fontSize:11.5, borderRadius:9 },
    md: { padding:"11px 20px", fontSize:13.5, borderRadius:11 },
    lg: { padding:"14px 24px", fontSize:14.5, borderRadius:13 },
  };
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    border:"none", fontWeight:700,
    transition:"all 0.18s", cursor:disabled||loading?"not-allowed":"pointer",
    opacity:disabled||loading?0.5:1, letterSpacing:"0.01em", ...sizes[size],
  };
  const v = {
    primary:   { background:"linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", color:"#fff", boxShadow:"0 4px 16px rgba(14,165,233,0.35)" },
    secondary: { background:"var(--surface2)", color:"var(--text)", border:"1.5px solid var(--border)" },
    danger:    { background:"color-mix(in srgb,var(--red) 10%,transparent)", color:"var(--red)", border:"1.5px solid color-mix(in srgb,var(--red) 22%,transparent)" },
    ghost:     { background:"transparent", color:"var(--text2)", border:"1.5px solid var(--border)" },
    sky:       { background:"color-mix(in srgb,var(--sky) 12%,transparent)", color:"var(--sky)", border:"1.5px solid color-mix(in srgb,var(--sky) 28%,transparent)" },
    green:     { background:"color-mix(in srgb,var(--green) 12%,transparent)", color:"var(--green)", border:"1.5px solid color-mix(in srgb,var(--green) 28%,transparent)" },
  };
  return (
    <button style={{...base,...v[variant],...style}} onClick={onClick} disabled={disabled||loading}>
      {loading ? <span style={{animation:"spin 0.7s linear infinite",display:"inline-block",fontSize:16}}>⟳</span> : children}
    </button>
  );
};

const Pill = ({ children, color }) => (
  <span style={{
    display:"inline-block", padding:"2px 9px", borderRadius:20,
    fontSize:10.5, fontWeight:700,
    background:`color-mix(in srgb,${color} 13%,transparent)`, color,
  }}>{children}</span>
);

const Toast = ({ msg }) => (
  <div style={{
    position:"fixed", top:22, left:"50%", transform:"translateX(-50%)",
    background:"var(--surface)", border:"1.5px solid var(--border)",
    color:"var(--text)", padding:"10px 22px", borderRadius:40, fontSize:13,
    fontWeight:600, zIndex:9999, boxShadow:"0 12px 40px rgba(0,0,0,0.28)",
    animation:"toastPop 0.24s cubic-bezier(0.34,1.56,0.64,1)", whiteSpace:"nowrap",
    display:"flex", alignItems:"center", gap:8,
  }}>{msg}</div>
);

const StatTile = ({ label, value, color, style={}, onClick, actionLabel }) => (
  <div style={{
    background:"var(--surface2)", border:"1.5px solid var(--border)",
    borderRadius:14, padding:"14px 16px", flex:1, ...style
  }}>
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--text2)", marginBottom:7 }}>{label}</div>
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
      <div style={{ fontSize:26, fontWeight:800, color:color||"var(--sky)", fontFamily:"var(--font-mono)", lineHeight:1 }}>{value}</div>
      {onClick && (
        <button onClick={onClick} style={{
          padding:"5px 11px", borderRadius:8, border:"1.5px solid var(--border)",
          background:"var(--surface)", color:"var(--sky)",
          fontSize:10.5, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
          flexShrink:0, whiteSpace:"nowrap",
        }}>{actionLabel||"View →"}</button>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
    <div style={{ width:36, height:36, border:"3px solid var(--border)", borderTop:"3px solid var(--sky)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
  </div>
);

const SectionHeader = ({ label, title, subtitle }) => (
  <div style={{ marginBottom:24 }}>
    {label && (
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--sky)", marginBottom:7, display:"flex", alignItems:"center", gap:7 }}>
        <span style={{ display:"inline-block", width:20, height:2, background:"linear-gradient(90deg, var(--sky), transparent)", borderRadius:2 }} />
        {label}
      </div>
    )}
    {title && <h2 style={{ fontSize:26, fontWeight:800, lineHeight:1.15, marginBottom:4, letterSpacing:"-0.02em" }}>{title}</h2>}
    {subtitle && <p style={{ color:"var(--text2)", fontSize:13 }}>{subtitle}</p>}
  </div>
);

// ─── Student List Modal ───────────────────────────────────────────────────────
const StudentListModal = ({ title, students, color, onClose }) => (
  <div style={{
    position:"fixed", inset:0, zIndex:6000, background:"rgba(0,0,0,0.6)",
    display:"flex", alignItems:"center", justifyContent:"center",
    backdropFilter:"blur(8px)", padding:"20px 16px",
  }} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{
      background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:22,
      width:"100%", maxWidth:400, maxHeight:"72vh", display:"flex", flexDirection:"column",
      animation:"up 0.26s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 28px 80px rgba(0,0,0,0.4)",
    }}>
      <div style={{ padding:"18px 20px", borderBottom:"1.5px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color, marginBottom:4 }}>{title}</div>
          <div style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.02em" }}>{students.length} Student{students.length!==1?"s":""}</div>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--surface2)", color:"var(--text2)", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:14 }}>
        {students.length===0 ? (
          <div style={{ textAlign:"center", color:"var(--text2)", padding:"30px 0", fontSize:13 }}>No students in this category</div>
        ) : students.map((s,i) => (
          <div key={s.roll} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:12, marginBottom:7, background:"var(--surface2)", border:"1.5px solid var(--border)" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background:`color-mix(in srgb,${color} 18%,transparent)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color }}>{i+1}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div>
              <div style={{ color:"var(--text2)", fontSize:11 }}>Roll: {s.roll}</div>
            </div>
            <Pill color={color}>{s.grade}</Pill>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Blocked Modal ────────────────────────────────────────────────────────────
const BlockedModal = ({ onSignOut }) => (
  <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
    <Card style={{ maxWidth:340, textAlign:"center", animation:"splashIn 0.4s ease", padding:32 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
      <h2 style={{ fontWeight:800, fontSize:20, marginBottom:10, letterSpacing:"-0.02em" }}>Account Blocked</h2>
      <p style={{ color:"var(--text2)", fontSize:13, marginBottom:24, lineHeight:1.6 }}>Your account has been blocked by the administrator. Contact your admin for assistance.</p>
      <Btn onClick={onSignOut} style={{ width:"100%" }}>Sign Out</Btn>
    </Card>
  </div>
);

// ─── Logo Splash ──────────────────────────────────────────────────────────────
const LogoSplash = ({ onDone }) => {
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1900);
    const t2 = setTimeout(() => onDone(), 2350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:99999,
      background:"linear-gradient(145deg,#040b16 0%,#081628 60%,#040b16 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      animation:phase==="out"?"splashOut 0.45s ease forwards":"none",
    }}>
      <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(14,165,233,0.1)", animation:"orbit 8s linear infinite" }} />
      <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", border:"1px solid rgba(14,165,233,0.15)", animation:"counterOrbit 6s linear infinite" }} />
      <div style={{ position:"relative", animation:"splashIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards, floatUp 3s ease-in-out 0.7s infinite", marginBottom:28 }}>
        <div style={{ position:"absolute", inset:-12, borderRadius:"24px", background:"conic-gradient(from 0deg, rgba(56,189,248,0.4), rgba(14,165,233,0.1), rgba(56,189,248,0.4))", animation:"spin 4s linear infinite", filter:"blur(8px)" }} />
        <div style={{ position:"relative", width:96, height:96, borderRadius:22, background:"linear-gradient(145deg, #38bdf8, #0284c7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(14,165,233,0.4), 0 20px 60px rgba(0,0,0,0.5)" }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.45)" />
            <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.6)" />
            <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 30h10M28 35h7" stroke="rgba(3,105,161,0.5)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div style={{ fontFamily:"'Sora', sans-serif", fontSize:36, fontWeight:800, background:"linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-0.04em", marginBottom:8, animation:"splashIn 0.6s 0.18s cubic-bezier(0.34,1.56,0.64,1) both" }}>EduGrade</div>
      <div style={{ color:"#2e4a6e", fontSize:10.5, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", animation:"splashIn 0.55s 0.32s ease both" }}>Academic Excellence</div>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ firebase, onAuth, showToast }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "reset")) return showToast("⚠ Fill all fields");
    if (mode==="signup" && !name.trim()) return showToast("⚠ Enter your name");
    if (password.length < 6 && mode !== "reset") return showToast("⚠ Password min 6 chars");
    setLoading(true);
    try {
      if (mode==="login") {
        const cred = await firebase.auth.signInWithEmailAndPassword(email, password);
        const snap = await firebase.db.collection("users").doc(cred.user.uid).get();
        if (snap.exists && snap.data().blocked) { await firebase.auth.signOut(); showToast("🚫 Your account has been blocked"); setLoading(false); return; }
        showToast("✓ Welcome back!");
      } else if (mode==="signup") {
        const cred = await firebase.auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name.trim() });
        await firebase.db.collection("users").doc(cred.user.uid).set({ name:name.trim(), email, createdAt:new Date().toISOString(), blocked:false, uid:cred.user.uid });
        await firebase.db.collection("adminNotifications").add({ type:"newUser", name:name.trim(), email, uid:cred.user.uid, createdAt:new Date().toISOString(), read:false });
        showToast("✓ Account created!");
      } else {
        await firebase.auth.sendPasswordResetEmail(email);
        showToast("✓ Reset email sent"); setMode("login");
      }
    } catch(e) { showToast("✗ " + (e.message?.replace("Firebase: ","")||"Error")); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", background:"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sky) 8%, transparent) 0%, transparent 60%)" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"up 0.35s ease" }}>
        <div style={{ textAlign:"center", marginBottom:30 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
            <div style={{ width:68, height:68, borderRadius:18, background:"linear-gradient(135deg, #38bdf8, #0284c7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 28px rgba(14,165,233,0.4)", animation:"pulseGlow 3s ease-in-out infinite" }}>
              <svg width="42" height="42" viewBox="0 0 52 52" fill="none">
                <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.3)" />
                <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.45)" />
                <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.6)" />
                <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28 30h10M28 35h7" stroke="rgba(3,105,161,0.5)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:5, letterSpacing:"-0.03em" }}>EduGrade</h1>
          <p style={{ color:"var(--text2)", fontSize:13 }}>
            {mode==="login"?"Sign in to your workspace":mode==="signup"?"Create your account":"Reset your password"}
          </p>
        </div>
        <Card style={{ padding:26 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="signup" && (
              <div><Label>Full Name</Label><input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} /></div>
            )}
            <div><Label>Email Address</Label><input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /></div>
            {mode!=="reset" && (
              <div><Label>Password</Label><input type="password" placeholder="••••••••" value={password} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /></div>
            )}
            <Btn onClick={handleSubmit} loading={loading} style={{ width:"100%", marginTop:4 }}>
              {mode==="login"?"Sign In →":mode==="signup"?"Create Account →":"Send Reset Email →"}
            </Btn>
          </div>
          <div style={{ marginTop:18, display:"flex", flexDirection:"column", gap:8, alignItems:"center" }}>
            {mode==="login" && (
              <>
                <button onClick={()=>setMode("reset")} style={{ background:"none", border:"none", color:"var(--sky)", fontSize:12, cursor:"pointer", fontWeight:600 }}>Forgot password?</button>
                <div style={{ color:"var(--text2)", fontSize:12.5 }}>No account?{" "}<span style={{ color:"var(--sky)", cursor:"pointer", fontWeight:700 }} onClick={()=>setMode("signup")}>Sign up</span></div>
              </>
            )}
            {mode!=="login" && (
              <div style={{ color:"var(--text2)", fontSize:12.5 }}><span style={{ color:"var(--sky)", cursor:"pointer", fontWeight:700 }} onClick={()=>setMode("login")}>← Back to Sign In</span></div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPanel = ({ firebase, showToast, onClose }) => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("notifs");
  const [loading, setLoading] = useState(true);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [viewingUser, setViewingUser] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersSnap = await firebase.db.collection("users").get();
        setUsers(usersSnap.docs.map(d=>({id:d.id,...d.data()})));
        const notifsSnap = await firebase.db.collection("adminNotifications").orderBy("createdAt","desc").limit(50).get();
        setNotifications(notifsSnap.docs.map(d=>({id:d.id,...d.data()})));
      } catch(e) { showToast("✗ "+e.message); }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleBlock = async (user) => {
    const newBlocked = !user.blocked;
    await firebase.db.collection("users").doc(user.id).update({ blocked:newBlocked });
    setUsers(prev=>prev.map(u=>u.id===user.id?{...u,blocked:newBlocked}:u));
    showToast(newBlocked?"🚫 User blocked":"✓ User unblocked");
  };

  const markAllRead = async () => {
    const batch = firebase.db.batch();
    notifications.forEach(n=>{ if(!n.read) batch.update(firebase.db.collection("adminNotifications").doc(n.id),{read:true}); });
    await batch.commit();
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
    showToast("✓ All marked as read");
  };

  const loadUserFullData = async (user) => {
    try {
      const snap = await firebase.db.collection("users").doc(user.id).collection("projects").orderBy("createdAt","asc").get();
      const projects = snap.docs.map(d=>({id:d.id,...d.data()}));
      setSelectedUserData({ user, projects });
      setSelectedProject(projects.length>0?projects[0]:null);
      setViewingUser(true);
    } catch(e) { showToast("✗ "+e.message); }
  };

  const unreadCount = notifications.filter(n=>!n.read).length;

  if (viewingUser && selectedUserData) {
    const u = selectedUserData.user;
    const projects = selectedUserData.projects;
    const meritRanks = selectedProject ? getMeritRank(selectedProject.students) : {};
    const sortedStudents = selectedProject
      ? [...selectedProject.students].sort((a,b)=>String(a.roll).localeCompare(String(b.roll),undefined,{numeric:true}))
      : [];
    const stats = (() => {
      if (!selectedProject?.students.length) return { pass:0, fail:0, rate:"0.0", avg:"0.00", total:0 };
      const pass = selectedProject.students.filter(s=>s.status==="PASS").length;
      const fail = selectedProject.students.length - pass;
      const avg = (selectedProject.students.reduce((a,s)=>a+s.gpa,0)/selectedProject.students.length).toFixed(2);
      return { pass, fail, rate:((pass/selectedProject.students.length)*100).toFixed(1), avg, total:selectedProject.students.length };
    })();
    return (
      <div style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(8px)" }} onClick={e=>e.target===e.currentTarget&&setViewingUser(false)}>
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:560, maxHeight:"92vh", display:"flex", flexDirection:"column", animation:"up 0.3s ease", boxShadow:"0 -16px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ padding:"18px 20px 0", borderBottom:"1.5px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--sky)", marginBottom:3 }}>👤 Viewing As</div>
                <h2 style={{ fontWeight:800, fontSize:19, letterSpacing:"-0.02em" }}>{u.name}</h2>
                <div style={{ color:"var(--text2)", fontSize:12 }}>{u.email}</div>
              </div>
              <button onClick={()=>setViewingUser(false)} style={{ width:34, height:34, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--surface2)", color:"var(--text2)", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            {projects.length>0 && (
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
                {projects.map(p=>(
                  <button key={p.id} onClick={()=>setSelectedProject(p)} style={{ padding:"6px 14px", borderRadius:9, border:"1.5px solid var(--border)", background:selectedProject?.id===p.id?"linear-gradient(135deg,#38bdf8,#0284c7)":"var(--surface2)", color:selectedProject?.id===p.id?"#fff":"var(--text2)", fontSize:12, fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>{p.examName}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:18 }}>
            {projects.length===0 ? (
              <div style={{ textAlign:"center", color:"var(--text2)", padding:"40px 0", fontSize:13 }}>No projects yet</div>
            ) : !selectedProject ? null : (
              <>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  {[{label:"Students",value:selectedProject.students.length,color:"var(--sky)"},{label:"Pass Rate",value:`${stats.rate}%`,color:"var(--green)"},{label:"Avg GPA",value:stats.avg,color:"var(--indigo)"}].map(({label,value,color})=>(
                    <div key={label} style={{ background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:12, padding:"11px 14px", flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text2)", marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"var(--font-mono)" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {sortedStudents.length===0 ? (
                  <div style={{ textAlign:"center", color:"var(--text2)", padding:"30px 0", fontSize:13 }}>No students</div>
                ) : (
                  <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
                    <div style={{ overflowX:"auto" }}>
                      <table>
                        <thead><tr><th style={{paddingLeft:14}}>Name</th><th>Roll</th><th>Merit</th><th>GPA</th><th>Grade</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>
                          {sortedStudents.map(s=>{
                            const rank=meritRanks[s.roll];
                            const rankColor=rank===1?"#f59e0b":rank===2?"#94a3b8":rank===3?"#cd7c2f":null;
                            return (
                              <tr key={s.roll}>
                                <td style={{fontWeight:600,paddingLeft:14}}>{s.name}</td>
                                <td style={{fontFamily:"var(--font-mono)",color:"var(--text2)",fontSize:12}}>{s.roll}</td>
                                <td>{rankColor?<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:"50%",fontSize:11,fontWeight:800,background:rankColor,color:"#fff"}}>{rank}</span>:<span style={{color:"var(--text2)",fontSize:12,fontFamily:"var(--font-mono)"}}>#{rank}</span>}</td>
                                <td style={{fontWeight:700,color:gradeColor(s.grade),fontFamily:"var(--font-mono)"}}>{s.gpa}</td>
                                <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                <td style={{fontFamily:"var(--font-mono)"}}>{s.total}</td>
                                <td><Pill color={s.status==="PASS"?"var(--green)":"var(--red)"}>{s.status}</Pill></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(8px)" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:560, maxHeight:"85vh", display:"flex", flexDirection:"column", animation:"up 0.3s ease", boxShadow:"0 -16px 60px rgba(0,0,0,0.28)" }}>
        <div style={{ padding:"20px 22px 0", borderBottom:"1.5px solid var(--border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--yellow)", marginBottom:4 }}>⚡ Admin Control</div>
              <h2 style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.02em" }}>Dashboard</h2>
            </div>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--surface2)", color:"var(--text2)", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
          <div style={{ display:"flex", gap:4, marginBottom:-1 }}>
            {[["notifs",`Notifications${unreadCount?` (${unreadCount})`:""}`],["users",`Users (${users.length})`]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"9px 16px", borderRadius:"10px 10px 0 0", border:"1.5px solid var(--border)", borderBottom:tab===id?"1.5px solid var(--surface)":"1.5px solid var(--border)", background:tab===id?"var(--surface)":"var(--surface2)", color:tab===id?"var(--text)":"var(--text2)", fontSize:12, fontWeight:tab===id?700:500, position:"relative" }}>
                {label}
                {id==="notifs"&&unreadCount>0&&<span style={{ position:"absolute", top:-6, right:-6, width:17, height:17, borderRadius:"50%", background:"var(--red)", color:"#fff", fontSize:9.5, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:18 }}>
          {loading ? <Spinner /> : (
            <>
              {tab==="notifs" && (
                <>
                  {unreadCount>0 && <div style={{ marginBottom:12, display:"flex", justifyContent:"flex-end" }}><Btn variant="secondary" onClick={markAllRead} size="sm">✓ Mark all read</Btn></div>}
                  {notifications.length===0 ? (
                    <div style={{ textAlign:"center", color:"var(--text2)", padding:"40px 0", fontSize:13 }}>No notifications yet</div>
                  ) : notifications.map(n=>(
                    <div key={n.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, marginBottom:8, background:n.read?"var(--surface2)":"color-mix(in srgb,var(--sky) 7%,var(--surface2))", border:`1.5px solid ${n.read?"var(--border)":"color-mix(in srgb,var(--sky) 22%,var(--border))"}` }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#38bdf8,#0284c7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff" }}>👤</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{n.name} joined</div>
                        <div style={{ color:"var(--text2)", fontSize:11.5 }}>{n.email}</div>
                        <div style={{ color:"var(--text3)", fontSize:10.5, marginTop:2 }}>{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      {!n.read && <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--sky)", flexShrink:0 }} />}
                    </div>
                  ))}
                </>
              )}
              {tab==="users" && users.map(u=>(
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, marginBottom:8, background:u.blocked?"color-mix(in srgb,var(--red) 5%,var(--surface2))":"var(--surface2)", border:`1.5px solid ${u.blocked?"color-mix(in srgb,var(--red) 20%,var(--border))":"var(--border)"}` }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:u.blocked?"color-mix(in srgb,var(--red) 18%,var(--surface))":"linear-gradient(135deg,#38bdf8,#0284c7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{u.blocked?"🚫":"👤"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>{u.name}{u.email===ADMIN_EMAIL&&<Pill color="var(--yellow)">Admin</Pill>}{u.blocked&&<Pill color="var(--red)">Blocked</Pill>}</div>
                    <div style={{ color:"var(--text2)", fontSize:11.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {u.email!==ADMIN_EMAIL && <Btn variant={u.blocked?"secondary":"danger"} onClick={()=>toggleBlock(u)} size="sm">{u.blocked?"Unblock":"Block"}</Btn>}
                    <Btn variant="sky" onClick={()=>loadUserFullData(u)} size="sm">📊 View</Btn>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dock ─────────────────────────────────────────────────────────────────────
const Dock = ({ page, go, isAdmin, onAdminOpen }) => {
  const tabs = [
    { id:"home",    icon:"⌂", label:"Home"  },
    { id:"setup",   icon:"＋", label:"New"   },
    { id:"app",     icon:"✎", label:"Entry" },
    { id:"summary", icon:"◈", label:"Stats" },
    { id:"merit",   icon:"☰", label:"Merit" },
  ];
  return (
    <nav style={{ position:"fixed", bottom:18, left:"50%", transform:"translateX(-50%)", display:"flex", gap:3, padding:"6px 7px", borderRadius:22, background:"var(--surface)", border:"1.5px solid var(--border)", boxShadow:"0 12px 40px rgba(0,0,0,0.25), 0 2px 0 rgba(255,255,255,0.04) inset", zIndex:1000 }}>
      {tabs.map(t=>{
        const active=page===t.id;
        return (
          <button key={t.id} onClick={()=>go(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"8px 13px", borderRadius:16, border:"none", minWidth:50, background:active?"linear-gradient(135deg,#38bdf8,#0284c7)":"transparent", color:active?"#fff":"var(--text2)", fontSize:16, transition:"all 0.18s", boxShadow:active?"0 4px 12px rgba(14,165,233,0.4)":"none" }}>
            <span style={{ fontSize:active?17:16 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.05em" }}>{t.label}</span>
          </button>
        );
      })}
      {isAdmin && (
        <button onClick={onAdminOpen} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"8px 13px", borderRadius:16, border:"none", minWidth:50, background:"color-mix(in srgb,var(--yellow) 14%,transparent)", color:"var(--yellow)", fontSize:16 }}>
          <span>⚡</span>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.05em" }}>Admin</span>
        </button>
      )}
    </nav>
  );
};

// ─── PDF: Marksheet ───────────────────────────────────────────────────────────
const downloadMarksheet = async (student, project, showToast) => {
  if (!student) return showToast("⚠ No student selected");
  showToast("⏳ Generating marksheet…");
  const loadScript = (src) => new Promise((res,rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s);
  });
  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();

  const SKY=[14,165,233], SKY_LT=[224,242,254], SKY_MID=[186,230,253], SKY_DK=[3,105,161];
  const DARK=[15,28,46], GREY=[100,116,132], LGREY=[241,245,249], WHITE=[255,255,255];
  const GREEN=[16,185,129], GREEN_LT=[209,250,229], RED=[239,68,68], RED_LT=[254,226,226];
  const INDIGO=[99,102,241], INDIGO_LT=[238,242,255], AMBER=[245,158,11], AMBER_LT=[254,243,199];
  const TEAL=[20,184,166];

  doc.setFillColor(...SKY_DK); doc.rect(0,0,W/3,7,"F");
  doc.setFillColor(...SKY);    doc.rect(W/3,0,W/3,7,"F");
  doc.setFillColor(...SKY_MID);doc.rect(2*W/3,0,W/3,7,"F");

  const school  = project.schoolName||"EduGrade";
  const loc     = project.schoolLocation||"";
  const etype   = project.examType||"ANNUAL";
  const cls     = project.classLevel||"";

  doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.setTextColor(...SKY);
  doc.text(school, W/2, 18, {align:"center"});
  if (loc) { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...GREY); doc.text(loc,W/2,23,{align:"center"}); }
  doc.setFont("helvetica","bold"); doc.setFontSize(12); doc.setTextColor(...DARK);
  doc.text(etype, W/2, loc?29:25, {align:"center"});
  doc.setFontSize(14); doc.text("PROGRESS REPORT", W/2, loc?35:31, {align:"center"});

  const scale = project.gradingScale||DEFAULT_GRADING;
  const giX=W-60, giY=10, giW=46, giRH=5.5;
  doc.setFillColor(...SKY); doc.roundedRect(giX,giY,giW,6,1,1,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(6.5); doc.setTextColor(...WHITE);
  doc.text("Grade Interval",giX+giW/2,giY+4,{align:"center"});
  const giCols=[giX,giX+18,giX+30];
  doc.setFillColor(...LGREY); doc.rect(giX,giY+6,giW,5,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(5.5); doc.setTextColor(...DARK);
  ["Grade Interval","GPA","LG"].forEach((h,ci)=>doc.text(h,giCols[ci]+[9,6,6][ci]/2,giY+9.5,{align:"center"}));
  const sortedScale=[...scale].sort((a,b)=>b.min-a.min);
  sortedScale.forEach((row,ri)=>{
    const ry=giY+11+ri*giRH;
    doc.setFillColor(...(ri%2===0?WHITE:SKY_LT)); doc.rect(giX,ry,giW,giRH,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(5.5); doc.setTextColor(...DARK);
    const next=sortedScale[ri+1];
    const rangeStr=ri===0?"80 – 100":next?`${next.min} – ${row.min-1}`:"00 – 32";
    doc.text(rangeStr,giCols[0]+9,ry+3.8,{align:"center"});
    doc.text(String(row.gp),giCols[1]+6,ry+3.8,{align:"center"});
    doc.setFont("helvetica","bold");
    doc.setTextColor(...(row.grade==="A+"||row.grade==="A"||row.grade==="A-"?GREEN:row.grade==="F"?RED:DARK));
    doc.text(row.grade,giCols[2]+6,ry+3.8,{align:"center"});
  });

  const divY=Math.max(loc?38:34, giY+11+sortedScale.length*giRH+3);
  doc.setDrawColor(...SKY_MID); doc.setLineWidth(0.6); doc.line(14,divY,W-14,divY);

  const siY=divY+5;
  const subjectNames=project.subjectNames||Array.from({length:project.subjectCount},(_,i)=>`Subject ${i+1}`);
  const fullMarks=project.examOutOfs||Array(project.subjectCount).fill(100);
  const totalFull=fullMarks.reduce((a,b)=>a+Number(b),0);
  const caWeight=project.caWeight??30;
  const exWeight=100-caWeight;

  const infoRows=[
    {label:"Student Name",value:student.name,col:0},
    {label:"Class",value:cls,col:0},
    {label:"Roll No.",value:String(student.roll),col:0},
    {label:"Total Subjects",value:String(project.subjectCount),col:1},
    {label:"Total Marks",value:String(totalFull),col:1},
  ];
  const lcol=14, rcol=W/2;
  let lrow=siY+8, rrow=siY+8;
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  infoRows.filter(r=>r.col===0).forEach(r=>{
    doc.text(`${r.label}  :`,lcol,lrow); doc.setFont("helvetica","bold"); doc.text(r.value||"—",lcol+35,lrow);
    doc.setFont("helvetica","normal"); doc.setDrawColor(...GREY); doc.setLineWidth(0.3); doc.line(lcol+34,lrow+1,rcol-10,lrow+1); lrow+=8;
  });
  infoRows.filter(r=>r.col===1).forEach(r=>{
    doc.text(`${r.label}  :`,rcol,rrow); doc.setFont("helvetica","bold"); doc.text(r.value||"—",rcol+35,rrow);
    doc.setFont("helvetica","normal"); doc.setDrawColor(...GREY); doc.setLineWidth(0.3); doc.line(rcol+34,rrow+1,W-14,rrow+1); rrow+=8;
  });

  const gpFn=makeGetGP(project.gradingScale||null);

  // Build table rows using stored marks
  const tableHead=[["Subject","Full\nMarks","(A)\nCA","MCQ/\nOral","CQ/\nWritten","Total","(B)","Obtained\nA+B","GP"]];
  const tableBody=subjectNames.map((subName,i)=>{
    const full  = Number(fullMarks[i])||100;
    const caMax = Math.round(full*caWeight/100);
    const ca    = Number((student.caMarks||[])[i])||0;
    const mcq   = Number((student.mcqMarks||[])[i])||0;
    const cq    = Number((student.cqMarks||[])[i])||0;
    const examTotal = mcq+cq;                          // Total column
    const B     = Math.round(examTotal*exWeight/100);  // Y% of exam total
    const obtained = ca+B;                             // A+B = final
    const pct   = full>0?(obtained/full)*100:0;
    const gp    = gpFn(pct);
    return [subName||`Subject ${i+1}`, full, ca, mcq, cq, examTotal, B, obtained, gp];
  });
  const tableStartY=Math.max(lrow,rrow)+4;

  doc.autoTable({
    head:tableHead, body:tableBody, startY:tableStartY,
    styles:{ font:"helvetica", fontSize:8, cellPadding:{top:3,bottom:3,left:3,right:3}, lineColor:SKY_MID, lineWidth:0.3 },
    headStyles:{ fillColor:SKY, textColor:WHITE, fontStyle:"bold", fontSize:7.5, halign:"center", valign:"middle", minCellHeight:12 },
    alternateRowStyles:{ fillColor:SKY_LT },
    columnStyles:{
      0:{fontStyle:"bold",cellWidth:30},
      1:{halign:"center",cellWidth:13},
      2:{halign:"center",cellWidth:13,textColor:INDIGO,fontStyle:"bold"},
      3:{halign:"center",cellWidth:14},
      4:{halign:"center",cellWidth:16},
      5:{halign:"center",cellWidth:12},
      6:{halign:"center",cellWidth:12,textColor:TEAL,fontStyle:"bold"},
      7:{halign:"center",cellWidth:18,fontStyle:"bold"},
      8:{halign:"center",cellWidth:12,fontStyle:"bold"},
    },
    didParseCell:(data)=>{
      if (data.section==="body") {
        if (data.column.index===7){const v=Number(data.cell.raw);const full=Number(tableBody[data.row.index]?.[1])||100;const pct2=(v/full)*100;data.cell.styles.textColor=pct2>=80?GREEN:pct2<33?RED:DARK;}
        if (data.column.index===8){const g=Number(data.cell.raw);data.cell.styles.textColor=g>=4?GREEN:g<1?RED:DARK;}
      }
    },
    margin:{left:14,right:14},
  });

  const rsY=doc.lastAutoTable.finalY+8;
  const box1W=(W-28)/3;
  const totalObtained=tableBody.reduce((a,r)=>a+Number(r[7]),0);
  const totalGP=tableBody.reduce((a,r)=>a+Number(r[8]),0);
  const pctOverall=totalFull>0?((totalObtained/totalFull)*100).toFixed(1):"0.0";

  [{label:"Total Obtained Marks",value:String(totalObtained),color:SKY,bg:SKY_LT,border:SKY_MID},
   {label:"Percentage of Marks (%)",value:`${pctOverall}%`,color:INDIGO,bg:INDIGO_LT,border:[199,210,254]},
   {label:"Total GP",value:String(totalGP.toFixed(1)),color:TEAL,bg:GREEN_LT,border:GREEN_LT}
  ].forEach((box,bi)=>{
    const bx=14+bi*(box1W+4);
    doc.setFillColor(...box.bg); doc.roundedRect(bx,rsY,box1W,16,2,2,"F");
    doc.setDrawColor(...box.border); doc.setLineWidth(0.5); doc.roundedRect(bx,rsY,box1W,16,2,2,"S");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY); doc.text(box.label,bx+box1W/2,rsY+5,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...box.color); doc.text(box.value,bx+box1W/2,rsY+13,{align:"center"});
  });

  const row2Y=rsY+22;
  const meritRanks2=getMeritRank(project.students);
  const myRank=meritRanks2[student.roll]||"—";

  [{label:"GPA",value:String(student.gpa),color:SKY,bg:SKY_LT,border:SKY_MID},
   {label:"LG",value:student.grade||"—",color:INDIGO,bg:INDIGO_LT,border:[199,210,254]},
   {label:"Merit Position",value:`#${myRank}`,color:AMBER,bg:AMBER_LT,border:AMBER_LT}
  ].forEach((box,bi)=>{
    const bx=14+bi*(box1W+4);
    doc.setFillColor(...box.bg); doc.roundedRect(bx,row2Y,box1W,18,2,2,"F");
    doc.setDrawColor(...box.border); doc.setLineWidth(0.5); doc.roundedRect(bx,row2Y,box1W,18,2,2,"S");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY); doc.text(box.label,bx+box1W/2,row2Y+5.5,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(...box.color); doc.text(box.value,bx+box1W/2,row2Y+15,{align:"center"});
  });

  const bannerY=row2Y+25;
  const isPass=student.status==="PASS";
  doc.setFillColor(...(isPass?GREEN:RED)); doc.roundedRect(14,bannerY,W-28,11,3,3,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...WHITE);
  doc.text(isPass?"✓  PASS — Congratulations!":"✗  FAIL",W/2,bannerY+7.5,{align:"center"});

  const sigY=bannerY+19;
  doc.setDrawColor(...SKY_MID); doc.setLineWidth(0.4);
  doc.line(14,sigY,65,sigY); doc.line(W-65,sigY,W-14,sigY);
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...GREY);
  doc.text("Student Signature",39.5,sigY+5,{align:"center"});
  doc.text("Authorized Signature",W-39.5,sigY+5,{align:"center"});

  doc.setFillColor(...SKY_DK); doc.rect(0,H-10,W/2,10,"F");
  doc.setFillColor(...SKY);    doc.rect(W/2,H-10,W/2,10,"F");
  doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...WHITE);
  doc.text(`${school} — ${etype} Progress Report`,14,H-3.5);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`,W-14,H-3.5,{align:"right"});

  doc.save(`${student.name.replace(/\s+/g,"_")}_Marksheet.pdf`);
  showToast("✓ Marksheet downloaded!");
};

// ─── PDF: Merit List ──────────────────────────────────────────────────────────
const downloadMeritListPDF = async (project, showToast) => {
  if (!project?.students.length) return showToast("⚠ No students to export");
  showToast("⏳ Generating Merit List PDF…");
  const loadScript=(src)=>new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`)){res();return;}
    const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
  });
  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  } catch { return showToast("✗ Could not load PDF library"); }

  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  const SKY=[14,165,233],SKY_LT=[240,249,255],SKY_MID=[186,230,253],SKY_DK=[3,105,161];
  const DARK=[15,28,46],GREY=[100,116,132],LGREY=[241,245,249],WHITE=[255,255,255];
  const GREEN=[16,185,129],RED=[239,68,68],GOLD=[180,130,0],SILVER=[100,116,139],BRONZE=[160,80,30],INDIGO=[99,102,241];

  doc.setFillColor(...SKY_DK); doc.rect(0,0,W/2,5,"F");
  doc.setFillColor(...SKY);    doc.rect(W/2,0,W/2,5,"F");

  const logoX=14,logoY=10,logoSize=16;
  doc.setFillColor(...SKY); doc.roundedRect(logoX,logoY,logoSize,logoSize,3,3,"F");
  doc.setFillColor(255,255,255); doc.rect(logoX+2,logoY+2.5,5,10.5,"F");
  doc.setFillColor(224,242,254); doc.rect(logoX+7.5,logoY+2.5,5.5,10.5,"F");
  doc.setDrawColor(...SKY_DK); doc.setLineWidth(0.6); doc.line(logoX+7.2,logoY+2.5,logoX+7.2,logoY+13);
  doc.setLineWidth(1); doc.line(logoX+8.8,logoY+8.2,logoX+10,logoY+9.5); doc.line(logoX+10,logoY+9.5,logoX+12.2,logoY+6.5);
  doc.setFillColor(255,255,255); doc.circle(logoX+13.5,logoY+2.5,1.2,"F");

  doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.setTextColor(...DARK); doc.text("EduGrade",logoX+logoSize+4,logoY+7);
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY); doc.text("Merit List",logoX+logoSize+4,logoY+12.5);

  const passCount=project.students.filter(s=>s.status==="PASS").length;
  const failCount=project.students.length-passCount;
  const avgGPA=(project.students.reduce((a,s)=>a+s.gpa,0)/project.students.length).toFixed(2);
  const examBadgeLabel=project.examName.length>22?project.examName.slice(0,22)+"…":project.examName;

  doc.setFillColor(...SKY_LT); doc.roundedRect(W-72,logoY-1,58,20,3,3,"F");
  doc.setDrawColor(...SKY_MID); doc.setLineWidth(0.5); doc.roundedRect(W-72,logoY-1,58,20,3,3,"S");
  doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...GREY);
  doc.text("EXAM",W-68,logoY+4); doc.text("STUDENTS",W-68,logoY+12);
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
  doc.text(examBadgeLabel,W-47,logoY+4); doc.text(String(project.students.length),W-47,logoY+12);

  doc.setDrawColor(...SKY_MID); doc.setLineWidth(0.5); doc.line(14,31,W-14,31);

  const tileW=(W-28-12)/4;
  [{label:"TOTAL",value:project.students.length,color:SKY},{label:"PASSED",value:passCount,color:GREEN},{label:"FAILED",value:failCount,color:RED},{label:"AVG GPA",value:avgGPA,color:INDIGO}].forEach(({label,value,color},i)=>{
    const tx=14+i*(tileW+4);
    doc.setFillColor(...SKY_LT); doc.roundedRect(tx,35,tileW,15,2,2,"F");
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY); doc.text(label,tx+tileW/2,40.5,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...color); doc.text(String(value),tx+tileW/2,47,{align:"center"});
  });

  const barY=55; const passRate=passCount/project.students.length;
  doc.setFillColor(...LGREY); doc.roundedRect(14,barY,W-28,5,2,2,"F");
  if(passRate>0){doc.setFillColor(...GREEN); doc.roundedRect(14,barY,(W-28)*passRate,5,2,2,"F");}
  doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY);
  doc.text(`Pass rate: ${(passRate*100).toFixed(1)}%`,16,barY+3.5);

  const sortedByRoll=[...project.students].sort((a,b)=>String(a.roll).localeCompare(String(b.roll),undefined,{numeric:true}));
  const meritRanks=getMeritRank(project.students);
  const colWidths={0:16,1:52,2:18,3:18,4:16,5:16,6:22,7:28};

  const head=[["Rank","Name","Roll","Total","GPA","Grade","Percent","Status"]];
  const body=sortedByRoll.map(s=>[
    `#${meritRanks[s.roll]}`,s.name,s.roll,s.total,s.gpa,s.grade,
    `${((s.total/(project.subjectCount*100))*100).toFixed(1)}%`,s.status,
  ]);

  doc.autoTable({
    head,body,startY:64,
    styles:{font:"helvetica",fontSize:8.5,cellPadding:{top:3.5,bottom:3.5,left:3.5,right:3.5},overflow:"hidden"},
    headStyles:{fillColor:SKY,textColor:WHITE,fontStyle:"bold",fontSize:7.5,cellPadding:{top:3,bottom:3,left:3.5,right:3.5},minCellHeight:8,valign:"middle",halign:"center"},
    alternateRowStyles:{fillColor:SKY_LT},
    columnStyles:{0:{halign:"center",cellWidth:colWidths[0]},1:{cellWidth:colWidths[1]},2:{halign:"center",cellWidth:colWidths[2]},3:{halign:"center",cellWidth:colWidths[3]},4:{halign:"center",cellWidth:colWidths[4]},5:{halign:"center",cellWidth:colWidths[5]},6:{halign:"center",cellWidth:colWidths[6]},7:{halign:"center",cellWidth:colWidths[7]}},
    didParseCell:(data)=>{
      if(data.section==="body"){
        if(data.column.index===0){const raw=data.cell.raw;if(raw==="#1"){data.cell.styles.textColor=GOLD;data.cell.styles.fontStyle="bold";}else if(raw==="#2"){data.cell.styles.textColor=SILVER;data.cell.styles.fontStyle="bold";}else if(raw==="#3"){data.cell.styles.textColor=BRONZE;data.cell.styles.fontStyle="bold";}else{data.cell.styles.textColor=GREY;}}
        if(data.column.index===7){data.cell.styles.textColor=data.cell.raw==="PASS"?GREEN:RED;data.cell.styles.fontStyle="bold";}
        if(data.column.index===5){const gc={"A+":SKY,"A":SKY,"A-":[2,132,199],"B":INDIGO,"C":[245,158,11],"D":[251,146,60],"F":RED};data.cell.styles.textColor=gc[data.cell.raw]||DARK;data.cell.styles.fontStyle="bold";}
      }
    },
    margin:{left:12,right:12},
  });

  const pageCount=doc.internal.getNumberOfPages();
  for(let i=1;i<=pageCount;i++){
    doc.setPage(i);
    doc.setFillColor(...SKY_DK);doc.rect(0,H-10,W/2,10,"F");
    doc.setFillColor(...SKY);doc.rect(W/2,H-10,W/2,10,"F");
    doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(...WHITE);
    doc.text("EduGrade — Academic Excellence Platform",14,H-3.5);
    doc.text(`Page ${i} of ${pageCount}`,W-14,H-3.5,{align:"right"});
  }
  doc.save(`${project.examName.replace(/\s+/g,"_")}_Merit_List.pdf`);
  showToast("✓ Merit List PDF downloaded!");
};

// ─── Firebase Loader ──────────────────────────────────────────────────────────
const useFirebase = () => {
  const [firebase, setFirebase] = useState(null);
  const [fbReady,  setFbReady]  = useState(false);
  const [fbError,  setFbError]  = useState(false);
  useEffect(() => {
    const load = async () => {
      const loadScript=(src)=>new Promise((res,rej)=>{
        if(document.querySelector(`script[src="${src}"]`)){res();return;}
        const s=document.createElement("script");s.src=src;s.onerror=rej;
        const timer=setTimeout(()=>rej(new Error(`Script load timeout: ${src}`)),10000);
        s.onload=()=>{clearTimeout(timer);res();}; document.head.appendChild(s);
      });
      try {
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js");
        const app=window.firebase.apps.length?window.firebase.apps[0]:window.firebase.initializeApp(FIREBASE_CONFIG);
        const auth=window.firebase.auth();
        const db=window.firebase.firestore();
        setFirebase({app,auth,db}); setFbReady(true);
      } catch(e) { console.error("Firebase load error:",e); setFbError(true); }
    };
    load();
  }, []);
  return { firebase, fbReady, fbError };
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { firebase, fbReady, fbError } = useFirebase();

  const [splash, setSplash] = useState(true);
  const [page,   setPage]   = useState("home");
  const [anim,   setAnim]   = useState(false);
  const [dark,   setDark]   = useState(true);
  const [toast,  setToast]  = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [projects,  setProjects]  = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  // Setup fields
  const [examName,       setExamName]       = useState("");
  const [subjectCount,   setSubjectCount]   = useState("");
  const [subjectNames,   setSubjectNames]   = useState([]);
  const [showSubjectInput,setShowSubjectInput]=useState(false);
  const [schoolName,     setSchoolName]     = useState("");
  const [schoolLocation, setSchoolLocation] = useState("");
  const [examType,       setExamType]       = useState("ANNUAL");
  const [classLevel,     setClassLevel]     = useState("");
  const [caWeight,       setCaWeight]       = useState(30);   // X% for CA
  const [passThreshold,  setPassThreshold]  = useState(33);
  const [examOutOfs,     setExamOutOfs]     = useState([]);
  const [showGradingEditor, setShowGradingEditor] = useState(false);
  const [customGrading,     setCustomGrading]     = useState(null);

  // Entry fields — separate inputs per subject
  const [name,          setName]          = useState("");
  const [roll,          setRoll]          = useState("");
  const [caMarks,       setCaMarks]       = useState([]);   // A: CA marks per subject
  const [mcqMarks,      setMcqMarks]      = useState([]);   // MCQ/Oral per subject
  const [cqMarks,       setCqMarks]       = useState([]);   // CQ/Written per subject

  const [viewStudent,   setViewStudent]   = useState(null);
  const [searchRoll,    setSearchRoll]    = useState("");
  const [saving,        setSaving]        = useState(false);
  const [studentModal,  setStudentModal]  = useState(null);
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue,     setRenameValue]     = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(()=>setToast(""), 2500);
  }, []);

  useEffect(() => {
    if (!firebase) return;
    const unsub = firebase.auth.onAuthStateChanged(async (u) => {
      setUser(u); setAuthReady(true);
      if (u) {
        const snap=await firebase.db.collection("users").doc(u.uid).get();
        if (snap.exists&&snap.data().blocked) { setIsAccountBlocked(true); return; }
        try {
          const projSnap=await firebase.db.collection("users").doc(u.uid).collection("projects").orderBy("createdAt","asc").get();
          setProjects(projSnap.docs.map(d=>({id:d.id,...d.data()})));
        } catch(e) { console.error(e); }
      } else { setProjects([]); setActiveProjectIndex(null); }
    });
    return ()=>unsub();
  }, [firebase]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(()=>{ const d=localStorage.getItem("edu_dark"); if(d!==null) setDark(JSON.parse(d)); },[]);
  useEffect(()=>{ localStorage.setItem("edu_dark",JSON.stringify(dark)); },[dark]);

  const go = useCallback((p)=>{
    setAnim(true); setTimeout(()=>{setPage(p);setAnim(false);},180);
  },[]);

  const activeProject = projects[activeProjectIndex] ?? null;

  // ─── Core calculation ────────────────────────────────────────────────────
  // Formula (matches marksheet image):
  //   CA marks      = A  (direct, stored as-is, max = fullMarks * caWeight%)
  //   MCQ+CQ        = Total column
  //   B             = round(Total * examWeight / 100)   where examWeight = 100 - caWeight
  //   Obtained      = A + B
  //   Percentage    = (Obtained / FullMarks) * 100
  //   GP            = look up percentage in grading scale
  //   Student fails if any subject percentage < passThreshold
  const calcStudent = (caArr, mcqArr, cqArr, eOutOfs, proj) => {
    const scale  = proj?.gradingScale || null;
    const gpFn   = makeGetGP(scale);
    const gradeFn= makeGetGrade(scale);
    const caw    = proj?.caWeight    ?? caWeight  ?? 30;
    const exw    = 100 - caw;                               // Y%
    const thresh = proj?.passThreshold ?? passThreshold ?? 33;
    const n      = mcqArr.length;
    const fullMarksArr = eOutOfs || Array(n).fill(100);

    const examTotals   = mcqArr.map((m,i)=>Number(m||0)+Number((cqArr||[])[i]||0)); // MCQ+CQ = Total
    const bMarks       = examTotals.map(t=>Math.round(t*exw/100));                  // B = Y% of Total
    const obtainedMarks= caArr.map((ca,i)=>Number(ca||0)+bMarks[i]);                // A+B
    const fullM        = fullMarksArr.map(f=>Number(f)||100);
    const pcts         = obtainedMarks.map((o,i)=>(o/fullM[i])*100);               // % for GP lookup
    const anyFail      = pcts.some(p=>p<thresh);
    const total        = obtainedMarks.reduce((a,b)=>a+b,0);

    let avgGP;
    if (anyFail) {
      avgGP = 0;
    } else {
      avgGP = pcts.reduce((a,p)=>a+gpFn(p),0)/pcts.length;
    }
    const cappedGP = Math.min(avgGP,5);
    return {
      gpa:Number(cappedGP.toFixed(2)),
      grade:gradeFn(cappedGP),
      total, examTotals, bMarks, obtainedMarks,
      status:anyFail?"FAIL":"PASS",
    };
  };

  const initEntryArrays = (n) => {
    setCaMarks(Array(n).fill(""));
    setMcqMarks(Array(n).fill(""));
    setCqMarks(Array(n).fill(""));
  };

  const addStudent = async () => {
    if (!activeProject) return;
    if (!name.trim()||!roll.trim()) return showToast("⚠ Name & Roll required");
    const n = activeProject.subjectCount;
    const eOutOfs = activeProject.examOutOfs||Array(n).fill(100);
    const caw = activeProject.caWeight??30;
    const exw = 100-caw;
    // Validate marks
    for (let i=0;i<n;i++){
      const ca=Number(caMarks[i]||0), mcq=Number(mcqMarks[i]||0), cq=Number(cqMarks[i]||0);
      const full=Number(eOutOfs[i])||100;
      const caMax=Math.round(full*caw/100);
      const examMax=full; // MCQ+CQ out of full marks (then B = Y% of that)
      if(ca<0||mcq<0||cq<0) return showToast("⚠ Marks cannot be negative");
      if(ca>caMax) return showToast(`⚠ CA for subject ${i+1} max is ${caMax}`);
      if(mcq+cq>full) return showToast(`⚠ MCQ+CQ for subject ${i+1} exceeds ${full}`);
    }
    const {gpa,grade,total,examTotals,bMarks,obtainedMarks,status} =
      calcStudent(caMarks,mcqMarks,cqMarks,eOutOfs,activeProject);
    const obj = {
      name:name.trim(), roll:roll.trim(), gpa, grade, total, status,
      obtainedMarks, examTotals, bMarks,
      caMarks:[...caMarks.map(Number)],
      mcqMarks:[...mcqMarks.map(Number)],
      cqMarks:[...cqMarks.map(Number)],
      subjectMarks:[...obtainedMarks], // backward compat
    };
    setSaving(true);
    try {
      const pr={...activeProject,students:[...activeProject.students]};
      const idx=pr.students.findIndex(s=>s.roll===obj.roll);
      if(idx!==-1){
        if(!window.confirm("Student exists. Update?")) { setSaving(false); return; }
        pr.students[idx]=obj;
      } else { pr.students.push(obj); }
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(pr.id).update({students:pr.students});
      const updated=[...projects]; updated[activeProjectIndex]=pr;
      setProjects(updated); setViewStudent(obj);
      setName(""); setRoll(""); initEntryArrays(n);
      showToast("✓ Saved");
    } catch(e) { showToast("✗ "+e.message); }
    setSaving(false);
  };

  const deleteStudent = async (rollNo) => {
    if (!activeProject) return;
    if (!window.confirm("Remove this student?")) return;
    try {
      const pr={...activeProject,students:activeProject.students.filter(s=>s.roll!==rollNo)};
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(pr.id).update({students:pr.students});
      const updated=[...projects]; updated[activeProjectIndex]=pr;
      setProjects(updated);
      if(viewStudent?.roll===rollNo) setViewStudent(null);
      showToast("✓ Student removed");
    } catch(e) { showToast("✗ "+e.message); }
  };

  const search = () => {
    const s=activeProject?.students.find(x=>x.roll.toLowerCase()===searchRoll.trim().toLowerCase());
    if(!s) return showToast("✗ Not found");
    setViewStudent(s);
  };

  const createProject = async () => {
    if (!examName.trim()||!subjectCount) return showToast("⚠ Fill all fields");
    const n=Number(subjectCount);
    if(n<1||n>20) return showToast("⚠ Subjects: 1–20");
    setSaving(true);
    try {
      const names=showSubjectInput?subjectNames.filter(s=>s.trim()):[];
      const np={
        examName:examName.trim(), subjectCount:n, students:[],
        subjectNames:names.length>0?names:[],
        createdAt:new Date().toISOString(),
        schoolName:schoolName.trim()||"",
        schoolLocation:schoolLocation.trim()||"",
        examType:examType.trim()||"ANNUAL",
        classLevel:classLevel.trim()||"",
        caWeight, examWeight:100-caWeight,
        passThreshold,
        examOutOfs:Array(n).fill(null).map((_,i)=>Number(examOutOfs[i])||100),
        gradingScale:showGradingEditor&&customGrading?customGrading:null,
      };
      const docRef=await firebase.db.collection("users").doc(user.uid).collection("projects").add(np);
      const newP={...np,id:docRef.id};
      const updated=[...projects,newP];
      setProjects(updated); setActiveProjectIndex(updated.length-1);
      initEntryArrays(n);
      setExamOutOfs([]); setExamName(""); setSubjectCount(""); setSubjectNames([]); setShowSubjectInput(false);
      setSchoolName(""); setSchoolLocation(""); setExamType("ANNUAL"); setClassLevel("");
      go("app"); showToast("✓ Project created");
    } catch(e) { showToast("✗ "+e.message); }
    setSaving(false);
  };

  const deleteProject = async (id) => {
    if(!window.confirm("Delete this project and all its data?")) return;
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).delete();
      const updated=projects.filter(p=>p.id!==id); setProjects(updated);
      if(activeProject?.id===id) setActiveProjectIndex(null);
      showToast("✓ Deleted");
    } catch(e) { showToast("✗ "+e.message); }
  };

  const renameProject = async (id, newName) => {
    if(!newName.trim()) return showToast("⚠ Name required");
    try {
      await firebase.db.collection("users").doc(user.uid).collection("projects").doc(id).update({examName:newName.trim()});
      setProjects(prev=>prev.map(q=>q.id===id?{...q,examName:newName.trim()}:q));
      setRenamingProject(null); setRenameValue(""); showToast("✓ Renamed");
    } catch(e) { showToast("✗ "+e.message); }
  };

  const exportCSV = (project) => {
    if(!project?.students?.length) return showToast("⚠ No students to export");
    const subs=project.subjectNames||Array(project.subjectCount).fill(null).map((_,i)=>`Sub${i+1}`);
    const headers=["Name","Roll","GPA","Grade","Total","Status",...subs.map(s=>`CA_${s}`),...subs.map(s=>`MCQ_${s}`),...subs.map(s=>`CQ_${s}`),...subs.map(s=>`Obtained_${s}`)];
    const rows=project.students.map(s=>[
      s.name,s.roll,s.gpa,s.grade,s.total,s.status,
      ...(s.caMarks||[]),...(s.mcqMarks||[]),...(s.cqMarks||[]),...(s.obtainedMarks||[]),
    ]);
    const csv=[headers,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download=`${project.examName.replace(/\s+/g,"_")}.csv`;
    a.click(); showToast("✓ CSV exported");
  };

  const signOut = async () => {
    await firebase.auth.signOut();
    setProjects([]); setActiveProjectIndex(null); setIsAccountBlocked(false);
    go("home"); showToast("✓ Signed out");
  };

  const meritRanks = activeProject ? getMeritRank(activeProject.students) : {};
  const sortedByRoll = activeProject
    ? [...activeProject.students].sort((a,b)=>String(a.roll).localeCompare(String(b.roll),undefined,{numeric:true}))
    : [];

  const summaryStats = () => {
    if (!activeProject?.students.length) return {pass:0,fail:0,rate:"0.0",avg:"0.00",total:0};
    const pass=activeProject.students.filter(s=>s.status==="PASS").length;
    const fail=activeProject.students.length-pass;
    const avg=(activeProject.students.reduce((a,s)=>a+s.gpa,0)/activeProject.students.length).toFixed(2);
    return {pass,fail,rate:((pass/activeProject.students.length)*100).toFixed(1),avg,total:activeProject.students.length};
  };

  const medalColors=["#f59e0b","#94a3b8","#cd7c2f"];
  const medals=["🥇","🥈","🥉"];

  const top3 = activeProject
    ? [...activeProject.students].sort((a,b)=>b.gpa-a.gpa||b.total-a.total).slice(0,3)
    : [];

  // ─── Grading Editor Component ────────────────────────────────────────────
  const GradingEditor = () => {
    const [rows, setRows] = useState(customGrading||DEFAULT_GRADING);
    const save = () => { setCustomGrading(rows); setShowGradingEditor(false); showToast("✓ Custom grading saved"); };
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 16px" }}>
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:20, padding:22, width:"100%", maxWidth:380, maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
          <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>Custom Grading Scale</div>
          <div style={{ color:"var(--text2)", fontSize:12, marginBottom:16 }}>GP is awarded based on percentage (Obtained/Full × 100)</div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {rows.map((r,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <Label>Min %</Label>
                  <input type="number" value={r.min} onChange={e=>{const nr=[...rows];nr[i]={...nr[i],min:Number(e.target.value)};setRows(nr);}} />
                </div>
                <div style={{ flex:1 }}>
                  <Label>GP</Label>
                  <input type="number" step="0.5" value={r.gp} onChange={e=>{const nr=[...rows];nr[i]={...nr[i],gp:Number(e.target.value)};setRows(nr);}} />
                </div>
                <div style={{ flex:1 }}>
                  <Label>Grade</Label>
                  <input value={r.grade} onChange={e=>{const nr=[...rows];nr[i]={...nr[i],grade:e.target.value};setRows(nr);}} />
                </div>
                <button onClick={()=>setRows(rows.filter((_,j)=>j!==i))} style={{ marginTop:20, width:28, height:28, borderRadius:8, border:"1.5px solid var(--red)", background:"transparent", color:"var(--red)", fontSize:14, cursor:"pointer" }}>×</button>
              </div>
            ))}
            <Btn variant="ghost" size="sm" onClick={()=>setRows([...rows,{min:0,gp:0,grade:""}])} style={{width:"100%",marginTop:4}}>+ Add Row</Btn>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <Btn variant="secondary" onClick={()=>setShowGradingEditor(false)} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={save} style={{flex:1}}>Save Scale</Btn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <Toast msg={toast} />}
      {splash && <LogoSplash onDone={()=>setSplash(false)} />}
      {isAccountBlocked && <BlockedModal onSignOut={signOut} />}
      {showAdmin && firebase && <AdminPanel firebase={firebase} showToast={showToast} onClose={()=>setShowAdmin(false)} />}
      {studentModal && <StudentListModal title={studentModal.title} students={studentModal.students} color={studentModal.color} onClose={()=>setStudentModal(null)} />}
      {showGradingEditor && <GradingEditor />}

      {/* ── Rename Modal ── */}
      {renamingProject && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px" }}>
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:20, padding:24, width:"100%", maxWidth:380 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>Rename Project</div>
            <input autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)} onKeyDown={e=>e.key==="Enter"&&renameProject(renamingProject,renameValue)} placeholder="Project name" style={{ marginBottom:14 }} />
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={()=>setRenamingProject(null)} style={{flex:1}}>Cancel</Btn>
              <Btn onClick={()=>renameProject(renamingProject,renameValue)} style={{flex:1}}>Save</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth:520, margin:"0 auto",
        paddingTop:16, paddingLeft:14, paddingRight:14, paddingBottom:110,
        opacity:anim?0:1, transform:anim?"translateY(8px)":"translateY(0)",
        transition:"opacity 0.18s, transform 0.18s",
      }}>
        {(!fbReady||!authReady)&&!splash&&<Spinner />}

        {fbError && (
          <Card style={{ marginTop:40, textAlign:"center", padding:32 }}>
            <div style={{ fontSize:36, marginBottom:14 }}>❌</div>
            <p style={{ fontWeight:800, marginBottom:8 }}>Firebase failed to load</p>
            <p style={{ color:"var(--text2)", fontSize:13 }}>Check your connection and Firebase config.</p>
          </Card>
        )}

        {fbReady&&authReady&&!user&&!fbError && <AuthPage firebase={firebase} onAuth={setUser} showToast={showToast} />}

        {fbReady&&authReady&&user&&!fbError&&!isAccountBlocked && (
          <>
            {/* ══════════════════════ HOME ══════════════════════ */}
            {page==="home" && (
              <div style={{ animation:"up 0.28s ease" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingTop:8, marginBottom:24 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#38bdf8,#0284c7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(14,165,233,0.35)" }}>
                        <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
                          <rect x="8" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.4)" />
                          <rect x="10" y="10" width="14" height="32" rx="3" fill="rgba(255,255,255,0.55)" />
                          <path d="M24 12h14a3 3 0 013 3v26a3 3 0 01-3 3H24V12z" fill="rgba(255,255,255,0.7)" />
                          <path d="M30 20l3 3 6-6" stroke="rgba(3,105,161,1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1 }}>EduGrade</div>
                        <div style={{ fontSize:10, color:"var(--text3)", fontWeight:500, letterSpacing:"0.04em" }}>Academic Excellence</div>
                      </div>
                    </div>
                    <h1 style={{ fontSize:24, fontWeight:800, lineHeight:1.15, letterSpacing:"-0.03em" }}>Hi, {user.displayName||user.email?.split("@")[0]} 👋</h1>
                    <p style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>Your grading workspace</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end", marginTop:4 }}>
                    <button onClick={()=>setDark(!dark)} style={{ width:38, height:38, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--surface2)", color:"var(--text)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>{dark?"☀":"☾"}</button>
                    <button onClick={signOut} style={{ padding:"5px 12px", borderRadius:9, border:"1.5px solid var(--border)", background:"var(--surface2)", color:"var(--text2)", fontSize:11, fontWeight:600 }}>Sign Out</button>
                  </div>
                </div>

                {projects.length>0 && (() => {
                  const totalStudents=projects.reduce((a,p)=>a+p.students.length,0);
                  const totalPassed=projects.reduce((a,p)=>a+p.students.filter(s=>s.status==="PASS").length,0);
                  return (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:18 }}>
                      {[{label:"Projects",value:projects.length,color:"var(--sky)"},{label:"Students",value:totalStudents,color:"var(--indigo)"},{label:"Passed",value:totalPassed,color:"var(--green)"}].map(({label,value,color})=>(
                        <div key={label} style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:14, padding:"12px 14px", textAlign:"center" }}>
                          <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"var(--font-mono)", lineHeight:1 }}>{value}</div>
                          <div style={{ fontSize:9.5, fontWeight:600, color:"var(--text2)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <button onClick={()=>go("setup")} style={{ width:"100%", padding:"15px 22px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#38bdf8 0%,#0284c7 100%)", color:"#fff", fontSize:14, fontWeight:700, marginBottom:16, boxShadow:"0 6px 22px rgba(14,165,233,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ width:24, height:24, borderRadius:8, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>+</span>
                  Create New Project
                </button>

                {projects.length===0 ? (
                  <div style={{ textAlign:"center", padding:"54px 0 0", color:"var(--text2)" }}>
                    <div style={{ width:64, height:64, borderRadius:18, margin:"0 auto 16px", background:"var(--surface2)", border:"1.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>📚</div>
                    <div style={{ fontWeight:700, marginBottom:6, color:"var(--text)", fontSize:15 }}>No projects yet</div>
                    <div style={{ fontSize:13 }}>Create your first grading project above</div>
                  </div>
                ) : projects.map((p,i)=>{
                  const pass=p.students.filter(s=>s.status==="PASS").length;
                  const passRate=p.students.length?((pass/p.students.length)*100).toFixed(0):0;
                  return (
                    <div key={p.id} className="project-card" style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:16, marginBottom:9, overflow:"hidden" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px" }}>
                        <div style={{ width:46, height:46, borderRadius:14, flexShrink:0, background:"color-mix(in srgb,var(--sky) 10%,var(--surface2))", border:"1.5px solid color-mix(in srgb,var(--sky) 18%,var(--border))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📋</div>
                        <div onClick={()=>{
                          setActiveProjectIndex(i);
                          initEntryArrays(p.subjectCount);
                          setExamOutOfs(p.examOutOfs||Array(p.subjectCount).fill(100));
                          setPassThreshold(p.passThreshold??33);
                          go("app");
                        }} style={{ flex:1, cursor:"pointer" }}>
                          <div style={{ fontWeight:700, fontSize:14.5, marginBottom:3 }}>{p.examName}</div>
                          <div style={{ color:"var(--text2)", fontSize:12 }}>
                            {p.students.length} students · {p.subjectCount} subjects
                            {p.students.length>0 && <span style={{ marginLeft:8, color:"var(--green)", fontWeight:600 }}>{passRate}% pass</span>}
                          </div>
                          {p.students.length>0 && (
                            <div style={{ height:3, borderRadius:2, background:"var(--border)", marginTop:7, overflow:"hidden" }}>
                              <div style={{ height:3, borderRadius:2, background:"var(--green)", width:`${passRate}%`, transition:"width 0.8s ease" }} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display:"flex", borderTop:"1px solid var(--border)" }}>
                        {[
                          {icon:"✏️",label:"Rename",  action:()=>{setRenamingProject(p.id);setRenameValue(p.examName);}},
                          {icon:"📤",label:"Export CSV",action:()=>exportCSV(p)},
                          {icon:"🗑", label:"Delete",  action:()=>deleteProject(p.id),danger:true},
                        ].map(({icon,label,action,danger})=>(
                          <button key={label} onClick={e=>{e.stopPropagation();action();}} style={{ flex:1, padding:"8px 2px", border:"none", background:"transparent", color:danger?"var(--red)":"var(--text2)", fontSize:10.5, fontWeight:600, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, borderRight:label!=="Delete"?"1px solid var(--border)":undefined }}>
                            <span style={{fontSize:14}}>{icon}</span><span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════ SETUP ══════════════════════ */}
            {page==="setup" && (
              <Card animate style={{ borderRadius:20 }}>
                <SectionHeader label="New Project" title="Configure Exam" subtitle="Set up your grading project" />
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                  <div><Label>School / Institution Name</Label>
                    <input placeholder="e.g. Alhera" value={schoolName} onChange={e=>setSchoolName(e.target.value)} />
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ flex:1 }}><Label>Location</Label>
                      <input placeholder="e.g. Sunamganj" value={schoolLocation} onChange={e=>setSchoolLocation(e.target.value)} />
                    </div>
                    <div style={{ flex:1 }}><Label>Exam Type</Label>
                      <select value={examType} onChange={e=>setExamType(e.target.value)}>
                        <option>ANNUAL</option><option>HALF-YEARLY</option><option>TEST</option><option>MONTHLY</option><option>TRIAL</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ flex:1 }}><Label>Class / Level</Label>
                      <input placeholder="e.g. Class 7" value={classLevel} onChange={e=>setClassLevel(e.target.value)} />
                    </div>
                    <div style={{ flex:1 }}><Label>Exam Name</Label>
                      <input placeholder="e.g. Alhera Annual 2025" value={examName} onChange={e=>setExamName(e.target.value)} />
                    </div>
                  </div>

                  <div><Label>Number of Subjects (1–20)</Label>
                    <input type="number" placeholder="e.g. 11" value={subjectCount}
                      onChange={e=>{
                        setSubjectCount(e.target.value);
                        const n=Number(e.target.value);
                        if(n>0&&n<=20){
                          setSubjectNames(Array(n).fill("").map((_,i)=>subjectNames[i]||""));
                          setExamOutOfs(Array(n).fill("").map((_,i)=>examOutOfs[i]||100));
                        }
                      }} />
                  </div>

                  {/* CA Weight */}
                  <div style={{ background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:14, padding:16 }}>
                    <Label>Marking Weights</Label>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text2)", marginBottom:6, fontWeight:600 }}>CA Weight (X%) — "A"</div>
                        <input type="number" placeholder="30" value={caWeight}
                          onChange={e=>{const v=Math.min(100,Math.max(0,Number(e.target.value)));setCaWeight(v);}} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"var(--text2)", marginBottom:6, fontWeight:600 }}>Exam Weight (Y%) — "B"</div>
                        <div style={{ padding:"11px 14px", borderRadius:10, background:"var(--surface3)", border:"1.5px solid var(--border)", fontSize:13.5, fontWeight:700, color:"var(--sky)", fontFamily:"var(--font-mono)" }}>{100-caWeight}%</div>
                      </div>
                    </div>
                    <div style={{ marginTop:10, padding:"10px 12px", borderRadius:10, background:"color-mix(in srgb,var(--sky) 7%,transparent)", border:"1.5px solid color-mix(in srgb,var(--sky) 18%,transparent)", fontSize:11.5, color:"var(--text2)", lineHeight:1.6 }}>
                      <strong style={{color:"var(--sky)"}}>Formula:</strong> A = CA marks · Total = MCQ + CQ · B = round(Total × {100-caWeight}%) · <strong>Obtained = A + B</strong> · GP from (Obtained/Full) × 100%
                    </div>
                  </div>

                  <div>
                    <Label>Pass Threshold (%)</Label>
                    <input type="number" placeholder="33" value={passThreshold} onChange={e=>setPassThreshold(Number(e.target.value))} />
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>Student fails if any subject's obtained% is below this</div>
                  </div>

                  {/* Subject names & full marks */}
                  {Number(subjectCount)>0 && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <Label>Subject Names & Full Marks</Label>
                        <button onClick={()=>setShowSubjectInput(!showSubjectInput)} style={{ fontSize:11, color:"var(--sky)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>
                          {showSubjectInput?"Hide":"Set Names"}
                        </button>
                      </div>
                      {showSubjectInput && Array.from({length:Number(subjectCount)},(_,i)=>(
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                          <input placeholder={`Subject ${i+1} name`} value={subjectNames[i]||""} onChange={e=>{const a=[...subjectNames];a[i]=e.target.value;setSubjectNames(a);}} style={{ flex:2 }} />
                          <input type="number" placeholder="Full marks" value={examOutOfs[i]||""} onChange={e=>{const a=[...examOutOfs];a[i]=e.target.value;setExamOutOfs(a);}} style={{ flex:1 }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grading scale */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:12, background:"var(--surface2)", border:"1.5px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>Grading Scale</div>
                      <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>{customGrading&&showGradingEditor===false?"Custom scale set":"Default (A+/A/A-/B/C/D/F)"}</div>
                    </div>
                    <Btn variant="sky" size="sm" onClick={()=>setShowGradingEditor(true)}>Customize</Btn>
                  </div>

                  <Btn onClick={createProject} loading={saving} style={{ width:"100%", marginTop:4 }} size="lg">
                    Create Project →
                  </Btn>
                </div>
              </Card>
            )}

            {/* ══════════════════════ ENTRY ══════════════════════ */}
            {page==="app" && (
              <div style={{ animation:"up 0.28s ease" }}>
                {!activeProject ? (
                  <div style={{ textAlign:"center", padding:"60px 0 0" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>No project selected</div>
                    <div style={{ color:"var(--text2)", fontSize:13, marginBottom:20 }}>Go Home and tap a project, or create one.</div>
                    <Btn onClick={()=>go("home")}>← Go Home</Btn>
                  </div>
                ) : (
                  <>
                    {/* Project header */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--sky)", marginBottom:4 }}>Active Project</div>
                      <h2 style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.02em" }}>{activeProject.examName}</h2>
                      <div style={{ color:"var(--text2)", fontSize:12, marginTop:2 }}>
                        {activeProject.subjectCount} subjects · CA {activeProject.caWeight??30}% + Exam {100-(activeProject.caWeight??30)}%
                      </div>
                    </div>

                    <Card style={{ marginBottom:14 }}>
                      <SectionHeader label="Add Student" title="" subtitle="" />
                      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                        <div style={{ display:"flex", gap:10 }}>
                          <div style={{ flex:2 }}><Label>Student Name</Label><input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} /></div>
                          <div style={{ flex:1 }}><Label>Roll No.</Label><input placeholder="Roll" value={roll} onChange={e=>setRoll(e.target.value)} /></div>
                        </div>

                        {/* Per-subject mark entry */}
                        {Array.from({length:activeProject.subjectCount},(_,i)=>{
                          const subName=(activeProject.subjectNames||[])[i]||`Subject ${i+1}`;
                          const full=Number((activeProject.examOutOfs||[])[i])||100;
                          const caw=activeProject.caWeight??30;
                          const caMax=Math.round(full*caw/100);
                          const exw=100-caw;
                          return (
                            <div key={i} style={{ background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:14, padding:14 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                                <div style={{ fontWeight:700, fontSize:13 }}>{subName}</div>
                                <div style={{ fontSize:10.5, color:"var(--text2)" }}>Full: {full}</div>
                              </div>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                                <div>
                                  <div style={{ fontSize:10, fontWeight:700, color:"var(--indigo)", marginBottom:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>CA (A)</div>
                                  <div style={{ fontSize:9, color:"var(--text3)", marginBottom:4 }}>max {caMax}</div>
                                  <input type="number" placeholder="0" value={caMarks[i]||""}
                                    onChange={e=>{const a=[...caMarks];a[i]=e.target.value;setCaMarks(a);}} />
                                </div>
                                <div>
                                  <div style={{ fontSize:10, fontWeight:700, color:"var(--sky)", marginBottom:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>MCQ/Oral</div>
                                  <div style={{ fontSize:9, color:"var(--text3)", marginBottom:4 }}>exam part</div>
                                  <input type="number" placeholder="0" value={mcqMarks[i]||""}
                                    onChange={e=>{const a=[...mcqMarks];a[i]=e.target.value;setMcqMarks(a);}} />
                                </div>
                                <div>
                                  <div style={{ fontSize:10, fontWeight:700, color:"var(--green)", marginBottom:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>CQ/Written</div>
                                  <div style={{ fontSize:9, color:"var(--text3)", marginBottom:4 }}>exam part</div>
                                  <input type="number" placeholder="0" value={cqMarks[i]||""}
                                    onChange={e=>{const a=[...cqMarks];a[i]=e.target.value;setCqMarks(a);}} />
                                </div>
                              </div>
                              {/* Live preview */}
                              {(Number(caMarks[i]||0)+Number(mcqMarks[i]||0)+Number(cqMarks[i]||0))>0 && (() => {
                                const ca=Number(caMarks[i]||0),mcq=Number(mcqMarks[i]||0),cq=Number(cqMarks[i]||0);
                                const examTotal=mcq+cq;
                                const B=Math.round(examTotal*exw/100);
                                const obtained=ca+B;
                                const pct=(obtained/full)*100;
                                const gpFn=makeGetGP(activeProject.gradingScale||null);
                                const gp=gpFn(pct);
                                return (
                                  <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
                                    <span style={{ fontSize:10.5, color:"var(--text2)", background:"var(--surface3)", padding:"3px 8px", borderRadius:6 }}>Total: {examTotal}</span>
                                    <span style={{ fontSize:10.5, color:"var(--text2)", background:"var(--surface3)", padding:"3px 8px", borderRadius:6 }}>B: {B}</span>
                                    <span style={{ fontSize:10.5, fontWeight:700, color:"var(--sky)", background:"color-mix(in srgb,var(--sky) 10%,transparent)", padding:"3px 8px", borderRadius:6 }}>A+B: {obtained}</span>
                                    <span style={{ fontSize:10.5, color:"var(--text2)", background:"var(--surface3)", padding:"3px 8px", borderRadius:6 }}>{pct.toFixed(1)}%</span>
                                    <span style={{ fontSize:10.5, fontWeight:700, color:gradeColor(makeGetGrade(activeProject.gradingScale||null)(gp)), background:`color-mix(in srgb,${gradeColor(makeGetGrade(activeProject.gradingScale||null)(gp))} 12%,transparent)`, padding:"3px 8px", borderRadius:6 }}>GP: {gp}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}

                        <Btn onClick={addStudent} loading={saving} style={{ width:"100%" }}>Save Student →</Btn>
                      </div>
                    </Card>

                    {/* Search */}
                    <Card style={{ marginBottom:14 }}>
                      <Label>Search by Roll Number</Label>
                      <div style={{ display:"flex", gap:8 }}>
                        <input placeholder="Roll number" value={searchRoll} onChange={e=>setSearchRoll(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} style={{ flex:1 }} />
                        <Btn onClick={search} variant="sky">Search</Btn>
                      </div>
                    </Card>

                    {/* Result card */}
                    {viewStudent && (
                      <Card animate style={{ marginBottom:14, border:"1.5px solid color-mix(in srgb,var(--sky) 30%,var(--border))" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                          <div>
                            <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--sky)", marginBottom:4 }}>Result</div>
                            <h3 style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.02em" }}>{viewStudent.name}</h3>
                            <div style={{ color:"var(--text2)", fontSize:12 }}>Roll: {viewStudent.roll}</div>
                          </div>
                          <Pill color={viewStudent.status==="PASS"?"var(--green)":"var(--red)"}>{viewStudent.status}</Pill>
                        </div>
                        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                          {[
                            {label:"GPA",value:viewStudent.gpa,color:"var(--sky)"},
                            {label:"Grade",value:viewStudent.grade,color:gradeColor(viewStudent.grade)},
                            {label:"Total",value:viewStudent.total,color:"var(--indigo)"},
                            {label:"Merit",value:`#${meritRanks[viewStudent.roll]||"—"}`,color:"var(--yellow)"},
                          ].map(({label,value,color})=>(
                            <div key={label} style={{ background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:12, padding:"10px 14px", flex:1, minWidth:60 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:"var(--text2)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{label}</div>
                              <div style={{ fontSize:18, fontWeight:800, color, fontFamily:"var(--font-mono)" }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        {/* Subject breakdown */}
                        <div style={{ marginBottom:14 }}>
                          {Array.from({length:activeProject.subjectCount},(_,i)=>{
                            const subName=(activeProject.subjectNames||[])[i]||`Subject ${i+1}`;
                            const obtained=(viewStudent.obtainedMarks||viewStudent.subjectMarks||[])[i]||0;
                            const full=Number((activeProject.examOutOfs||[])[i])||100;
                            const pct=(obtained/full)*100;
                            const gpFn=makeGetGP(activeProject.gradingScale||null);
                            const gp=gpFn(pct);
                            const ca=(viewStudent.caMarks||[])[i]||0;
                            const mcq=(viewStudent.mcqMarks||[])[i]||0;
                            const cq=(viewStudent.cqMarks||[])[i]||0;
                            const examTot=mcq+cq;
                            const B=(viewStudent.bMarks||[])[i]||0;
                            return (
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                                <div style={{ flex:2, fontSize:12, fontWeight:600 }}>{subName}</div>
                                <div style={{ flex:1, fontSize:10.5, color:"var(--text2)", textAlign:"center" }}>CA:{ca} T:{examTot} B:{B}</div>
                                <div style={{ fontSize:13, fontWeight:700, color:"var(--sky)", fontFamily:"var(--font-mono)", minWidth:28, textAlign:"right" }}>{obtained}</div>
                                <Pill color={gradeColor(makeGetGrade(activeProject.gradingScale||null)(gp))}>{makeGetGrade(activeProject.gradingScale||null)(gp)}</Pill>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <Btn variant="sky" size="sm" onClick={()=>downloadMarksheet(viewStudent,activeProject,showToast)} style={{flex:1}}>📄 Marksheet</Btn>
                          <Btn variant="danger" size="sm" onClick={()=>deleteStudent(viewStudent.roll)} style={{flex:1}}>🗑 Delete</Btn>
                        </div>
                      </Card>
                    )}

                    {/* Students list */}
                    {sortedByRoll.length>0 && (
                      <Card>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>All Students ({sortedByRoll.length})</div>
                        <div style={{ overflowX:"auto" }}>
                          <table>
                            <thead><tr>
                              <th>Name</th><th>Roll</th><th>GPA</th><th>Grade</th><th>Total</th><th>Status</th>
                            </tr></thead>
                            <tbody>
                              {sortedByRoll.map(s=>(
                                <tr key={s.roll} style={{ cursor:"pointer" }} onClick={()=>setViewStudent(s)}>
                                  <td style={{ fontWeight:600 }}>{s.name}</td>
                                  <td style={{ fontFamily:"var(--font-mono)", color:"var(--text2)", fontSize:12 }}>{s.roll}</td>
                                  <td style={{ fontWeight:700, color:gradeColor(s.grade), fontFamily:"var(--font-mono)" }}>{s.gpa}</td>
                                  <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                  <td style={{ fontFamily:"var(--font-mono)" }}>{s.total}</td>
                                  <td><Pill color={s.status==="PASS"?"var(--green)":"var(--red)"}>{s.status}</Pill></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════ SUMMARY ══════════════════════ */}
            {page==="summary" && (
              <div style={{ animation:"up 0.28s ease" }}>
                <SectionHeader label="Analytics" title="Statistics" subtitle={activeProject?.examName||"Select a project"} />

                {!activeProject ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text2)" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
                    <div>Select a project from Home first</div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const s=summaryStats();
                      return (
                        <>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                            <StatTile label="Total Students" value={s.total} color="var(--sky)" />
                            <StatTile label="Avg GPA" value={s.avg} color="var(--indigo)" />
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                            <StatTile label="Passed" value={s.pass} color="var(--green)"
                              onClick={()=>setStudentModal({title:"Passed Students",students:activeProject.students.filter(x=>x.status==="PASS"),color:"var(--green)"})}
                              actionLabel="View" />
                            <StatTile label="Failed" value={s.fail} color="var(--red)"
                              onClick={()=>setStudentModal({title:"Failed Students",students:activeProject.students.filter(x=>x.status==="FAIL"),color:"var(--red)"})}
                              actionLabel="View" />
                          </div>

                          {/* Pass rate bar */}
                          <Card style={{ marginBottom:14 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                              <span style={{ fontSize:12, fontWeight:600 }}>Pass Rate</span>
                              <span style={{ fontSize:14, fontWeight:800, color:"var(--green)", fontFamily:"var(--font-mono)" }}>{s.rate}%</span>
                            </div>
                            <div style={{ height:10, borderRadius:5, background:"var(--surface2)", overflow:"hidden" }}>
                              <div style={{ height:10, borderRadius:5, background:"linear-gradient(90deg,#10b981,#34d399)", width:`${s.rate}%`, transition:"width 1s ease" }} />
                            </div>
                          </Card>

                          {/* Grade distribution */}
                          <Card style={{ marginBottom:14 }}>
                            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Grade Distribution</div>
                            {(activeProject.gradingScale||DEFAULT_GRADING).map(g=>{
                              const count=activeProject.students.filter(s=>s.grade===g.grade).length;
                              const pct=activeProject.students.length?((count/activeProject.students.length)*100).toFixed(0):0;
                              if(count===0) return null;
                              return (
                                <div key={g.grade} style={{ marginBottom:10 }}
                                  onClick={()=>setStudentModal({title:`Grade ${g.grade}`,students:activeProject.students.filter(s=>s.grade===g.grade),color:gradeColor(g.grade)})}>
                                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                                    <span style={{ fontSize:12, fontWeight:600, color:gradeColor(g.grade) }}>{g.grade}</span>
                                    <span style={{ fontSize:12, color:"var(--text2)" }}>{count} ({pct}%)</span>
                                  </div>
                                  <div style={{ height:7, borderRadius:4, background:"var(--surface2)", overflow:"hidden", cursor:"pointer" }}>
                                    <div style={{ height:7, borderRadius:4, background:gradeColor(g.grade), width:`${pct}%`, transition:"width 0.8s ease" }} />
                                  </div>
                                </div>
                              );
                            })}
                          </Card>

                          {/* Top 3 */}
                          {top3.length>0 && (
                            <Card style={{ marginBottom:14 }}>
                              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Top Performers</div>
                              {top3.map((s,i)=>(
                                <div key={s.roll} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<top3.length-1?"1px solid var(--border)":"none" }}>
                                  <div style={{ width:32, height:32, borderRadius:"50%", background:`color-mix(in srgb,${medalColors[i]} 20%,transparent)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{medals[i]}</div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div>
                                    <div style={{ color:"var(--text2)", fontSize:11 }}>Roll: {s.roll}</div>
                                  </div>
                                  <div style={{ textAlign:"right" }}>
                                    <div style={{ fontWeight:800, fontSize:16, color:medalColors[i], fontFamily:"var(--font-mono)" }}>{s.gpa}</div>
                                    <Pill color={gradeColor(s.grade)}>{s.grade}</Pill>
                                  </div>
                                </div>
                              ))}
                            </Card>
                          )}

                          <div style={{ display:"flex", gap:8 }}>
                            <Btn variant="sky" onClick={()=>downloadMeritListPDF(activeProject,showToast)} style={{flex:1}}>📋 Merit PDF</Btn>
                            <Btn variant="secondary" onClick={()=>exportCSV(activeProject)} style={{flex:1}}>📤 Export CSV</Btn>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════ MERIT ══════════════════════ */}
            {page==="merit" && (
              <div style={{ animation:"up 0.28s ease" }}>
                <SectionHeader label="Merit List" title="Rankings" subtitle={activeProject?.examName||"Select a project"} />

                {!activeProject ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text2)" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>☰</div>
                    <div>Select a project from Home first</div>
                  </div>
                ) : activeProject.students.length===0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text2)" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
                    <div>No students added yet</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      <Btn variant="sky" size="sm" onClick={()=>downloadMeritListPDF(activeProject,showToast)} style={{flex:1}}>📋 Download PDF</Btn>
                      <Btn variant="secondary" size="sm" onClick={()=>exportCSV(activeProject)} style={{flex:1}}>📤 CSV</Btn>
                    </div>

                    <Card>
                      <div style={{ overflowX:"auto" }}>
                        <table>
                          <thead><tr>
                            <th style={{minWidth:36}}>Rank</th>
                            <th>Name</th>
                            <th>Roll</th>
                            <th>GPA</th>
                            <th>Grade</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr></thead>
                          <tbody>
                            {[...activeProject.students]
                              .sort((a,b)=>b.gpa-a.gpa||b.total-a.total)
                              .map((s,i)=>{
                                const rank=i+1;
                                const rankColor=rank===1?"#f59e0b":rank===2?"#94a3b8":rank===3?"#cd7c2f":null;
                                return (
                                  <tr key={s.roll} onClick={()=>{setViewStudent(s);go("app");}} style={{cursor:"pointer"}}>
                                    <td>
                                      {rankColor
                                        ? <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:26, height:26, borderRadius:"50%", fontSize:11, fontWeight:800, background:rankColor, color:"#fff" }}>{rank}</span>
                                        : <span style={{ color:"var(--text2)", fontSize:12, fontFamily:"var(--font-mono)" }}>#{rank}</span>}
                                    </td>
                                    <td style={{ fontWeight:600 }}>{s.name}</td>
                                    <td style={{ fontFamily:"var(--font-mono)", color:"var(--text2)", fontSize:12 }}>{s.roll}</td>
                                    <td style={{ fontWeight:700, color:gradeColor(s.grade), fontFamily:"var(--font-mono)" }}>{s.gpa}</td>
                                    <td><Pill color={gradeColor(s.grade)}>{s.grade}</Pill></td>
                                    <td style={{ fontFamily:"var(--font-mono)" }}>{s.total}</td>
                                    <td><Pill color={s.status==="PASS"?"var(--green)":"var(--red)"}>{s.status}</Pill></td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* Dock */}
            {user && (
              <Dock page={page} go={go} isAdmin={isAdmin} onAdminOpen={()=>setShowAdmin(true)} />
            )}
          </>
        )}
      </div>
    </>
  );
}
