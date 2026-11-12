const fs = require('fs');
const path = require('path');

console.log('=== SENSORY JAPAN REBRANDING SCRIPT ===\n');

// 1. Update index.html
const indexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/<title>.*?<\/title>/, '<title>SENSORY JAPAN — 建築CAD & 日本住宅設計プラットフォーム</title>');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[OK] index.html title updated to SENSORY JAPAN');
}

// 2. Update package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = 'sensory';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('[OK] package.json name updated to sensory');
}

// 3. Update app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (appJson.expo) {
    appJson.expo.name = 'SENSORY';
    appJson.expo.slug = 'sensory';
    appJson.expo.scheme = 'sensory';
  }
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
  console.log('[OK] app.json rebranded to SENSORY');
}

// 4. Update HeaderToolbar.tsx logo and branding
const headerPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'HeaderToolbar.tsx');
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');
  header = header.replace(
    /LAND<span className="text-hinoki-dark font-sans font-light">Sense<\/span>/g,
    'SEN<span className="text-hinoki-dark font-sans font-light">SORY</span>'
  );
  header = header.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  fs.writeFileSync(headerPath, header, 'utf8');
  console.log('[OK] HeaderToolbar.tsx logo updated to SENSORY');
}

// 5. Update ValidationPanel.tsx
const valPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'ValidationPanel.tsx');
if (fs.existsSync(valPath)) {
  let val = fs.readFileSync(valPath, 'utf8');
  val = val.replace(/LANDSense CAD Engine/g, 'SENSORY CAD Engine');
  val = val.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  fs.writeFileSync(valPath, val, 'utf8');
  console.log('[OK] ValidationPanel.tsx branding updated to SENSORY');
}

// 6. Update Modals.tsx
const modalPath = path.join(__dirname, '..', 'src', 'components', 'ui', 'Modals.tsx');
if (fs.existsSync(modalPath)) {
  let mod = fs.readFileSync(modalPath, 'utf8');
  mod = mod.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  mod = mod.replace(/LANDSense/g, 'Sensory');
  mod = mod.replace(/LandSense/g, 'Sensory');
  fs.writeFileSync(modalPath, mod, 'utf8');
  console.log('[OK] Modals.tsx AI assistant & export dialogs updated to SENSORY');
}

// 7. Update ReportsView.tsx
const reportsPath = path.join(__dirname, '..', 'src', 'components', 'views', 'ReportsView.tsx');
if (fs.existsSync(reportsPath)) {
  let rep = fs.readFileSync(reportsPath, 'utf8');
  rep = rep.replace(/LANDSENSE JAPAN - ARCHITECTURAL DOSSIER/g, 'SENSORY JAPAN - ARCHITECTURAL DOSSIER');
  rep = rep.replace(/LANDSENSE JAPAN ARCHITECTURAL DOSSIER/g, 'SENSORY JAPAN ARCHITECTURAL DOSSIER');
  rep = rep.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  fs.writeFileSync(reportsPath, rep, 'utf8');
  console.log('[OK] ReportsView.tsx PDF document titles updated to SENSORY');
}

// 8. Update ThreeHouseCanvas.tsx
const canvas3dPath = path.join(__dirname, '..', 'src', 'components', 'canvas3d', 'ThreeHouseCanvas.tsx');
if (fs.existsSync(canvas3dPath)) {
  let c3d = fs.readFileSync(canvas3dPath, 'utf8');
  c3d = c3d.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  c3d = c3d.replace(/LandSense/g, 'Sensory');
  fs.writeFileSync(canvas3dPath, c3d, 'utf8');
  console.log('[OK] ThreeHouseCanvas.tsx updated');
}

