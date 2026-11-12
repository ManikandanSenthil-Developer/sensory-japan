/**
 * SENSORY JAPAN — Architectural Preferences & Settings View
 */

import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { TatamiSystem, StructureType } from '../../types/architectural';
import { TATAMI_SYSTEMS } from '../../engine/tatami';
import { Settings, CheckCircle2, Sliders, Ruler, Grid } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const setGlobalTatamiSystem = useProjectStore((s) => s.setGlobalTatamiSystem);
  const gridModuleMm = useUIStore((s) => s.gridModuleMm);
  const setGridModuleMm = useUIStore((s) => s.setGridModuleMm);
  const showDimensions = useUIStore((s) => s.showDimensions);
  const toggleDimensions = useUIStore((s) => s.toggleDimensions);
  const showTatamiDetails = useUIStore((s) => s.showTatamiDetails);
  const toggleTatamiDetails = useUIStore((s) => s.toggleTatamiDetails);

  return (
    <div className="flex-1 overflow-y-auto bg-washi-100 p-6 md:p-8 space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="border-b border-washi-400/40 pb-4">
        <span className="text-xs font-mono uppercase text-hinoki-dark font-semibold">
          設計基準・モジュール規格設定
        </span>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-sumi flex items-center gap-2 mt-1">
          <Settings className="w-6 h-6 text-hinoki-dark" />
          環境設定 & 尺貫法モジュール仕様
        </h1>
        <p className="text-xs text-sumi-100 mt-1">
          日本固有の寸法体系（尺貫法・畳規格・木造軸組モジュール）の既定値カスタマイズ
        </p>
      </div>

      {/* 1. TATAMI CONVENTION DEFAULTS */}
      <div className="p-5 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-sumi flex items-center gap-2">
              <Ruler className="w-4 h-4 text-hinoki-dark" />
              1. 畳規格体系（Tatami Measurement Convention）
            </h2>
            <p className="text-xs text-sumi-100 mt-0.5">
              地域や建築様式に応じた畳の寸法基準。変更時に全和室の寸法・敷き方が自動再計算されます。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['chukyoma', 'edoma', 'kyoma', 'danchima'] as TatamiSystem[]).map((sysKey) => {
            const sys = TATAMI_SYSTEMS[sysKey];
            const isSelected = project.tatamiSystem === sysKey;

            return (
              <div
                key={sysKey}
                onClick={() => setGlobalTatamiSystem(sysKey)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-washi-50 border-hinoki shadow-subtle ring-1 ring-hinoki/30'
                    : 'bg-white border-washi-400/40 hover:bg-washi-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-sumi">{sys.kanji}</h3>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-hinoki-dark" />}
                </div>
                <div className="text-xs text-sumi-100 mt-1">{sys.region}</div>
                <div className="mt-2 text-xs font-mono font-medium text-hinoki-dark">
                  {sys.lengthMm} mm × {sys.widthMm} mm ({sys.areaSqMeters.toFixed(3)} ㎡/畳)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ARCHITECTURAL MODULE (SHAKKAN VS METER) */}
      <div className="p-5 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-sumi flex items-center gap-2">
          <Grid className="w-4 h-4 text-aizome" />
          2. 製図基本モジュール（Architectural CAD Module）
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            onClick={() => setGridModuleMm(910)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              gridModuleMm === 910
                ? 'bg-washi-50 border-hinoki shadow-subtle ring-1 ring-hinoki/30'
                : 'bg-white border-washi-400/40 hover:bg-washi-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sumi">尺モジュール (910 mm)</h3>
              {gridModuleMm === 910 && <CheckCircle2 className="w-4 h-4 text-hinoki-dark" />}
            </div>
            <p className="text-xs text-sumi-100 mt-1 leading-relaxed">
              日本の伝統木造在来工法における標準。3尺 = 910mm、6尺（1間）= 1820mm。合板や石膏ボードの規格（3×6板）と完全に合致。
            </p>
          </div>

          <div
            onClick={() => setGridModuleMm(1000)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              gridModuleMm === 1000
                ? 'bg-washi-50 border-hinoki shadow-subtle ring-1 ring-hinoki/30'
                : 'bg-white border-washi-400/40 hover:bg-washi-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sumi">メーターモジュール (1000 mm)</h3>
              {gridModuleMm === 1000 && <CheckCircle2 className="w-4 h-4 text-hinoki-dark" />}
            </div>
            <p className="text-xs text-sumi-100 mt-1 leading-relaxed">
              バリアフリー設計やゆとりある廊下・階段幅（有効幅約850mm以上）を重視した近代メーターグリッド規格。
            </p>
          </div>
        </div>
      </div>

      {/* 3. DISPLAY PREFERENCES */}
      <div className="p-5 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-sumi flex items-center gap-2">
          <Sliders className="w-4 h-4 text-bengala" />
          3. 画面表示設定 (Canvas Display Toggles)
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-sumi block">寸法線・面積注記の常時表示</span>
              <span className="text-[11px] text-sumi-50">部屋の幅・奥行き・㎡・坪・畳数を2D図面内に表示</span>
            </div>
            <button
              onClick={toggleDimensions}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                showDimensions ? 'bg-hinoki text-white border-hinoki-dark' : 'bg-washi-200 text-sumi'
              }`}
            >
              {showDimensions ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-sumi block">和室 畳縁（へり）詳細描画</span>
              <span className="text-[11px] text-sumi-50">和室内の畳の敷き方（祝儀敷き）と縁（Heri）テクスチャを表示</span>
            </div>
            <button
              onClick={toggleTatamiDetails}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                showTatamiDetails ? 'bg-hinoki text-white border-hinoki-dark' : 'bg-washi-200 text-sumi'
              }`}
            >
              {showTatamiDetails ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

