"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFinixData } from "@/hooks/useFinixData";
import {
  ArrowRight, Shield, Wallet, Database, Loader2, AlertTriangle, X,
  TrendingUp, Brain, Target, PieChart, Activity,
  Menu, ExternalLink, CheckCircle,
  Layers, Globe, Sparkles, ArrowUpRight,
} from "lucide-react";
import Image from "next/image";

// ─── Scroll Reveal Hook ──────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.97]"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────
function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`absolute rounded-full blur-3xl animate-float opacity-30 ${className}`} style={{ animationDelay: `${delay}ms` }} />
  );
}

// ─── Animated Number ─────────────────────────────────────────────
function CountUp({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────────────
const features = [
  { icon: TrendingUp, title: "Income & Expense Tracking", desc: "Log every transaction on-chain. Categorize income and expenses with a clean, intuitive interface.", color: "from-blue-500/10 to-indigo-500/10" },
  { icon: Brain, title: "AI Financial Advisor", desc: "Get personalized insights and money tips powered by AI. Understand your spending patterns.", color: "from-violet-500/10 to-purple-500/10" },
  { icon: Target, title: "Goal Setting", desc: "Set savings goals and track progress. Stay motivated with visual milestones and achievements.", color: "from-rose-500/10 to-pink-500/10" },
  { icon: Database, title: "Walrus Storage", desc: "Your financial data lives on Walrus — decentralized, permanent, and fully owned by you.", color: "from-amber-500/10 to-orange-500/10" },
  { icon: Activity, title: "On-Chain Tracking", desc: "Every transaction is recorded on Sui Network. Transparent, verifiable, and tamper-proof.", color: "from-cyan-500/10 to-teal-500/10" },
  { icon: PieChart, title: "Saving Rate Analytics", desc: "Visualize your saving rate with beautiful charts. Know exactly where your money goes.", color: "from-emerald-500/10 to-green-500/10" },
];

const steps = [
  { num: "01", title: "Connect Your Wallet", desc: "Link your Sui wallet — no email sign-up needed.", icon: Wallet },
  { num: "02", title: "Track Your Finances", desc: "Log income, expenses, and let AI analyze your habits.", icon: PieChart },
  { num: "03", title: "Own Your Data", desc: "Stored on Walrus, anchored on Sui. Yours forever.", icon: Database },
];

const stats = [
  { value: 100, suffix: "%", label: "Non-Custodial" },
  { value: 2, suffix: "s", label: "Finality" },
  { value: 100, suffix: "%", label: "Transparent" },
  { value: 0, suffix: "$", label: "Platform Fee" },
];

// ─── Page ────────────────────────────────────────────────────────
export default function Home() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { connectWallet, isLoading } = useFinixData();
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isConnected && address && !isLoading) {
      connectWallet(address).then(() => router.replace("/dashboard"));
    }
  }, [isConnected, address, isLoading, connectWallet, router]);

  const handleConnect = useCallback(async () => {
    setError(null);
    try { await connect(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to connect"); }
  }, [connect]);

  return (
    <main className="min-h-screen bg-[#FAFBFF] text-[#111827] overflow-x-hidden">
      {/* ─── Error Toast ──────────────────────────────────────────── */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-xl max-w-sm animate-slide-up">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">Connection Failed</p>
            <p className="mt-1 text-xs text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)}><X size={16} className="text-red-400 hover:text-red-600" /></button>
        </div>
      )}

      {/* ─── Nav ──────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-transparent"}`}>
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 h-[72px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <Image src="/logos/finix-logo.svg" alt="Finix" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight">Finix</span>
          </a>
          <div className="hidden md:flex items-center gap-1">
            {["Features", "How it works", "Tech"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-black/[0.03] transition-all">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isConnected ? (
              <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-[#1F2937] transition-all btn-press">
                Launch App <ExternalLink size={14} />
              </button>
            ) : (
              <button onClick={handleConnect} disabled={isConnecting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-[#1F2937] transition-all btn-press">
                {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
          <button className="md:hidden p-2 text-[#6B7280]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-2xl px-5 py-4 space-y-1 animate-slide-up">
            {["Features", "How it works", "Tech"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileMenuOpen(false)} className="block py-3 text-base font-medium text-[#6B7280] hover:text-[#111827]">{item}</a>
            ))}
            <div className="pt-3">
              <button onClick={() => { setMobileMenuOpen(false); handleConnect(); }} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#111827] text-white rounded-xl text-base font-semibold">
                {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-[72px] overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-[#FAFBFF] to-[#FAFBFF]" />
          <FloatingOrb className="w-[600px] h-[600px] bg-[#3B5BDB]/20 top-[-100px] left-1/2 -translate-x-1/2" delay={0} />
          <FloatingOrb className="w-[400px] h-[400px] bg-[#6F8CFF]/15 top-[200px] right-[-100px]" delay={1000} />
          <FloatingOrb className="w-[300px] h-[300px] bg-[#3B5BDB]/10 top-[400px] left-[-50px]" delay={2000} />
        </div>

        {/* Floating icons — desktop only */}
        <div className="hidden xl:block">
          {[
            { Icon: TrendingUp, x: "8%", y: "120px", d: 0 },
            { Icon: Brain, x: "88%", y: "80px", d: 200 },
            { Icon: Database, x: "5%", y: "350px", d: 400 },
            { Icon: Target, x: "90%", y: "320px", d: 600 },
            { Icon: PieChart, x: "12%", y: "520px", d: 800 },
            { Icon: Activity, x: "85%", y: "500px", d: 1000 },
            { Icon: Layers, x: "15%", y: "180px", d: 300 },
            { Icon: Globe, x: "82%", y: "160px", d: 500 },
          ].map(({ Icon, x, y, d }, i) => (
            <Reveal key={i} delay={d}>
              <div className="absolute animate-float" style={{ left: x, top: y, animationDelay: `${d}ms` }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg shadow-black/[0.03] border border-black/[0.04] hover:scale-110 transition-transform duration-300">
                  <Icon size={22} className="text-[#3B5BDB]/70" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 md:px-8 py-24 md:py-36 lg:py-40">
          <Reveal>
            <div className="max-w-[800px] mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3B5BDB]/10 bg-white/60 backdrop-blur-sm px-4 py-2 mb-8 shadow-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B5BDB]">
                  <Shield size={11} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-[#3B5BDB] tracking-wide uppercase">Personal Finance on Sui Network</span>
              </div>

              <h1 className="text-[48px] sm:text-[56px] md:text-[64px] lg:text-[72px] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#111827]">
                Your Money.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B5BDB] via-[#5B7BFF] to-[#8BA4FF]">
                  On-Chain. On Point.
                </span>
              </h1>

              <p className="mt-7 text-lg md:text-xl leading-relaxed text-[#6B7280] max-w-[560px] mx-auto font-normal">
                Connect your Sui wallet.
                <br className="hidden sm:block" />
                Track income, expenses, and goals — with AI insights.
                <br className="hidden sm:block" />
                Your data lives on Walrus. Decentralized. Yours.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || isLoading}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#111827] text-white rounded-2xl text-base font-semibold transition-all duration-300 hover:shadow-[0_8px_30px_rgba(17,24,39,0.3)] hover:scale-[1.02] btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting || isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Wallet size={18} />
                  )}
                  {isConnecting || isLoading ? "Connecting..." : "Get Started"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3B5BDB] to-[#5B7BFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </button>
                <span className="text-sm text-[#9CA3AF] flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#10B981]" />
                  No email. No signup. Just your wallet.
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stats bar */}
        <Reveal delay={300}>
          <div className="relative mx-auto max-w-[900px] px-5 md:px-8 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="relative rounded-2xl border border-black/[0.04] bg-white/70 backdrop-blur-sm p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-sm text-[#6B7280] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[680px] mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#3B5BDB] mb-4">Features</span>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-[#111827] leading-[1.1] tracking-[-0.02em]">
                Everything You Need.
                <br />
                <span className="text-[#6B7280]">Nothing You Don&apos;t.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group relative rounded-3xl border border-black/[0.04] bg-white p-7 md:p-8 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(59,91,219,0.12)] hover:border-[#3B5BDB]/20 hover:-translate-y-1 cursor-default">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-[#3B5BDB] group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#111827]">{f.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[#6B7280]">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#3B5BDB] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ArrowUpRight size={14} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-b from-white to-[#FAFBFF]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[680px] mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#3B5BDB] mb-4">How It Works</span>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-[#111827] leading-[1.1] tracking-[-0.02em]">
                Three Steps.
                <br />
                <span className="text-[#6B7280]">Zero Complications.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-[48px] left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-[2px] bg-gradient-to-r from-transparent via-[#3B5BDB]/20 to-transparent" />
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 150}>
                <div className="relative flex flex-col items-center text-center group">
                  <div className="relative">
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#EEF2FF] to-white text-[#3B5BDB] text-3xl font-extrabold relative z-10 border border-[#3B5BDB]/10 shadow-[0_4px_20px_rgba(59,91,219,0.08)] group-hover:shadow-[0_8px_30px_rgba(59,91,219,0.15)] group-hover:scale-105 transition-all duration-500">
                      <s.icon size={32} />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-white text-xs font-bold z-20">
                      {s.num}
                    </div>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-[#111827]">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280] max-w-[300px]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={500}>
            <div className="mt-16 text-center">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#111827] text-white rounded-2xl text-base font-semibold hover:shadow-[0_8px_30px_rgba(17,24,39,0.3)] transition-all btn-press"
              >
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                {isConnecting ? "Connecting..." : "Start Tracking Now"}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Tech ──────────────────────────────────────────────────── */}
      <section id="tech" className="py-24 md:py-32 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#3B5BDB]/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[680px] mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#6F8CFF] mb-4">Technology</span>
              <h2 className="text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.02em]">
                Built on
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F8CFF] to-[#A5B4FC]">Battle-Tested Infrastructure</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
              {/* Sui */}
              <div className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 md:p-10 hover:bg-white/[0.06] transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B5BDB] overflow-hidden shadow-lg shadow-[#3B5BDB]/20">
                    <Image src="/logos/sui-logo.svg" alt="Sui" width={40} height={40} className="object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sui Network</h3>
                    <p className="text-sm text-[#94A3B8] mt-0.5">Layer 1 Blockchain</p>
                  </div>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-[#94A3B8]">
                  Fast, scalable, and secure. Sub-second finality with parallel execution. Built for everyday financial tracking.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Parallel Execution", "Move Language", "Low Fees", "Mainnet"].map((tag) => (
                    <span key={tag} className="inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-[#94A3B8] group-hover:border-white/[0.12] transition-colors">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Walrus */}
              <div className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 md:p-10 hover:bg-white/[0.06] transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white overflow-hidden shadow-lg">
                    <Image src="/logos/walrus-logo.svg" alt="Walrus" width={40} height={40} className="object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Walrus</h3>
                    <p className="text-sm text-[#94A3B8] mt-0.5">Decentralized Storage</p>
                  </div>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-[#94A3B8]">
                  Your financial data stored as Walrus blobs — decentralized, permanent, and fully owned by you. No third-party control.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Immutable", "Redundant", "Blob Storage", "Sui-Anchored"].map((tag) => (
                    <span key={tag} className="inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-[#94A3B8] group-hover:border-white/[0.12] transition-colors">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[680px] mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#3B5BDB] mb-4">Pricing</span>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-[#111827] leading-[1.1] tracking-[-0.02em]">
                Free Forever.
              </h2>
              <p className="mt-4 text-lg text-[#6B7280]">
                No subscription. No hidden fees. Just minimal Sui gas.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="max-w-[520px] mx-auto">
              <div className="relative rounded-[28px] border-2 border-[#111827] bg-white p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3B5BDB] to-[#8BA4FF]" />
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 mb-6">
                    <Sparkles size={12} className="text-[#3B5BDB]" />
                    <span className="text-xs font-bold text-[#3B5BDB] uppercase tracking-wider">Free</span>
                  </div>
                  <p className="text-[64px] md:text-[72px] font-extrabold text-[#111827] tracking-tight leading-none">
                    $0
                    <span className="text-lg font-normal text-[#6B7280] ml-1">/month</span>
                  </p>
                  <p className="mt-3 text-base text-[#6B7280]">Always free. No credit card.</p>
                </div>
                <ul className="mt-10 space-y-4">
                  {[
                    "Unlimited income & expense tracking",
                    "AI-powered financial insights",
                    "Goal setting with progress tracking",
                    "Walrus decentralized storage",
                    "On-chain transaction history",
                    "Saving rate analytics & charts",
                    "All future features included",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-[#374151]">
                      <CheckCircle size={18} className="mt-0.5 shrink-0 text-[#10B981]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#111827] text-white rounded-2xl text-base font-semibold hover:bg-[#1F2937] transition-all btn-press"
                  >
                    {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                    {isConnecting ? "Connecting..." : "Get Started Free"}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-[#111827] text-white py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="grid md:grid-cols-4 gap-10 md:gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <Image src="/logos/finix-logo.svg" alt="Finix" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold tracking-tight">Finix</span>
              </div>
              <p className="text-sm leading-relaxed text-[#9CA3AF] max-w-[240px]">
                Personal finance on Sui Network. Your data, your rules, on-chain.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-5">Product</h4>
              <ul className="space-y-3">
                {["Features", "How it Works", "Technology", "Pricing"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-[#D1D5DB] hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><a href="https://github.com/oktavian3/finix" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">Documentation <ExternalLink size={11} className="opacity-40" /></a></li>
                <li><a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">Sui Network <ExternalLink size={11} className="opacity-40" /></a></li>
                <li><a href="https://walrus.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">Walrus Storage <ExternalLink size={11} className="opacity-40" /></a></li>
                <li><a href="https://github.com/oktavian3/finix" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">GitHub <ExternalLink size={11} className="opacity-40" /></a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-5">Connect</h4>
              <ul className="space-y-3">
                <li><a href="https://x.com/satyaXBT" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">X (Twitter) <ExternalLink size={11} className="opacity-40" /></a></li>
                <li><a href="https://t.me/satyaxbt" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">Telegram <ExternalLink size={11} className="opacity-40" /></a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#4B5563]">&copy; {new Date().getFullYear()} Finix. Built on Sui Network with Walrus Storage.</p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#4B5563] hover:text-[#6B7280] cursor-pointer transition-colors">Privacy</span>
              <span className="text-xs text-[#4B5563] hover:text-[#6B7280] cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
