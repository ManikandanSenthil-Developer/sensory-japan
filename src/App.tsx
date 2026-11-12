/**
 * SENSORY JAPAN — Main Application Shell
 * 
 * Coordinates:
 * - Professional Japanese architectural layout
 * - Multi-panel CAD interface with responsive drawers
 * - View routing across all 9 core architectural modules
 * - Global modals & persistence initialization
 */

import React, { useEffect } from 'react';
import { useUIStore } from './store/uiStore';
import { useProjectStore } from './store/projectStore';
import { HeaderToolbar } from './components/layout/HeaderToolbar';
import { MainNavigation } from './components/layout/MainNavigation';
import { LeftPanel } from './components/layout/LeftPanel';
import { RightInspector } from './components/layout/RightInspector';
import { FloorPlanCanvas } from './components/canvas2d/FloorPlanCanvas';
import { DashboardView } from './components/views/DashboardView';
import { SiteAnalysisView } from './components/views/SiteAnalysisView';
import { ComplianceView } from './components/views/ComplianceView';
import { ProjectHistoryView } from './components/views/ProjectHistoryView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { Designer3DView } from './components/views/Designer3DView';
import { ValidationPanel } from './components/layout/ValidationPanel';
import { Modals } from './components/ui/Modals';

export const App: React.FC = () => {
  const currentView = useUIStore((s) => s.currentView);
  const is3DMode = useUIStore((s) => s.is3DMode);
  const validationPanelOpen = useUIStore((s) => s.validationPanelOpen);
  const toggleValidationPanel = useUIStore((s) => s.toggleValidationPanel);
  const loadProjectFromStorage = useProjectStore((s) => s.loadProjectFromStorage);
  const saveProjectToStorage = useProjectStore((s) => s.saveProjectToStorage);

  // Load saved project from local storage on first mount
  useEffect(() => {
    const hasLoaded = loadProjectFromStorage();
    if (!hasLoaded) {
      saveProjectToStorage();
    }
  }, [loadProjectFromStorage, saveProjectToStorage]);

  return (
    <div className="flex h-screen w-screen bg-washi-100 overflow-hidden font-sans text-sumi">
      {/* 1. MAIN GLOBAL SIDEBAR NAVIGATION */}
      <MainNavigation />

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top CAD & Project Toolbar */}
        <HeaderToolbar />

        {/* View Router */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* A. 2D FLOOR PLANNER VIEW (3-PANEL CAD WORKSPACE) */}
          {currentView === 'floor_planner' && !is3DMode && (
            <>
              {/* Left Panel (Room Library, Floors, Templates, Elements) */}
              <LeftPanel />

              {/* Center Panel (Interactive SVG CAD Canvas) */}
              <main className="flex-1 h-full relative overflow-hidden bg-washi-100">
                <FloorPlanCanvas />
              </main>

              {/* Right Panel (Inspector, Tatami Engine, Compliance & Cost HUD) */}
              <RightInspector />
            </>
          )}

          {/* B. 3D DESIGNER VIEW (Part 2 Prepared Stage) */}
          {(currentView === 'designer_3d' || (currentView === 'floor_planner' && is3DMode)) && <Designer3DView />}

          {/* C. DASHBOARD VIEW */}
          {currentView === 'dashboard' && <DashboardView />}

          {/* D. SITE & PLOT ANALYSIS VIEW */}
          {currentView === 'site_analysis' && <SiteAnalysisView />}

          {/* E. COMPLIANCE & BUILDING CODES AUDIT VIEW */}
          {currentView === 'compliance' && <ComplianceView />}

          {/* F. PROJECT HISTORY & REVISIONS VIEW */}
          {currentView === 'history' && <ProjectHistoryView />}

          {/* G. REPORTS & PDF EXPORT VIEW */}
          {currentView === 'reports' && <ReportsView />}

          {/* H. SETTINGS & SYSTEM PREFERENCES VIEW */}
          {currentView === 'settings' && <SettingsView />}

          {/* I. LIVE DESIGN VALIDATION PANEL (DRAWER / OVERLAY) */}
          {validationPanelOpen && (
            <ValidationPanel onClose={() => toggleValidationPanel()} />
          )}
        </div>
      </div>

      {/* GLOBAL MODALS (New Project, Export PDF, AI Architectural Chat) */}
      <Modals />
    </div>
  );
};

export default App;

