"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { FaGithub } from "react-icons/fa";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const account = useActiveAccount();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0e0c]/95 backdrop-blur-md border-b border-[#2a2520]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold text-xs">
              B
            </div>
            <span className="font-bold text-[#fafaf9] text-lg tracking-tight">BountyHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {account && (
              <>
                <Link
                  href="/bounties"
                  className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Bounties
                </Link>
                <Link
                  href="/manager"
                  className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Maintainer
                </Link>
                <Link
                  href="/contributer"
                  className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Contributor
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/apps/bounty-birbal-bot/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-stone-400 hover:text-[#fafaf9] border border-[#2a2520] hover:border-[#3a3025] rounded-lg transition-colors"
            >
              <FaGithub size={15} />
              Install App
            </a>
            <ConnectButton
              client={client}
              detailsButton={{ style: { maxHeight: "40px", minWidth: "120px" } }}
            />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-stone-400 hover:text-[#fafaf9] transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-[#2a2520] py-3 space-y-0.5">
            {account && (
              <>
                <Link
                  href="/bounties"
                  className="block px-4 py-2.5 text-sm text-stone-300 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Bounties
                </Link>
                <Link
                  href="/manager"
                  className="block px-4 py-2.5 text-sm text-stone-300 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Maintainer Dashboard
                </Link>
                <Link
                  href="/contributer"
                  className="block px-4 py-2.5 text-sm text-stone-300 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
                >
                  Contributor Dashboard
                </Link>
              </>
            )}
            <a
              href="https://github.com/apps/bounty-birbal-bot/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-300 hover:text-[#fafaf9] hover:bg-[#2a2520] rounded-lg transition-colors"
            >
              <FaGithub size={15} />
              Install GitHub App
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
