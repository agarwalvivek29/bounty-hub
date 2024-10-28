"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { FaGithub } from "react-icons/fa";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const account = useActiveAccount();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
            <span className="font-bold text-white text-lg tracking-tight">BountyHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {account && (
              <>
                <Link
                  href="/bounties"
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Bounties
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Dashboard
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-44 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                      <Link
                        href="/manager"
                        className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Maintainer
                      </Link>
                      <Link
                        href="/contributer"
                        className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Contributor
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/apps/tst-app-vivk/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-colors"
            >
              <FaGithub size={15} />
              Install App
            </a>
            <ConnectButton
              client={client}
              theme={lightTheme()}
              detailsButton={{ style: { maxHeight: "40px", minWidth: "120px" } }}
            />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-white/10 py-3 space-y-0.5">
            {account && (
              <>
                <Link
                  href="/bounties"
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Bounties
                </Link>
                <Link
                  href="/manager"
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Maintainer Dashboard
                </Link>
                <Link
                  href="/contributer"
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Contributor Dashboard
                </Link>
              </>
            )}
            <a
              href="https://github.com/apps/tst-app-vivk/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
