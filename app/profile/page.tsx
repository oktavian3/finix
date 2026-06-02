"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, ChevronRight, Copy, Database, Download, ExternalLink, RefreshCw, Settings, ShieldCheck, Sparkles, User, Wallet } from "lucide-react";

export default function ProfilePage() {
  const { data, updateData, blobId, objectId, walrusNetwork, saveToWalrus, isSaving } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [displayName, setDisplayName] = useState(data.profile.displayName);
  const [savingTarget, setSavingTarget] = useState(data.profile.monthlyTargetSavingRate);
  const [showDanger, setShowDanger] = useState(false);

  const handleSaveProfile = async () => {
    updateData({
      ...data,
      profile: { ...data.profile, displayName, monthlyTargetSavingRate: savingTarget },
    });
    showToast("success", "Profile updated");

    // Auto-sync to Walrus so name survives refresh
    try {
      await saveToWalrus();
      showToast("success", "Profile saved & synced to Walrus");
    } catch {
      // localStorage cache already updated by updateData, Walrus sync is best-effort
      showToast("info", "Profile saved locally", "Walrus sync failed, but data is cached on this device");
    }
  };

  const handleExportData = () => {
    const cols = ["Date", "Type", "Category/Source", "Description", "Amount"];
    const rows = data.transactions.map((tx) => {
      const catOrSrc = tx.type === "income" ? tx.source || "other" : tx.category || "other";
      const desc = (tx.description || "").replace(/"/g, '""');
      const amount = tx.type === "income" ? tx.amount : -tx.amount;
      return [tx.date, tx.type, catOrSrc, `"${desc}"`, amount.toFixed(2)].join(";");
    });
    const csv = "\uFEFF" + cols.join(";") + "\n" + rows.join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finix-transactions-${address?.slice(0, 8) || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Transactions exported as CSV");
  };

  const handleWalrusSync = async () => {
    try {
      await saveToWalrus();
      showToast("success", "Data synced to Walrus");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Walrus sync failed";
      showToast("error", "Walrus sync failed", message);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem("finix_blob_mock");
    if (address) {
      localStorage.removeItem(`finix_cache_${address}`);
      localStorage.removeItem(`finix_blobid_${address}`);
      localStorage.removeItem(`finix_objectid_${address}`);
      localStorage.removeItem(`finix_walrus_network_${address}`);
    }
    showToast("info", "Local data cleared", "Reconnect or add new records to start again on this device");
    setShowDanger(false);
  };

  if (!isConnected) {
    return (
      <AppShell title="Profile">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <User size={14} />
              Wallet profile
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Manage your Finix workspace.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Connect your wallet to manage profile settings, exports, and Walrus sync metadata.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={connect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet size={16} /> {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Wallet settings and data controls"
      topbarExtra={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
          <Button variant="secondary" size="sm" onClick={handleWalrusSync} loading={isSaving} className="rounded-full px-4">
            <RefreshCw size={13} /> Sync Now
          </Button>
          <div className="hidden items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2 md:flex">
            <Wallet size={14} className="text-[#3B5BDB]" />
            <span className="text-xs font-bold text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <section className="relative mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
        <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#4F6EF7]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#8FE5C0]/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Sparkles size={14} />
              Account workspace
            </div>
            <h2 className="max-w-[680px] text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Profile Command Center</h2>
            <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/65 sm:text-base">Manage display preferences, export records, and verify your latest Walrus testnet sync.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC]"
              >
                <Settings size={16} /> Save Settings
              </button>
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Export CSV
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Walrus sync</p>
                <p className="mt-2 text-3xl font-black">{blobId ? "Ready" : "Local"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-lg">
                <Database size={22} />
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              {[
                ["Network", walrusNetwork || "testnet"],
                ["Records", String(data.transactions.length)],
                ["Goals", String(data.goals.length)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white/70">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#3B5BDB]">
                <Wallet size={20} />
              </span>
              <div>
                <h3 className="text-base font-black text-[#111827]">Wallet Info</h3>
                <p className="text-xs text-[#64748B]">Connected Sui identity</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#374151]">{address}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(address || ""); showToast("success", "Address copied"); }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-all duration-200 hover:bg-[#EEF2FF] hover:text-[#3B5BDB]"
                >
                  <Copy size={15} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">Network</p>
                  <p className="mt-2 text-lg font-black text-[#111827]">Sui Testnet</p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">Currency</p>
                  <p className="mt-2 text-lg font-black text-[#111827]">USD</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#B91C1C]/30 bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#B91C1C]">
                <AlertTriangle size={18} />
              </span>
              <h3 className="text-base font-black text-[#B91C1C]">Danger Zone</h3>
            </div>
            <p className="mb-4 text-sm leading-6 text-[#64748B]">This removes local Finix data for this wallet from this device. Remote Walrus blobs are not deleted.</p>
            <Button variant="danger" size="sm" onClick={() => setShowDanger(true)}>
              <AlertTriangle size={13} /> Clear Local Data
            </Button>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#3B5BDB]">
                <User size={20} />
              </span>
              <div>
                <h3 className="text-base font-black text-[#111827]">Display Settings</h3>
                <p className="text-xs text-[#64748B]">Personalize the dashboard greeting</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">Display Name</label>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm font-bold text-[#111827] focus:border-[#3B5BDB] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">Saving Target</label>
                <input type="number" min="0" max="100" value={savingTarget} onChange={(event) => setSavingTarget(parseInt(event.target.value) || 0)} className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm font-bold text-[#111827] focus:border-[#3B5BDB] focus:outline-none" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="mt-5 rounded-full bg-[#050505] px-5 hover:bg-[#111827]">
              <Settings size={14} /> Save Changes
            </Button>
          </section>

          <section className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#15803D]">
                  <Database size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#111827]">Data on Walrus</h3>
                  <p className="text-xs text-[#64748B]">Latest wallet-scoped snapshot</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleWalrusSync} loading={isSaving}>
                <RefreshCw size={13} /> Sync Now
              </Button>
            </div>

            <div className="mb-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 text-[#15803D]" />
                <p className="text-sm leading-6 text-[#64748B]">Finix stores a local cache for speed and syncs a snapshot to Walrus testnet when saving succeeds.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["Latest Blob ID", blobId || "Not synced yet"],
                ["Latest Object ID", objectId || "Not available for the latest saved blob"],
                ["Walrus Network", walrusNetwork || "testnet"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">{label}</p>
                  <code className="block truncate text-xs text-[#374151]">{value}</code>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                <Download size={13} /> Export Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!objectId) {
                    showToast("error", "No object ID saved yet", "Sync data to Walrus before opening the explorer");
                    return;
                  }
                  const network = walrusNetwork || process.env.NEXT_PUBLIC_WALRUS_NETWORK || "testnet";
                  const base = network === "testnet" ? "testnet" : "mainnet";
                  window.open(`https://suiscan.xyz/${base}/object/${objectId}`, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink size={13} /> View on Explorer
              </Button>
            </div>
          </section>
        </div>
      </div>

      <Modal isOpen={showDanger} onClose={() => setShowDanger(false)} title="Clear all data?" size="sm">
        <p className="mb-4 text-xs text-[#6B7280]">This will remove local Finix data for this wallet from this device. Remote Walrus blobs are not deleted.</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDanger(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearData}><AlertTriangle size={13} /> Clear Data</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
