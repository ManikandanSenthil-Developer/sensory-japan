/**
 * SENSORY JAPAN — Three.js Architectural Materials & Procedural Japanese Textures
 * 
 * Provides:
 * - Natural Woven Igusa Tatami Material (with woven rush grain & dark-green cloth edge Heri)
 * - Hinoki (檜 Japanese Cypress) & Sugi (杉 Japanese Cedar) PBR Wood Materials
 * - Shikkui (漆喰 Japanese Lime Plaster) & Juraku (聚楽壁 Earthen Plaster)
 * - Translucent Shoji (障子) Paper & Opaque Fusuma (襖) Partitions
 * - Japanese Ceramic Clay Roof Tiles (和瓦 Kawara)
 * - Troweled Concrete Doma (玄関土間)
 */

import * as THREE from 'three';

// Procedural Canvas Texture Generators to ensure zero external network/asset dependencies!

/**
 * Generates an authentic Japanese woven Igusa rush tatami texture canvas.
 */
function createTatamiWeaveTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#8FA076'; // Fresh young igusa green-gold
    ctx.fillRect(0, 0, 256, 256);

    // Fine woven horizontal rush reeds
    for (let y = 0; y < 256; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? '#83946B' : '#99AA80';
      ctx.fillRect(0, y, 256, 2);
    }

    // Vertical warp threads
    for (let x = 0; x < 256; x += 16) {
      ctx.fillStyle = 'rgba(70, 85, 55, 0.25)';
      ctx.fillRect(x, 0, 2, 256);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

/**
 * Generates Japanese Hinoki (Cypress) wood grain texture.
 */
function createHinokiWoodTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#E8CCA8'; // Pale Hinoki gold
    ctx.fillRect(0, 0, 256, 256);

    // Subtle grain lines
    for (let x = 0; x < 256; x += 3) {
      const alpha = (Math.sin(x * 0.15) + 1) * 0.08;
      ctx.fillStyle = `rgba(180, 140, 95, ${alpha})`;
      ctx.fillRect(x, 0, 2, 256);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 6);
  return texture;
}

/**
 * Generates Japanese Kawara roof tile texture.
 */
function createKawaraRoofTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2B3033'; // Deep graphite gray
    ctx.fillRect(0, 0, 128, 128);

    // Tile lap lines
    for (let y = 0; y < 128; y += 32) {
      ctx.fillStyle = '#1A1D1F';
      ctx.fillRect(0, y, 128, 4);
      ctx.fillStyle = '#3F464A';
      ctx.fillRect(0, y + 4, 128, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export class JapaneseMaterialsLibrary {
  private static instance: JapaneseMaterialsLibrary;

  // Materials
  public tatamiMat: THREE.MeshStandardMaterial;
  public tatamiHeri: THREE.MeshStandardMaterial; // Cloth edge
  public hinokiWood: THREE.MeshStandardMaterial;
  public sugiCedar: THREE.MeshStandardMaterial;
  public shikkuiPlaster: THREE.MeshStandardMaterial; // White exterior/interior plaster
  public shojiPaper: THREE.MeshPhysicalMaterial; // Translucent
  public shojiWoodLattice: THREE.MeshStandardMaterial;
  public fusumaScreen: THREE.MeshStandardMaterial;
  public glassGlazing: THREE.MeshPhysicalMaterial;
  public concreteDoma: THREE.MeshStandardMaterial;
  public foundationConcrete: THREE.MeshStandardMaterial;
  public kawaraRoof: THREE.MeshStandardMaterial;
  public timberBeam: THREE.MeshStandardMaterial;
  public balconyDeck: THREE.MeshStandardMaterial;
  public railingMetal: THREE.MeshStandardMaterial;

  private constructor() {
    const tatamiTex = createTatamiWeaveTexture();
    const hinokiTex = createHinokiWoodTexture();
    const kawaraTex = createKawaraRoofTexture();

    // 1. Tatami Igusa
    this.tatamiMat = new THREE.MeshStandardMaterial({
      map: tatamiTex || null,
      color: 0x9CB082,
      roughness: 0.75,
      metalness: 0.05,
    });

    // 2. Tatami Cloth Border (Heri 縁)
    this.tatamiHeri = new THREE.MeshStandardMaterial({
      color: 0x243321, // Deep forest green
      roughness: 0.85,
      metalness: 0.0,
    });

    // 3. Hinoki Wood (Floor & Posts)
    this.hinokiWood = new THREE.MeshStandardMaterial({
      map: hinokiTex || null,
      color: 0xD8B892,
      roughness: 0.45,
      metalness: 0.05,
    });

    // 4. Sugi Cedar
    this.sugiCedar = new THREE.MeshStandardMaterial({
      color: 0xA6724E,
      roughness: 0.55,
      metalness: 0.05,
    });

    // 5. Shikkui Lime Plaster (Walls)
    this.shikkuiPlaster = new THREE.MeshStandardMaterial({
      color: 0xF7F4EC,
      roughness: 0.9,
      metalness: 0.02,
    });

    // 6. Shoji Paper (Translucent)
    this.shojiPaper = new THREE.MeshPhysicalMaterial({
      color: 0xFFFDF8,
      roughness: 0.65,
      transmission: 0.65,
      opacity: 0.85,
      transparent: true,
      thickness: 0.05,
    });

    // 7. Shoji Wood Lattice
    this.shojiWoodLattice = new THREE.MeshStandardMaterial({
      color: 0x8C5E39,
      roughness: 0.5,
    });

    // 8. Fusuma Screen
    this.fusumaScreen = new THREE.MeshStandardMaterial({
      color: 0xEDE7D8,
      roughness: 0.8,
    });

    // 9. Glass
    this.glassGlazing = new THREE.MeshPhysicalMaterial({
      color: 0xDEF1F7,
      transmission: 0.92,
      opacity: 0.35,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
    });

    // 10. Concrete Doma
    this.concreteDoma = new THREE.MeshStandardMaterial({
      color: 0xBEB9B0,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 11. Foundation Concrete
    this.foundationConcrete = new THREE.MeshStandardMaterial({
      color: 0x9E9990,
      roughness: 0.85,
    });

    // 12. Kawara Roof Tiles
    this.kawaraRoof = new THREE.MeshStandardMaterial({
      map: kawaraTex || null,
      color: 0x32373B,
      roughness: 0.4,
      metalness: 0.2,
    });

    // 13. Timber Framing Beams & Columns
    this.timberBeam = new THREE.MeshStandardMaterial({
      color: 0x9E754C,
      roughness: 0.6,
      metalness: 0.05,
    });

    // 14. Balcony Deck
    this.balconyDeck = new THREE.MeshStandardMaterial({
      color: 0x8F6846,
      roughness: 0.65,
    });

    // 15. Metal Railing
    this.railingMetal = new THREE.MeshStandardMaterial({
      color: 0x232628,
      roughness: 0.25,
      metalness: 0.85,
    });
  }

  public static getInstance(): JapaneseMaterialsLibrary {
    if (!JapaneseMaterialsLibrary.instance) {
      JapaneseMaterialsLibrary.instance = new JapaneseMaterialsLibrary();
    }
    return JapaneseMaterialsLibrary.instance;
  }
}
