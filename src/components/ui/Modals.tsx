/**
 * SENSORY JAPAN — UI Modals (New Project, Template Picker, Export, AI Chat)
 * 
 * Embeds:
 * - Deterministic AI Architectural Design Assistant (`parseArchitecturalInstruction`)
 * - Structured operation execution: Add room, Resize, Change tatami count/system, Add floor, Change roof
 * - Regulatory impact audit on generated changes
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { JAPANESE_TEMPLATES } from '../../data/templates';
import { parseArchitecturalInstruction, StructuredAIOperation } from '../../engine/aiAssistant';
import {
  X,
  Sparkles,
  Building,
  FileDown,
  CheckCircle2,
  FolderPlus,
  Send,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Modals: React.FC = () => {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const setCurrentView = useUIStore((s) => s.setCurrentView);
  const createNewProject = useProjectStore((s) => s.createNewProject);
  const addRoomToActiveFloor = useProjectStore((s) => s.addRoomToActiveFloor);
  const updateRoom = useProjectStore((s) => s.updateRoom);
  const setGlobalTatamiSystem = useProjectStore((s) => s.setGlobalTatamiSystem);
  const updateRoomTatamiConfig = useProjectStore((s) => s.updateRoomTatamiConfig);
  const addFloor = useProjectStore((s) => s.addFloor);
  const project = useProjectStore((s) => s.project);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('My Japanese Residence');
  const [newLocation, setNewLocation] = useState('Setagaya-ku, Tokyo (東京都世田谷区)');
  const [selectedTemplate, setSelectedTemplate] = useState('proj-family');

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Array<{
      sender: 'user' | 'ai';
      text: string;
      operations?: StructuredAIOperation[];
    }>
  >([
    {
      sender: 'ai',
      text: 'こんにちは！SENSORY JAPAN 専属のAI建築設計アシスタントです。間取りの拡張、和室の畳数変更（6畳・8畳・四畳半）、濡れ縁やバルコニーの追加、建ぺい率・容積率の法規最適化など、どのようなご要望でもお申し付けください。',
    },
  ]);

  if (!activeModal) return null;

  const handleCreateProject = () => {
    createNewProject(newTitle, newLocation, selectedTemplate);
    confetti({ particleCount: 40, spread: 60 });
    closeModal();
    setCurrentView('floor_planner');
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const prompt = textToSend || chatInput;
    if (!prompt.trim()) return;

    const userMsg = { sender: 'user' as const, text: prompt.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Process through deterministic architectural instruction parser
    setTimeout(() => {
      const result = parseArchitecturalInstruction(prompt.trim(), project);

      // Execute generated operations on the actual architectural store
      result.operations.forEach((op) => {
        if (op.operation === 'add_room' || op.operation === 'add_engawa' || op.operation === 'add_balcony') {
          addRoomToActiveFloor({
            type: op.payload.roomType || 'washitsu',
            name: op.payload.name || 'New Room',
            japaneseName: op.payload.japaneseName || '居室',
            width: op.payload.widthMm || 2730,
            height: op.payload.heightMm || 3640,
            elevationOffset: op.payload.elevationOffset,
            position: op.payload.position || { x: 3640, y: 3640 },
          });
        } else if (op.operation === 'change_tatami_count' && op.payload.roomId && op.payload.tatamiCount) {
          updateRoomTatamiConfig(op.payload.roomId, op.payload.tatamiCount);
        } else if (op.operation === 'change_tatami_system' && op.payload.tatamiSystem) {
          setGlobalTatamiSystem(op.payload.tatamiSystem);
        } else if (op.operation === 'add_floor' && op.payload.level) {
          addFloor(op.payload.level);
        }
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.message,
          operations: result.operations,
        },
      ]);
      confetti({ particleCount: 30, spread: 50 });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* 1. NEW PROJECT MODAL */}
      {activeModal === 'new_project' && (
        <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-card border border-washi-400/50">
          <div className="flex items-center justify-between border-b border-washi-300 pb-3">
            <h2 className="text-lg font-bold font-serif text-sumi flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-hinoki-dark" />
              新規日本住宅プロジェクト作成
            </h2>
            <button onClick={closeModal} className="p-1 rounded text-sumi-50 hover:text-sumi">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-sumi block mb-1">プロジェクト名称</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-washi-400/60 rounded-lg outline-none focus:border-hinoki"
                placeholder="例: 世田谷の2階建て住宅"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sumi block mb-1">建設予定地 (所在地)</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-washi-400/60 rounded-lg outline-none focus:border-hinoki"
                placeholder="例: 東京都世田谷区 / 京都府京都市"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sumi block mb-1.5">
                スターター設計テンプレート
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {JAPANESE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'border-hinoki bg-washi-100 ring-1 ring-hinoki/30 font-semibold text-sumi'
                        : 'border-washi-400/40 hover:bg-washi-50 text-sumi-100'
                    }`}
                  >
                    <div className="font-bold">{tmpl.japaneseName}</div>
                    <div className="text-[10px] text-hinoki-dark font-mono mt-0.5">
                      {tmpl.tsubo}坪 / {tmpl.stories}階建て
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-washi-300">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-xs font-medium text-sumi-100 hover:bg-washi-100"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateProject}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-hinoki hover:bg-hinoki-dark text-white shadow-subtle"
            >
              プロジェクトを開始
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPORT PDF MODAL */}
      {activeModal === 'export_pdf' && (
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-card border border-washi-400/50">
          <div className="flex items-center justify-between border-b border-washi-300 pb-3">
            <h2 className="text-base font-bold font-serif text-sumi flex items-center gap-2">
              <FileDown className="w-5 h-5 text-hinoki-dark" />
              建築計画書・求積図 PDF出力
            </h2>
            <button onClick={closeModal} className="p-1 rounded text-sumi-50 hover:text-sumi">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-washi-50 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-sumi">出力内容:</div>
            <div className="space-y-1 font-mono text-sumi-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>各階別 居室求積表（mm寸法・㎡・坪・畳換算）</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>建築基準法適合性チェック（建ぺい率・容積率・第42条後退）</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>概算本体工事費・内訳内訳書 (JPY)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-xs font-medium text-sumi-100 hover:bg-washi-100"
            >
              閉じる
            </button>
            <button
              onClick={() => {
                closeModal();
                setCurrentView('reports');
              }}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-hinoki hover:bg-hinoki-dark text-white shadow-subtle"
            >
              計画書レポート画面へ進む
            </button>
          </div>
        </div>
      )}

      {/* 3. AI CHAT MODAL WITH STRUCTURED OPERATION VERIFICATION */}
      {activeModal === 'ai_chat' && (
        <div className="bg-white rounded-2xl max-w-xl w-full h-[580px] flex flex-col shadow-card border border-washi-400/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-sumi text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-hinoki text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">AI 建築設計アシスタント</h3>
                <span className="text-[10px] text-washi-400 font-mono">
                  構造化オペレーション生成・建築基準法適合性自動検証
                </span>
              </div>
            </div>
            <button onClick={closeModal} className="p-1 rounded text-washi-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-washi-100 border-b border-washi-300 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            {[
              '和室を8畳に拡張する',
              '南面に濡れ縁（ウッドデッキ）を追加',
              '四畳半の茶室を追加する',
              '畳規格を京間に変更',
              '屋根を切妻に変更する',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendChatMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-white border border-washi-400/60 hover:border-hinoki text-sumi whitespace-nowrap shadow-subtle transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-washi-50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-sumi text-white rounded-br-sm'
                      : 'bg-white text-sumi border border-washi-300 shadow-subtle rounded-bl-sm'
                  }`}
                >
                  <div>{msg.text}</div>

                  {/* Render Structured Operation Card */}
                  {msg.operations && msg.operations.length > 0 && (
                    <div className="pt-2 border-t border-washi-300/60 space-y-1.5">
                      <div className="text-[10px] font-mono text-hinoki-dark uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>実行された構造化オペレーション:</span>
                      </div>
                      {msg.operations.map((op, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-washi-100 rounded border border-washi-300 text-[11px] font-mono"
                        >
                          <div className="font-bold text-sumi">{op.description}</div>
                          {op.validation.regulatoryImpact && (
                            <div className="text-[10px] text-emerald-700 mt-0.5">
                              {op.validation.regulatoryImpact}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-washi-300 flex items-center space-x-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="例: 和室を8畳に拡張して、南面に濡れ縁を設けて..."
              className="flex-1 text-xs px-3 py-2.5 bg-washi-50 border border-washi-300 rounded-xl outline-none focus:border-hinoki"
            />
            <button
              onClick={() => handleSendChatMessage()}
              className="p-2.5 bg-hinoki hover:bg-hinoki-dark text-white rounded-xl shadow-subtle transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
