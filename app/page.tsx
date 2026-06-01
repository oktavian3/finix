"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFinixData } from "@/hooks/useFinixData";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle,
  Database,
  ExternalLink,
  Loader2,
  Menu,
  PieChart,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FINIX_LOGO_SRC = "/logo/finix-logo.svg";
const SUI_LOGO_SRC = "/logo/sui-logo.svg";
const WALRUS_LOGO_SRC = "/logo/walrus-logo.svg";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Technology", href: "#tech" },
  { label: "Access", href: "#access" },
];

const valueCards = [
  {
    label: "Built on Sui",
    desc: "Wallet-native access for on-chain finance workflows.",
  },
  {
    label: "Powered by Walrus",
    desc: "Structured finance records designed for decentralized storage.",
  },
  {
    label: "Early Access Product",
    desc: "A focused product surface while Finix keeps evolving.",
  },
  {
    label: "Real-Time Portfolio Insights",
    desc: "Track spending, goals, and portfolio signals in one view.",
  },
];

const floatingCards = [
  { label: "Wallet Sync", value: "Sui", className: "left-3 top-10 md:left-12 md:top-24", tone: "from-[#EAF1FF] to-[#FFFFFF]" },
  { label: "Storage Layer", value: "Walrus", className: "right-3 top-24 md:right-10 md:top-28", tone: "from-[#EAFBF6] to-[#FFFFFF]" },
  { label: "Signals", value: "Live", className: "left-8 bottom-10 md:left-20 md:bottom-20", tone: "from-[#FFF4E8] to-[#FFFFFF]" },
  { label: "AI Notes", value: "Contextual", className: "right-8 bottom-6 md:right-24 md:bottom-24", tone: "from-[#F3EFFF] to-[#FFFFFF]" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Portfolio Clarity",
    desc: "See income, expenses, and portfolio movement without turning your dashboard into a spreadsheet.",
  },
  {
    icon: Brain,
    title: "AI Financial Notes",
    desc: "Turn recent activity into readable summaries that help you spot habits and follow up with better questions.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set practical savings targets and follow progress with clean milestones instead of vanity metrics.",
  },
  {
    icon: Database,
    title: "Walrus Data Layer",
    desc: "Use Walrus-backed storage paths for user-owned records as the product matures.",
  },
  {
    icon: Activity,
    title: "Transaction Context",
    desc: "Log records with categories and notes so your financial history stays useful after the moment passes.",
  },
  {
    icon: PieChart,
    title: "Saving Rate View",
    desc: "Understand how money flows across categories with simple charts built for recurring review.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect your Sui wallet",
    desc: "Use your wallet as the entry point. No email account is needed for the landing flow.",
  },
  {
    num: "02",
    title: "Add finance activity",
    desc: "Track income, spending, goals, and context in a product surface built for personal review.",
  },
  {
    num: "03",
    title: "Review insights",
    desc: "Use portfolio views and AI notes to understand what changed and where to focus next.",
  },
];

const techCards = [
  {
    name: "Sui Network",
    label: "Layer 1 blockchain",
    logo: SUI_LOGO_SRC,
    desc: "Finix is designed around Sui wallet access and fast on-chain interactions for personal finance workflows.",
    tags: ["Wallet-native", "Move ecosystem", "Fast settlement"],
  },
  {
    name: "Walrus",
    label: "Decentralized storage",
    logo: WALRUS_LOGO_SRC,
    desc: "Walrus gives Finix a path for decentralized blob storage without relying on a traditional app database as the only source of truth.",
    tags: ["Blob storage", "User-owned data", "Sui-aligned"],
  },
];

const footerProductLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Technology", href: "#tech" },
  { label: "Access", href: "#access" },
];

const footerResourceLinks = [
  { label: "Documentation", href: "https://github.com/oktavian3/finix", external: true },
  { label: "Sui Network", href: "https://sui.io", external: true },
  { label: "Walrus Storage", href: "https://www.walrus.xyz", external: true },
];

