"use client";

import React, { useState, useEffect } from "react";
import { Github, Wallet, Search, ExternalLink } from "lucide-react";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { contractABI } from "../constants/contract";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { client } from "../client";
import { ConnectButton } from "thirdweb/react";

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: "0x96111652DB352b814697e79A846E8CD9C8e11196",
  abi: contractABI,
});

const STATUS_TABS = ["All", "Open", "Completed"];

function StatusBadge({ isOpen, isCompleted }) {
  if (isCompleted)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Completed
      </span>
    );
  if (isOpen)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
        Open
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      In Progress
    </span>
  );
}

const ManagerDashboard = () => {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState(null);
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: bountiesData, isPending: isBountiesPending } = useReadContract({
    contract,
    method:
      "function getBountiesByMaintainer(address _maintainer) view returns ((uint256 id, string issueLink, uint256 amount, address creator, address rewardedTo, address[] assignedTo, bool isOpen, bool isCompleted, string rewardee_username)[])",
    params: [account?.address],
  });

  const { data: fundsData, isPending: isFundsPending } = useReadContract({
    contract,
    method:
      "function maintainers(address) view returns (uint256 totalFunds, uint256 blockedFounds, uint256 availableFunds)",
    params: [account?.address],
  });

  const [bounties, setBounties] = useState([]);
  const [funds, setFunds] = useState({ totalFunds: 0, blockedFunds: 0, availableFunds: 0 });

  useEffect(() => {
    if (bountiesData && !isBountiesPending) setBounties(bountiesData);
  }, [bountiesData, isBountiesPending]);

  useEffect(() => {
    if (fundsData && !isFundsPending) {
      setFunds({
        totalFunds: Number(fundsData[0].toString()) / 1e18,
        blockedFunds: Number(fundsData[1].toString()) / 1e18,
        availableFunds: Number(fundsData[2].toString()) / 1e18,
      });
    }
  }, [fundsData, isFundsPending]);

  const filteredBounties = bounties.filter((bounty) => {
    const tabMatch =
      activeTab === "All" ||
      (activeTab === "Open" && bounty.isOpen) ||
      (activeTab === "Completed" && bounty.isCompleted);
    const searchMatch =
      bounty.issueLink.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bounty.rewardee_username || "").toLowerCase().includes(searchTerm.toLowerCase());
    return tabMatch && searchMatch;
  });

  const handleDepositFunds = async () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      setDepositStatus("error");
      return;
    }
    try {
      setDepositStatus("pending");
      const valueInWei = parseFloat(depositAmount) * 1e18;
      const transaction = prepareContractCall({
        contract,
        method: "function depositFunds() payable",
        params: [],
        value: valueInWei,
      });
      sendTransaction(transaction, {
        onSuccess: () => {
          setDepositStatus("success");
          setDepositAmount("");
        },
        onError: () => setDepositStatus("error"),
      });
    } catch {
      setDepositStatus("error");
    }
  };

  const handleAddToGitHub = () => {
    window.open("https://github.com/apps/bounty-birbal-bot/installations/new", "_blank");
  };

  if (!account) {
    return (
      <div
        className="min-h-screen bg-[#0f0e0c] flex items-center justify-center"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(245,158,11,0.04) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      >
        <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-10 text-center max-w-md w-full mx-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Wallet size={22} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-[#fafaf9] mb-2">Maintainer Dashboard</h2>
          <p className="text-[#78716c] text-sm mb-6">
            Connect your wallet to manage bounties and track your repos.
          </p>
          <ConnectButton client={client} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0f0e0c] text-[#fafaf9]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(245,158,11,0.04) 1px, transparent 0)",
        backgroundSize: "36px 36px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {account.address.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-[#78716c] mb-0.5">Connected Wallet</p>
                  <p className="text-sm font-mono text-stone-300">
                    {account.address.slice(0, 6)}…{account.address.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-[#78716c]">
                  <Wallet size={12} />
                  <span className="font-mono truncate">{account.address}</span>
                </div>
              </div>

              <button
                onClick={handleAddToGitHub}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition-colors"
              >
                <Github size={16} />
                Add to GitHub
              </button>
            </div>

            {/* Deposit Card */}
            <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#fafaf9] mb-1">Deposit Funds</h3>
              <p className="text-xs text-[#78716c] mb-4">Add ETH to your bounty pool</p>
              <div className="relative mb-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                    setDepositStatus(null);
                  }}
                  className="w-full px-4 py-2.5 pr-14 bg-[#0f0e0c] border border-[#2a2520] focus:border-amber-500/40 rounded-xl text-sm text-stone-200 placeholder-stone-700 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-600 font-mono">
                  ETH
                </span>
              </div>
              <button
                onClick={handleDepositFunds}
                disabled={depositStatus === "pending"}
                className="w-full py-2.5 bg-[#2a2520] hover:bg-[#3a3025] border border-[#3a3025] text-sm font-medium text-stone-300 hover:text-[#fafaf9] rounded-xl transition-colors disabled:opacity-50"
              >
                {depositStatus === "pending" ? "Confirming…" : "Deposit"}
              </button>
              {depositStatus === "success" && (
                <p className="text-xs text-emerald-400 mt-2 text-center">
                  Deposit submitted successfully!
                </p>
              )}
              {depositStatus === "error" && (
                <p className="text-xs text-red-400 mt-2 text-center">
                  Something went wrong. Check your input.
                </p>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Available",
                  value: isFundsPending ? "—" : `${funds.availableFunds.toFixed(4)} ETH`,
                  color: "text-emerald-400",
                },
                {
                  label: "Total Deposited",
                  value: isFundsPending ? "—" : `${funds.totalFunds.toFixed(4)} ETH`,
                  color: "text-[#fafaf9]",
                },
                {
                  label: "Locked in Bounties",
                  value: isFundsPending ? "—" : `${funds.blockedFunds.toFixed(4)} ETH`,
                  color: "text-amber-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-5"
                >
                  <p className="text-xs text-[#78716c] mb-2">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Bounties */}
            <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-base font-semibold text-[#fafaf9]">Your Bounties</h2>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600"
                  />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#0f0e0c] border border-[#2a2520] rounded-lg text-sm text-stone-300 placeholder-stone-700 focus:outline-none focus:border-amber-500/40 transition-colors w-full sm:w-56"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === tab
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "text-stone-600 hover:text-stone-400 hover:bg-[#2a2520]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Table */}
              {isBountiesPending ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-[#2a2520] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredBounties.length === 0 ? (
                <div className="text-center py-12 text-stone-700">
                  <p>No bounties found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2a2520]">
                        <th className="text-left text-xs text-[#78716c] font-medium pb-3 pr-4">
                          Issue
                        </th>
                        <th className="text-left text-xs text-[#78716c] font-medium pb-3 pr-4">
                          Amount
                        </th>
                        <th className="text-left text-xs text-[#78716c] font-medium pb-3 pr-4">
                          Status
                        </th>
                        <th className="text-left text-xs text-[#78716c] font-medium pb-3">
                          Rewarded To
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2520]">
                      {filteredBounties.map((bounty) => (
                        <tr key={bounty.id} className="group">
                          <td className="py-3 pr-4">
                            <a
                              href={bounty.issueLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors max-w-xs truncate"
                            >
                              <span className="truncate">
                                {bounty.issueLink.replace("https://github.com/", "")}
                              </span>
                              <ExternalLink size={11} className="shrink-0 opacity-0 group-hover:opacity-100" />
                            </a>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-mono text-stone-300 text-xs">
                              {(Number(bounty.amount.toString()) / 1e18).toFixed(4)} ETH
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge isOpen={bounty.isOpen} isCompleted={bounty.isCompleted} />
                          </td>
                          <td className="py-3 text-stone-600 text-xs">
                            {bounty.rewardee_username || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
