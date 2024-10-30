"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Github, Zap, Lock, ArrowRight, CheckCircle, Terminal, Coins } from "lucide-react";
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
    icon: <Github size={20} />,
    title: "Install the GitHub App",
    description:
      "Add BountyHub to your repository in one click. The bot starts listening to issue comments immediately.",
  },
  {
    number: "02",
    icon: <Zap size={20} />,
    title: "Create a Bounty",
    description:
      "Comment /bounty 0.5ETH on any GitHub issue. Funds are locked in the smart contract escrow instantly.",
  },
  {
    number: "03",
    icon: <Lock size={20} />,
    title: "Reward Contributors",
    description:
      "Comment /reward @username when the work is done. The contributor gets paid on-chain and the issue closes automatically.",
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
      className="min-h-screen bg-[#0f0e0c] text-[#fafaf9]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(245,158,11,0.04) 1px, transparent 0)",
        backgroundSize: "36px 36px",
      }}
    >
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Live on Base Sepolia
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          <span className="text-[#fafaf9]">Open Source</span>
          <br />
          <span className="text-amber-400">Bounties On-Chain</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-[#78716c] mb-10 leading-relaxed">
          Incentivize contributions to your GitHub repos with ETH bounties on Base. Create bounties
          from a comment, pay contributors automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/manager"
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            I&apos;m a Maintainer
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/contributer"
            className="flex items-center gap-2 px-6 py-3 bg-[#1a1814] hover:bg-[#2a2520] text-[#fafaf9] font-semibold rounded-xl border border-[#2a2520] hover:border-[#3a3025] transition-colors"
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
            { label: "Total Bounties", value: isPending ? "—" : stats.total, accent: "text-[#fafaf9]" },
            { label: "Open Bounties", value: isPending ? "—" : stats.open, accent: "text-amber-400" },
            { label: "ETH Distributed", value: isPending ? "—" : `${stats.ethDistributed} ETH`, accent: "text-amber-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#1a1814]/80 backdrop-blur-sm border border-[#2a2520] rounded-2xl p-6 text-center"
            >
              <div className={`text-3xl font-bold mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-sm text-[#78716c]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#fafaf9] mb-4">How It Works</h2>
          <p className="text-[#78716c] max-w-xl mx-auto">
            From issue to payment in three steps — no external tools, everything through GitHub
            comments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="bg-[#1a1814]/80 border border-[#2a2520] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-[#2a2520] select-none">
                {step.number}
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold text-[#fafaf9] mb-2">{step.title}</h3>
              <p className="text-sm text-[#78716c] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Maintainers / Contributors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1814]/80 border border-[#2a2520] rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Github size={16} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#fafaf9]">For Maintainers</h3>
            </div>
            <ul className="space-y-3">
              {maintainerBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-[#78716c]">
                  <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/manager"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-[#1a1814]/80 border border-[#2a2520] rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Coins size={16} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#fafaf9]">For Contributors</h3>
            </div>
            <ul className="space-y-3">
              {contributorBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-[#78716c]">
                  <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/bounties"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Browse Bounties <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bot Commands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-[#1a1814]/80 border border-[#2a2520] rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Terminal size={18} className="text-[#78716c]" />
            <h3 className="text-base font-semibold text-[#fafaf9]">Bot Commands</h3>
          </div>
          <div className="space-y-5">
            {[
              {
                cmd: "/bounty 0.5ETH",
                desc: "Lock 0.5 ETH as bounty for this issue (maintainer only)",
              },
              {
                cmd: "/reward @username",
                desc: "Pay the contributor and close the issue (maintainer only)",
              },
              {
                cmd: "/help",
                desc: "List all available commands",
              },
            ].map((c) => (
              <div
                key={c.cmd}
                className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8"
              >
                <code className="font-mono text-sm font-semibold text-amber-400 sm:min-w-[200px]">
                  {c.cmd}
                </code>
                <span className="text-sm text-[#78716c]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-600">
          <span>BountyHub &copy; 2024</span>
          <div className="flex items-center gap-6">
            <span>Built on Base</span>
            <a
              href="https://sepolia.basescan.org/address/0x96111652DB352b814697e79A846E8CD9C8e11196"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-400 transition-colors"
            >
              Contract on BaseScan
            </a>
            <a
              href="https://github.com/agarwalvivek29/bounty-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-400 transition-colors"
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
