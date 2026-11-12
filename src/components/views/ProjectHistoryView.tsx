/**
 * SENSORY JAPAN — Project History & Version Management View
 */

import React, { useEffect, useState } from 'react';
import { useProjectStore, ProjectSummary } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import {
  History,
  FolderOpen,
  Copy,
  Trash2,
  FileDown,
  Clock,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const ProjectHistoryView: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const loadProjectFromStorage = useProjectStore((s) => s.loadProjectFromStorage);
  const deleteSavedProject = useProjectStore((s) => s.deleteSavedProject);
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const setCurrentView = useUIStore((s) => s.setCurrentView);

  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);

  const refreshList = () => {
    try {
      const raw = localStorage.getItem('sensory_japan_projects_list') || localStorage.getItem('landsense_japan_projects_list');
      if (raw) {
        setProjectList(JSON.parse(raw));
      } else {
        // Fallback with current project
        setProjectList([
          {
            id: project.id,
            name: project.name,
            location: project.location,
            updatedAt: project.updatedAt,
            floorCount: project.floors.length,
            totalFloorAreaSqm: 115,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleOpen = (id: string) => {
    const success = loadProjectFromStorage(id);
    if (success) {
      setCurrentView('floor_planner');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_cad.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-washi-100 p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="border-b border-washi-400/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-hinoki-dark font-semibold">
            設計履歴 & バージョン管理
          </span>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-sumi flex items-center gap-2">
            <History className="w-6 h-6 text-hinoki-dark" />
            保存済みプロジェクト一覧
          </h1>
          <p className="text-xs text-sumi-100 mt-1">
            ローカルストレージ（ブラウザ永続化）による設計データの保存・復元・複製およびJSONバックアップ
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-washi-50 hover:bg-white text-sumi text-xs font-semibold rounded-lg border border-washi-400/50 shadow-subtle flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <FileDown className="w-4 h-4 text-hinoki-dark" />
          <span>現プロジェクトをJSONエクスポート</span>
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="space-y-3">
        {projectList.map((item) => {
          const isCurrent = item.id === project.id;

          return (
            <div
              key={item.id}
              className={`p-4 md:p-5 rounded-xl border transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isCurrent
                  ? 'border-hinoki ring-1 ring-hinoki/30 shadow-subtle'
                  : 'border-washi-400/40 hover:border-washi-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-sumi">{item.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      編集中
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sumi-100 font-mono">
                  <span>場所: {item.location}</span>
                  <span>階数: {item.floorCount}階建て</span>
                  <span>延床面積: {item.totalFloorAreaSqm}㎡</span>
                  <span className="flex items-center gap-1 text-sumi-50">
                    <Clock className="w-3.5 h-3.5" />
                    更新: {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end md:self-auto">
                <button
                  onClick={() => handleOpen(item.id)}
                  className="px-3.5 py-1.5 bg-hinoki hover:bg-hinoki-dark text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>開く</span>
                </button>

                <button
                  onClick={duplicateProject}
                  className="p-2 text-sumi-100 hover:text-sumi hover:bg-washi-100 rounded-lg border border-washi-400/40 transition-colors"
                  title="プロジェクトを複製"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {!isCurrent && (
                  <button
                    onClick={() => {
                      deleteSavedProject(item.id);
                      refreshList();
                    }}
                    className="p-2 text-sumi-100 hover:text-bengala hover:bg-rose-50 rounded-lg border border-washi-400/40 transition-colors"
                    title="プロジェクトを削除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

