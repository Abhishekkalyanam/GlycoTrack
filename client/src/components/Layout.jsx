import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ShieldAlert } from "lucide-react";

export default function Layout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#171917] flex">
      {/* Black Vertical Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-22 transition-all duration-300">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Top Header */}
          <Header onOpenMobile={() => setIsMobileOpen(true)} />

          {/* Child Page Content */}
          <main className="w-full">{children}</main>
        </div>

        {/* Minimalist Medical Disclaimer Footer */}
        <footer className="border-t border-[#E9ECE7] bg-[#F7F8F5] py-4 px-6 text-center text-xs text-[#777D78]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-[#101310] shrink-0" />
            <span>
              <strong>Medical Disclaimer:</strong> GlycoTrack is a glycemic self-monitoring and wellness tracking tool. It does not provide medical diagnosis or treatment advice. Consult a healthcare provider for medical inquiries.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
