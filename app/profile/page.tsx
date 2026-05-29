"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";

import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Wallet, Copy, Download, AlertTriangle, Database, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const { data, updateData } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [displayName, setDisplayName] = useState(data.profile.displayName);
  const [savingTarget, setSavingTarget] = useState(data.profile.monthlyTargetSavingRate);
  const [showDanger, setShowDanger] = useState(false);

  const handleSaveProfile = () => {
    const updated = {
      ...data,
      profile: { ...data.profile, displayName, monthlyTargetSavingRate: savingTarget },
    };
    localStorage.setItem('finix_blob_mock', JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Profile updated');
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finix-data-${address?.slice(0, 8) || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data exported');
  };

  const handleClearData = () => {
    localStorage.removeItem('finix_blob_mock');
    showToast('info', 'Data reference cleared', 'Walrus data will expire naturally');
    setShowDanger(false);
  };

  if (!isConnected) {
    return (
      <AppShell title="Profile">
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#1E293B] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={15} /> CONNECT WALLET</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="// SETTINGS_AND_DATA"
      topbarExtra={
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#111827] border border-[#1E293B]">
          <span className="flex h-[5px] w-[5px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[10px] font-mono text-[#9CA3AF]">NODE: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      }
    >
      <div className="max-w-[600px] space-y-4">
        {/* Wallet Info */}
        <div className="bg-[#111827] border border-[#1E293B] p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-[#3B5BDB]">/WALLET</span>
            <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Wallet Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono text-[#6B7280] mb-1 uppercase tracking-wider">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] font-mono text-[#9CA3AF] bg-[#0A0E1A] px-3 py-1.5 border border-[#1E293B] flex-1 truncate">{address}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(address || ''); showToast('success', 'Address copied'); }}
                  className="p-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0E1A] border border-[#1E293B] p-3">
                <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider">SUI Balance</p>
                <p className="text-[13px] font-mono font-semibold text-white">—</p>
                <p className="text-[9px] font-mono text-[#6B7280]">VIA_TATUM_RPC</p>
              </div>
              <div className="bg-[#0A0E1A] border border-[#1E293B] p-3">
                <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider">Network</p>
                <p className="text-[13px] font-mono font-semibold text-white">SUI_MAINNET</p>
                <p className="text-[9px] font-mono text-[#15803D]">✓ CONNECTED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-[#111827] border border-[#1E293B] p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-[#3B5BDB]">/SETTINGS</span>
            <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Display Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-medium text-[#6B7280] mb-1.5 block uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-[12px] font-mono border border-[#1E293B] bg-[#0A0E1A] text-white focus:outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-medium text-[#6B7280] mb-1.5 block uppercase tracking-wider">Currency</label>
              <div className="px-3 py-2 text-[12px] font-mono border border-[#1E293B] bg-[#0A0E1A] text-[#9CA3AF]">
                USD 🇺🇸 (LOCKED)
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono font-medium text-[#6B7280] mb-1.5 block uppercase tracking-wider">Monthly Saving Target (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={savingTarget}
                onChange={(e) => setSavingTarget(parseInt(e.target.value) || 0)}
                className="w-[100px] px-3 py-2 text-[12px] font-mono border border-[#1E293B] bg-[#0A0E1A] text-white focus:outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <Button onClick={handleSaveProfile}>SAVE_CHANGES</Button>
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-[#111827] border border-[#1E293B] p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-[#3B5BDB]">/DATA</span>
            <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Data on Walrus</h3>
          </div>
          <div className="bg-[#15803D]/10 border border-[#15803D]/30 p-3 mb-4">
            <div className="flex items-start gap-2">
              <Database size={13} className="text-[#15803D] mt-0.5" />
              <div>
                <p className="text-[11px] font-mono font-medium text-white">Your data is stored on Walrus</p>
                <p className="text-[10px] font-mono text-[#6B7280] mt-0.5 leading-4">All your financial data is stored as decentralized blobs on Walrus mainnet. No centralized database.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono text-[#6B7280] mb-1 uppercase tracking-wider">Latest Blob ID</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] font-mono text-[#9CA3AF] bg-[#0A0E1A] px-3 py-1.5 border border-[#1E293B] flex-1 truncate">
                  mock-blob-{address?.slice(2, 10) || 'abc123'}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(`mock-blob-${address?.slice(2, 10) || 'abc123'}`); showToast('success', 'Blob ID copied'); }}
                  className="p-2 text-[#6B7280] hover:text-[#3B5BDB] transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#6B7280]">SIZE: ~{(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB</span>
              <span className="text-[10px] font-mono text-[#6B7280]">UPDATED: {new Date(data.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                <Download size={12} /> EXPORT
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.open('https://walruscan.net/', '_blank')}>
                <ExternalLink size={12} /> EXPLORER
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#111827] border border-[#B91C1C]/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-[#B91C1C]">/DANGER</span>
            <h3 className="text-[12px] font-mono font-semibold text-[#B91C1C] uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="text-[10px] font-mono text-[#6B7280] mb-4 leading-4">
            This removes your data reference from localStorage. Walrus data will expire naturally after 52 epochs (~1 year).
          </p>
          <Button variant="danger" size="sm" onClick={() => setShowDanger(true)}>
            <AlertTriangle size={12} /> CLEAR_ALL_DATA
          </Button>
        </div>
      </div>

      <Modal isOpen={showDanger} onClose={() => setShowDanger(false)} title="// CLEAR_ALL_DATA?" size="sm">
        <p className="text-[11px] font-mono text-[#6B7280] mb-4 leading-4">
          This will remove your data reference from this device. Your Walrus blobs will remain on the network until they expire naturally.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDanger(false)}>CANCEL</Button>
          <Button variant="danger" onClick={handleClearData}><AlertTriangle size={12} /> CLEAR_DATA</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
