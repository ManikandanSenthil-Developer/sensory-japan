/**
 * SENSORY JAPAN — Architectural Reports & PDF Dossier Generator
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { auditProjectCompliance } from '../../engine/compliance';
import { estimateProjectCost } from '../../engine/costEstimator';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Download,
  Building,
  CheckCircle2,
  Printer,
  Sparkles,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const compliance = auditProjectCompliance(project);
  const cost = estimateProjectCost(project);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Cover / Header
      doc.setFillColor(30, 34, 33);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('SENSORY JAPAN - ARCHITECTURAL DOSSIER', 15, 18);
      doc.setFontSize(10);
      doc.text('Japanese Residential Planning Report & Building Standards Compliance', 15, 26);

      // Project Meta
      doc.setTextColor(30, 34, 33);
      doc.setFontSize(14);
      doc.text(`Project: ${project.name}`, 15, 48);
      doc.setFontSize(10);
      doc.text(`Location: ${project.location}`, 15, 55);
      doc.text(`Date: ${new Date().toLocaleDateString('ja-JP')} | Structure: Wooden Post & Beam`, 15, 62);
      doc.text(`Tatami Standard: ${project.tatamiSystem.toUpperCase()}`, 15, 69);

      // Section 1: Plot & Building Coverage
      doc.setFontSize(12);
      doc.setTextColor(201, 147, 91); // Hinoki
      doc.text('1. SITE & COMPLIANCE SUMMARY (Building Standards Act)', 15, 82);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.text(`- Plot Area: ${project.plot.areaSqMeters} m2 (${(project.plot.areaSqMeters * 0.3025).toFixed(1)} Tsubo)`, 15, 90);
      doc.text(`- Building Footprint: ${compliance.bcr.buildingFootprintSqm.toFixed(1)} m2`, 15, 96);
      doc.text(`- Total Gross Floor Area: ${compliance.far.totalFloorAreaSqm.toFixed(1)} m2 (${(compliance.far.totalFloorAreaSqm * 0.3025).toFixed(1)} Tsubo)`, 15, 102);
      doc.text(`- Building Coverage Ratio (BCR): ${compliance.bcr.proposedPercent.toFixed(1)}% (Legal Cap: ${compliance.bcr.legalMaxPercent}%) - ${compliance.bcr.isCompliant ? 'PASS' : 'FAIL'}`, 15, 108);
      doc.text(`- Floor Area Ratio (FAR): ${compliance.far.proposedPercent.toFixed(1)}% (Legal Cap: ${compliance.far.appliedMaxFarPercent}%) - ${compliance.far.isCompliant ? 'PASS' : 'FAIL'}`, 15, 114);
      doc.text(`- Road Width: ${(project.plot.roadWidth / 1000).toFixed(1)}m | Article 42 Setback: ${compliance.roadSetback.requiresSetback ? (compliance.roadSetback.setbackDistanceMm / 1000).toFixed(2) + 'm required' : 'Exempt'}`, 15, 120);

      // Section 2: Room Schedule
      doc.setFontSize(12);
      doc.setTextColor(201, 147, 91);
      doc.text('2. ROOM SCHEDULE & DIMENSIONS', 15, 134);

      let curY = 142;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Floor', 15, curY);
      doc.text('Room Name', 35, curY);
      doc.text('Dimensions (mm)', 95, curY);
      doc.text('Area (m2)', 140, curY);
      doc.text('Tatami (Jo)', 175, curY);

      doc.setDrawColor(200, 200, 200);
      doc.line(15, curY + 2, 195, curY + 2);
      curY += 7;

      doc.setTextColor(30, 34, 33);
      for (const floor of project.floors) {
        for (const room of floor.rooms) {
          if (curY > 260) {
            doc.addPage();
            curY = 20;
          }
          const sqm = (room.width * room.height) / 1_000_000;
          const jo = (sqm / 1.62).toFixed(1);
          doc.text(floor.level, 15, curY);
          doc.text(room.name, 35, curY);
          doc.text(`${room.width} x ${room.height}`, 95, curY);
          doc.text(`${sqm.toFixed(1)} m2`, 140, curY);
          doc.text(`${jo} jo`, 175, curY);
          curY += 6;
        }
      }

      // Section 3: Cost Estimation
      if (curY > 240) {
        doc.addPage();
        curY = 25;
      } else {
        curY += 8;
      }

      doc.setFontSize(12);
      doc.setTextColor(201, 147, 91);
      doc.text('3. PRELIMINARY COST ESTIMATION (JPY)', 15, curY);
      curY += 8;

      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`- Estimated Average Total: ${cost.formattedAverage}`, 15, curY);
      curY += 6;
      doc.text(`- Expected Range: ${cost.formattedRange}`, 15, curY);
      curY += 6;
      doc.text(`- Base Tsubo Unit Price: Approx. ¥${(cost.baseTsuboTankaJpy / 10000).toFixed(0)} Man-yen / Tsubo`, 15, curY);

      doc.save(`${project.name.replace(/\s+/g, '_')}_Dossier.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-washi-100 p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-washi-400/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-hinoki-dark font-semibold">
            設計計画書・建築確認申請ドキュメント
          </span>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-sumi flex items-center gap-2">
            <FileText className="w-6 h-6 text-hinoki-dark" />
            建築計画書 & PDF出力
          </h1>
          <p className="text-xs text-sumi-100 mt-1">
            建築基準法適合性チェック、部屋別求積表、および概算工事費を含めた公式提出用PDFレポート
          </p>
        </div>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-hinoki hover:bg-hinoki-dark text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'PDF生成中...' : '計画書PDFをダウンロード'}</span>
        </button>
      </div>

      {/* REPORT DOSSIER PREVIEW */}
      <div className="bg-white p-6 md:p-10 rounded-xl border border-washi-400/50 shadow-card max-w-4xl mx-auto space-y-8 font-sans">
        {/* Title Block */}
        <div className="border-b-2 border-sumi pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs font-mono text-hinoki-dark font-bold">
              SENSORY JAPAN ARCHITECTURAL DOSSIER
            </span>
            <h2 className="text-2xl font-serif font-bold text-sumi mt-1">{project.name}</h2>
            <p className="text-xs text-sumi-100 mt-1">
              所在地: {project.location} | 設計日: {new Date().toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-sumi-100">
            <div>規格: 尺モジュール (910mm)</div>
            <div>畳体系: {project.tatamiSystem.toUpperCase()}</div>
          </div>
        </div>

        {/* Section 1: Plot & Law */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sumi border-b border-washi-300 pb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-hinoki-dark" />
            1. 敷地概要 & 建築基準法 適合性確認
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-washi-50 rounded border border-washi-300/40">
              <span className="text-[10px] text-sumi-50 block">敷地面積</span>
              <strong className="text-sumi text-sm">{project.plot.areaSqMeters}㎡</strong>
              <div className="text-[10px] text-sumi-100">{(project.plot.areaSqMeters * 0.3025).toFixed(1)}坪</div>
            </div>
            <div className="p-3 bg-washi-50 rounded border border-washi-300/40">
              <span className="text-[10px] text-sumi-50 block">建築面積 (建ぺい率)</span>
              <strong className="text-sumi text-sm">{compliance.bcr.proposedPercent.toFixed(1)}%</strong>
              <div className="text-[10px] text-emerald-700">上限 {compliance.bcr.legalMaxPercent}% (適合)</div>
            </div>
            <div className="p-3 bg-washi-50 rounded border border-washi-300/40">
              <span className="text-[10px] text-sumi-50 block">延床面積 (容積率)</span>
              <strong className="text-sumi text-sm">{compliance.far.proposedPercent.toFixed(1)}%</strong>
              <div className="text-[10px] text-emerald-700">上限 {compliance.far.appliedMaxFarPercent}% (適合)</div>
            </div>
            <div className="p-3 bg-washi-50 rounded border border-washi-300/40">
              <span className="text-[10px] text-sumi-50 block">前面道路幅員</span>
              <strong className="text-sumi text-sm">{(project.plot.roadWidth / 1000).toFixed(1)}m</strong>
              <div className="text-[10px] text-sumi-100">{compliance.roadSetback.requiresSetback ? '要後退' : '後退不要'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Room Schedule Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sumi border-b border-washi-300 pb-1.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-hinoki-dark" />
            2. 各階別 居室求積表 (Room Dimensions Schedule)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-washi-400/60 text-sumi-50 font-mono text-[11px]">
                  <th className="py-2">階</th>
                  <th className="py-2">部屋名称</th>
                  <th className="py-2">用途分類</th>
                  <th className="py-2 font-mono">寸法 (幅×奥行 mm)</th>
                  <th className="py-2 font-mono">床面積 (㎡)</th>
                  <th className="py-2 font-mono">坪数 (坪)</th>
                  <th className="py-2 font-mono">畳数 (畳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-washi-300/40 font-mono">
                {project.floors.flatMap((floor) =>
                  floor.rooms.map((room) => {
                    const sqm = (room.width * room.height) / 1_000_000;
                    return (
                      <tr key={room.id} className="hover:bg-washi-50">
                        <td className="py-2 font-bold text-sumi">{floor.level}</td>
                        <td className="py-2 font-sans font-medium text-sumi">{room.japaneseName || room.name}</td>
                        <td className="py-2 font-sans text-sumi-100">{room.type}</td>
                        <td className="py-2">{room.width} × {room.height}</td>
                        <td className="py-2 font-bold">{sqm.toFixed(2)}㎡</td>
                        <td className="py-2">{(sqm * 0.3025).toFixed(2)}坪</td>
                        <td className="py-2 text-tatami-dark font-bold">
                          {room.tatamiConfig ? room.tatamiConfig.matCount : (sqm / 1.62).toFixed(1)}畳
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Cost Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sumi border-b border-washi-300 pb-1.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-hinoki-dark" />
            3. 概算建築工事費 内訳表
          </h3>

          <div className="p-4 bg-washi-50 rounded-lg border border-washi-300/40 flex justify-between items-center font-mono">
            <div>
              <span className="text-xs text-sumi-50 block">想定本体平均建築費</span>
              <span className="text-xl font-bold text-sumi">{cost.formattedAverage}</span>
            </div>
            <div className="text-right text-xs text-sumi-100">
              <div>想定価格帯: {cost.formattedRange}</div>
              <div>坪単価換算: 約 {(cost.baseTsuboTankaJpy / 10000).toFixed(0)}万円 / 坪</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

