/**
 * SENSORY JAPAN — Main Application Navigation
 * 
 * Provides primary navigation across all 9 core architectural modules:
 * 1. Dashboard (プロジェクト概要)
 * 2. New Project (新規作成)
 * 3. Site Analysis (敷地分析・日影)
 * 4. Floor Planner (2D間取りエディタ)
 * 5. 3D Designer (3D外観・内観 - Part 2)
 * 6. Compliance (建築基準法・建ぺい率・容積率)
 * 7. Project History (設計履歴・版管理)
 * 8. Reports (建築確認申請・計画書出力)
 * 9. Settings (環境設定・モジュール規格)
 */

import React from 'react';
import { useUIStore, NavigationView } from '../../store/uiStore';
import {
  LayoutDashboard,
  FilePlus,
  Compass,
  PenTool,
  Box,
  ShieldCheck,
  History,
  FileText,
  Settings,
  Sparkles,
} from 'lucide-react';

export const MainNavigation: React.FC = () => {
  const currentView = useUIStore((s) => s.currentView);
  const setCurrentView = useUIStore((s) => s.setCurrentView);
  const openModal = useUIStore((s) => s.openModal);

  const navItems: Array<{
    id: NavigationView;
    label: string;
    japaneseLabel: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      japaneseLabel: 'ダッシュボード',
      icon: LayoutDashboard,
    },
    {
      id: 'new_project',
      label: 'New Project',
      japaneseLabel: '新規プロジェクト',
      icon: FilePlus,
    },
    {
      id: 'site_analysis',
      label: 'Site Analysis',
      japaneseLabel: '敷地分析・日影',
      icon: Compass,
    },
    {
      id: 'floor_planner',
      label: 'Floor Planner',
      japaneseLabel: '2D間取りエディタ',
      icon: PenTool,
    },
    {
      id: 'designer_3d',
      label: '3D Designer',
      japaneseLabel: '3D外観・空間',
      icon: Box,
      badge: 'Part 2',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      japaneseLabel: '建築基準法診断',
      icon: ShieldCheck,
    },
    {
      id: 'history',
      label: 'Project History',
      japaneseLabel: '設計履歴・版管理',
      icon: History,
    },
    {
      id: 'reports',
      label: 'Reports & PDF',
      japaneseLabel: '建築計画書出力',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Settings',
      japaneseLabel: '環境設定・尺貫法',
      icon: Settings,
    },
  ];

  return (
    <nav className="w-16 bg-washi-200/80 border-r border-washi-400/40 flex flex-col items-center py-3 select-none shrink-0 shadow-subtle z-20">
      {/* Top App Icon */}
      <div className="w-9 h-9 rounded-lg bg-sumi text-washi-50 flex items-center justify-center font-serif font-bold text-sm mb-4 shadow-subtle">
        和
      </div>

      {/* Nav List */}
      <div className="flex-1 space-y-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'new_project') {
                  openModal('new_project');
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full py-2.5 rounded-lg flex flex-col items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-washi-50 text-hinoki-dark shadow-subtle border border-hinoki/30'
                  : 'text-sumi-100 hover:text-sumi hover:bg-washi-100/70'
              }`}
              title={`${item.japaneseLabel} (${item.label})`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-sans font-medium text-center leading-none scale-90 truncate max-w-full">
                {item.japaneseLabel.slice(0, 4)}
              </span>

              {item.badge && (
                <span className="absolute -top-1 -right-1 text-[8px] font-mono bg-hinoki text-white px-1 rounded-full scale-75">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-sumi text-white text-xs rounded shadow-dropdown whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
                <div className="font-semibold">{item.japaneseLabel}</div>
                <div className="text-[10px] text-sumi-50 font-mono">{item.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Assistant Quick Trigger */}
      <button
        onClick={() => openModal('ai_chat')}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-hinoki to-hinoki-dark text-white flex items-center justify-center shadow-subtle hover:scale-105 transition-transform"
        title="AI 建築設計アシスタント"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </nav>
  );
};