// 9. Update sceneBuilder3d.ts
const sceneBuilderPath = path.join(__dirname, '..', 'src', 'engine', 'sceneBuilder3d.ts');
if (fs.existsSync(sceneBuilderPath)) {
  let sb = fs.readFileSync(sceneBuilderPath, 'utf8');
  sb = sb.replace(/'LandSenseBuildingRoot'/g, "'SensoryBuildingRoot'");
  sb = sb.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  fs.writeFileSync(sceneBuilderPath, sb, 'utf8');
  console.log('[OK] sceneBuilder3d.ts updated to SensoryBuildingRoot');
}

// 10. Update projectStore.ts persistence with fallback
const storePath = path.join(__dirname, '..', 'src', 'store', 'projectStore.ts');
if (fs.existsSync(storePath)) {
  let st = fs.readFileSync(storePath, 'utf8');
  // Update storage keys with backwards compatibility
  st = st.replace(
    "const LOCAL_STORAGE_KEY = 'landsense_japan_active_project';",
    "const LOCAL_STORAGE_KEY = 'sensory_japan_active_project';\nconst LEGACY_LOCAL_STORAGE_KEY = 'landsense_japan_active_project';"
  );
  st = st.replace(
    "const PROJECT_LIST_STORAGE_KEY = 'landsense_japan_projects_list';",
    "const PROJECT_LIST_STORAGE_KEY = 'sensory_japan_projects_list';\nconst LEGACY_PROJECT_LIST_STORAGE_KEY = 'landsense_japan_projects_list';"
  );

  // In loadProjectFromStorage, fallback to legacy if new is empty
  st = st.replace(
    'rawData = localStorage.getItem(LOCAL_STORAGE_KEY);',
    'rawData = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);'
  );

  st = st.replace(
    "const raw = localStorage.getItem(PROJECT_LIST_STORAGE_KEY);",
    "const raw = localStorage.getItem(PROJECT_LIST_STORAGE_KEY) || localStorage.getItem(LEGACY_PROJECT_LIST_STORAGE_KEY);"
  );

  st = st.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  st = st.replace(/LandSense/g, 'Sensory');
  fs.writeFileSync(storePath, st, 'utf8');
  console.log('[OK] projectStore.ts updated with seamless SENSORY storage & legacy migration');
}

// 11. Update ProjectHistoryView.tsx
const historyPath = path.join(__dirname, '..', 'src', 'components', 'views', 'ProjectHistoryView.tsx');
if (fs.existsSync(historyPath)) {
  let hist = fs.readFileSync(historyPath, 'utf8');
  hist = hist.replace(
    "const raw = localStorage.getItem('landsense_japan_projects_list');",
    "const raw = localStorage.getItem('sensory_japan_projects_list') || localStorage.getItem('landsense_japan_projects_list');"
  );
  hist = hist.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
  fs.writeFileSync(historyPath, hist, 'utf8');
  console.log('[OK] ProjectHistoryView.tsx storage fallback updated');
}

// 12. Batch replace doc headers in all src/ files
const srcDir = path.join(__dirname, '..', 'src');
function walkAndReplace(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walkAndReplace(full);
    } else if (/\.(ts|tsx)$/.test(item)) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      if (content.includes('LANDSense JAPAN')) {
        content = content.replace(/LANDSense JAPAN/g, 'SENSORY JAPAN');
        changed = true;
      }
      if (content.includes('LandSense Japan')) {
        content = content.replace(/LandSense Japan/g, 'Sensory Japan');
        changed = true;
      }
      if (content.includes('LandSense application')) {
        content = content.replace(/LandSense application/g, 'Sensory application');
        changed = true;
      }
      if (content.includes('LANDSense')) {
        content = content.replace(/LANDSense/g, 'SENSORY');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
      }
    }
  }
}
walkAndReplace(srcDir);
console.log('[OK] Batch updated source comments and headers across src/');

// 13. Update app/ mobile entrypoints if present
const appDir = path.join(__dirname, '..', 'app');
if (fs.existsSync(appDir)) {
  walkAndReplace(appDir);
  console.log('[OK] Mobile screens rebranded to Sensory');
}

console.log('\n=== REBRANDING COMPLETED SUCCESSFULLY ===');

