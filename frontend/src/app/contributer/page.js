"use client";

import { useState, useEffect } from "react";
import { Github, Wallet, Award, ExternalLink, ArrowRight } from "lucide-react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { contractABI } from "../constants/contract";
import { client } from "../client";
import { ConnectButton, lightTheme } from "thirdweb/react";
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        Open
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
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
        className="min-h-screen bg-[#0d0d1a] flex items-center justify-center"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-10 text-center max-w-md w-full mx-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Award size={22} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Contributor Dashboard</h2>
          <p className="text-gray-500 text-sm mb-6">
            Connect your wallet to view your earnings and assigned bounties.
          </p>
          <ConnectButton client={client} theme={lightTheme()} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0d0d1a] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt={userData.login}
                    className="w-20 h-20 rounded-full ring-2 ring-purple-500/30 mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                    {account.address.slice(2, 4).toUpperCase()}
                  </div>
                )}
                <h2 className="text-base font-semibold text-white">
                  {userData?.name || userData?.login || "Anonymous"}
                </h2>
                {userData?.bio && (
                  <p className="text-xs text-gray-500 text-center mt-1 leading-relaxed">
                    {userData.bio}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {userData?.login && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Github size={14} />
                    <a
                      href={`https://github.com/${userData.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-300 transition-colors"
                    >
                      @{userData.login}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
              <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-xs text-gray-600 mb-2">Total Earned</p>
                <p className="text-2xl font-bold text-purple-400">
                  {isEarningsLoading ? "—" : `${formatEth(totalEarnings)} ETH`}
                </p>
              </div>
              <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-xs text-gray-600 mb-2">Assigned Bounties</p>
                <p className="text-2xl font-bold text-blue-400">
                  {isBountiesLoading ? "—" : assignedIssues.length}
                </p>
              </div>
            </div>

            {/* Bounties */}
            <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-base font-semibold text-white mb-6">My Bounties</h2>

              {isBountiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : assignedIssues.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-gray-600 text-sm mb-4">No bounties assigned yet</p>
                  <Link
                    href="/bounties"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Browse open bounties <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {assignedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="group bg-[#0d0d1a]/60 border border-white/5 hover:border-purple-500/20 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <p className="text-sm text-gray-400 line-clamp-2 leading-snug">
                          {issue.issueLink.replace("https://github.com/", "")}
                        </p>
                        <StatusBadge isOpen={issue.isOpen} isCompleted={issue.isCompleted} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-300">
                          {formatEth(issue.amount)} ETH
                        </span>
                        <a
                          href={issue.issueLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
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
