/**
 * SENSORY JAPAN — Top Architectural CAD Toolbar
 * 
 * Provides:
 * - Project title & quick rename
 * - Save status & autosave indicator
 * - Undo & Redo buttons with shortcut tooltips
 * - Floor switcher (B1, 1F, 2F, 3F)
 * - 2D / 3D Mode toggle
 * - Zoom in / out / fit controls
 * - Grid snap & module toggle (910mm vs 1000mm)
 * - Export architectural dossier
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import {
  Save,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Box,
  Layers,
  FileDown,
  Compass,
  CheckCircle2,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { FloorLevel } from '../../types/architectural';

export const HeaderToolbar: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const isDirty = useProjectStore((s) => s.isDirty);
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt);
  const saveProjectToStorage = useProjectStore((s) => s.saveProjectToStorage);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const canUndo = useProjectStore((s) => s.canUndo());
  const canRedo = useProjectStore((s) => s.canRedo());
  const updateProjectName = useProjectStore((s) => s.updateProjectName);
  const setActiveFloor = useProjectStore((s) => s.setActiveFloor);
  const addFloor = useProjectStore((s) => s.addFloor);

  const currentView = useUIStore((s) => s.currentView);
  const setCurrentView = useUIStore((s) => s.setCurrentView);
  const is3DMode = useUIStore((s) => s.is3DMode);
  const toggle3DMode = useUIStore((s) => s.toggle3DMode);
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const resetZoom = useUIStore((s) => s.resetZoom);
  const gridSnapEnabled = useUIStore((s) => s.gridSnapEnabled);
  const toggleGridSnap = useUIStore((s) => s.toggleGridSnap);
  const gridModuleMm = useUIStore((s) => s.gridModuleMm);
  const setGridModuleMm = useUIStore((s) => s.setGridModuleMm);
  const showLowerFloorGhost = useUIStore((s) => s.showLowerFloorGhost);
  const toggleLowerFloorGhost = useUIStore((s) => s.toggleLowerFloorGhost);
  const openModal = useUIStore((s) => s.openModal);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const validationPanelOpen = useUIStore((s) => s.validationPanelOpen);
  const toggleValidationPanel = useUIStore((s) => s.toggleValidationPanel);
  const lastValidationError = useProjectStore((s) => s.lastValidationError);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateProjectName(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const activeFloor = project.floors.find((f) => f.id === project.activeFloorId) || project.floors[0];

  return (
    <header className="h-14 bg-washi-50 border-b border-washi-400/40 px-4 flex items-center justify-between select-none shadow-subtle shrink-0">
      {/* LEFT SECTION: Logo & Project Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleLeftPanel}
          className="p-1.5 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded transition-colors"
          title="パネル切り替え"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-sumi tracking-tight text-base flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-hinoki inline-block" />
            SEN<span className="text-hinoki-dark font-sans font-light">SORY</span>
            <span className="text-xs font-mono font-normal bg-washi-200 text-sumi-100 px-1.5 py-0.5 rounded border border-washi-400/30">
              JAPAN
            </span>
          </span>
        </div>

        <span className="text-washi-400">/</span>

        {/* Project Name */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="text-sm font-medium text-sumi px-2 py-0.5 border border-hinoki rounded bg-white outline-none w-64 font-sans"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTitleInput(project.name);
              setIsEditingTitle(true);
            }}
            className="text-sm font-medium text-sumi-200 hover:text-sumi hover:bg-washi-200/60 px-2 py-1 rounded transition-colors max-w-[280px] truncate text-left"
            title="クリックしてプロジェクト名を変更"
          >
            {project.name}
          </button>
        )}

        {/* Save Status Badge */}
        <div className="flex items-center space-x-1.5 text-xs text-sumi-50 font-mono">
          {isDirty ? (
            <span className="text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              未保存の変更
            </span>
          ) : (
            <span className="text-tatami-dark flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {lastSavedAt ? `${lastSavedAt} 保存済` : '保存済'}
            </span>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Multi-Floor Selector & 2D/3D Mode Switcher */}
      <div className="flex items-center space-x-3">
        {/* Floor Level Tabs */}
        <div className="flex items-center bg-washi-200 p-0.5 rounded-md border border-washi-400/40">
          {project.floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloor(floor.id)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-all ${
                activeFloor.id === floor.id
                  ? 'bg-washi-50 text-sumi shadow-subtle border border-washi-400/30'
                  : 'text-sumi-100 hover:text-sumi hover:bg-washi-100/50'
              }`}
            >
              {floor.level}
            </button>
          ))}
          {project.floors.length < 4 && (
            <button
              onClick={() => {
                const nextLevel: FloorLevel =
                  !project.floors.some((f) => f.level === '1F')
                    ? '1F'
                    : !project.floors.some((f) => f.level === '2F')
                    ? '2F'
                    : !project.floors.some((f) => f.level === '3F')
                    ? '3F'
                    : 'B1';
                addFloor(nextLevel);
              }}
              className="px-2 py-1 text-xs text-sumi-50 hover:text-sumi hover:bg-washi-100 rounded"
              title="フロアを追加"
            >
              +
            </button>
          )}
        </div>

        {/* 2D / 3D Mode Toggle Switcher */}
        <div className="flex items-center bg-washi-200 p-0.5 rounded-md border border-washi-400/40">
          <button
            onClick={() => {
              if (currentView !== 'floor_planner') setCurrentView('floor_planner');
              if (is3DMode) toggle3DMode();
            }}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center space-x-1 transition-all ${
              !is3DMode && currentView === 'floor_planner'
                ? 'bg-washi-50 text-sumi shadow-subtle font-semibold'
                : 'text-sumi-100 hover:text-sumi'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D 平面図</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('designer_3d');
              if (!is3DMode) toggle3DMode();
            }}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center space-x-1 transition-all ${
              is3DMode || currentView === 'designer_3d'
                ? 'bg-hinoki text-white shadow-subtle font-semibold'
                : 'text-sumi-100 hover:text-sumi'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D 外観・空間</span>
          </button>
        </div>
      </div>

      {/* RIGHT SECTION: CAD Controls & Export */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 border-r border-washi-400/40 pr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-sumi-200 hover:text-sumi hover:bg-washi-200'
                : 'text-washi-400 cursor-not-allowed'
            }`}
            title="元に戻す (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-sumi-200 hover:text-sumi hover:bg-washi-200'
                : 'text-washi-400 cursor-not-allowed'
            }`}
            title="やり直し (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* CAD Grid & Module Options */}
        <div className="flex items-center space-x-1 border-r border-washi-400/40 pr-2">
          {/* Snap toggle */}
          <button
            onClick={toggleGridSnap}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              gridSnapEnabled
                ? 'bg-washi-200 text-hinoki-dark font-medium border border-hinoki/30'
                : 'text-sumi-50 hover:bg-washi-200'
            }`}
            title="グリッドスナップ (910mmモジュール)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{gridModuleMm}mm</span>
          </button>

          {/* Module switch (910 Shakkan vs 1000 Meter) */}
          <button
            onClick={() => setGridModuleMm(gridModuleMm === 910 ? 1000 : 910)}
            className="text-[11px] font-mono px-1.5 py-1 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded"
            title="尺モジュール (910mm) / メーターモジュール (1000mm) 切り替え"
          >
            {gridModuleMm === 910 ? '尺' : '米'}
          </button>

          {/* Structural Ghost Overlay Toggle */}
          <button
            onClick={toggleLowerFloorGhost}
            className={`p-1.5 rounded transition-colors ${
              showLowerFloorGhost
                ? 'bg-washi-200 text-hinoki-dark'
                : 'text-sumi-50 hover:text-sumi hover:bg-washi-200'
            }`}
            title="直下階の柱・壁ラインを表示（構造重ね合わせ表示）"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-r border-washi-400/40 pr-2">
          <button
            onClick={zoomIn}
            className="p-1.5 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded transition-colors"
            title="拡大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded transition-colors"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded transition-colors"
            title="全体表示 (フィット)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={saveProjectToStorage}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-washi-200 hover:bg-washi-300 text-sumi rounded-md text-xs font-medium border border-washi-400/40 transition-colors shadow-subtle"
          title="プロジェクトを保存"
        >
          <Save className="w-3.5 h-3.5 text-hinoki-dark" />
          <span>保存</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={() => openModal('export_pdf')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-hinoki hover:bg-hinoki-dark text-white rounded-md text-xs font-medium transition-colors shadow-subtle"
          title="建築計画書・PDFを出力"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>計画書出力</span>
        </button>

        {/* Validation Panel Toggle */}
        <button
          onClick={toggleValidationPanel}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors shadow-subtle ${
            validationPanelOpen
              ? 'bg-wood-800 text-white border-wood-900'
              : lastValidationError
              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              : 'bg-washi-200 hover:bg-washi-300 text-sumi border-washi-400/40'
          }`}
          title="構造・法規・幾何学バリデーションパネル"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${lastValidationError ? 'text-rose-600' : 'text-wood-700'}`} />
          <span>検証</span>
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={toggleRightPanel}
          className="p-1.5 text-sumi-100 hover:text-sumi hover:bg-washi-200 rounded transition-colors ml-1"
          title="プロパティインスペクター切り替え"
        >
          <Menu className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </header>
  );
};

