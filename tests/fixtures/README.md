# Synthetic workspace fixtures

These files are **illustration-derived synthetic test fixtures**, not photographs, camera captures, or evidence of successful real-device tracking.

- `desk-reference.png`: the editable `dist/assets/desk-organizer.svg` rendered at 1200 × 760 pixels using sharp/libvips.
- `desk-shifted.png`: the same raster translated exactly **42 pixels right and 24 pixels down**. The original rightmost 42 and bottommost 24 pixels are cropped; the exposed left/top border is filled with `#e8e2d4`. Dimensions remain 1200 × 760.
- `manifest.json`: renderer versions, provenance, and the ground-truth transform in pixel and normalized coordinates.

Both PNGs include an EXIF description identifying them as synthetic illustrations. They are useful for photo-import paths and deterministic feature-matching regression checks. They do not validate camera permissions, lighting changes, object movement, speech recognition, or iPhone Safari performance.

To regenerate, install/provide `sharp`, then run `node tests/fixtures/generate-fixtures.cjs` from the app directory. A bundled package directory can alternatively be supplied through `THREADBACK_NODE_MODULE_DIR`.
