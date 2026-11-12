/**
 * SENSORY JAPAN — Zustand Architectural Project Store
 * 
 * Provides:
 * - Single source of truth for architectural project data in millimetres
 * - Full Undo / Redo historical state snapshot stack
 * - Multi-floor management (B1, 1F, 2F, 3F) with FloorElevationManager
 * - Transactional editing: failed operations reject changes and leave state intact
 * - Pre-mutation validation guards via GeometryValidationService & ArchitecturalConstraintEngine
 * - Object selection (rooms, walls, openings, elements)
 * - Dynamic tatami recalculation on system change
 * - Local persistence (LocalStorage) with autosave and revision history
 */

import { create } from 'zustand';
import {
  Project,
  Floor,
  Room,
  TatamiSystem,
  TatamiMatCount,
  FloorLevel,
  PlotConfiguration,
} from '../types/architectural';
import { createTwoStoreyFamilyHouse, getTemplateProject } from '../data/templates';
import { generateTatamiLayout, getStandardTatamiRoomDimensions } from '../engine/tatami';
import { FloorElevationManager } from '../engine/FloorElevationManager';
import { GeometryValidationService, ComprehensiveValidationReport } from '../engine/GeometryValidationService';

const LOCAL_STORAGE_KEY = 'sensory_japan_active_project';
const LEGACY_LOCAL_STORAGE_KEY = 'landsense_japan_active_project';
const PROJECT_LIST_STORAGE_KEY = 'sensory_japan_projects_list';
const LEGACY_PROJECT_LIST_STORAGE_KEY = 'landsense_japan_projects_list';
const MAX_UNDO_STACK = 30;

export interface ProjectSummary {
  id: string;
  name: string;
  location: string;
  updatedAt: string;
  floorCount: number;
  totalFloorAreaSqm: number;
}

export interface ProjectStoreState {
  // Current active project
  project: Project;
  
  // Selection
  selectedId: string | null;
  selectedType: 'room' | 'wall' | 'opening' | 'element' | null;
  
  // Undo / Redo stacks
  past: Project[];
  future: Project[];
  
  // Validation state
  lastValidationError: string | null;
  activeValidationReport: ComprehensiveValidationReport | null;
  
  // Persistence metadata
  isDirty: boolean;
  lastSavedAt: string | null;
  savedProjectsList: ProjectSummary[];
  
  // Actions - Project Management
  loadProject: (project: Project) => void;
  loadTemplate: (templateId: string) => void;
  createNewProject: (name: string, location: string, templateId?: string) => void;
  updateProjectName: (name: string) => void;
  saveProjectToStorage: () => void;
  loadProjectFromStorage: (id?: string) => boolean;
  deleteSavedProject: (id: string) => void;
  duplicateProject: () => void;
  
  // Actions - Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Actions - Validation
  clearValidationError: () => void;
  runValidationAudit: () => ComprehensiveValidationReport;
  
  // Actions - Selection
  selectObject: (id: string | null, type: 'room' | 'wall' | 'opening' | 'element' | null) => void;
  clearSelection: () => void;
  
  // Actions - Multi-floor & Elevations
  setActiveFloor: (floorId: string) => void;
  addFloor: (level: FloorLevel) => void;
  deleteFloor: (floorId: string) => void;
  updateFloorHeight: (floorId: string, heightMm: number) => boolean;
  updateFloorCeilingHeight: (floorId: string, ceilingMm: number) => boolean;
  
  // Actions - Rooms (Transactional)
  addRoomToActiveFloor: (roomData: Partial<Room>) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => boolean;
  moveRoom: (roomId: string, newPos: { x: number; y: number }) => boolean;
  resizeRoom: (roomId: string, width: number, height: number) => boolean;
  rotateRoom: (roomId: string) => void;
  deleteRoom: (roomId: string) => void;
  duplicateRoom: (roomId: string) => void;
  
