// Deterministic synthetic illustration fixtures, not camera photographs.
// Requires sharp in normal module resolution or THREADBACK_NODE_MODULE_DIR.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = process.env.THREADBACK_NODE_MODULE_DIR
  ? require(path.join(process.env.THREADBACK_NODE_MODULE_DIR, 'sharp'))
  : require('sharp');

(async () => {
  const root = __dirname;
  const source = path.resolve(root, '../../dist/assets/desk-organizer.svg');
  const reference = path.join(root, 'desk-reference.png');
  const shifted = path.join(root, 'desk-shifted.png');
  const description = 'Threadback synthetic test fixture rendered from a code-native SVG illustration. Not a photograph or live camera capture.';
  await sharp(await fs.readFile(source), { density: 72 })
    .resize(1200, 760)
    .withMetadata({ exif: { IFD0: { ImageDescription: description } } })
    .png().toFile(reference);
  // Move the original content right 42 px and down 24 px, cropping the far
  // right/bottom. The output remains 1200x760, with a solid desk-colored border.
  await sharp(reference)
    .extract({ left: 0, top: 0, width: 1158, height: 736 })
    .extend({ left: 42, top: 24, right: 0, bottom: 0, background: '#e8e2d4' })
    .withMetadata({ exif: { IFD0: { ImageDescription: description + ' Translated right 42 pixels and down 24 pixels.' } } })
    .png().toFile(shifted);
  const manifest = {
    type: 'synthetic-illustration-test-fixtures',
    cameraCapture: false,
    source: 'dist/assets/desk-organizer.svg',
    renderer: 'sharp / libvips SVG rasterization',
    rendererVersions: sharp.versions,
    width: 1200,
    height: 760,
    reference: 'desk-reference.png',
    transformed: 'desk-shifted.png',
    transform: {
      kind: 'translation',
      dxPixels: 42,
      dyPixels: 24,
      pixelHomography: [1, 0, 42, 0, 1, 24, 0, 0, 1],
      normalizedHomography: [1, 0, 42 / 1200, 0, 1, 24 / 760, 0, 0, 1],
      borderColor: '#e8e2d4',
      cropsRightPixels: 42,
      cropsBottomPixels: 24,
    },
  };
  await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ renderer: manifest.renderer, width: manifest.width, height: manifest.height, transform: manifest.transform }));
})().catch(error => { console.error(error); process.exitCode = 1; });
