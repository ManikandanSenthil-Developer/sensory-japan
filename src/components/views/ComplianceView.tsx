/**
 * SENSORY JAPAN — Building Standards Act (BSL / 建築基準法) Compliance View
 * 
 * Modular rule-based compliance validator citing authoritative Japanese statutes:
 * - Building Standards Act (建築基準法 - Act No. 201 of 1950)
 * - Building Standards Act Enforcement Order (建築基準法施行令 - Cabinet Order No. 338 of 1950)
 * - Article 21 Ceiling Height 2.1m rule (令第21条 居室天井高基準)
 * - Article 53 Kenpeiritsu (法第53条 建ぺい率)
 * - Article 52 Yosekiritsu (法第52条 容積率 & 道路幅員低減)
 * - Article 42 Paragraph 2 Setback (法第42条第2項 みなし道路後退)
 * - Article 43 Road Frontage (法第43条 接道義務 2m以上)
 * - Article 28 Daylighting (法第28条 居室有効採光 1/7以上)
 * - Article 23 Stair Dimensions (令第23条 階段 蹴上23cm以下・踏面15cm以上)
 * - Article 55 Absolute Height Limit (法第55条 第一種低層住居専用地域 10m制限)
 * 
 * Transparent Legal Status:
 * GREEN: Passed known applicable check
 * AMBER: Requires further municipal inquiry or professional review
 * RED: Failed known mandatory statutory requirement
 * GREY: Not evaluated / Exempt
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { evaluateAllRegulations, RuleEvaluationResult } from '../../engine/regulations';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sun,
  Scale,
  Sparkles,
  Building,
  ExternalLink,
  Info,
  HelpCircle,
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const evaluatedRules: RuleEvaluationResult[] = evaluateAllRegulations(project);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pass' | 'warn' | 'fail'>('all');

  const passCount = evaluatedRules.filter((r) => r.status === 'pass').length;
  const warnCount = evaluatedRules.filter((r) => r.status === 'warn').length;
  const failCount = evaluatedRules.filter((r) => r.status === 'fail').length;

  const filteredRules = evaluatedRules.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-washi-100 p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-washi-400/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-700 font-semibold">
            建築確認申請 事前適合性チェック（建築基準法・政令・告示）
          </span>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-sumi flex items-center gap-2 mt-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            建築基準法 体系的法規監査エンジン
          </h1>
          <p className="text-xs text-sumi-100 mt-1">
            建ぺい率・容積率・居室天井高2.1m・2項道路後退・接道義務・採光比率1/7・階段寸法・10m絶対高さ制限の自動照合
          </p>
        </div>

        {/* STATUS COUNTER BADGES */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-sumi text-white border-sumi'
                : 'bg-white text-sumi border-washi-400/50 hover:bg-washi-50'
            }`}
          >
            全{evaluatedRules.length}項目
          </button>
          <button
            onClick={() => setSelectedFilter('pass')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'pass'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>適合 {passCount}</span>
          </button>
          {warnCount > 0 && (
            <button
              onClick={() => setSelectedFilter('warn')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 ${
                selectedFilter === 'warn'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>要確認 {warnCount}</span>
            </button>
          )}
          {failCount > 0 && (
            <button
              onClick={() => setSelectedFilter('fail')}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 ${
                selectedFilter === 'fail'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>不適合 {failCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* TRANSPARENT LEGAL DISCLAIMER BANNER */}
      <div className="p-3.5 bg-washi-200/80 rounded-xl border border-washi-400/50 text-xs text-sumi-200 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-hinoki-dark shrink-0 mt-0.5" />
        <div>
          <strong className="text-sumi block">【法規判定に関する注意事項・法的免責事項】</strong>
          本システムによる法規診断は、入力された設計データおよび建築基準法体系に基づく事前自動計算です。
          本結果をもって特定行政庁または指定確認検査機関の建築確認済証の交付を保証するものではありません。
          最終的な申請図面の検証および自治体固有の建築安全条例・風致地区条例等の照合は、必ず有資格者（一級建築士・二級建築士）へご依頼ください。
        </div>
      </div>

      {/* RULE DETAILS CARDS */}
      <div className="space-y-4">
        {filteredRules.map(({ rule, status, actualValue, thresholdValue, explanation, affectedComponents, recommendation }) => {
          let statusBadge = (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              法規適合 (PASS)
            </span>
          );
          if (status === 'warn') {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                要専門家確認 (REVIEW)
              </span>
            );
          } else if (status === 'fail') {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                基準不適合 (FAIL)
              </span>
            );
          }

          return (
            <div
              key={rule.ruleId}
              className={`p-5 rounded-xl border bg-white shadow-subtle transition-all space-y-3 ${
                status === 'fail'
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : status === 'warn'
                  ? 'border-amber-300'
                  : 'border-washi-400/40 hover:border-washi-400'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-washi-300/40 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-washi-200 text-sumi-200 font-bold">
                      {rule.articleNumber}
                    </span>
                    <span className="text-xs text-sumi-50 font-mono">ID: {rule.ruleId}</span>
                  </div>
                  <h3 className="text-sm font-bold text-sumi mt-1">
                    {rule.japaneseName}
                  </h3>
                  <div className="text-[11px] text-hinoki-dark font-mono font-medium">
                    {rule.legalReference}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                  {statusBadge}
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-sumi-50 hover:text-hinoki-dark transition-colors"
                    title="e-Gov法令検索 条文を開く"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Legal Description */}
              <p className="text-xs text-sumi-100 leading-relaxed font-sans">
                {rule.description}
              </p>

              {/* Metric Values Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-washi-50 rounded-lg font-mono text-xs">
                <div>
                  <span className="text-[10px] text-sumi-50 block font-sans">計画値 (Actual)</span>
                  <strong className="text-sumi text-sm">{actualValue}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-sumi-50 block font-sans">法定基準 (Statutory Cap / Threshold)</span>
                  <strong className="text-sumi text-sm">{thresholdValue}</strong>
                </div>
              </div>

              {/* Detailed Explanation & Corrective Guidance */}
              <div className="space-y-1.5 text-xs">
                <div className="text-sumi leading-relaxed">
                  <span className="font-semibold text-sumi-200">診断結果: </span>
                  {explanation}
                </div>
                {recommendation && (
                  <div className="text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/60 leading-relaxed">
                    <span className="font-semibold">是正方針・設計指針: </span>
                    {recommendation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