const footerConnectLinks = [
  { label: "X / Twitter", href: "https://x.com/satyaXBT", external: true },
  { label: "Telegram", href: "https://t.me/satyaxbt", external: true },
];

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const { ref, visible } = useScrollReveal();
  const isVisible = immediate || visible;
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function OptionalLogo({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`text-lg font-black tracking-tight ${
          dark ? "text-white" : "text-[#111827]"
        }`}
      >
        Finix
      </span>
    );
  }

  return (
    <div className="flex min-w-[72px] items-center gap-3">
      <img
        src={FINIX_LOGO_SRC}
        alt="Finix logo"
        className="h-8 w-8 shrink-0 object-contain"
        onError={() => setFailed(true)}
      />
      <span
        className={`text-[17px] font-black tracking-tight ${
          dark ? "text-white" : "text-[#111827]"
        }`}
      >
        Finix
      </span>
    </div>
  );
}

function CTAButton({
  isConnected,
  handleLaunchApp,
  compact = false,
}: {
  isConnected: boolean;
  handleLaunchApp: () => void;
  compact?: boolean;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full font-bold transition-all duration-200 btn-press focus-ring";
  const size = compact ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm md:px-7 md:py-3.5 md:text-base";

  if (isConnected) {
    return (
      <button
        onClick={handleLaunchApp}
        className={`${base} ${size} bg-[#111827] text-white shadow-[0_18px_36px_-18px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 hover:bg-black`}
      >
        Launch App
        <ExternalLink size={compact ? 14 : 17} />
      </button>
    );
  }

  return (
    <button
      onClick={handleLaunchApp}
      className={`${base} ${size} bg-[#111827] text-white shadow-[0_18px_36px_-18px_rgba(17,24,39,0.75)] hover:-translate-y-0.5 hover:bg-black`}
    >
      Launch App
      <ExternalLink size={compact ? 14 : 17} />
    </button>
  );
}

function ConnectWalletButton({
  isConnecting,
  isLoading,
  handleConnect,
}: {
  isConnecting: boolean;
  isLoading?: boolean;
  handleConnect: () => void;
}) {
  const busy = isConnecting || Boolean(isLoading);

  return (
    <button
      onClick={handleConnect}
      disabled={busy}
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-bold text-[#111827] shadow-[0_16px_38px_-32px_rgba(17,24,39,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 md:text-base"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
      {busy ? "Connecting..." : "Connect Wallet"}
      {!busy && <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </button>
  );
}

function ValueCard({ label, desc, index }: { label: string; desc: string; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <div className="group h-full rounded-[22px] border border-[#E5E7EB] bg-white/85 p-5 shadow-[0_18px_45px_-32px_rgba(17,24,39,0.55)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-[#CBD5E1] hover:shadow-[0_24px_55px_-35px_rgba(17,24,39,0.7)]">
        <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#111827] via-[#4F6EF7] to-[#22C55E] transition-all duration-300 group-hover:w-16" />
        <h3 className="text-[17px] font-black tracking-tight text-[#111827]">{label}</h3>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{desc}</p>
      </div>
    </Reveal>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: { icon: LucideIcon; title: string; desc: string; index: number }) {
  return (
    <Reveal delay={index * 90}>
      <div className="group h-full rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_-38px_rgba(17,24,39,0.65)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-[#CBD5E1] hover:shadow-[0_26px_70px_-42px_rgba(17,24,39,0.8)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F8FAFC] via-[#EEF2FF] to-[#EAFBF6] text-[#111827] ring-1 ring-[#E5E7EB] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
          <Icon size={22} strokeWidth={1.9} />
        </div>
        <h3 className="mt-6 text-lg font-black tracking-tight text-[#111827]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#6B7280]">{desc}</p>
      </div>
    </Reveal>
  );
}

function TechLogo({ src, name }: { src: string; name: string }) {
  return (
    <OptionalLogo
      src={src}
      alt={`${name} logo`}
      className="h-10 w-10 object-contain"
      fallback={
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#111827]">
          {name}
        </span>
      }
    />
  );
}

function FooterLink({ label, href, external }: { label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-1.5 text-sm text-[#D1D5DB] transition-colors hover:text-white"
    >
      {label}
      {external && <ExternalLink size={12} />}
    </a>
  );
}

export default function Home() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { connectWallet, isLoading } = useFinixData();
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address && !isLoading) {
      connectWallet(address);
    }
  }, [isConnected, address, isLoading, connectWallet]);

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
    <main className="min-h-screen overflow-x-hidden bg-[#ECEEF2] px-3 py-3 text-[#111827] sm:px-5 sm:py-5">
      {error && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-xl">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-red-800">Connection Failed</p>
            <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-semibold text-red-600 underline hover:text-red-800"
            >
              Reload page and try again
            </button>
          </div>
          <button onClick={() => setError(null)} className="shrink-0" aria-label="Dismiss connection error">
            <X size={16} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[30px] bg-white shadow-[0_28px_100px_-72px_rgba(15,23,42,0.8)] sm:rounded-[42px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_50%_0%,rgba(238,242,255,0.92),rgba(255,255,255,0)_62%)]" />
        <div className="pointer-events-none absolute left-8 top-36 h-48 w-48 rounded-full bg-[#DFF8EF]/70 blur-[90px]" />
        <div className="pointer-events-none absolute right-0 top-16 h-56 w-56 rounded-full bg-[#E8EEFF]/90 blur-[96px]" />

        <nav className="fixed left-0 right-0 top-5 z-40 px-4 sm:top-7">
          <div className="mx-auto flex max-w-[980px] items-center justify-between rounded-full border border-[#E5E7EB] bg-white/88 px-4 py-3 shadow-[0_18px_55px_-34px_rgba(17,24,39,0.9)] backdrop-blur-xl md:px-5">
            <a href="#" aria-label="Finix home">
              <BrandMark />
            </a>

            <div className="hidden items-center gap-1 rounded-full bg-[#F8FAFC] p-1 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-bold text-[#6B7280] hover:bg-white hover:text-[#111827] hover:shadow-sm"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden md:block">
              <CTAButton
                isConnected={isConnected}
                handleLaunchApp={handleLaunchApp}
                compact
              />
            </div>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFC] md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mx-auto mt-3 max-w-[620px] rounded-[28px] border border-[#E5E7EB] bg-white/95 p-4 shadow-[0_22px_55px_-36px_rgba(17,24,39,0.9)] backdrop-blur-xl md:hidden">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-[#374151] hover:bg-[#F8FAFC]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-3">
                <CTAButton
                  isConnected={isConnected}
                  handleLaunchApp={() => {
                    setMobileMenuOpen(false);
                    handleLaunchApp();
                  }}
                />
              </div>
            </div>
          )}
        </nav>

        <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-8 md:pb-24 md:pt-36">
          <div className="pointer-events-none absolute left-1/2 top-[270px] hidden h-px w-[760px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent md:block" />
          <div className="pointer-events-none absolute left-1/2 top-[198px] hidden h-[330px] w-[330px] -translate-x-1/2 rounded-full border border-[#E5E7EB] md:block" />
          <div className="pointer-events-none absolute left-1/2 top-[145px] hidden h-[440px] w-[440px] -translate-x-1/2 rounded-full border border-dashed border-[#E5E7EB] md:block" />

          <div className="relative mx-auto max-w-[1180px]">
            {floatingCards.map((card, index) => (
              <div
                key={card.label}
                className={`animate-float hidden md:block absolute z-10 ${card.className}`}
                style={{ animationDelay: `${index * 450}ms` }}
              >
                <div className={`rounded-[24px] border border-white/80 bg-gradient-to-br ${card.tone} p-4 shadow-[0_22px_55px_-38px_rgba(17,24,39,0.85)] backdrop-blur`}>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9CA3AF]">{card.label}</p>
                  <p className="mt-1 text-lg font-black tracking-tight text-[#111827]">{card.value}</p>
                </div>
              </div>
            ))}

            <Reveal immediate>
              <div className="mx-auto max-w-[790px] text-center">
                <div className="mx-auto mb-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-center text-[9px] font-black uppercase tracking-[0.08em] text-[#374151] shadow-[0_14px_35px_-28px_rgba(17,24,39,0.75)] sm:px-4 sm:text-xs sm:tracking-[0.14em]">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                  <span className="min-w-0">Personal finance for the Sui ecosystem</span>
                </div>

                <h1 className="text-[34px] font-black leading-[0.98] tracking-tight text-[#050505] min-[420px]:text-[44px] sm:text-[62px] md:text-[84px] lg:text-[96px]">
                  Finance that feels lighter on-chain.
                </h1>

                <p className="mx-auto mt-7 max-w-[620px] text-base leading-8 text-[#6B7280] md:text-lg">
                  Finix brings wallet-native tracking, goal progress, and AI-assisted finance notes into one clean workspace built around Sui and Walrus.
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <CTAButton
                    isConnected={isConnected}
                    handleLaunchApp={handleLaunchApp}
                  />
                  {!isConnected && (
                    <ConnectWalletButton
                      isConnecting={isConnecting}
                      isLoading={isLoading}
                      handleConnect={handleConnect}
                    />
                  )}
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-bold text-[#111827] shadow-[0_16px_38px_-32px_rgba(17,24,39,0.8)] hover:-translate-y-0.5 hover:border-[#CBD5E1]"
                  >
                    Explore product
                    <ArrowRight size={16} />
                  </a>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#9CA3AF]">
                  <CheckCircle size={14} className="text-[#22C55E]" />
                  Early access. No fake traction claims.
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} immediate>
              <div className="mx-auto mt-14 max-w-[860px] overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-[#F8FAFC]/80 p-2 shadow-[0_24px_70px_-50px_rgba(17,24,39,0.95)] backdrop-blur sm:p-3 md:mt-20">
                <div className="grid min-w-0 max-w-full gap-3 overflow-hidden rounded-[22px] bg-white p-3 sm:p-4 md:grid-cols-[1.1fr_0.9fr] md:p-5">
                  <div className="min-w-0 max-w-full overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#111827] p-4 text-white sm:p-5">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">Portfolio pulse</p>
                        <p className="mt-1 text-2xl font-black">$2,840.50</p>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Preview</div>
                    </div>
                    <div className="flex h-32 min-w-0 items-end gap-1.5 sm:gap-2">
                      {[42, 58, 45, 76, 64, 88, 72, 96].map((height, index) => (
                        <div key={height + index} className="flex-1 rounded-t-xl bg-gradient-to-t from-[#4F6EF7] to-[#8FE5C0]" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3">
                    <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-white ring-1 ring-[#E5E7EB]">
                          <Brain size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#111827]">AI note</p>
                          <p className="text-xs leading-5 text-[#6B7280]">Spending shifted toward recurring items this week.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9CA3AF]">Savings goal</p>
                          <p className="mt-1 text-lg font-black text-[#111827]">Emergency fund</p>
                        </div>
                        <span className="text-sm font-black text-[#22C55E]">64%</span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-[#E5E7EB]">
                        <div className="h-2 w-[64%] rounded-full bg-gradient-to-r from-[#111827] to-[#22C55E]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-12 sm:px-8 md:pb-20">
          <div className="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-4">
            {valueCards.map((card, index) => (
              <ValueCard key={card.label} {...card} index={index} />
            ))}
          </div>
        </section>

        <section id="features" className="px-5 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <Reveal>
              <div className="max-w-[650px]">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">Features</span>
                <h2 className="mt-4 text-[34px] font-black leading-tight tracking-tight text-[#111827] md:text-[54px]">
                  A calm command center for personal finance.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#6B7280]">
                  Finix is built around a few useful workflows first: record activity, understand patterns, and keep your financial context portable.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-5 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <Reveal>
              <div className="mx-auto max-w-[670px] text-center">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">How it works</span>
                <h2 className="mt-4 text-[34px] font-black leading-tight tracking-tight text-[#111827] md:text-[52px]">
                  Start with your wallet, then build the picture.
                </h2>
              </div>
            </Reveal>

            <div className="relative mt-12 grid gap-5 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-[#CBD5E1] to-transparent md:block" />
              {steps.map((step, index) => (
                <Reveal key={step.num} delay={index * 120}>
                  <div className="relative h-full rounded-[26px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_18px_50px_-42px_rgba(17,24,39,0.75)] transition-all duration-300 hover:-translate-y-1">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-white bg-[#111827] text-lg font-black text-white shadow-[0_0_0_1px_#E5E7EB]">
                      {step.num}
                    </div>
                    <h3 className="mt-6 text-lg font-black tracking-tight text-[#111827]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#6B7280]">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="tech" className="px-5 py-16 sm:px-8 md:py-24">
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[32px] bg-[#111827] px-5 py-12 text-white shadow-[0_28px_80px_-58px_rgba(17,24,39,0.9)] md:px-10 md:py-16">
            <Reveal>
              <div className="mx-auto max-w-[720px] text-center">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Technology</span>
                <h2 className="mt-4 text-[34px] font-black leading-tight tracking-tight md:text-[52px]">
                  Built for Sui and Walrus from the start.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/60">
                  The landing page now points to official logo asset paths only. Add the SVGs listed below and Finix will render them automatically.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {techCards.map((card, index) => (
                <Reveal key={card.name} delay={index * 120}>
                  <div className="group h-full rounded-[28px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.09]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-[#111827]">
                        <TechLogo src={card.logo} name={card.name} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">{card.name}</h3>
                        <p className="mt-1 text-sm text-white/55">{card.label}</p>
                      </div>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-white/65">{card.desc}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/65">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="access" className="px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <div className="mx-auto max-w-[940px] overflow-hidden rounded-[34px] border border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF2FF] p-6 shadow-[0_24px_70px_-54px_rgba(17,24,39,0.85)] md:p-10">
              <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6B7280]">Early access</span>
                  <h2 className="mt-4 text-[32px] font-black leading-tight tracking-tight text-[#111827] md:text-[48px]">
                    Try the product surface while Finix is still young.
                  </h2>
                  <p className="mt-5 max-w-[620px] text-base leading-8 text-[#6B7280]">
                    Launch the public dashboard without connecting, then connect your wallet only when you need wallet-specific actions.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                  <CTAButton
                    isConnected={isConnected}
                    handleLaunchApp={handleLaunchApp}
                  />
                  {!isConnected && (
                    <ConnectWalletButton
                      isConnecting={isConnecting}
                      isLoading={isLoading}
                      handleConnect={handleConnect}
                    />
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="relative overflow-hidden bg-[#111827] px-5 pb-10 pt-14 text-white sm:px-8 md:pb-12 md:pt-16">
          <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-[96px] font-black leading-none tracking-tight text-white/[0.035] sm:text-[160px] md:-bottom-16 md:text-[240px] lg:text-[300px]">
            FINIX
          </div>
          <div className="relative mx-auto max-w-[1120px]">
            <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
              <div>
                <BrandMark dark />
                <p className="mt-5 max-w-[320px] text-sm leading-7 text-[#9CA3AF]">
                  Premium personal finance tooling for Sui users, powered by a product stack that keeps data ownership in view.
                </p>
              </div>

              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">Product</h4>
                <ul className="space-y-3">
                  {footerProductLinks.map((item) => (
                    <li key={item.href}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">Resources</h4>
                <ul className="space-y-3">
                  {footerResourceLinks.map((item) => (
                    <li key={item.href}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#6B7280]">Connect</h4>
                <ul className="space-y-3">
                  {footerConnectLinks.map((item) => (
                    <li key={item.href}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-[#6B7280] md:flex-row md:items-center md:justify-between">
              <p>&copy; {new Date().getFullYear()} Finix. Built on Sui Network with Walrus Storage.</p>
              <p>Logo assets expected in public/logo.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
