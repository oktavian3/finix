"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFinixData } from "@/hooks/useFinixData";
import {
  ArrowRight, Shield, Wallet, Database, Loader2, AlertTriangle, X,
  TrendingUp, Brain, Target, PieChart, Activity,
  Menu, ExternalLink, ChevronRight, Star, CheckCircle,
  Lock, Zap, Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

// ─── Fade-in on scroll hook ───────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
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
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Floating Icon Component ──────────────────────────────────────
function FloatingIcon({ icon: Icon, className = "", delay = 0 }: { icon: LucideIcon; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal(0.3);
  return (
    <div
      ref={ref}
      className={`absolute transition-all duration-1000 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/5 border border-black/5">
        <Icon size={20} className="text-[#3B5BDB]" />
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────
const features = [
  { icon: TrendingUp, title: "Income & Expense Tracking", desc: "Log every transaction on-chain. Categorize income and expenses with a clean, intuitive interface." },
  { icon: Brain, title: "AI Financial Advisor", desc: "Get personalized insights and money tips powered by AI. Understand your spending patterns." },
  { icon: Target, title: "Goal Setting", desc: "Set savings goals and track progress. Stay motivated with visual milestones and achievements." },
  { icon: Database, title: "Walrus Storage", desc: "Your financial data lives on Walrus — decentralized, permanent, and fully owned by you." },
  { icon: Activity, title: "On-Chain Tracking", desc: "Every transaction is recorded on Sui Network. Transparent, verifiable, and tamper-proof." },
  { icon: PieChart, title: "Saving Rate Analytics", desc: "Visualize your saving rate with beautiful charts. Know exactly where your money goes." },
];

function FeatureCard({ icon: Icon, title, desc, index }: { icon: LucideIcon; title: string; desc: string; index: number }) {
  return (
    <Reveal delay={index * 100}>
      <div className="group relative rounded-[20px] border border-[#E2E8F0] bg-white p-6 md:p-8 hover-card cursor-default">
        <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#EEF2FF] text-[#3B5BDB] group-hover:bg-[#3B5BDB] group-hover:text-white transition-all duration-300">
          <Icon size={22} />
        </div>
        <h3 className="mt-5 text-[17px] font-semibold text-[#111827]">{title}</h3>
        <p className="mt-2 text-base leading-6 text-[#6B7280]">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Step Card ────────────────────────────────────────────────────
const steps = [
  { num: "01", title: "Connect Your Wallet", desc: "Link your Sui wallet — no email sign-up needed. Your wallet is your identity on Finix." },
  { num: "02", title: "Track Your Finances", desc: "Log income and expenses, set goals, and let AI analyze your spending habits automatically." },
  { num: "03", title: "Own Your Data", desc: "Everything is stored on Walrus and anchored on Sui. Your data stays decentralized and yours forever." },
];

// ─── Highlight Pill ───────────────────────────────────────────────
const highlights = [
  { icon: Lock, label: "Non-Custodial" },
  { icon: Zap, label: "Sub-Second Finality" },
  { icon: Eye, label: "Fully Transparent" },
  { icon: Shield, label: "Decentralized" },
];

export default function Home() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { connectWallet, isLoading } = useFinixData();
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address && !isLoading) {
      connectWallet(address).then(() => {
        router.replace("/dashboard");
      });
    }
  }, [isConnected, address, isLoading, connectWallet, router]);

  const handleConnect = useCallback(async () => {
    setError(null);
    try {
      await connect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  }, [connect]);

  const handleLaunchApp = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-[#111827] overflow-x-hidden">
      {/* ─── Error Toast ────────────────────────────────────────── */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4 shadow-lg max-w-sm animate-slide-up">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800">Connection Failed</p>
            <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800"
            >
              Reload page & try again
            </button>
          </div>
          <button onClick={() => setError(null)} className="shrink-0">
            <X size={16} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* ─── Nav Bar ────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <Image
              src="/logos/finix-logo.svg"
              alt="Finix"
              width={34}
              height={34}
              className="rounded-[10px]"
            />
            <span className="text-[17px] font-bold text-[#111827] tracking-tight">Finix</span>
          </a>

          {/* Desktop Nav Right */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">How it works</a>
            <a href="#tech" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">Tech</a>
            {isConnected ? (
              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] text-white rounded-[10px] text-sm font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
              >
                Launch App
                <ExternalLink size={14} />
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B5BDB] text-white rounded-[10px] text-sm font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
              >
                {isConnecting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Wallet size={15} />
                )}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-[#6B7280] hover:text-[#111827]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-5 py-4 space-y-3 animate-slide-up">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-[#6B7280] hover:text-[#111827]">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-[#6B7280] hover:text-[#111827]">How it works</a>
            <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-[#6B7280] hover:text-[#111827]">Tech</a>
            <div className="pt-2">
              {isConnected ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLaunchApp(); }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#3B5BDB] text-white rounded-[10px] text-base font-semibold"
                >
                  Launch App
                  <ExternalLink size={14} />
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleConnect(); }}
                  disabled={isConnecting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#3B5BDB] text-white rounded-[10px] text-base font-semibold"
                >
                  {isConnecting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Wallet size={15} />
                  )}
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-[64px] overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-white to-white pointer-events-none" />
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#3B5BDB]/3 blur-[120px] pointer-events-none" />

        {/* Floating Icons — Desktop Only */}
        <div className="hidden lg:block">
          <FloatingIcon icon={TrendingUp} className="top-[140px] left-[8%]" delay={100} />
          <FloatingIcon icon={Brain} className="top-[100px] right-[10%]" delay={200} />
          <FloatingIcon icon={Database} className="top-[280px] left-[5%]" delay={300} />
          <FloatingIcon icon={Target} className="top-[240px] right-[6%]" delay={400} />
          <FloatingIcon icon={PieChart} className="top-[380px] left-[12%]" delay={500} />
          <FloatingIcon icon={Activity} className="top-[360px] right-[12%]" delay={600} />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 md:px-8 py-20 md:py-28">
          <Reveal>
            <div className="max-w-[700px] mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3B5BDB]/15 bg-[#EEF2FF] px-4 py-1.5 mb-6">
                <Shield size={13} className="text-[#3B5BDB]" />
                <span className="text-xs font-semibold text-[#3B5BDB] tracking-wide">Personal Finance on Sui Network</span>
              </div>

              <h1 className="text-[42px] md:text-[52px] lg:text-[60px] font-bold leading-[1.05] text-[#111827] tracking-tight">
                Your Finances,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B5BDB] to-[#6F8CFF]">
                  On-Chain.
                </span>
              </h1>

              <p className="mt-5 text-[15px] md:text-md leading-7 text-[#6B7280] max-w-[540px] mx-auto">
                Connect your Sui wallet to manage income, expenses, goals, and AI-powered insights.
                Your data is stored securely on Walrus — decentralized and yours forever.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {isConnecting || isLoading ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold opacity-50 cursor-not-allowed"
                  >
                    <Loader2 size={17} className="animate-spin" />
                    Loading...
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 shadow-[0_4px_14px_rgba(59,91,219,0.3)] hover:shadow-[0_6px_24px_rgba(59,91,219,0.4)] btn-press"
                  >
                    <Wallet size={17} />
                    Connect Wallet
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                )}
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-[#10B981]" />
                  No email required
                </span>
              </div>
            </div>
          </Reveal>

          {/* Highlight Pills — replaces fake stats */}
          <Reveal delay={200}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-sm"
                >
                  <h.icon size={14} className="text-[#3B5BDB]" />
                  <span className="text-sm font-medium text-[#374151]">{h.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-14">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#3B5BDB] mb-3">Features</span>
              <h2 className="text-[34px] md:text-[40px] font-bold text-[#111827] leading-[1.1] tracking-tight">
                Everything You Need to Master Your Money
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                Finix combines on-chain transparency with AI-powered insights to give you complete control over your personal finances.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-14">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#3B5BDB] mb-3">How It Works</span>
              <h2 className="text-[34px] md:text-[40px] font-bold text-[#111827] leading-[1.1] tracking-tight">
                Get Started in 3 Simple Steps
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                No account creation. No email sign-up. Just your Sui wallet and a few clicks.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[40px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-[2px] bg-gradient-to-r from-[#3B5BDB]/20 via-[#3B5BDB]/40 to-[#3B5BDB]/20" />

            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 150}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB] text-2xl font-bold relative z-10 border-4 border-white shadow-[0_0_0_2px_rgba(59,91,219,0.15)]">
                    {s.num}
                  </div>
                  <h3 className="mt-6 text-[19px] font-semibold text-[#111827]">{s.title}</h3>
                  <p className="mt-2 text-base leading-6 text-[#6B7280] max-w-[320px]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={500}>
            <div className="mt-14 text-center">
              {isConnected ? (
                <button
                  onClick={handleLaunchApp}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
                >
                  Launch App
                  <ExternalLink size={16} />
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
                >
                  {isConnecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wallet size={16} />
                  )}
                  {isConnecting ? "Connecting..." : "Connect Wallet & Get Started"}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Tech Section ───────────────────────────────────────── */}
      <section id="tech" className="py-20 md:py-24 bg-[#111827] text-white">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-14">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F8CFF] mb-3">Technology</span>
              <h2 className="text-[34px] md:text-[40px] font-bold leading-[1.1] tracking-tight">
                Built on Battle-Tested Infrastructure
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#9CA3AF]">
                Finix leverages the Sui Network for fast, low-cost transactions and Walrus for decentralized, permanent data storage.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
              {/* Sui Badge */}
              <div className="group relative w-full max-w-[400px] rounded-[20px] border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-all duration-300 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-[#3B5BDB] overflow-hidden">
                    <Image
                      src="/logos/sui-logo.svg"
                      alt="Sui"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Sui Network</h3>
                    <p className="text-sm text-[#9CA3AF] mt-0.5">Layer 1 Blockchain</p>
                  </div>
                </div>
                <p className="mt-5 text-base leading-6 text-[#9CA3AF]">
                  Fast, scalable, and secure. Sui processes thousands of transactions per second with sub-second finality, making it ideal for everyday financial tracking.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {["Parallel Execution", "Move Language", "Low Fees", "Mainnet Ready"].map((tag) => (
                    <span key={tag} className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#9CA3AF]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Walrus Badge */}
              <div className="group relative w-full max-w-[400px] rounded-[20px] border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-all duration-300 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-white overflow-hidden">
                    <Image
                      src="/logos/walrus-logo.svg"
                      alt="Walrus"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Walrus</h3>
                    <p className="text-sm text-[#9CA3AF] mt-0.5">Decentralized Storage</p>
                  </div>
                </div>
                <p className="mt-5 text-base leading-6 text-[#9CA3AF]">
                  Your financial data is stored as Walrus blobs — decentralized, permanent, and fully owned by you. No centralized database, no third-party control.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {["Immutable", "Redundant", "Blob Storage", "Sui-Anchored"].map((tag) => (
                    <span key={tag} className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#9CA3AF]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Pricing / Free Section ─────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-14">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#3B5BDB] mb-3">Pricing</span>
              <h2 className="text-[34px] md:text-[40px] font-bold text-[#111827] leading-[1.1] tracking-tight">
                Free to Use. Forever.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                No subscription fees, no hidden costs. Just pay the minimal Sui network gas fees for transactions.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="max-w-[480px] mx-auto">
              <div className="relative rounded-[24px] border-2 border-[#3B5BDB] bg-white p-8 md:p-10 shadow-[0_20px_60px_-12px_rgba(59,91,219,0.2)] overflow-hidden">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B5BDB] to-[#6F8CFF]" />

                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1 mb-5">
                    <Star size={12} className="text-[#3B5BDB]" />
                    <span className="text-xs font-semibold text-[#3B5BDB]">Popular</span>
                  </div>
                  <p className="text-[56px] md:text-[64px] font-bold text-[#111827] tracking-tight">
                    $0
                    <span className="text-md font-normal text-[#6B7280] ml-1">/month</span>
                  </p>
                  <p className="mt-2 text-base text-[#6B7280]">Always free, no credit card needed</p>
                </div>

                <ul className="mt-8 space-y-3.5">
                  {[
                    "Unlimited income & expense tracking",
                    "AI-powered financial insights",
                    "Goal setting with progress tracking",
                    "Walrus decentralized storage",
                    "On-chain transaction history",
                    "Saving rate analytics & charts",
                    "All future features included",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-[#374151]">
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#10B981]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isConnected ? (
                    <button
                      onClick={handleLaunchApp}
                      className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
                    >
                      Launch App
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#3B5BDB] text-white rounded-[12px] text-base font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-all duration-150 btn-press"
                    >
                      {isConnecting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Wallet size={16} />
                      )}
                      {isConnecting ? "Connecting..." : "Get Started Free"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#111827] text-white py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/logos/finix-logo.svg"
                  alt="Finix"
                  width={30}
                  height={30}
                  className="rounded-[8px]"
                />
                <span className="text-md font-bold tracking-tight">Finix</span>
              </div>
              <p className="text-sm leading-6 text-[#9CA3AF] max-w-[240px]">
                Personal finance on Sui Network. Your data, your rules, on-chain.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Product</h4>
              <ul className="space-y-2.5">
                {["Features", "How it Works", "Technology", "Pricing"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-[#D1D5DB] hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://github.com/oktavian3/finix" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Documentation
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
                <li>
                  <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Sui Network
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
                <li>
                  <a href="https://walrus.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Walrus Storage
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/oktavian3/finix" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    GitHub
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://x.com/satyaXBT" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    X (Twitter)
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
                <li>
                  <a href="https://t.me/satyaxbt" target="_blank" rel="noopener noreferrer" className="text-sm text-[#D1D5DB] hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Telegram
                    <ExternalLink size={11} className="opacity-50" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6B7280]">
              &copy; {new Date().getFullYear()} Finix. Built on Sui Network with Walrus Storage.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#6B7280]">Privacy</span>
              <span className="text-xs text-[#6B7280]">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
