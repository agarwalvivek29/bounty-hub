"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Github, Zap, Lock, ArrowRight, CheckCircle, Terminal } from "lucide-react";
import { useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { client } from "../client";
import { contractABI } from "../constants/contract";

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: "0x96111652DB352b814697e79A846E8CD9C8e11196",
  abi: contractABI,
});

const steps = [
  {
    number: "01",
    icon: <Github size={22} />,
    title: "Install the GitHub App",
    description:
      "Add BountyHub to your repository in one click. The bot starts listening to issue comments immediately.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    accent: "text-purple-400",
  },
  {
    number: "02",
    icon: <Zap size={22} />,
    title: "Create a Bounty",
    description:
      "Comment /bounty 0.5ETH on any GitHub issue. Funds are locked in the smart contract escrow instantly.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    accent: "text-blue-400",
  },
  {
    number: "03",
    icon: <Lock size={22} />,
    title: "Reward Contributors",
    description:
      "Comment /reward @username when the work is done. The contributor gets paid on-chain and the issue closes automatically.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
];

const maintainerBenefits = [
  "Fund bounties directly from GitHub issue comments",
  "Deposit once, create multiple bounties from your balance",
  "Full transparency — every transaction on-chain",
  "Auto-close issues when bounty is rewarded",
];

const contributorBenefits = [
  "Browse open bounties across all connected repos",
  "Get paid in ETH instantly on PR merge",
  "Track your earnings from the contributor dashboard",
  "No sign-up required — just connect your wallet",
];

const Home = () => {
  const { data, isPending } = useReadContract({
    contract,
    method:
      "function getBounties() view returns ((uint256 id, string issueLink, uint256 amount, address creator, address rewardedTo, address[] assignedTo, bool isOpen, bool isCompleted, string rewardee_username)[])",
    params: [],
  });

  const stats = useMemo(() => {
    if (!data) return { total: 0, open: 0, ethDistributed: "0.000" };
    const total = data.length;
    const open = data.filter((b) => b.isOpen).length;
    const ethDistributed =
      data.filter((b) => b.isCompleted).reduce((sum, b) => sum + Number(b.amount), 0) / 1e18;
    return { total, open, ethDistributed: ethDistributed.toFixed(3) };
  }, [data]);

  return (
    <div
      className="min-h-screen bg-[#0d0d1a] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Live on Base Sepolia
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white">Open Source</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Bounties On-Chain
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10">
          Incentivize contributions to your GitHub repos with ETH bounties on Base. Create bounties
          from a comment, pay contributors automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/manager"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-purple-500/20"
          >
            I&apos;m a Maintainer
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/contributer"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-colors"
          >
            I&apos;m a Contributor
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Bounties", value: isPending ? "—" : stats.total },
            { label: "Open Bounties", value: isPending ? "—" : stats.open },
            { label: "ETH Distributed", value: isPending ? "—" : `${stats.ethDistributed} ETH` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From issue to payment in three steps — no external tools, everything through GitHub
            comments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`bg-gradient-to-b ${step.color} border ${step.border} rounded-2xl p-6 backdrop-blur-sm`}
            >
              <div className={`flex items-center gap-3 mb-4 ${step.accent}`}>
                {step.icon}
                <span className="text-sm font-mono font-bold opacity-60">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Maintainers / Contributors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Github size={16} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">For Maintainers</h3>
            </div>
            <ul className="space-y-3">
              {maintainerBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-400">
                  <CheckCircle size={16} className="text-purple-400 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/manager"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Zap size={16} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">For Contributors</h3>
            </div>
            <ul className="space-y-3">
              {contributorBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-400">
                  <CheckCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/bounties"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Browse Bounties <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bot Commands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Terminal size={18} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Bot Commands</h3>
          </div>
          <div className="space-y-5">
            {[
              {
                cmd: "/bounty 0.5ETH",
                desc: "Lock 0.5 ETH as bounty for this issue (maintainer only)",
                color: "text-purple-400",
              },
              {
                cmd: "/reward @username",
                desc: "Pay the contributor and close the issue (maintainer only)",
                color: "text-blue-400",
              },
              {
                cmd: "/help",
                desc: "List all available commands",
                color: "text-emerald-400",
              },
            ].map((c) => (
              <div
                key={c.cmd}
                className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8"
              >
                <code className={`font-mono text-sm font-semibold ${c.color} sm:min-w-[200px]`}>
                  {c.cmd}
                </code>
                <span className="text-sm text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <span>BountyHub &copy; 2024</span>
          <div className="flex items-center gap-6">
            <span>Built on Base</span>
            <a
              href="https://sepolia.basescan.org/address/0x96111652DB352b814697e79A846E8CD9C8e11196"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              Contract on BaseScan
            </a>
            <a
              href="https://github.com/agarwalvivek29/bounty-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
