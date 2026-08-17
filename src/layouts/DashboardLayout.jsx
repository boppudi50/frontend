import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import { Sidebar } from "../components/common/Sidebar";
import { AICopilotDrawer } from "../components/ai/AICopilotDrawer";
import { LiveScenarioModal } from "../components/demo/LiveScenarioModal";
import { HHTScannerModal } from "../components/common/HHTScannerModal";
import { ThermalShippingLabelModal } from "../components/common/ThermalShippingLabelModal";
import { ColdChainMonitorModal } from "../components/common/ColdChainMonitorModal";
import { useRealtimeData } from "../context/RealtimeDataContext";

export function DashboardLayout() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const {
    scannerOpen,
    setScannerOpen,
    labelModalOrder,
    setLabelModalOrder,
    climateModalOpen,
    setClimateModalOpen
  } = useRealtimeData() || {};

  return (
    <div className="h-screen w-screen bg-[#FFFFFF] flex flex-col antialiased overflow-hidden">
      {/* Top Navbar - Fixed at top */}
      <div className="shrink-0 z-30">
        <Navbar
          onOpenDemo={() => setDemoOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
        />
      </div>

      {/* Body with Fixed Sidebar and Scrolling Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 bg-slate-50/60 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="w-full space-y-5 pb-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Drawers & Modals */}
      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <LiveScenarioModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />

      <HHTScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      <ThermalShippingLabelModal
        isOpen={!!labelModalOrder}
        orderId={labelModalOrder}
        onClose={() => setLabelModalOrder(null)}
      />

      <ColdChainMonitorModal
        isOpen={climateModalOpen}
        onClose={() => setClimateModalOpen(false)}
      />
    </div>
  );
}