  // Actions - Tatami system
  setGlobalTatamiSystem: (system: TatamiSystem) => void;
  updateRoomTatamiConfig: (roomId: string, joCount: TatamiMatCount, system?: TatamiSystem) => void;
  
  // Actions - Plot
  updatePlot: (updates: Partial<PlotConfiguration>) => void;
}

function cloneProject(p: Project): Project {
  return JSON.parse(JSON.stringify(p));
}

function calculateProjectTotalSqm(p: Project): number {
  let totalMm2 = 0;
  for (const f of p.floors) {
    for (const r of f.rooms) {
      if (r.type !== 'balcony') {
        totalMm2 += r.width * r.height;
      }
    }
  }
  return totalMm2 / 1_000_000;
}

function updateProjectsListSummary(p: Project) {
  try {
    const raw = localStorage.getItem(PROJECT_LIST_STORAGE_KEY) || localStorage.getItem(LEGACY_PROJECT_LIST_STORAGE_KEY);
    const list: ProjectSummary[] = raw ? JSON.parse(raw) : [];
    const summary: ProjectSummary = {
      id: p.id,
      name: p.name,
      location: p.location,
      updatedAt: new Date().toISOString(),
      floorCount: p.floors.length,
      totalFloorAreaSqm: Math.round(calculateProjectTotalSqm(p)),
    };
    const index = list.findIndex((item) => item.id === p.id);
    if (index >= 0) {
      list[index] = summary;
    } else {
      list.unshift(summary);
    }
    localStorage.setItem(PROJECT_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to update projects list summary in localStorage', e);
  }
}

export const useProjectStore = create<ProjectStoreState>((set, get) => {
  const initialProject = FloorElevationManager.recalculateProjectElevations(createTwoStoreyFamilyHouse());

  return {
    project: initialProject,
    selectedId: null,
    selectedType: null,
    past: [],
    future: [],
    lastValidationError: null,
    activeValidationReport: null,
    isDirty: false,
    lastSavedAt: null,
    savedProjectsList: [],

    loadProject: (newProject: Project) => {
      const coordinated = FloorElevationManager.recalculateProjectElevations(newProject);
      set({
        project: cloneProject(coordinated),
        selectedId: null,
        selectedType: null,
        past: [],
        future: [],
        lastValidationError: null,
        isDirty: false,
      });
    },

    loadTemplate: (templateId: string) => {
      const templateProj = getTemplateProject(templateId);
      const cloned = cloneProject(templateProj);
      cloned.id = `proj_${Date.now()}`;
      cloned.createdAt = new Date().toISOString();
      cloned.updatedAt = new Date().toISOString();
      const coordinated = FloorElevationManager.recalculateProjectElevations(cloned);

      set((state) => ({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: coordinated,
        selectedId: null,
        selectedType: null,
        lastValidationError: null,
        isDirty: true,
      }));

      get().saveProjectToStorage();
    },

    createNewProject: (name: string, location: string, templateId?: string) => {
      let baseProj = templateId ? getTemplateProject(templateId) : createTwoStoreyFamilyHouse();
      const newProj = cloneProject(baseProj);
      newProj.id = `proj_${Date.now()}`;
      newProj.name = name;
      newProj.location = location;
      newProj.createdAt = new Date().toISOString();
      newProj.updatedAt = new Date().toISOString();
      const coordinated = FloorElevationManager.recalculateProjectElevations(newProj);

      set((state) => ({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: coordinated,
        selectedId: null,
        selectedType: null,
        lastValidationError: null,
        isDirty: true,
      }));

      get().saveProjectToStorage();
    },

    updateProjectName: (name: string) => {
      set((state) => {
        const next = cloneProject(state.project);
        next.name = name;
        next.updatedAt = new Date().toISOString();
        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          isDirty: true,
        };
      });
    },

    saveProjectToStorage: () => {
      const { project } = get();
      try {
        const payload = JSON.stringify(project);
        localStorage.setItem(LOCAL_STORAGE_KEY, payload);
        localStorage.setItem(`sensory_proj_${project.id}`, payload);
        updateProjectsListSummary(project);
        set({ isDirty: false, lastSavedAt: new Date().toISOString() });
      } catch (e) {
        console.error('Failed to save project to localStorage', e);
      }
    },

    loadProjectFromStorage: (id?: string) => {
      try {
        let rawData: string | null = null;
        if (id) {
          rawData = localStorage.getItem(`sensory_proj_${id}`) || localStorage.getItem(`landsense_proj_${id}`);
        } else {
          rawData = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
        }

        if (rawData) {
          const loaded: Project = JSON.parse(rawData);
          const coordinated = FloorElevationManager.recalculateProjectElevations(loaded);
          set({
            project: coordinated,
            selectedId: null,
            selectedType: null,
            past: [],
            future: [],
            lastValidationError: null,
            isDirty: false,
          });
          return true;
        }
      } catch (e) {
        console.error('Failed to load project from localStorage', e);
      }
      return false;
    },

    deleteSavedProject: (id: string) => {
      try {
        localStorage.removeItem(`sensory_proj_${id}`);
        localStorage.removeItem(`landsense_proj_${id}`);
        const raw = localStorage.getItem(PROJECT_LIST_STORAGE_KEY) || localStorage.getItem(LEGACY_PROJECT_LIST_STORAGE_KEY);
        if (raw) {
          const list: ProjectSummary[] = JSON.parse(raw);
          const updated = list.filter((item) => item.id !== id);
          localStorage.setItem(PROJECT_LIST_STORAGE_KEY, JSON.stringify(updated));
          set({ savedProjectsList: updated });
        }
      } catch (e) {
        console.error('Failed to delete project', e);
      }
    },

    duplicateProject: () => {
      const { project } = get();
      const duplicated = cloneProject(project);
      duplicated.id = `proj_${Date.now()}`;
      duplicated.name = `${project.name} (Copy)`;
      duplicated.createdAt = new Date().toISOString();
      duplicated.updatedAt = new Date().toISOString();

      set((state) => ({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: duplicated,
        lastValidationError: null,
        isDirty: true,
      }));

      get().saveProjectToStorage();
    },

    undo: () => {
      const { past, project, future } = get();
      if (!past.length) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      set({
        past: newPast,
        future: [cloneProject(project), ...future],
        project: cloneProject(previous),
        selectedId: null,
        selectedType: null,
        lastValidationError: null,
        isDirty: true,
      });
    },

    redo: () => {
      const { past, project, future } = get();
      if (!future.length) return;

      const next = future[0];
      const newFuture = future.slice(1);

      set({
        past: [...past, cloneProject(project)],
        future: newFuture,
        project: cloneProject(next),
        selectedId: null,
        selectedType: null,
        lastValidationError: null,
        isDirty: true,
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    clearValidationError: () => {
      set({ lastValidationError: null });
    },

    runValidationAudit: () => {
      const report = GeometryValidationService.validateFullProject(get().project);
      set({ activeValidationReport: report });
      return report;
    },

    selectObject: (id, type) => {
      set({ selectedId: id, selectedType: type });
    },

    clearSelection: () => {
      set({ selectedId: null, selectedType: null });
    },

    setActiveFloor: (floorId: string) => {
      set((state) => {
        const next = cloneProject(state.project);
        next.activeFloorId = floorId;
        return { project: next, selectedId: null, selectedType: null };
      });
    },

    addFloor: (level: FloorLevel) => {
      set((state) => {
        const next = cloneProject(state.project);
        const existing = next.floors.find((f) => f.level === level);
        if (existing) {
          next.activeFloorId = existing.id;
          return { project: next };
        }

        const newFloor: Floor = {
          id: `fl_${Date.now()}`,
          projectId: next.id,
          level,
          name: `${level} (${level === 'B1' ? '地下1階' : level.replace('F', '階')})`,
          elevation: 0, // Recalculated dynamically
          floorHeight: 2900,
          ceilingHeight: 2400,
          slabThickness: 150,
          rooms: [],
          walls: [],
          openings: [],
          elements: [],
        };

        next.floors.push(newFloor);
        const coordinated = FloorElevationManager.recalculateProjectElevations(next);
        coordinated.activeFloorId = newFloor.id;

        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: coordinated,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    deleteFloor: (floorId: string) => {
      set((state) => {
        if (state.project.floors.length <= 1) return state; // Never delete last floor
        const next = cloneProject(state.project);
        next.floors = next.floors.filter((f) => f.id !== floorId);
        if (next.activeFloorId === floorId) {
          next.activeFloorId = next.floors[0].id;
        }
        const coordinated = FloorElevationManager.recalculateProjectElevations(next);

        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: coordinated,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    updateFloorHeight: (floorId: string, heightMm: number): boolean => {
      const state = get();
      const floor = state.project.floors.find(f => f.id === floorId);
      if (!floor) return false;

      const report = GeometryValidationService.validateFloorHeightChange(floor, heightMm, state.project);
      if (!report.isValid) {
        set({ lastValidationError: report.errors.join('; ') });
        return false;
      }

      const next = cloneProject(state.project);
      const target = next.floors.find(f => f.id === floorId);
      if (target) {
        target.floorHeight = heightMm;
      }
      const coordinated = FloorElevationManager.recalculateProjectElevations(next);

      set({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: coordinated,
        lastValidationError: null,
        isDirty: true,
      });

      return true;
    },

    updateFloorCeilingHeight: (floorId: string, ceilingMm: number): boolean => {
      const state = get();
      const floor = state.project.floors.find(f => f.id === floorId);
      if (!floor) return false;

      if (ceilingMm < FloorElevationManager.MIN_LEGAL_CEILING_HEIGHT_MM) {
        set({
          lastValidationError: `Ceiling height (${ceilingMm} mm) violates Japanese BSL Art. 21 (minimum 2,100 mm).`,
        });
        return false;
      }

      const next = cloneProject(state.project);
      const target = next.floors.find(f => f.id === floorId);
      if (target) {
        target.ceilingHeight = ceilingMm;
      }
      const coordinated = FloorElevationManager.recalculateProjectElevations(next);

      set({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: coordinated,
        lastValidationError: null,
        isDirty: true,
      });

      return true;
    },

    addRoomToActiveFloor: (roomData: Partial<Room>) => {
      set((state) => {
        const next = cloneProject(state.project);
        const activeFloor = next.floors.find((f) => f.id === next.activeFloorId) || next.floors[0];
        if (!activeFloor) return state;

        const tatamiSys = next.tatamiSystem;
        let tatamiConfig = roomData.tatamiConfig;
        let width = roomData.width || 2730;
        let height = roomData.height || 3640;

        if (roomData.type === 'washitsu' && !tatamiConfig) {
          const dims = getStandardTatamiRoomDimensions(6, tatamiSys);
          width = dims.widthMm;
          height = dims.heightMm;
          tatamiConfig = generateTatamiLayout(6, tatamiSys);
        }

        const newRoom: Room = {
          id: `room_${Date.now()}`,
          floorId: activeFloor.id,
          name: roomData.name || 'New Room',
          japaneseName: roomData.japaneseName || '居室',
          type: roomData.type || 'living',
          position: roomData.position || { x: 1820, y: 1820 },
          width,
          height,
          rotation: 0,
          floorMaterial: roomData.floorMaterial || (roomData.type === 'washitsu' ? 'tatami_igusa' : 'hardwood_hinoki'),
          tatamiConfig,
          color: roomData.color || '#F4EFE6',
          elevationOffset: roomData.elevationOffset,
        };

        // Validate boundary
        const boundaryViolations = GeometryValidationService.validateRoomMove(
          newRoom,
          newRoom.position,
          activeFloor,
          next
        );
        if (!boundaryViolations.isValid) {
          return {
            ...state,
            lastValidationError: boundaryViolations.errors.join('; '),
          };
        }

        activeFloor.rooms.push(newRoom);

        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          selectedId: newRoom.id,
          selectedType: 'room',
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    updateRoom: (roomId: string, updates: Partial<Room>): boolean => {
      const state = get();
      let targetRoom: Room | null = null;
      let targetFloor: Floor | null = null;

      for (const floor of state.project.floors) {
        const r = floor.rooms.find(room => room.id === roomId);
        if (r) {
          targetRoom = r;
          targetFloor = floor;
          break;
        }
      }

      if (!targetRoom || !targetFloor) return false;

      // If dimensions are updated, pre-validate
      const proposedWidth = updates.width !== undefined ? updates.width : targetRoom.width;
      const proposedHeight = updates.height !== undefined ? updates.height : targetRoom.height;

      if (updates.width !== undefined || updates.height !== undefined) {
        const report = GeometryValidationService.validateRoomResize(
          targetRoom,
          proposedWidth,
          proposedHeight,
          targetFloor,
          state.project
        );
        if (!report.isValid) {
          set({ lastValidationError: report.errors.join('; ') });
          return false;
        }
      }

      // If position is updated, pre-validate
      if (updates.position) {
        const report = GeometryValidationService.validateRoomMove(
          targetRoom,
          updates.position,
          targetFloor,
          state.project
        );
        if (!report.isValid) {
          set({ lastValidationError: report.errors.join('; ') });
          return false;
        }
      }

      const next = cloneProject(state.project);
      for (const floor of next.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) {
          Object.assign(room, updates);
          if (room.type === 'washitsu' && (updates.width || updates.height) && room.tatamiConfig) {
            room.tatamiConfig = generateTatamiLayout(
              room.tatamiConfig.matCount,
              room.tatamiConfig.system,
              room.width,
              room.height
            );
          }
          break;
        }
      }

      set({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: next,
        lastValidationError: null,
        isDirty: true,
      });

      return true;
    },

    moveRoom: (roomId: string, newPos: { x: number; y: number }): boolean => {
      const state = get();
      let targetRoom: Room | null = null;
      let targetFloor: Floor | null = null;

      for (const floor of state.project.floors) {
        const r = floor.rooms.find(room => room.id === roomId);
        if (r) {
          targetRoom = r;
          targetFloor = floor;
          break;
        }
      }

      if (!targetRoom || !targetFloor) return false;

      // Pre-validation guard
      const report = GeometryValidationService.validateRoomMove(
        targetRoom,
        newPos,
        targetFloor,
        state.project
      );
      if (!report.isValid) {
        set({ lastValidationError: report.errors.join('; ') });
        return false;
      }

      const next = cloneProject(state.project);
      for (const floor of next.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) {
          room.position = { ...newPos };
          break;
        }
      }

      set({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: next,
        lastValidationError: null,
        isDirty: true,
      });

      return true;
    },

    resizeRoom: (roomId: string, width: number, height: number): boolean => {
      const state = get();
      let targetRoom: Room | null = null;
      let targetFloor: Floor | null = null;

      for (const floor of state.project.floors) {
        const r = floor.rooms.find(room => room.id === roomId);
        if (r) {
          targetRoom = r;
          targetFloor = floor;
          break;
        }
      }

      if (!targetRoom || !targetFloor) return false;

      // Transactional Pre-Validation Guard (Hard constraints block)
      const report = GeometryValidationService.validateRoomResize(
        targetRoom,
        width,
        height,
        targetFloor,
        state.project
      );
      if (!report.isValid) {
        set({ lastValidationError: report.errors.join('; ') });
        return false;
      }

      const next = cloneProject(state.project);
      for (const floor of next.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) {
          room.width = width;
          room.height = height;
          if (room.type === 'washitsu' && room.tatamiConfig) {
            room.tatamiConfig = generateTatamiLayout(
              room.tatamiConfig.matCount,
              room.tatamiConfig.system,
              room.width,
              room.height
            );
          }
          break;
        }
      }

      set({
        past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
        future: [],
        project: next,
        lastValidationError: null,
        isDirty: true,
      });

      return true;
    },

    rotateRoom: (roomId: string) => {
      set((state) => {
        const next = cloneProject(state.project);
        for (const floor of next.floors) {
          const room = floor.rooms.find((r) => r.id === roomId);
          if (room) {
            const oldW = room.width;
            room.width = room.height;
            room.height = oldW;
            room.rotation = (room.rotation + 90) % 360;
            if (room.type === 'washitsu' && room.tatamiConfig) {
              room.tatamiConfig = generateTatamiLayout(
                room.tatamiConfig.matCount,
                room.tatamiConfig.system,
                room.width,
                room.height
              );
            }
            break;
          }
        }
        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    deleteRoom: (roomId: string) => {
      set((state) => {
        const next = cloneProject(state.project);
        for (const floor of next.floors) {
          floor.rooms = floor.rooms.filter((r) => r.id !== roomId);
        }
        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          selectedId: null,
          selectedType: null,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    duplicateRoom: (roomId: string) => {
      set((state) => {
        const next = cloneProject(state.project);
        let duplicated: Room | null = null;
        for (const floor of next.floors) {
          const room = floor.rooms.find((r) => r.id === roomId);
          if (room) {
            duplicated = {
              ...cloneProject(room as any),
              id: `room_${Date.now()}`,
              name: `${room.name} (Copy)`,
              position: {
                x: room.position.x + 910,
                y: room.position.y + 910,
              },
            };
            floor.rooms.push(duplicated);
            break;
          }
        }
        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          selectedId: duplicated ? duplicated.id : state.selectedId,
          selectedType: 'room',
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    setGlobalTatamiSystem: (system: TatamiSystem) => {
      set((state) => {
        const next = cloneProject(state.project);
        next.tatamiSystem = system;

        for (const floor of next.floors) {
          for (const room of floor.rooms) {
            if (room.type === 'washitsu' && room.tatamiConfig) {
              const currentMatCount = room.tatamiConfig.matCount;
              if (currentMatCount !== 'custom') {
                const dims = getStandardTatamiRoomDimensions(currentMatCount, system);
                room.width = dims.widthMm;
                room.height = dims.heightMm;
              }
              room.tatamiConfig = generateTatamiLayout(
                currentMatCount,
                system,
                room.width,
                room.height
              );
            }
          }
        }

        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    updateRoomTatamiConfig: (roomId: string, joCount: TatamiMatCount, system?: TatamiSystem) => {
      set((state) => {
        const next = cloneProject(state.project);
        const sys = system || next.tatamiSystem;

        for (const floor of next.floors) {
          const room = floor.rooms.find((r) => r.id === roomId);
          if (room) {
            if (joCount !== 'custom') {
              const dims = getStandardTatamiRoomDimensions(joCount, sys);
              room.width = dims.widthMm;
              room.height = dims.heightMm;
            }
            room.tatamiConfig = generateTatamiLayout(joCount, sys, room.width, room.height);
            break;
          }
        }

        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },

    updatePlot: (updates: Partial<PlotConfiguration>) => {
      set((state) => {
        const next = cloneProject(state.project);
        next.plot = { ...next.plot, ...updates };
        return {
          past: [...state.past.slice(-MAX_UNDO_STACK), cloneProject(state.project)],
          future: [],
          project: next,
          lastValidationError: null,
          isDirty: true,
        };
      });
    },
  };
});
