"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";

import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Wallet, Copy, Download, AlertTriangle, Database, ExternalLink } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";

export default function ProfilePage() {
  const { data, updateData } = useFinixData();
  const { isConnected, address } = useWallet();
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
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <ConnectButton connectText={<span className="flex items-center gap-2"><Wallet size={16} /> Connect Wallet</span>} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Manage your settings and data"
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <div className="max-w-[600px] space-y-5">
        {/* Wallet Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Wallet Info</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-[#6B7280] mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] text-[#374151] bg-[#F8FAFC] px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] flex-1">{address}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(address || ''); showToast('success', 'Address copied'); }}
                  className="p-2 rounded-[8px] text-[#9CA3AF] hover:text-[#3B5BDB] hover:bg-[#EEF2FF]"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8FAFC] rounded-[10px] p-3">
                <p className="text-[10px] text-[#6B7280]">SUI Balance</p>
                <p className="text-[14px] font-semibold text-[#111827]">—</p>
                <p className="text-[10px] text-[#9CA3AF]">via Tatum RPC</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-[10px] p-3">
                <p className="text-[10px] text-[#6B7280]">Network</p>
                <p className="text-[14px] font-semibold text-[#111827]">Sui Mainnet</p>
                <p className="text-[10px] text-[#15803D]">✓ Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Display Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Currency</label>
              <div className="px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[10px] bg-[#F8FAFC] text-[#374151]">
                USD 🇺🇸 (locked)
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Monthly Saving Target (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={savingTarget}
                onChange={(e) => setSavingTarget(parseInt(e.target.value) || 0)}
                className="w-[120px] px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Data on Walrus</h3>
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[10px] p-3 mb-4">
            <div className="flex items-start gap-2">
              <Database size={14} className="text-[#15803D] mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-[#111827]">Your data is stored on Walrus</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">All your financial data is stored as decentralized blobs on Walrus mainnet. No centralized database.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-[#6B7280] mb-1">Latest Blob ID</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] text-[#374151] bg-[#F8FAFC] px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] flex-1 truncate">
                  mock-blob-{address?.slice(2, 10) || 'abc123'}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(`mock-blob-${address?.slice(2, 10) || 'abc123'}`); showToast('success', 'Blob ID copied'); }}
                  className="p-2 rounded-[8px] text-[#9CA3AF] hover:text-[#3B5BDB]"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#6B7280]">Data size: ~{(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB</span>
              <span className="text-[11px] text-[#6B7280]">Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                <Download size={13} /> Export Data
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.open('https://walruscan.net/', '_blank')}>
                <ExternalLink size={13} /> View on Explorer
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-[#B91C1C]/30 rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#B91C1C] mb-2">Danger Zone</h3>
          <p className="text-[11px] text-[#6B7280] mb-4">
            This removes your data reference from localStorage. Walrus data will expire naturally after 52 epochs (~1 year).
          </p>
          <Button variant="danger" size="sm" onClick={() => setShowDanger(true)}>
            <AlertTriangle size={13} /> Clear All Data
          </Button>
        </div>
      </div>

      <Modal isOpen={showDanger} onClose={() => setShowDanger(false)} title="Clear all data?" size="sm">
        <p className="text-[12px] text-[#6B7280] mb-4">
          This will remove your data reference from this device. Your Walrus blobs will remain on the network until they expire naturally.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDanger(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearData}><AlertTriangle size={13} /> Clear Data</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
