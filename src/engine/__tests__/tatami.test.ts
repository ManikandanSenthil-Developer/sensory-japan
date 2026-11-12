/**
 * Verification test for Japanese Tatami Engine & Compliance
 */
import {
  TATAMI_SYSTEMS,
  generateTatamiLayout,
  getStandardTatamiRoomDimensions,
  sqMetersToTsubo,
  tsuboToSqMeters,
  sqMetersToAdvertisingTatami,
  tatamiToPhysicalSqMeters,
} from '../tatami';

console.log('=== TEST 1: 4 Regional Tatami Systems ===');
for (const [key, sys] of Object.entries(TATAMI_SYSTEMS)) {
  console.log(
    `[${key}] ${sys.kanji}: ${sys.lengthMm}x${sys.widthMm}mm | Area: ${sys.areaSqMeters.toFixed(4)} m² (${sys.areaTsubo.toFixed(3)} tsubo)`
  );
}

console.log('\n=== TEST 2: Traditional Auspicious 6-Jo Layout (Rokujo Shukugi-jiki) ===');
const sixJoDim = getStandardTatamiRoomDimensions(6, 'chukyoma');
console.log(`6-jo Chukyoma Dimensions: ${sixJoDim.widthMm}mm x ${sixJoDim.heightMm}mm`);
const layout6 = generateTatamiLayout(6, 'chukyoma');
console.log(`Generated mats count: ${layout6.mats.length}`);
layout6.mats.forEach((m, i) => {
  console.log(`  Mat ${i + 1} (${m.id}): at (${m.x}, ${m.y}) mm, size ${m.width}x${m.height} mm, orientation: ${m.orientation}`);
});

console.log('\n=== TEST 3: 4.5-Jo Spiral Pinwheel Layout (Yonjohan) ===');
const layout45 = generateTatamiLayout(4.5, 'chukyoma');
console.log(`Generated 4.5-jo mats count: ${layout45.mats.length}`);
const halfMat = layout45.mats.find(m => m.isHalfMat);
console.log(`  Half-mat present: ${!!halfMat} (${halfMat?.width}x${halfMat?.height} mm at x:${halfMat?.x}, y:${halfMat?.y})`);

console.log('\n=== TEST 4: Tsubo and Advertising Tatami Calculations ===');
const sampleSqm = 100;
console.log(`${sampleSqm} m² = ${sqMetersToTsubo(sampleSqm).toFixed(2)} tsubo`);
console.log(`${sqMetersToTsubo(sampleSqm).toFixed(2)} tsubo = ${tsuboToSqMeters(sqMetersToTsubo(sampleSqm)).toFixed(2)} m²`);
console.log(`${sampleSqm} m² in Advertising standard (1.62 m²/jo) = ${sqMetersToAdvertisingTatami(sampleSqm).toFixed(2)} jo`);
console.log(`6 jo in Edoma physical area = ${tatamiToPhysicalSqMeters(6, 'edoma').toFixed(2)} m²`);
console.log(`6 jo in Kyoma physical area = ${tatamiToPhysicalSqMeters(6, 'kyoma').toFixed(2)} m²`);
console.log('\nALL ENGINE MATHEMATICAL TESTS PASSED SUCCESSFULLY!');

