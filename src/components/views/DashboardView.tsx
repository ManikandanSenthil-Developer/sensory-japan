/**
 * SENSORY JAPAN — Project Dashboard View
 */

import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { JAPANESE_TEMPLATES } from '../../data/templates';
import { auditProjectCompliance } from '../../engine/compliance';
import { estimateProjectCost } from '../../engine/costEstimator';
import {
  PenTool,
  ShieldCheck,
  Compass,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Coins,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const loadTemplate = useProjectStore((s) => s.loadTemplate);
  const setCurrentView = useUIStore((s) => s.setCurrentView);
  const openModal = useUIStore((s) => s.openModal);

  const compliance = auditProjectCompliance(project);
  const cost = estimateProjectCost(project);

  return (
    <div className="flex-1 overflow-y-auto bg-washi-100 p-6 md:p-8 space-y-6">
      {/* HERO BANNER */}
      <div className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-sumi to-sumi-200 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-hinoki text-white font-semibold">
              建築基準法 適合設計
            </span>
            <span className="text-xs text-washi-400 font-mono">
              規格: {project.tatamiSystem.toUpperCase()} (京間/中京間/江戸間/団地間)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-washi-300 leading-relaxed font-sans">
            所在地: {project.location}・敷地面積 {project.plot.areaSqMeters}㎡ ({(project.plot.areaSqMeters * 0.3025).toFixed(1)}坪)・
            建ぺい率 {compliance.bcr.proposedPercent.toFixed(1)}% / 容積率 {compliance.far.proposedPercent.toFixed(1)}%
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentView('floor_planner')}
            className="px-5 py-2.5 bg-hinoki hover:bg-hinoki-dark text-white rounded-lg text-sm font-semibold transition-all shadow-subtle flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            <span>2D間取りエディタを開く</span>
          </button>
          <button
            onClick={() => openModal('new_project')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all border border-white/20"
          >
            新規プロジェクト
          </button>
        </div>
      </div>

      {/* QUICK STATS TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Floor Area */}
        <div className="p-4 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-sumi-50 font-mono">
            <span>延床面積 (Total Area)</span>
            <Building2 className="w-4 h-4 text-hinoki-dark" />
          </div>
          <div className="text-2xl font-bold font-mono text-sumi">
            {compliance.far.totalFloorAreaSqm.toFixed(1)} <span className="text-sm font-normal">㎡</span>
          </div>
          <div className="text-xs text-sumi-100 font-mono">
            {(compliance.far.totalFloorAreaSqm * 0.3025).toFixed(1)} 坪 / 全{project.floors.length}階
          </div>
        </div>

        {/* BCR */}
        <div className="p-4 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-sumi-50 font-mono">
            <span>建ぺい率 (BCR)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-sumi">
            {compliance.bcr.proposedPercent.toFixed(1)} <span className="text-sm font-normal">%</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            法定上限 {compliance.bcr.legalMaxPercent}% ({compliance.bcr.isCompliant ? '適合' : '超過'})
          </div>
        </div>

        {/* FAR */}
        <div className="p-4 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-sumi-50 font-mono">
            <span>容積率 (FAR)</span>
            <TrendingUp className="w-4 h-4 text-aizome" />
          </div>
          <div className="text-2xl font-bold font-mono text-sumi">
            {compliance.far.proposedPercent.toFixed(1)} <span className="text-sm font-normal">%</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium">
            法定上限 {compliance.far.appliedMaxFarPercent}% (適合)
          </div>
        </div>

        {/* Cost */}
        <div className="p-4 bg-white rounded-xl border border-washi-400/40 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-sumi-50 font-mono">
            <span>想定建築費 (JPY)</span>
            <Coins className="w-4 h-4 text-hinoki-dark" />
          </div>
          <div className="text-xl font-bold font-mono text-sumi">
            {cost.formattedAverage}
          </div>
          <div className="text-xs text-sumi-50 font-mono">
            坪単価 約{(cost.baseTsuboTankaJpy / 10000).toFixed(0)}万円
          </div>
        </div>
      </div>

      {/* CORE WORKFLOW MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCurrentView('floor_planner')}
          className="p-5 bg-white rounded-xl border border-washi-400/40 hover:border-hinoki/60 cursor-pointer shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-hinoki-50 text-hinoki-dark flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-sumi group-hover:text-hinoki-dark transition-colors">
            2D 間取りエディタ (CAD)
          </h3>
          <p className="text-xs text-sumi-100 mt-1 leading-relaxed">
            910mm尺モジュールスナップ、和室畳の祝儀敷き自動配置、寸法線表示、複数階管理を備えた本格製図キャンバス。
          </p>
          <div className="mt-3 flex items-center text-xs text-hinoki-dark font-semibold">
            エディタを起動 <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        <div
          onClick={() => setCurrentView('site_analysis')}
          className="p-5 bg-white rounded-xl border border-washi-400/40 hover:border-hinoki/60 cursor-pointer shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-aizome flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-sumi group-hover:text-aizome transition-colors">
            敷地・道路・日影分析
          </h3>
          <p className="text-xs text-sumi-100 mt-1 leading-relaxed">
            敷地間口・奥行き、前面道路幅員、第42条2項道路後退、真北方位角、南向き採光・日照条件の自動シミュレーション。
          </p>
          <div className="mt-3 flex items-center text-xs text-aizome font-semibold">
            敷地分析を開く <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        <div
          onClick={() => setCurrentView('compliance')}
          className="p-5 bg-white rounded-xl border border-washi-400/40 hover:border-hinoki/60 cursor-pointer shadow-subtle hover:shadow-card transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-sumi group-hover:text-emerald-700 transition-colors">
            建築基準法 適合性診断
          </h3>
          <p className="text-xs text-sumi-100 mt-1 leading-relaxed">
            用途地域ごとの建ぺい率・容積率上限、道路斜線制限、居室採光・換気計算、ZEH省エネ住宅基準のリアルタイム監査。
          </p>
          <div className="mt-3 flex items-center text-xs text-emerald-700 font-semibold">
            法規診断を確認 <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* JAPANESE RESIDENTIAL TEMPLATES CAROUSEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-sumi flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hinoki-dark" />
              日本の代表的住宅プラン（即時編集可能）
            </h2>
            <p className="text-xs text-sumi-100">
              日本の風土・都市規制に最適化された8種類の建築プランをワンクリックで読み込み
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {JAPANESE_TEMPLATES.slice(0, 4).map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                loadTemplate(tmpl.id);
                setCurrentView('floor_planner');
              }}
              className="p-4 bg-white rounded-xl border border-washi-400/40 hover:border-hinoki/60 cursor-pointer shadow-subtle hover:shadow-card transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-washi-200 text-sumi">
                  {tmpl.category}
                </span>
                <span className="text-xs font-mono font-bold text-hinoki-dark">
                  {tmpl.tsubo}坪
                </span>
              </div>
              <h4 className="text-sm font-bold text-sumi group-hover:text-hinoki-dark transition-colors">
                {tmpl.japaneseName}
              </h4>
              <p className="text-xs text-sumi-100 line-clamp-2 leading-relaxed">
                {tmpl.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-hinoki-dark font-medium border-t border-washi-400/20">
                <span>{tmpl.stories}階建て・延床 {tmpl.totalFloorAreaSqm}㎡</span>
                <span>編集 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

