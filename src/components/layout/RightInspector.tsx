/**
 * SENSORY JAPAN — Right Architectural Inspector Panel
 * 
 * Provides:
 * - Selected object inspector: Width, Height, X/Y mm, Rotation, Area in m² & Tsubo (坪)
 * - Interactive Tatami System Convention selector (Kyoma, Chukyoma, Edoma, Danchima)
 * - Live tatami mat re-arrangement and jo count selector (1, 2, 3, 4.5, 6, 8, 10, Custom)
 * - When no selection: Live building compliance (BCR/FAR) & Japanese cost estimation HUD
 */

import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { TatamiSystem, TatamiMatCount, FloorMaterial, RoomType } from '../../types/architectural';
import { TATAMI_SYSTEMS, sqMetersToTsubo, sqMetersToAdvertisingTatami } from '../../engine/tatami';
import { auditProjectCompliance } from '../../engine/compliance';
import { estimateProjectCost } from '../../engine/costEstimator';
import { FloorElevationManager } from '../../engine/FloorElevationManager';
import {
  RotateCw,
  Copy,
  Trash2,
  X,
  Compass,
  Building,
  CheckCircle2,
  AlertTriangle,
  BadgePercent,
  Coins,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const RightInspector: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const selectedId = useProjectStore((s) => s.selectedId);
  const selectedType = useProjectStore((s) => s.selectedType);
  const clearSelection = useProjectStore((s) => s.clearSelection);
  const updateRoom = useProjectStore((s) => s.updateRoom);
  const rotateRoom = useProjectStore((s) => s.rotateRoom);
  const deleteRoom = useProjectStore((s) => s.deleteRoom);
  const duplicateRoom = useProjectStore((s) => s.duplicateRoom);
  const setGlobalTatamiSystem = useProjectStore((s) => s.setGlobalTatamiSystem);
  const updateRoomTatamiConfig = useProjectStore((s) => s.updateRoomTatamiConfig);
  const updateFloorHeight = useProjectStore((s) => s.updateFloorHeight);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleValidationPanel = useUIStore((s) => s.toggleValidationPanel);

  if (!rightPanelOpen) return null;

  // Find selected room across all floors
  let selectedRoom = null;
  if (selectedId && selectedType === 'room') {
    for (const f of project.floors) {
      const r = f.rooms.find((room) => room.id === selectedId);
      if (r) {
        selectedRoom = r;
        break;
      }
    }
  }

  // Calculate live compliance and cost estimation
  const compliance = auditProjectCompliance(project);
  const cost = estimateProjectCost(project);

  return (
    <aside className="w-80 bg-washi-50 border-l border-washi-400/40 flex flex-col h-full select-none shrink-0 shadow-subtle overflow-y-auto z-10">
      {/* 1. ROOM SELECTED: Detailed Object Inspector */}
      {selectedRoom ? (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-washi-400/40 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sumi-50">
                部屋プロパティ
              </span>
              <h3 className="text-sm font-bold text-sumi">
                {selectedRoom.japaneseName || selectedRoom.name}
              </h3>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 text-sumi-50 hover:text-sumi hover:bg-washi-200 rounded"
              title="選択解除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Type */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-sumi-100 block mb-1">
                部屋名 (日本語表記)
              </label>
              <input
                type="text"
                value={selectedRoom.japaneseName}
                onChange={(e) => updateRoom(selectedRoom.id, { japaneseName: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sumi-100 block mb-1">
                用途分類 (Room Type)
              </label>
              <select
                value={selectedRoom.type}
                onChange={(e) => updateRoom(selectedRoom.id, { type: e.target.value as RoomType })}
                className="w-full text-xs px-2 py-1.5 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
              >
                <option value="living">居間・LDK (Living / Dining)</option>
                <option value="washitsu">和室 (Tatami Room)</option>
                <option value="bedroom">寝室・洋室 (Bedroom)</option>
                <option value="genkan">玄関・土間 (Genkan)</option>
                <option value="bathroom">浴室 (Unit Bath)</option>
                <option value="washroom">洗面脱衣室 (Washroom)</option>
                <option value="toilet">トイレ (Toilet)</option>
                <option value="kitchen">キッチン (Kitchen)</option>
                <option value="oshiire">押入れ・収納 (Storage)</option>
                <option value="balcony">バルコニー・ベランダ (Balcony)</option>
                <option value="engawa">縁側 (Engawa Veranda)</option>
              </select>
            </div>
          </div>

          {/* DIMENSIONS (Width, Height, X, Y in mm) */}
          <div className="space-y-2 pt-2 border-t border-washi-400/30">
            <div className="text-xs font-semibold text-sumi-200">
              寸法・配置座標 (ミリメートル・mm)
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-sumi-50 font-mono block">幅 (Width mm)</label>
                <input
                  type="number"
                  step="455"
                  value={selectedRoom.width}
                  onChange={(e) =>
                    updateRoom(selectedRoom.id, { width: Math.max(910, Number(e.target.value)) })
                  }
                  className="w-full text-xs font-mono px-2 py-1 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
                />
              </div>

              <div>
                <label className="text-[10px] text-sumi-50 font-mono block">奥行 (Height mm)</label>
                <input
                  type="number"
                  step="455"
                  value={selectedRoom.height}
                  onChange={(e) =>
                    updateRoom(selectedRoom.id, { height: Math.max(910, Number(e.target.value)) })
                  }
                  className="w-full text-xs font-mono px-2 py-1 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
                />
              </div>

              <div>
                <label className="text-[10px] text-sumi-50 font-mono block">X 座標 (mm)</label>
                <input
                  type="number"
                  step="455"
                  value={selectedRoom.position.x}
                  onChange={(e) =>
                    updateRoom(selectedRoom.id, {
                      position: { ...selectedRoom.position, x: Number(e.target.value) },
                    })
                  }
                  className="w-full text-xs font-mono px-2 py-1 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
                />
              </div>

              <div>
                <label className="text-[10px] text-sumi-50 font-mono block">Y 座標 (mm)</label>
                <input
                  type="number"
                  step="455"
                  value={selectedRoom.position.y}
                  onChange={(e) =>
                    updateRoom(selectedRoom.id, {
                      position: { ...selectedRoom.position, y: Number(e.target.value) },
                    })
                  }
                  className="w-full text-xs font-mono px-2 py-1 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
                />
              </div>
            </div>

            {/* AREA METRIC CARDS */}
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              <div className="p-2 rounded bg-washi-100 border border-washi-400/30 text-center">
                <span className="text-[10px] text-sumi-50 block font-mono">床面積</span>
                <span className="text-xs font-bold text-sumi font-mono">
                  {((selectedRoom.width * selectedRoom.height) / 1_000_000).toFixed(2)}㎡
                </span>
              </div>
              <div className="p-2 rounded bg-washi-100 border border-washi-400/30 text-center">
                <span className="text-[10px] text-sumi-50 block font-mono">坪数</span>
                <span className="text-xs font-bold text-sumi font-mono">
                  {sqMetersToTsubo(
                    (selectedRoom.width * selectedRoom.height) / 1_000_000
                  ).toFixed(2)}坪
                </span>
              </div>
              <div className="p-2 rounded bg-washi-100 border border-washi-400/30 text-center">
                <span className="text-[10px] text-sumi-50 block font-mono">畳数換算</span>
                <span className="text-xs font-bold text-tatami-dark font-mono">
                  {selectedRoom.tatamiConfig
                    ? selectedRoom.tatamiConfig.matCount
                    : sqMetersToAdvertisingTatami(
                        (selectedRoom.width * selectedRoom.height) / 1_000_000
                      ).toFixed(1)}畳
                </span>
              </div>
            </div>
          </div>

          {/* TATAMI CONVENTION ENGINE (If Washitsu or Selected) */}
          <div className="space-y-2.5 pt-2 border-t border-washi-400/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sumi">
                畳規格体系（Tatami System）
              </span>
              <span className="text-[10px] text-tatami-dark font-medium">日本4大規格</span>
            </div>

            {/* System Convention Selector */}
            <div className="space-y-1">
              {(['chukyoma', 'edoma', 'kyoma', 'danchima'] as TatamiSystem[]).map((sysKey) => {
                const sys = TATAMI_SYSTEMS[sysKey];
                const isSelected = project.tatamiSystem === sysKey;

                return (
                  <button
                    key={sysKey}
                    onClick={() => {
                      setGlobalTatamiSystem(sysKey);
                    }}
                    className={`w-full text-left p-2 rounded border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-washi-100 border-hinoki shadow-subtle ring-1 ring-hinoki/30 font-semibold'
                        : 'bg-white border-washi-400/40 hover:bg-washi-100/50'
                    }`}
                  >
                    <div>
                      <div className="text-sumi">{sys.kanji}</div>
                      <div className="text-[10px] text-sumi-50 font-mono">
                        {sys.lengthMm} × {sys.widthMm} mm ({sys.areaSqMeters.toFixed(3)}㎡/畳)
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-hinoki-dark" />}
                  </button>
                );
              })}
            </div>

            {/* Mat Count Selector (1, 2, 3, 4.5, 6, 8, 10) */}
            {selectedRoom.type === 'washitsu' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-sumi-100 block mb-1">
                  伝統畳数・祝儀敷きレイアウト
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {([4.5, 6, 8, 10] as TatamiMatCount[]).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => updateRoomTatamiConfig(selectedRoom.id, cnt)}
                      className={`py-1 text-xs font-mono font-medium rounded border transition-colors ${
                        selectedRoom.tatamiConfig?.matCount === cnt
                          ? 'bg-tatami text-white border-tatami-dark'
                          : 'bg-white border-washi-400/40 text-sumi hover:bg-washi-100'
                      }`}
                    >
                      {cnt}畳
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Floor Material & Koagari Offset */}
          <div className="space-y-2 pt-2 border-t border-washi-400/30">
            <label className="text-xs font-semibold text-sumi-100 block mb-1">
              床仕上げ材 (Floor Material)
            </label>
            <select
              value={selectedRoom.floorMaterial}
              onChange={(e) =>
                updateRoom(selectedRoom.id, { floorMaterial: e.target.value as FloorMaterial })
              }
              className="w-full text-xs px-2 py-1.5 bg-white border border-washi-400/50 rounded outline-none focus:border-hinoki"
            >
              <option value="tatami_igusa">天然い草畳（伝統縁付畳）</option>
              <option value="tatami_washi">和紙畳・琉球畳（縁なし目積）</option>
              <option value="hardwood_hinoki">国産 檜（ヒノキ無垢フローリング）</option>
              <option value="hardwood_sugi">吉野 杉（スギ無垢板）</option>
              <option value="hardwood_oak">オーク・無垢フローリング</option>
              <option value="concrete_doma">土間モルタル仕上（玄関土間）</option>
              <option value="tile_ceramic">磁器質タイル（サニタリー）</option>
              <option value="deck_wood">天然木ウッドデッキ（濡れ縁）</option>
            </select>

            {/* Koagari raised step */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-sumi-100">小上がり段差 (+150mm)</span>
              <button
                onClick={() =>
                  updateRoom(selectedRoom.id, {
                    elevationOffset: selectedRoom.elevationOffset ? undefined : 150,
                  })
                }
                className={`px-2.5 py-1 text-xs rounded border font-mono transition-colors ${
                  selectedRoom.elevationOffset
                    ? 'bg-hinoki text-white border-hinoki-dark'
                    : 'bg-white border-washi-400/40 text-sumi'
                }`}
              >
                {selectedRoom.elevationOffset ? '+150mm 設定中' : 'なし (フラット)'}
              </button>
            </div>
          </div>

          {/* ACTIONS: Rotate, Duplicate, Delete */}
          <div className="space-y-2 pt-3 border-t border-washi-400/30">
            <div className="flex space-x-2">
              <button
                onClick={() => rotateRoom(selectedRoom.id)}
                className="flex-1 py-1.5 bg-washi-100 hover:bg-washi-200 text-sumi text-xs font-medium rounded border border-washi-400/40 flex items-center justify-center gap-1.5 transition-colors"
                title="90度回転 (R)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>90°回転</span>
              </button>

              <button
                onClick={() => duplicateRoom(selectedRoom.id)}
                className="flex-1 py-1.5 bg-washi-100 hover:bg-washi-200 text-sumi text-xs font-medium rounded border border-washi-400/40 flex items-center justify-center gap-1.5 transition-colors"
                title="部屋を複製 (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>複製</span>
              </button>
            </div>

            <button
              onClick={() => deleteRoom(selectedRoom.id)}
              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-bengala text-xs font-medium rounded border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
              title="部屋を削除 (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>部屋を削除</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. NO SELECTION: Comprehensive Japanese Compliance & Cost HUD */
        <div className="p-4 space-y-4">
          <div className="border-b border-washi-400/40 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sumi-50">
              建築法規・概算費用 HUD
            </span>
            <h3 className="text-sm font-bold text-sumi flex items-center gap-1.5">
              <Building className="w-4 h-4 text-hinoki-dark" />
              日本建築基準法 リアルタイム診断
            </h3>
          </div>

          {/* KENPEIRITSU (BCR) & YOSEKIRITSU (FAR) METRIC TILES */}
          <div className="space-y-2">
            {/* BCR 建ぺい率 */}
            <div className="p-3 rounded-lg bg-white border border-washi-400/40 shadow-subtle space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sumi flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5 text-hinoki-dark" />
                  建ぺい率 (BCR)
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    compliance.bcr.isCompliant
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {compliance.bcr.isCompliant ? '法規適合' : '上限超過'}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-sumi-100 font-mono">
                  計画値: <strong className="text-sumi text-sm">{compliance.bcr.proposedPercent.toFixed(1)}%</strong>
                </span>
                <span className="text-sumi-50 font-mono">
                  法定上限: {compliance.bcr.legalMaxPercent}%
                </span>
              </div>
              <div className="w-full bg-washi-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    compliance.bcr.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (compliance.bcr.proposedPercent / compliance.bcr.legalMaxPercent) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-sumi-50 font-mono text-right">
                建築面積 {compliance.bcr.buildingFootprintSqm.toFixed(1)}㎡ / 敷地 {compliance.bcr.plotAreaSqm.toFixed(1)}㎡
              </div>
            </div>

            {/* FAR 容積率 */}
            <div className="p-3 rounded-lg bg-white border border-washi-400/40 shadow-subtle space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sumi flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5 text-aizome" />
                  容積率 (FAR)
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    compliance.far.isCompliant
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {compliance.far.isCompliant ? '法規適合' : '上限超過'}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-sumi-100 font-mono">
                  計画値: <strong className="text-sumi text-sm">{compliance.far.proposedPercent.toFixed(1)}%</strong>
                </span>
                <span className="text-sumi-50 font-mono">
                  法定上限: {compliance.far.appliedMaxFarPercent}%
                </span>
              </div>
              <div className="w-full bg-washi-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    compliance.far.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (compliance.far.proposedPercent / compliance.far.appliedMaxFarPercent) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-sumi-50 font-mono text-right">
                延床面積 {compliance.far.totalFloorAreaSqm.toFixed(1)}㎡ ({(compliance.far.totalFloorAreaSqm * 0.3025).toFixed(1)}坪)
              </div>
            </div>
          </div>

          {/* ROAD SETBACK AUDIT (Article 42 Setback) */}
          <div className="p-3 rounded-lg bg-white border border-washi-400/40 shadow-subtle space-y-1 text-xs">
            <div className="font-semibold text-sumi flex items-center justify-between">
              <span>道路後退（第42条2項道路）</span>
              {compliance.roadSetback.requiresSetback ? (
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">要セットバック</span>
              ) : (
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">クリア</span>
              )}
            </div>
            <p className="text-[11px] text-sumi-100 leading-relaxed">
              前面道路幅員 {(compliance.roadSetback.roadWidthMm / 1000).toFixed(1)}m。
              {compliance.roadSetback.requiresSetback
                ? `中心線より ${(compliance.roadSetback.setbackDistanceMm / 1000).toFixed(2)}m の後退が必要です。`
                : '幅員4m以上を確保しており、セットバックは不要です。'}
            </p>
          </div>

          {/* ACTIVE FLOOR VERTICAL ELEVATION & STORY HEIGHT */}
          {(() => {
            const activeFloor = project.floors.find(f => f.id === project.activeFloorId) || project.floors[0];
            const datums = FloorElevationManager.calculateFloorElevations(project);
            const activeDatum = datums.find(d => d.floorId === activeFloor?.id);
            if (!activeFloor || !activeDatum) return null;

            return (
              <div className="p-3 rounded-lg bg-white border border-washi-400/40 shadow-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-washi-200 pb-1.5">
                  <span className="font-semibold text-sumi flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-wood-700" />
                    <span>階高・垂直基準面 ({activeFloor.level})</span>
                  </span>
                  <button
                    onClick={toggleValidationPanel}
                    className="text-[10px] text-wood-700 hover:text-wood-900 font-semibold flex items-center gap-0.5 bg-washi-100 hover:bg-washi-200 px-1.5 py-0.5 rounded border border-washi-300"
                  >
                    <ShieldCheck className="w-3 h-3 text-wood-600" />
                    <span>検証</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-washi-50 p-2 rounded">
                    <span className="text-wood-500 block text-[10px]">構造階高 (H)</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        step="50"
                        min="2300"
                        max="4500"
                        value={activeFloor.floorHeight}
                        onChange={(e) => updateFloorHeight(activeFloor.id, parseInt(e.target.value) || 2900)}
                        className="w-16 px-1 py-0.5 bg-white border border-washi-300 rounded text-sumi font-bold text-xs"
                      />
                      <span className="text-wood-500 text-[10px]">mm</span>
                    </div>
                  </div>
                  <div className="bg-washi-50 p-2 rounded">
                    <span className="text-wood-500 block text-[10px]">基準FL (基盤高)</span>
                    <span className="font-bold text-sumi text-xs block mt-1">
                      {activeDatum.baseElevationMm} mm
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-wood-600 space-y-0.5 font-mono pt-1 border-t border-washi-200">
                  <div className="flex justify-between">
                    <span>仕上天端 (FFL):</span>
                    <span className="font-semibold text-sumi">{activeDatum.finishedFloorElevationMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>天井高 (CH):</span>
                    <span className="font-semibold text-sumi">{activeDatum.ceilingClearanceMm} mm</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* JAPANESE RESIDENTIAL CONSTRUCTION COST ESTIMATE */}
          <div className="p-3 rounded-lg bg-white border border-washi-400/40 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sumi flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-hinoki-dark" />
                概算建築工事費 (JPY)
              </span>
              <span className="text-[10px] text-sumi-50 font-mono">
                坪単価 約{(cost.baseTsuboTankaJpy / 10000).toFixed(0)}万円
              </span>
            </div>

            <div className="text-lg font-bold text-sumi font-mono text-center py-1 bg-washi-50 rounded border border-washi-400/20">
              {cost.formattedAverage}
            </div>
            <div className="text-[10px] text-sumi-50 font-mono text-center">
              想定レンジ: {cost.formattedRange}
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-1.5 pt-1">
              {cost.breakdown.map((item) => (
                <div key={item.category} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-sumi-100">{item.japaneseLabel}</span>
                    <span className="font-mono text-sumi font-medium">
                      {(item.amountJpy / 10000).toFixed(0)}万円 ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-washi-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

