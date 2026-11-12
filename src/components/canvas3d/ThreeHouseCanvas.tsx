/**
 * SENSORY JAPAN — 360° Interactive Architectural Three.js Viewport
 * 
 * Features:
 * - Full 360° horizontal unrestricted orbit with vertical roof-to-foundation inspection
 * - Smooth camera transitions (interpolated easeInOutCubic lerp)
 * - View Control Panel: Top, Front, Back, Left, Right, Isometric, 360° Auto-Orbit, Fit, Reset, Fullscreen
 * - Dynamic building bounding sphere calculation for multi-storey framing
 * - Full touch gestures: 1-finger orbit, 2-finger dolly-zoom & pan
 * - Architectural hotkeys: 1 (Front), 3 (Right), 7 (Top), 9 (Back), 0 (Isometric), F (Fit), Space (360° Orbit)
 * - Dynamic Solar Lighting simulation based on true North orientation & time of day
 * - Raycaster object picking connected to projectStore selection
 * - Multi-floor view modes (Full, Floor-Isolated, Exploded Isometric, Cutaway, Wireframe)
 * - High-Res PNG Screenshot Capture & 3D GLTF Export
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { buildArchitectural3DScene } from '../../engine/sceneBuilder3d';
import { BuildingCoordinateSystem } from '../../engine/BuildingCoordinateSystem';
import { FloorElevationManager } from '../../engine/FloorElevationManager';
import { computeFloorBoundingBox } from '../../engine/geometry';
import {
  Sun,
  Maximize2,
  Minimize2,
  Download,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  Box,
  Eye,
  Layers,
  ArrowDownToLine,
  ArrowRight,
  ArrowLeft,
  Scan,
  Compass,
  Play,
  Pause,
} from 'lucide-react';

interface CameraTransition {
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  targetLookAt: THREE.Vector3;
  startTime: number;
  durationMs: number;
}

export type PresetView = 'top' | 'front' | 'back' | 'left' | 'right' | 'isometric';

export const ThreeHouseCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingMeshGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const transitionRef = useRef<CameraTransition | null>(null);

  // Store bindings
  const project = useProjectStore((s) => s.project);
  const selectedId = useProjectStore((s) => s.selectedId);
  const selectObject = useProjectStore((s) => s.selectObject);

  // 3D View Modes & Display Toggles
  const [viewMode, setViewMode] = useState<'full' | 'floor_isolated' | 'exploded' | 'cutaway' | 'wireframe'>('full');
  const [showRoof, setShowRoof] = useState(true);
  const [showTatami, setShowTatami] = useState(true);
  const [showStructuralFraming, setShowStructuralFraming] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'golden_hour' | 'night'>('noon');
  const [hoveredObjectName, setHoveredObjectName] = useState<string | null>(null);

  // Camera & Viewport States
  const [activePreset, setActivePreset] = useState<PresetView | null>('isometric');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Calculates the exact 3D building bounds, center height, and optimal camera framing distance.
   */
  const computeBuildingBounds = useCallback(() => {
    const allRooms = project.floors.flatMap((f) => f.rooms);
    const bbox = computeFloorBoundingBox(allRooms);
    const datums = FloorElevationManager.calculateFloorElevations(project);
    const topDatum = datums[datums.length - 1];
    const totalHeightMm = (topDatum?.structuralReferenceElevationMm || 6000) + 1800; // includes roof pitch

    const widthM = BuildingCoordinateSystem.toMetres(bbox.width || 12000);
    const depthM = BuildingCoordinateSystem.toMetres(bbox.height || 10000);
    const heightM = BuildingCoordinateSystem.toMetres(totalHeightMm);

    const centerY = heightM / 2;
    const radius = Math.sqrt((widthM / 2) ** 2 + (heightM / 2) ** 2 + (depthM / 2) ** 2);
    const fovRad = (42 * Math.PI) / 180;
    const fitDistance = Math.max(10, (radius / Math.sin(fovRad / 2)) * 1.15);

    return {
      widthM,
      heightM,
      depthM,
      centerY,
      fitDistance,
    };
  }, [project]);

  /**
   * Smoothly animates the camera to a target position and look-at point.
   */
  const animateCameraTo = useCallback(
    (targetPosition: THREE.Vector3, targetLookAt: THREE.Vector3, durationMs = 700) => {
      if (!cameraRef.current || !controlsRef.current) return;

      if (controlsRef.current.autoRotate) {
        controlsRef.current.autoRotate = false;
        setIsAutoRotating(false);
      }

      transitionRef.current = {
        startPos: cameraRef.current.position.clone(),
        targetPos: targetPosition.clone(),
        startTarget: controlsRef.current.target.clone(),
        targetLookAt: targetLookAt.clone(),
        startTime: performance.now(),
        durationMs,
      };
    },
    []
  );

  /**
   * Transitions camera to one of the canonical architectural view presets.
   */
  const setCameraPreset = useCallback(
    (preset: PresetView) => {
      setActivePreset(preset);
      const bounds = computeBuildingBounds();
      const lookAt = new THREE.Vector3(0, bounds.centerY, 0);
      let targetPos = new THREE.Vector3();

      switch (preset) {
        case 'top':
          // Looking directly down onto the roof / plan
          targetPos = new THREE.Vector3(0, bounds.centerY + bounds.fitDistance * 1.3, 0.001);
          break;
        case 'front':
          // Front Elevation (South facade, looking along -Z)
          targetPos = new THREE.Vector3(0, bounds.centerY, bounds.fitDistance);
          break;
        case 'back':
          // Rear Elevation (North facade, looking along +Z)
          targetPos = new THREE.Vector3(0, bounds.centerY, -bounds.fitDistance);
          break;
        case 'left':
          // Left Elevation (West facade, looking along +X)
          targetPos = new THREE.Vector3(-bounds.fitDistance, bounds.centerY, 0);
          break;
        case 'right':
          // Right Elevation (East facade, looking along -X)
          targetPos = new THREE.Vector3(bounds.fitDistance, bounds.centerY, 0);
          break;
        case 'isometric':
        default:
          // Default architectural 3D axonometric angle
          targetPos = new THREE.Vector3(
            bounds.fitDistance * 0.72,
            bounds.centerY + bounds.fitDistance * 0.62,
            bounds.fitDistance * 0.72
          );
          break;
      }

      animateCameraTo(targetPos, lookAt, 750);
    },
    [computeBuildingBounds, animateCameraTo]
  );

  /**
   * Fits the entire building comfortably inside the viewport regardless of scale or floor count.
   */
  const fitEntireBuilding = useCallback(() => {
    setActivePreset('isometric');
    const bounds = computeBuildingBounds();
    const lookAt = new THREE.Vector3(0, bounds.centerY, 0);
    const targetPos = new THREE.Vector3(
      bounds.fitDistance * 0.72,
      bounds.centerY + bounds.fitDistance * 0.62,
      bounds.fitDistance * 0.72
    );
    animateCameraTo(targetPos, lookAt, 800);
  }, [computeBuildingBounds, animateCameraTo]);

  /**
   * Resets the camera to default view.
   */
  const resetCamera = useCallback(() => {
    fitEntireBuilding();
  }, [fitEntireBuilding]);

  /**
   * Toggles 360-degree automatic orbit rotation.
   */
  const toggle360AutoOrbit = useCallback(() => {
    if (!controlsRef.current) return;
    const next = !controlsRef.current.autoRotate;
    controlsRef.current.autoRotate = next;
    setIsAutoRotating(next);
  }, []);

  /**
   * Toggles browser fullscreen mode on the 3D canvas viewport.
   */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.parentElement?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // 1. INITIALIZE THREE.JS SCENE, CAMERA, ORBIT CONTROLS & RENDERER
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181B1A); // Deep Sumi architectural charcoal
    sceneRef.current = scene;

    // CAMERA (42° architectural FOV)
    const bounds = computeBuildingBounds();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(
      bounds.fitDistance * 0.72,
      bounds.centerY + bounds.fitDistance * 0.62,
      bounds.fitDistance * 0.72
    );
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // PROFESSIONAL ORBIT CONTROLS (360° UNRESTRICTED HORIZONTAL ROTATION)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.screenSpacePanning = true;
    controls.minDistance = 2.0;
    controls.maxDistance = 150;
    // Complete 360° horizontal rotation
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    // Vertical rotation: inspect roof from above down to foundation from below
    controls.minPolarAngle = 0.01;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.target.set(0, bounds.centerY, 0);
    // Auto-orbit configuration
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.8;
    // Full touch controls for mobile & tablet (1 finger: rotate, 2 fingers: zoom + pan)
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // When user manually manipulates camera, clear active preset badge
    controls.addEventListener('start', () => {
      setActivePreset(null);
    });

    // AMBIENT & HEMISPHERE LIGHTS
    const hemiLight = new THREE.HemisphereLight(0xF2EDE4, 0x303538, 0.65);
    scene.add(hemiLight);

    // DIRECTIONAL SUN LIGHT (WITH SHADOW MAPPING)
    const sunLight = new THREE.DirectionalLight(0xFFF7EA, 1.4);
    sunLight.position.set(12, 22, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 70;
    const shadowDist = 20;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // ANIMATION & CAMERA TRANSITION LOOP
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle smooth camera interpolation
      if (transitionRef.current && cameraRef.current && controlsRef.current) {
        const elapsed = performance.now() - transitionRef.current.startTime;
        const progress = Math.min(1, elapsed / transitionRef.current.durationMs);
        // Smooth easeInOutCubic
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        cameraRef.current.position.lerpVectors(
          transitionRef.current.startPos,
          transitionRef.current.targetPos,
          ease
        );
        controlsRef.current.target.lerpVectors(
          transitionRef.current.startTarget,
          transitionRef.current.targetLookAt,
          ease
        );

        if (progress >= 1) {
          transitionRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      renderer.dispose();
    };
  }, []);

  // 2. REBUILD 3D ARCHITECTURAL MESHES WHEN MODEL OR VIEW MODE CHANGES
  useEffect(() => {
    if (!sceneRef.current) return;

    if (buildingMeshGroupRef.current) {
      sceneRef.current.remove(buildingMeshGroupRef.current);
    }

    const buildingGroup = buildArchitectural3DScene(project, {
      viewMode,
      activeFloorId: project.activeFloorId,
      showRoof,
      showTatami,
      showStructuralFraming,
      selectedObjectId: selectedId,
    });

    buildingMeshGroupRef.current = buildingGroup;
    sceneRef.current.add(buildingGroup);
  }, [project, viewMode, showRoof, showTatami, showStructuralFraming, selectedId]);

  // 3. SOLAR LIGHTING AZIMUTH & TIME OF DAY UPDATE
  useEffect(() => {
    if (!sunLightRef.current || !sceneRef.current) return;

    const northRad = (project.plot.northOrientation * Math.PI) / 180;
    const sunDist = 26;

    if (timeOfDay === 'morning') {
      const az = northRad + Math.PI / 2; // East (8:00 AM)
      sunLightRef.current.position.set(Math.cos(az) * sunDist, 14, Math.sin(az) * sunDist);
      sunLightRef.current.color.setHex(0xFFE8CC);
      sunLightRef.current.intensity = 1.3;
      sceneRef.current.background = new THREE.Color(0x1F2426);
    } else if (timeOfDay === 'noon') {
      const az = northRad + Math.PI; // South (12:00 PM)
      sunLightRef.current.position.set(Math.cos(az) * 12, 26, Math.sin(az) * 12);
      sunLightRef.current.color.setHex(0xFFFAF0);
      sunLightRef.current.intensity = 1.6;
      sceneRef.current.background = new THREE.Color(0x181B1A);
    } else if (timeOfDay === 'golden_hour') {
      const az = northRad + (Math.PI * 5) / 4; // South-West (16:30 PM)
      sunLightRef.current.position.set(Math.cos(az) * sunDist, 8, Math.sin(az) * sunDist);
      sunLightRef.current.color.setHex(0xFFB570);
      sunLightRef.current.intensity = 1.5;
      sceneRef.current.background = new THREE.Color(0x241C18);
    } else {
      sunLightRef.current.intensity = 0.2;
      sunLightRef.current.color.setHex(0x7090B0);
      sceneRef.current.background = new THREE.Color(0x0E1112);
    }
  }, [timeOfDay, project.plot.northOrientation]);

  // 4. KEYBOARD SHORTCUTS FOR PROFESSIONAL ARCHITECTURAL INSPECTION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case '1':
          setCameraPreset('front');
          break;
        case '3':
          setCameraPreset('right');
          break;
        case '7':
          setCameraPreset('top');
          break;
        case '9':
          setCameraPreset('back');
          break;
        case '0':
          setCameraPreset('isometric');
          break;
        case 'f':
        case 'F':
          fitEntireBuilding();
          break;
        case 'r':
        case 'R':
          resetCamera();
          break;
        case ' ':
          e.preventDefault();
          toggle360AutoOrbit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraPreset, fitEntireBuilding, resetCamera, toggle360AutoOrbit]);

  // 5. RAYCASTING INTERACTION: MOUSE CLICK TO SELECT OBJECTS
  const handlePointerDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !buildingMeshGroupRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(buildingMeshGroupRef.current.children, true);
      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData?.id && hit.parent) {
          hit = hit.parent as THREE.Mesh;
        }
        if (hit?.userData?.id) {
          selectObject(hit.userData.id, hit.userData.type || 'room');
          setHoveredObjectName(hit.userData.name || '選択中オブジェクト');
          return;
        }
      }
    },
    [selectObject]
  );

  // 6. SCREENSHOT CAPTURE (High-Resolution PNG)
  const captureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${project.name.replace(/\s+/g, '_')}_3D_Render.png`;
    link.href = dataUrl;
    link.click();
    link.remove();
  };

  // 7. 3D GLTF EXPORT
  const exportGLTF = () => {
    if (!buildingMeshGroupRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      buildingMeshGroupRef.current,
      (gltf) => {
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${project.name.replace(/\s+/g, '_')}_3D_Model.gltf`;
        link.click();
        link.remove();
      },
      (error) => console.error('GLTF export error', error),
      { binary: false }
    );
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-sumi">
      {/* 3D WEBGL CANVAS */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />

      {/* TOP-LEFT FLOATING CONTROLS: 3D VIEW MODES */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-sumi/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-dropdown text-xs text-washi-300">
        <button
          onClick={() => setViewMode('full')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            viewMode === 'full' ? 'bg-hinoki text-white font-bold' : 'hover:bg-white/10 text-washi-400'
          }`}
        >
          全景外観 (Full)
        </button>

        <button
          onClick={() => setViewMode('floor_isolated')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            viewMode === 'floor_isolated' ? 'bg-hinoki text-white font-bold' : 'hover:bg-white/10 text-washi-400'
          }`}
        >
          階層単体 (Isolated)
        </button>

        <button
          onClick={() => setViewMode('exploded')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            viewMode === 'exploded' ? 'bg-hinoki text-white font-bold' : 'hover:bg-white/10 text-washi-400'
          }`}
          title="各フロアを垂直方向に分解して同時確認"
        >
          階層分解 (Exploded)
        </button>

        <button
          onClick={() => setViewMode('cutaway')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            viewMode === 'cutaway' ? 'bg-hinoki text-white font-bold' : 'hover:bg-white/10 text-washi-400'
          }`}
          title="壁を1.2m高さで水平断面スライス"
        >
          水平断面 (Cutaway)
        </button>

        <button
          onClick={() => setViewMode('wireframe')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            viewMode === 'wireframe' ? 'bg-hinoki text-white font-bold' : 'hover:bg-white/10 text-washi-400'
          }`}
        >
          軸組ワイヤー (Wireframe)
        </button>
      </div>

      {/* TOP-RIGHT FLOATING TOOLBAR: DISPLAY TOGGLES & EXPORT */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-sumi/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-dropdown text-xs">
        {/* Toggle Roof */}
        <button
          onClick={() => setShowRoof(!showRoof)}
          className={`px-2.5 py-1.5 rounded-lg transition-colors ${
            showRoof ? 'bg-white/20 text-white font-semibold' : 'text-washi-400 hover:text-white'
          }`}
          title="屋根の表示/非表示切り替え（内部見下ろし）"
        >
          屋根: {showRoof ? 'ON' : 'OFF'}
        </button>

        {/* Toggle Tatami */}
        <button
          onClick={() => setShowTatami(!showTatami)}
          className={`px-2.5 py-1.5 rounded-lg transition-colors ${
            showTatami ? 'bg-tatami/80 text-white font-semibold' : 'text-washi-400 hover:text-white'
          }`}
          title="畳・畳縁のリアル表示"
        >
          畳: {showTatami ? 'ON' : 'OFF'}
        </button>

        {/* Toggle Structural Columns */}
        <button
          onClick={() => setShowStructuralFraming(!showStructuralFraming)}
          className={`px-2.5 py-1.5 rounded-lg transition-colors ${
            showStructuralFraming ? 'bg-hinoki text-white font-semibold' : 'text-washi-400 hover:text-white'
          }`}
          title="木造軸組通し柱 (105mm角) の表示"
        >
          柱: {showStructuralFraming ? 'ON' : 'OFF'}
        </button>

        <span className="text-white/20">|</span>

        {/* Capture Screenshot */}
        <button
          onClick={captureScreenshot}
          className="p-1.5 text-washi-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="3D高解像度レンダリング画像を保存 (PNG)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Export GLTF */}
        <button
          onClick={exportGLTF}
          className="p-1.5 text-washi-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="3DモデルをGLTFエクスポート"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* CENTER FLOATING DOCK: 360° INTERACTIVE VIEW CONTROL PANEL */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-sumi/90 backdrop-blur-lg px-2.5 py-1.5 rounded-2xl border border-white/15 shadow-2xl text-xs text-washi-200 overflow-x-auto max-w-[95vw]">
        {/* 1. 360° AUTO-ORBIT TOGGLE */}
        <button
          onClick={toggle360AutoOrbit}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            isAutoRotating
              ? 'bg-amber-500 text-sumi font-bold shadow-lg animate-pulse'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="360° 自動周回オービット (スペースキー)"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
          <span className="text-[11px] whitespace-nowrap">360°周回</span>
        </button>

        <span className="text-white/20 mx-0.5">|</span>

        {/* 2. TOP VIEW (屋根・平面見下ろし) */}
        <button
          onClick={() => setCameraPreset('top')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activePreset === 'top'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="上面見下ろし視点 (Top View) [キー: 7]"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">上 (7)</span>
        </button>

        {/* 3. FRONT VIEW (正面・南立面) */}
        <button
          onClick={() => setCameraPreset('front')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activePreset === 'front'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="正面立面 (Front Elevation - 南面) [キー: 1]"
        >
          <Eye className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">正 (1)</span>
        </button>

        {/* 4. BACK VIEW (背面・北立面) */}
        <button
          onClick={() => setCameraPreset('back')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activePreset === 'back'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="背面立面 (Back Elevation - 北面) [キー: 9]"
        >
          <Compass className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">背 (9)</span>
        </button>

        {/* 5. LEFT VIEW (左側面・西立面) */}
        <button
          onClick={() => setCameraPreset('left')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activePreset === 'left'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="左側立面 (Left Elevation - 西面)"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">左</span>
        </button>

        {/* 6. RIGHT VIEW (右側面・東立面) */}
        <button
          onClick={() => setCameraPreset('right')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
            activePreset === 'right'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="右側立面 (Right Elevation - 東面) [キー: 3]"
        >
          <ArrowRight className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">右 (3)</span>
        </button>

        {/* 7. ISOMETRIC VIEW (鳥瞰アイソメ) */}
        <button
          onClick={() => setCameraPreset('isometric')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            activePreset === 'isometric'
              ? 'bg-hinoki text-white font-bold'
              : 'hover:bg-white/10 text-washi-300'
          }`}
          title="鳥瞰アイソメトリック視点 (Isometric View) [キー: 0]"
        >
          <Box className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">鳥瞰 (0)</span>
        </button>

        <span className="text-white/20 mx-0.5">|</span>

        {/* 8. FIT ENTIRE BUILDING (全体フィット) */}
        <button
          onClick={fitEntireBuilding}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 text-washi-300 transition-all"
          title="建物全体を画角にフィット (キー: F)"
        >
          <Scan className="w-3.5 h-3.5 text-wood-400" />
          <span className="text-[11px]">フィット (F)</span>
        </button>

        {/* 9. RESET CAMERA */}
        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg hover:bg-white/10 text-washi-300 transition-all"
          title="視点を初期位置にリセット (キー: R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* 10. FULLSCREEN VIEWPORT */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/10 text-washi-300 transition-all"
          title={isFullscreen ? '全画面表示を終了' : '全画面表示モード'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* BOTTOM-LEFT FLOATING CONTROLS: SOLAR LIGHTING & TIME */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2 bg-sumi/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-dropdown text-xs text-washi-300">
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-white whitespace-nowrap">太陽光環境:</span>

        <button
          onClick={() => setTimeOfDay('morning')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            timeOfDay === 'morning' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'hover:bg-white/10'
          }`}
        >
          朝 (8:00)
        </button>
        <button
          onClick={() => setTimeOfDay('noon')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            timeOfDay === 'noon' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'hover:bg-white/10'
          }`}
        >
          正午 (12:00)
        </button>
        <button
          onClick={() => setTimeOfDay('golden_hour')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            timeOfDay === 'golden_hour' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'hover:bg-white/10'
          }`}
        >
          夕景 (16:30)
        </button>
        <button
          onClick={() => setTimeOfDay('night')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            timeOfDay === 'night' ? 'bg-blue-500/30 text-blue-300 font-bold' : 'hover:bg-white/10'
          }`}
        >
          夜間
        </button>
      </div>

      {/* TOUCH & NAVIGATION HINT BADGE (BOTTOM CENTER) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-3 px-3 py-1 rounded-full bg-sumi/60 backdrop-blur-sm border border-white/5 text-[10px] text-washi-400 font-mono pointer-events-none">
        <span>左ドラッグ: 360°回転</span>
        <span>•</span>
        <span>右ドラッグ / 2本指: パン移動</span>
        <span>•</span>
        <span>ホイール / ピンチ: ズーム</span>
      </div>

      {/* OBJECT SELECTION HUD AT BOTTOM RIGHT */}
      {hoveredObjectName && (
        <div className="absolute bottom-4 right-4 z-20 bg-sumi/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-hinoki/50 shadow-dropdown text-xs text-washi-200 font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-hinoki" />
          <span>{hoveredObjectName}</span>
        </div>
      )}
    </div>
  );
};
