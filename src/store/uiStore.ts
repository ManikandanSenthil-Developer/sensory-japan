/**
 * SENSORY JAPAN — UI Navigation, Canvas Viewport & Tooling State Store
 */

import { create } from 'zustand';

export type NavigationView =
  | 'dashboard'
  | 'new_project'
  | 'site_analysis'
  | 'floor_planner'
  | 'designer_3d'
  | 'compliance'
  | 'history'
  | 'reports'
  | 'settings';

export type CanvasTool = 'select' | 'pan' | 'measure';

interface UIStoreState {
  currentView: NavigationView;
  is3DMode: boolean; // 2D vs 3D switcher on top toolbar
  
  // 2D CAD Canvas Viewport
  zoom: number;               // Scale: screen pixels per millimetre
  panX: number;               // Offset X in pixels
  panY: number;               // Offset Y in pixels
  activeTool: CanvasTool;
  gridSnapEnabled: boolean;
  gridModuleMm: 910 | 1000;   // 910mm 京間/尺モジュール vs 1000mm メーターモジュール
  showDimensions: boolean;
  showTatamiDetails: boolean;
  showLowerFloorGhost: boolean; // Structural alignment onion skin
  
  // Responsive sidebar toggles
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  validationPanelOpen: boolean;

  // Modals & Panels
  activeModal: 'new_project' | 'template_picker' | 'export_pdf' | 'ai_chat' | null;

  // Actions
  setCurrentView: (view: NavigationView) => void;
  toggle3DMode: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (panX: number, panY: number) => void;
  panBy: (dx: number, dy: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  toggleGridSnap: () => void;
  setGridModuleMm: (mod: 910 | 1000) => void;
  toggleDimensions: () => void;
  toggleTatamiDetails: () => void;
  toggleLowerFloorGhost: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleValidationPanel: () => void;
  openModal: (modal: 'new_project' | 'template_picker' | 'export_pdf' | 'ai_chat') => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  currentView: 'floor_planner',
  is3DMode: false,
  
  // 1000mm = 50px at zoom 0.05 (ideal starting scale for 10m-20m Japanese house)
  zoom: 0.065,
  panX: 180,
  panY: 100,
  activeTool: 'select',
  gridSnapEnabled: true,
  gridModuleMm: 910,
  showDimensions: true,
  showTatamiDetails: true,
  showLowerFloorGhost: false,
  
  leftPanelOpen: true,
  rightPanelOpen: true,
  validationPanelOpen: false,
  activeModal: null,

  setCurrentView: (view) => set({ currentView: view }),
  toggle3DMode: () => set((s) => ({ is3DMode: !s.is3DMode })),
  
  setZoom: (zoom) => set({ zoom: Math.min(0.3, Math.max(0.015, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(0.3, s.zoom * 1.25) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.015, s.zoom / 1.25) })),
  resetZoom: () => set({ zoom: 0.065, panX: 180, panY: 100 }),

  setPan: (panX, panY) => set({ panX, panY }),
  panBy: (dx, dy) => set((s) => ({ panX: s.panX + dx, panY: s.panY + dy })),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleGridSnap: () => set((s) => ({ gridSnapEnabled: !s.gridSnapEnabled })),
  setGridModuleMm: (mod) => set({ gridModuleMm: mod }),
  toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),
  toggleTatamiDetails: () => set((s) => ({ showTatamiDetails: !s.showTatamiDetails })),
  toggleLowerFloorGhost: () => set((s) => ({ showLowerFloorGhost: !s.showLowerFloorGhost })),
  
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleValidationPanel: () => set((s) => ({ validationPanelOpen: !s.validationPanelOpen })),
  
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));

if (typeof window !== 'undefined') {
  (window as any).__UI_STORE__ = useUIStore;
}

