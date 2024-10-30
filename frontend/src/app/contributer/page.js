"use client";

import { useState, useEffect } from "react";
import { Github, Wallet, Award, ExternalLink, ArrowRight } from "lucide-react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { contractABI } from "../constants/contract";
import { client } from "../client";
import { ConnectButton } from "thirdweb/react";
import Link from "next/link";

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: "0x96111652DB352b814697e79A846E8CD9C8e11196",
  abi: contractABI,
});

const formatEth = (wei) => {
  if (!wei) return "0.0000";
  return (Number(wei) / 1e18).toFixed(4);
};

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

const ContributorDashboard = () => {
  const account = useActiveAccount();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [userData, setUserData] = useState(null);

  const { data: totalEarnings, isLoading: isEarningsLoading } = useReadContract({
    contract,
    method:
      "function getContributorEarnedfunds(address _address) view returns (uint256)",
    params: [account?.address],
  });

  const { data: bounties, isLoading: isBountiesLoading } = useReadContract({
    contract,
    method:
      "function getBounties() view returns ((uint256 id, string issueLink, uint256 amount, address creator, address rewardedTo, address[] assignedTo, bool isOpen, bool isCompleted, string rewardee_username)[])",
    params: [],
  });

  useEffect(() => {
    if (bounties && account) {
      const filtered = bounties.filter(
        (bounty) =>
          bounty.rewardedTo === account.address ||
          bounty.assignedTo.includes(account.address)
      );
      setAssignedIssues(filtered);

      if (filtered.length > 0) {
        const username = filtered[0].rewardee_username;
        if (username) {
          fetch(`https://api.github.com/users/${username}`)
            .then((res) => res.json())
            .then((data) => setUserData(data))
            .catch(() => {});
        }
      }
    }
  }, [bounties, account]);

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
            <Award size={22} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-[#fafaf9] mb-2">Contributor Dashboard</h2>
          <p className="text-[#78716c] text-sm mb-6">
            Connect your wallet to view your earnings and assigned bounties.
          </p>
          <ConnectButton client={client} theme="dark" />
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
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt={userData.login}
                    className="w-20 h-20 rounded-full ring-2 ring-amber-500/20 mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400 mb-4">
                    {account.address.slice(2, 4).toUpperCase()}
                  </div>
                )}
                <h2 className="text-base font-semibold text-[#fafaf9]">
                  {userData?.name || userData?.login || "Anonymous"}
                </h2>
                {userData?.bio && (
                  <p className="text-xs text-[#78716c] text-center mt-1 leading-relaxed">
                    {userData.bio}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {userData?.login && (
                  <div className="flex items-center gap-2 text-sm text-[#78716c]">
                    <Github size={14} />
                    <a
                      href={`https://github.com/${userData.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-stone-300 transition-colors"
                    >
                      @{userData.login}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#78716c]">
                  <Wallet size={14} />
                  <span className="font-mono text-xs truncate">{account.address}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-5">
                <p className="text-xs text-[#78716c] mb-2">Total Earned</p>
                <p className="text-2xl font-bold text-amber-400">
                  {isEarningsLoading ? "—" : `${formatEth(totalEarnings)} ETH`}
                </p>
              </div>
              <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-5">
                <p className="text-xs text-[#78716c] mb-2">Assigned Bounties</p>
                <p className="text-2xl font-bold text-[#fafaf9]">
                  {isBountiesLoading ? "—" : assignedIssues.length}
                </p>
              </div>
            </div>

            {/* Bounties */}
            <div className="bg-[#1a1814] border border-[#2a2520] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-[#fafaf9] mb-6">My Bounties</h2>

              {isBountiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-[#2a2520] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : assignedIssues.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-[#78716c] text-sm mb-4">No bounties assigned yet</p>
                  <Link
                    href="/bounties"
                    className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Browse open bounties <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {assignedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="group bg-[#0f0e0c] border border-[#2a2520] hover:border-amber-500/20 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <p className="text-sm text-stone-400 line-clamp-2 leading-snug">
                          {issue.issueLink.replace("https://github.com/", "")}
                        </p>
                        <StatusBadge isOpen={issue.isOpen} isCompleted={issue.isCompleted} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400">
                          {formatEth(issue.amount)} ETH
                        </span>
                        <a
                          href={issue.issueLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-400 transition-colors"
                        >
                          View <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;
