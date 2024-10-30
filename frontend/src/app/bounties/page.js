"use client";

import { client } from "../client";
import { defineChain, getContract } from "thirdweb";
import React, { useState, useMemo, useEffect } from "react";
import { useReadContract } from "thirdweb/react";
import { contractABI } from "../constants/contract";
import { Search, ArrowUpDown, ExternalLink } from "lucide-react";

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: "0x96111652DB352b814697e79A846E8CD9C8e11196",
  abi: contractABI,
});

const STATUS_TABS = ["All", "Open", "In Progress", "Completed"];

function parseRepo(issueLink) {
  const match = issueLink.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match ? `${match[1]}/${match[2]}` : issueLink;
}

function parseIssueRef(issueLink) {
  const match = issueLink.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  return match ? `${match[1]}/${match[2]} #${match[3]}` : issueLink.replace("https://github.com/", "");
}

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

function SkeletonCard() {
  return (
    <div className="bg-[#1a1814]/80 border border-[#2a2520] rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-[#2a2520] rounded w-3/4" />
        <div className="h-5 bg-[#2a2520] rounded-full w-16" />
      </div>
      <div className="h-3 bg-[#2a2520] rounded w-1/2 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-[#2a2520] rounded-full w-20" />
        <div className="h-4 bg-[#2a2520] rounded w-24" />
      </div>
    </div>
  );
}

const AllIssues = () => {
  const { data, isPending } = useReadContract({
    contract,
    method:
      "function getBounties() view returns ((uint256 id, string issueLink, uint256 amount, address creator, address rewardedTo, address[] assignedTo, bool isOpen, bool isCompleted, string rewardee_username)[])",
    params: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);
  const [issueTitles, setIssueTitles] = useState({});

  const bounties = useMemo(() => {
    if (!data) return [];
    return data.map((bounty) => ({
      id: Number(bounty.id),
      issueLink: bounty.issueLink,
      amount: Number(bounty.amount),
      creator: bounty.creator,
      rewardedTo: bounty.rewardedTo,
      assignedTo: bounty.assignedTo,
      isOpen: bounty.isOpen,
      isCompleted: bounty.isCompleted,
      rewardee_username: bounty.rewardee_username || "",
    }));
  }, [data]);

  useEffect(() => {
    const fetchIssueTitles = async () => {
      const titles = {};
      for (const bounty of bounties) {
        if (bounty.issueLink) {
          try {
            const match = bounty.issueLink.match(
              /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/
            );
            if (match) {
              const [, owner, repo, issue_number] = match;
              const headers = {};
              if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
                headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
              }
              const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`,
                { headers }
              );
              if (response.ok) {
                const issueData = await response.json();
                titles[bounty.id] = issueData.title;
              } else {
                titles[bounty.id] = parseIssueRef(bounty.issueLink);
              }
            } else {
              titles[bounty.id] = null;
            }
          } catch {
            titles[bounty.id] = null;
          }
        } else {
          titles[bounty.id] = null;
        }
      }
      setIssueTitles(titles);
    };
    if (bounties.length > 0) fetchIssueTitles();
  }, [bounties]);

  const filteredBounties = useMemo(() => {
    let result = bounties.filter((bounty) => {
      const titleMatch =
        (issueTitles[bounty.id] &&
          issueTitles[bounty.id].toLowerCase().includes(searchTerm.toLowerCase())) ||
        bounty.issueLink.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bounty.rewardee_username.toLowerCase().includes(searchTerm.toLowerCase());

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Open" && bounty.isOpen) ||
        (activeTab === "Completed" && bounty.isCompleted) ||
        (activeTab === "In Progress" && !bounty.isCompleted && !bounty.isOpen);

      return titleMatch && tabMatch;
    });

    result = [...result].sort((a, b) =>
      sortDesc ? b.amount - a.amount : a.amount - b.amount
    );

    return result;
  }, [bounties, issueTitles, searchTerm, activeTab, sortDesc]);

  return (
    <div
      className="min-h-screen bg-[#0f0e0c] text-[#fafaf9]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(245,158,11,0.04) 1px, transparent 0)",
        backgroundSize: "36px 36px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#fafaf9]">Open Bounties</h1>
            <p className="text-[#78716c] mt-1 text-sm">
              {isPending ? "Loading…" : `${bounties.length} bounties across all repos`}
            </p>
          </div>
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-400 hover:text-[#fafaf9] bg-[#1a1814] hover:bg-[#2a2520] border border-[#2a2520] rounded-lg transition-colors self-start sm:self-auto"
          >
            <ArrowUpDown size={14} />
            Amount {sortDesc ? "High → Low" : "Low → High"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
          />
          <input
            type="text"
            placeholder="Search by issue title, repo, or contributor…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1a1814] border border-[#2a2520] rounded-xl text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/40 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-stone-500 hover:text-stone-300 hover:bg-[#2a2520]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredBounties.length === 0 ? (
          <div className="text-center py-20 text-stone-600">
            <p className="text-lg mb-1">No bounties found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBounties.map((bounty) => (
              <div
                key={bounty.id}
                className="group bg-[#1a1814]/80 border border-[#2a2520] hover:border-amber-500/25 rounded-2xl p-6 transition-colors backdrop-blur-sm"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="text-sm font-medium text-stone-200 leading-snug line-clamp-2">
                    {issueTitles[bounty.id] !== undefined
                      ? issueTitles[bounty.id] || parseIssueRef(bounty.issueLink)
                      : parseIssueRef(bounty.issueLink)}
                  </h3>
                  <StatusBadge isOpen={bounty.isOpen} isCompleted={bounty.isCompleted} />
                </div>

                <p className="text-xs text-stone-600 mb-5 font-mono">
                  {parseRepo(bounty.issueLink)}
                </p>

                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm font-semibold text-amber-400">
                    {(bounty.amount / 1e18).toFixed(4)} ETH
                  </span>
                  <a
                    href={bounty.issueLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    View Issue
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIssues;
