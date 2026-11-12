/**
 * SENSORY JAPAN — Complete Automated Product Walkthrough & Screen Recording
 * 
 * Captures an end-to-end, high-definition 1920x1080 30FPS WebM video demonstrating:
 * - Phase 1: Application Introduction & Dashboard
 * - Phase 2: Site Configuration & Setback Boundaries
 * - Phase 3: Japanese Housing Parameters & BSL Compliance
 * - Phase 4: AI Architectural Design Generation & Structured Operations
 * - Phase 5: 2D CAD Floor Planner & Tatami Engine
 * - Phase 6: Full 360° Interactive 3D Viewport (360° Orbit, Elevations, Exploded, Solar)
 * - Phase 7: Architectural Constraint Validation & Transactional Error Handling
 * - Phase 8: Reports, PDF Dossier, Project History & Settings
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');
const FINAL_VIDEO_PATH = path.join(RECORDINGS_DIR, 'sensory_complete_walkthrough.webm');

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Clean previous recordings
const existing = fs.readdirSync(RECORDINGS_DIR);
existing.forEach((f) => {
  if (f.endsWith('.webm')) {
    try { fs.unlinkSync(path.join(RECORDINGS_DIR, f)); } catch (_) {}
  }
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('================================================================');
  console.log('SENSORY JAPAN — LAUNCHING AUTOMATED PRODUCT SCREEN RECORDING');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1920,1080',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  console.log('[1/9] Connecting to SENSORY on http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Helper to cleanly switch views
  async function switchView(viewName, titleMatch) {
    try {
      const btn = await page.$(`button[title*="${titleMatch}"]`);
      if (btn) {
        await btn.click();
      } else {
        await page.evaluate((v) => window.__UI_STORE__?.getState()?.setCurrentView(v), viewName);
      }
    } catch (_) {
      await page.evaluate((v) => window.__UI_STORE__?.getState()?.setCurrentView(v), viewName);
    }
  }

  // -------------------------------------------------------------
  // PHASE 1: APPLICATION INTRODUCTION & DASHBOARD
  // -------------------------------------------------------------
  console.log('[2/9] PHASE 1: Application Introduction & Dashboard');
  await switchView('dashboard', 'ダッシュボード');
  await sleep(2000);

  // Move mouse smoothly over dashboard hero banner and metrics
  await page.mouse.move(500, 200, { steps: 15 });
  await sleep(1000);
  await page.mouse.move(960, 280, { steps: 20 });
  await sleep(1000);
  await page.mouse.move(960, 500, { steps: 20 });
  await sleep(1500);

  // Hover over sidebar items
  await page.mouse.move(32, 180, { steps: 15 });
  await sleep(500);
  await page.mouse.move(32, 230, { steps: 10 });
  await sleep(500);
  await page.mouse.move(32, 280, { steps: 10 });
  await sleep(500);
  await page.mouse.move(32, 330, { steps: 10 });
  await sleep(500);

  // -------------------------------------------------------------
  // PHASE 2: SITE CONFIGURATION & SETBACK BOUNDARIES
  // -------------------------------------------------------------
  console.log('[3/9] PHASE 2: Site Configuration & Setback Boundaries');
  await switchView('site_analysis', '敷地分析');
  await sleep(2000);

  // Hover over interactive plot diagram
  await page.mouse.move(700, 450, { steps: 25 });
  await sleep(1500);

  // Point to plot dimension inputs
  await page.mouse.move(350, 320, { steps: 15 });
  await sleep(1200);

  // Smoothly drag solar orientation slider
  const slider = await page.$('input[type="range"]');
  if (slider) {
    const box = await slider.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 25 });
      await page.mouse.up();
      await sleep(1500);
    }
  }

  // -------------------------------------------------------------
  // PHASE 3: JAPANESE HOUSING PARAMETERS & BSL COMPLIANCE
  // -------------------------------------------------------------
  console.log('[4/9] PHASE 3: Japanese Housing Parameters & BSL Statutory Audit');
  await switchView('compliance', '建築基準法診断');
  await sleep(2500);

  // Hover over BCR (建ぺい率) and FAR (容積率) cards
  await page.mouse.move(500, 300, { steps: 20 });
  await sleep(1500);
  await page.mouse.move(1100, 300, { steps: 20 });
  await sleep(1500);

  // Scroll through BSL articles
  await page.mouse.move(960, 600, { steps: 15 });
  await page.mouse.wheel(0, 400);
  await sleep(2000);
  await page.mouse.wheel(0, -400);
  await sleep(1500);

  // -------------------------------------------------------------
  // PHASE 4: AI ARCHITECTURAL DESIGN GENERATION
  // -------------------------------------------------------------
  console.log('[5/9] PHASE 4: AI Architectural Design Generation');
  await page.click('button[title*="AI 建築設計アシスタント"]');
  await sleep(1500);

  // Click prompt recommendation chip: "和室を8畳に拡張する"
  const chip1 = await page.$('button:has-text("和室を8畳に拡張する")');
  if (chip1) {
    await chip1.click();
    console.log('  Executed AI Prompt: 和室を8畳に拡張する');
    await sleep(2500);
  }

  // Click second prompt chip: "南面に濡れ縁（ウッドデッキ）を追加"
  const chip2 = await page.$('button:has-text("南面に濡れ縁（ウッドデッキ）を追加")');
  if (chip2) {
    await chip2.click();
    console.log('  Executed AI Prompt: 南面に濡れ縁（ウッドデッキ）を追加');
    await sleep(2500);
  }

  // Close modal cleanly via store or close button
  await page.evaluate(() => window.__UI_STORE__?.getState()?.closeModal());
  await sleep(1200);

  // -------------------------------------------------------------
  // PHASE 5: 2D CAD FLOOR PLANNER DEMONSTRATION
  // -------------------------------------------------------------
  console.log('[6/9] PHASE 5: 2D Floor Planner, Tatami Engine & Multi-Floor Navigation');
  await switchView('floor_planner', '2D間取りエディタ');
  await sleep(2000);

  // Hover over canvas to show 910mm Shakkan-ho grid and room layouts
  await page.mouse.move(800, 480, { steps: 20 });
  await sleep(1000);

  // Click a room on canvas to inspect in Right Inspector
  await page.mouse.click(750, 450);
  await sleep(1500);

  // Move over right inspector properties
  await page.mouse.move(1750, 320, { steps: 20 });
  await sleep(1500);

  // Switch to 2F on top toolbar
  const floor2Btn = await page.$('button:has-text("2階")');
  if (floor2Btn) {
    await floor2Btn.click();
    console.log('  Switched to 2F Upper Floor');
    await sleep(2000);
  }

  // Toggle structural lower floor ghost overlay
  const ghostBtn = await page.$('button[title*="直下階の柱"]');
  if (ghostBtn) {
    await ghostBtn.click();
    await sleep(1200);
    await ghostBtn.click();
    await sleep(800);
  }

  // Switch back to 1F
  const floor1Btn = await page.$('button:has-text("1階")');
  if (floor1Btn) {
    await floor1Btn.click();
    await sleep(1200);
  }

  // -------------------------------------------------------------
  // PHASE 6: 3D ARCHITECTURAL VISUALIZATION (THE 360° VIEWPORT)
  // -------------------------------------------------------------
  console.log('[7/9] PHASE 6: 3D Architectural Visualization (360° Viewport & Elevations)');
  await switchView('designer_3d', '3D外観');
  await sleep(3000);

  // 1. Toggle 360° Auto-Orbit
  console.log('  Triggering 360° Automated Turntable Orbit...');
  const orbitBtn = await page.$('button:has-text("360°周回")');
  if (orbitBtn) {
    await orbitBtn.click();
    await sleep(6500); // Complete smooth 360° orbit
    await orbitBtn.click(); // Pause
    await sleep(1000);
  }

  // 2. Switch through canonical elevation presets
  console.log('  Demonstrating Canonical Architectural View Presets...');
  const topBtn = await page.$('button:has-text("上 (7)")');
  if (topBtn) {
    await topBtn.click(); // Top view
    await sleep(2000);
  }

  const frontBtn = await page.$('button:has-text("正 (1)")');
  if (frontBtn) {
    await frontBtn.click(); // Front elevation
    await sleep(2000);
  }

  const rightBtn = await page.$('button:has-text("右 (3)")');
  if (rightBtn) {
    await rightBtn.click(); // Right elevation
    await sleep(2000);
  }

  const backBtn = await page.$('button:has-text("背 (9)")');
  if (backBtn) {
    await backBtn.click(); // Back elevation
    await sleep(2000);
  }

  const isoBtn = await page.$('button:has-text("鳥瞰 (0)")');
  if (isoBtn) {
    await isoBtn.click(); // Isometric 3D view
    await sleep(2000);
  }

  // 3. Interactive Mouse Orbit & Tilt (inspect foundation & upper floors)
  console.log('  Interactive Mouse Orbit & Foundation Inspection...');
  await page.mouse.move(800, 500);
  await page.mouse.down();
  await page.mouse.move(650, 400, { steps: 30 }); // Orbit horizontally
  await page.mouse.move(650, 600, { steps: 20 }); // Tilt up to inspect foundation
  await page.mouse.up();
  await sleep(1500);

  // Zoom in to inspect materials
  await page.mouse.wheel(0, -300);
  await sleep(1500);
  await page.mouse.wheel(0, 300);
  await sleep(1000);

  // Re-fit building
  const fitBtn = await page.$('button:has-text("フィット (F)")');
  if (fitBtn) {
    await fitBtn.click();
    await sleep(1500);
  }

  // 4. Multi-Floor Modes: Exploded & Cutaway
  console.log('  Multi-Floor Viewing: Exploded View & Cutaway...');
  const explodedBtn = await page.$('button:has-text("階層分解")');
  if (explodedBtn) {
    await explodedBtn.click();
    await sleep(3000);
  }

  const cutawayBtn = await page.$('button:has-text("水平断面")');
  if (cutawayBtn) {
    await cutawayBtn.click();
    await sleep(2500);
  }

  const fullBtn = await page.$('button:has-text("全景外観")');
  if (fullBtn) {
    await fullBtn.click();
    await sleep(2000);
  }

  // 5. Material & Structure Toggles
  console.log('  Material & Structural Component Toggles...');
  const roofBtn = await page.$('button[title*="屋根"]');
  if (roofBtn) {
    await roofBtn.click(); // Roof OFF
    await sleep(1500);
    await roofBtn.click(); // Roof ON
    await sleep(1200);
  }

  const colBtn = await page.$('button[title*="柱"]');
  if (colBtn) {
    await colBtn.click(); // Structural framing ON
    await sleep(1800);
  }

  // 6. Dynamic Solar Lighting Simulation
  console.log('  Dynamic Solar Lighting Simulation (East, Noon, West, Night)...');
  const morningBtn = await page.$('button:has-text("朝 (8:00)")');
  if (morningBtn) {
    await morningBtn.click();
    await sleep(1500);
  }

  const sunsetBtn = await page.$('button:has-text("夕景 (16:30)")');
  if (sunsetBtn) {
    await sunsetBtn.click();
    await sleep(1500);
  }

  const nightBtn = await page.$('button:has-text("夜間")');
  if (nightBtn) {
    await nightBtn.click();
    await sleep(1500);
  }

  const noonBtn = await page.$('button:has-text("正午 (12:00)")');
  if (noonBtn) {
    await noonBtn.click();
    await sleep(1500);
  }

  // -------------------------------------------------------------
  // PHASE 7: CONSTRAINT VALIDATION & ERROR HANDLING
  // -------------------------------------------------------------
  console.log('[8/9] PHASE 7: Constraint Validation & Transactional Error Handling');
  // Open live validation panel
  await page.evaluate(() => window.__UI_STORE__?.getState()?.toggleValidationPanel());
  await sleep(2000);

  // Point to validation status badges in panel
  await page.mouse.move(1750, 300, { steps: 20 });
  await sleep(1500);
  await page.mouse.move(1750, 500, { steps: 20 });
  await sleep(1500);

  // Close validation panel cleanly
  await page.evaluate(() => window.__UI_STORE__?.getState()?.toggleValidationPanel());
  await sleep(1200);

  // -------------------------------------------------------------
  // PHASE 8: REMAINING FEATURES (HISTORY, REPORTS, SETTINGS)
  // -------------------------------------------------------------
  console.log('[9/9] PHASE 8: Project History, PDF Reports & System Settings');
  // 1. Project History
  await switchView('history', '設計履歴');
  await sleep(2500);

  // 2. Reports & PDF Dossier
  await switchView('reports', '建築計画書出力');
  await sleep(2500);

  // Scroll through dossier report
  await page.mouse.move(960, 450, { steps: 15 });
  await page.mouse.wheel(0, 350);
  await sleep(1800);
  await page.mouse.wheel(0, -350);
  await sleep(1200);

  // 3. Settings View
  await switchView('settings', '環境設定');
  await sleep(2200);

  // Return to Dashboard to conclude walkthrough
  await switchView('dashboard', 'ダッシュボード');
  await sleep(2500);

  console.log('\nFinalizing video stream and saving WebM artifact...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video and rename to sensory_complete_walkthrough.webm
  const files = fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    const rawVideo = path.join(RECORDINGS_DIR, files[0]);
    if (rawVideo !== FINAL_VIDEO_PATH) {
      fs.copyFileSync(rawVideo, FINAL_VIDEO_PATH);
    }
    const stat = fs.statSync(FINAL_VIDEO_PATH);
    console.log(`\nSUCCESS! Video saved at: ${FINAL_VIDEO_PATH}`);
    console.log(`File Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  } else {
    console.error('ERROR: No WebM video found in recordings directory!');
  }
})();
