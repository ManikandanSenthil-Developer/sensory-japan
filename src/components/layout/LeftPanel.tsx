/**
 * SENSORY JAPAN — Left Architectural Library & Navigation Panel
 * 
 * Provides:
 * - Authentic Japanese room library (Washitsu, LDK, Genkan, Furo, Oshiire, etc.)
 * - Floor hierarchy list & vertical level manager
 * - 8 Japanese residential design templates selector
 * - Architectural elements & Japanese partitions (Fusuma, Shoji, Hikido)
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { JAPANESE_TEMPLATES } from '../../data/templates';
import { RoomType } from '../../types/architectural';
import {
  LayoutGrid,
  Layers,
  Sparkles,
  DoorOpen,
  Plus,
  Trash2,
  ChevronRight,
  Info,
} from 'lucide-react';

type LeftTab = 'rooms' | 'floors' | 'templates' | 'elements';

export const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeftTab>('rooms');
  const project = useProjectStore((s) => s.project);
  const activeFloor = project.floors.find((f) => f.id === project.activeFloorId) || project.floors[0];
  const setActiveFloor = useProjectStore((s) => s.setActiveFloor);
  const addRoomToActiveFloor = useProjectStore((s) => s.addRoomToActiveFloor);
  const deleteFloor = useProjectStore((s) => s.deleteFloor);
  const loadTemplate = useProjectStore((s) => s.loadTemplate);
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);

  if (!leftPanelOpen) return null;

  // Japanese Room Library definitions with authentic mm dimensions
  const roomPresets: Array<{
    category: string;
    items: Array<{
      type: RoomType;
      name: string;
      japaneseName: string;
      widthMm: number;
      heightMm: number;
      color: string;
      joCount?: number;
      elevationOffset?: number;
    }>;
  }> = [
    {
      category: '和室（畳空間）',
      items: [
        {
          type: 'washitsu',
          name: 'Washitsu (4.5-jo)',
          japaneseName: '和室 4.5畳（四畳半・茶室）',
          widthMm: 2730,
          heightMm: 2730,
          color: '#EBF1E4',
          joCount: 4.5,
          elevationOffset: 150,
        },
        {
          type: 'washitsu',
          name: 'Washitsu (6-jo)',
          japaneseName: '和室 6畳（祝儀敷き）',
          widthMm: 2730,
          heightMm: 3640,
          color: '#EBF1E4',
          joCount: 6,
          elevationOffset: 150,
        },
        {
          type: 'washitsu',
          name: 'Washitsu (8-jo)',
          japaneseName: '主和室 8畳（床の間付）',
          widthMm: 3640,
          heightMm: 3640,
          color: '#EBF1E4',
          joCount: 8,
          elevationOffset: 150,
        },
      ],
    },
    {
      category: 'LDK・居間・台所',
      items: [
        {
          type: 'living',
          name: 'LDK (16-jo)',
          japaneseName: '広々LDK（16畳）',
          widthMm: 5460,
          heightMm: 4550,
          color: '#F4EFE6',
        },
        {
          type: 'living',
          name: 'Living Room',
          japaneseName: 'リビング（居間 10畳）',
          widthMm: 3640,
          heightMm: 4550,
          color: '#F4EFE6',
        },
        {
          type: 'kitchen',
          name: 'Kitchen',
          japaneseName: 'システムキッチン',
          widthMm: 3640,
          heightMm: 2730,
          color: '#F4EFE6',
        },
        {
          type: 'dining',
          name: 'Dining Room',
          japaneseName: 'ダイニング（食事室）',
          widthMm: 3640,
          heightMm: 2730,
          color: '#F4EFE6',
        },
      ],
    },
    {
      category: '寝室・洋室',
      items: [
        {
          type: 'bedroom',
          name: 'Master Bedroom',
          japaneseName: '主寝室（8畳・洋室）',
          widthMm: 3640,
          heightMm: 3640,
          color: '#EDE8E0',
        },
        {
          type: 'bedroom',
          name: 'Western Bedroom (6-jo)',
          japaneseName: '洋室・子ども部屋（6畳）',
          widthMm: 2730,
          heightMm: 3640,
          color: '#EDE8E0',
        },
      ],
    },
    {
      category: '玄関・収納・水回り',
      items: [
        {
          type: 'genkan',
          name: 'Genkan Entrance',
          japaneseName: '玄関・式台・土間',
          widthMm: 1820,
          heightMm: 1820,
          color: '#D8D4CD',
        },
        {
          type: 'oshiire',
          name: 'Oshiire / Closet',
          japaneseName: '押入れ・大型収納',
          widthMm: 1820,
          heightMm: 910,
          color: '#E5DFD4',
        },
        {
          type: 'washroom',
          name: 'Washroom & Vanity',
          japaneseName: '洗面脱衣室',
          widthMm: 1820,
          heightMm: 1820,
          color: '#E5ECEF',
        },
        {
          type: 'bathroom',
          name: 'Unit Bath (UB 1616)',
          japaneseName: 'システムバス（1616型 1坪）',
          widthMm: 1820,
          heightMm: 1820,
          color: '#D4E2E6',
        },
        {
          type: 'toilet',
          name: 'Toilet',
          japaneseName: 'トイレ（手洗い付）',
          widthMm: 910,
          heightMm: 1820,
          color: '#E0E8E8',
        },
        {
          type: 'staircase',
          name: 'Staircase',
          japaneseName: '階段室（回り階段）',
          widthMm: 910,
          heightMm: 2730,
          color: '#E3DDD3',
        },
        {
          type: 'engawa',
          name: 'Engawa Veranda',
          japaneseName: '南面 濡れ縁・広縁',
          widthMm: 3640,
          heightMm: 910,
          color: '#DECDBE',
        },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-washi-50 border-r border-washi-400/40 flex flex-col h-full select-none shrink-0 shadow-subtle z-10">
      {/* Top Tabs */}
      <div className="flex border-b border-washi-400/40 bg-washi-100/60 p-1">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'rooms'
              ? 'bg-washi-50 text-sumi shadow-subtle font-semibold'
              : 'text-sumi-100 hover:text-sumi'
          }`}
          title="部屋ライブラリ"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>部屋</span>
        </button>
        <button
          onClick={() => setActiveTab('floors')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'floors'
              ? 'bg-washi-50 text-sumi shadow-subtle font-semibold'
              : 'text-sumi-100 hover:text-sumi'
          }`}
          title="フロア階層"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>フロア</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'templates'
              ? 'bg-washi-50 text-sumi shadow-subtle font-semibold'
              : 'text-sumi-100 hover:text-sumi'
          }`}
          title="日本住宅設計テンプレート"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>間取り</span>
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'elements'
              ? 'bg-washi-50 text-sumi shadow-subtle font-semibold'
              : 'text-sumi-100 hover:text-sumi'
          }`}
          title="建具・柱"
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>建具</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 1. ROOM LIBRARY */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="text-[11px] text-sumi-50 font-mono flex items-center justify-between">
              <span>追加先: <strong className="text-hinoki-dark">{activeFloor.name}</strong></span>
              <span>910mm規格</span>
            </div>

            {roomPresets.map((category) => (
              <div key={category.category} className="space-y-1.5">
                <h4 className="text-xs font-semibold text-sumi-200 tracking-wider">
                  {category.category}
                </h4>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <button
                      key={item.japaneseName}
                      onClick={() =>
                        addRoomToActiveFloor({
                          type: item.type,
                          name: item.name,
                          japaneseName: item.japaneseName,
                          width: item.widthMm,
                          height: item.heightMm,
                          color: item.color,
                          elevationOffset: item.elevationOffset,
                        })
                      }
                      className="w-full text-left p-2 rounded-md border border-washi-400/40 hover:border-hinoki/60 bg-washi-50 hover:bg-white transition-all flex items-center justify-between group shadow-subtle"
                    >
                      <div>
                        <div className="text-xs font-medium text-sumi group-hover:text-hinoki-dark">
                          {item.japaneseName}
                        </div>
                        <div className="text-[10px] text-sumi-50 font-mono">
                          {(item.widthMm / 1000).toFixed(2)}m × {(item.heightMm / 1000).toFixed(2)}m
                          {' '}({((item.widthMm * item.heightMm) / 1_000_000).toFixed(1)}㎡)
                        </div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-sumi-50 group-hover:text-hinoki-dark transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. FLOOR MANAGER */}
        {activeTab === 'floors' && (
          <div className="space-y-3">
            <div className="text-xs text-sumi-100 flex items-center justify-between">
              <span className="font-semibold">階層管理 (Multi-Floor)</span>
              <span className="text-[11px] text-sumi-50">全{project.floors.length}フロア</span>
            </div>

            <div className="space-y-2">
              {project.floors.map((floor) => {
                const isActive = floor.id === activeFloor.id;
                const totalAreaSqm = (
                  floor.rooms.reduce((acc, r) => acc + r.width * r.height, 0) / 1_000_000
                ).toFixed(1);

                return (
                  <div
                    key={floor.id}
                    onClick={() => setActiveFloor(floor.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white border-hinoki shadow-subtle ring-1 ring-hinoki/30'
                        : 'bg-washi-50 border-washi-400/40 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-sumi">
                        {floor.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        {project.floors.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFloor(floor.id);
                            }}
                            className="p-1 text-sumi-50 hover:text-bengala rounded"
                            title="このフロアを削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-sumi-50" />
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-sumi-100 font-mono">
                      <span>基準高: {floor.elevation}mm</span>
                      <span>天井高: {floor.ceilingHeight}mm</span>
                    </div>
                    <div className="mt-1 text-[11px] text-sumi-50 font-mono">
                      部屋数: {floor.rooms.length}室 ({totalAreaSqm}㎡)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. JAPANESE ARCHITECTURAL TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="text-xs text-sumi-100 flex items-center justify-between">
              <span className="font-semibold">日本住宅代表プラン (8種)</span>
              <span className="text-[11px] text-hinoki-dark">即時反映</span>
            </div>

            <div className="space-y-2">
              {JAPANESE_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => loadTemplate(tmpl.id)}
                  className="p-2.5 rounded-lg border border-washi-400/40 bg-washi-50 hover:bg-white hover:border-hinoki/60 cursor-pointer transition-all shadow-subtle group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-washi-200 text-sumi-100">
                        {tmpl.category}
                      </span>
                      <h4 className="text-xs font-semibold text-sumi mt-1 group-hover:text-hinoki-dark">
                        {tmpl.japaneseName}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-medium text-hinoki-dark">
                      {tmpl.tsubo}坪
                    </span>
                  </div>
                  <p className="text-[11px] text-sumi-100 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-sumi-50 font-mono">
                    <span>{tmpl.stories}階建て・延床 {tmpl.totalFloorAreaSqm}㎡</span>
                    <span className="text-hinoki-dark font-medium">適用 →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ARCHITECTURAL ELEMENTS & PARTITIONS */}
        {activeTab === 'elements' && (
          <div className="space-y-3">
            <div className="text-xs text-sumi-100 font-semibold">
              伝統建具・構造部材 (Japanese Partitions)
            </div>
            <div className="space-y-2">
              {[
                { name: '襖（ふすま）', desc: '和室の間仕切り引き違い戸。35mm厚' },
                { name: '障子（しょうじ）', desc: '明かりを通す格子組和紙引き戸' },
                { name: '引戸（ひきど）', desc: '洋室・水回りの引き戸 (910mm一筋)' },
                { name: '掃き出し窓', desc: '南面テラス・庭への床面窓 (1820mm)' },
                { name: '通し柱（とおしばしら）', desc: '120mm角 檜構造耐震柱' },
                { name: '上がり框（あがりかまち）', desc: '玄関とホールの段差見切り材' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-2 rounded border border-washi-400/30 bg-washi-50 text-xs"
                >
                  <div className="font-semibold text-sumi">{item.name}</div>
                  <div className="text-[11px] text-sumi-50 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-washi-200/60 rounded border border-washi-400/30 text-[11px] text-sumi-100 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-hinoki-dark shrink-0 mt-0.5" />
              <span>
                2Dキャンバス上の部屋境界または壁面上で自動スナップ・配置が可能です。
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

