/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const root = path.resolve(__dirname, '..');
  const iconSrc = path.join(root, 'public', 'icon.png');

  // Verify icon source exists
  if (!fs.existsSync(iconSrc)) {
    throw new Error('public/icon.png not found');
  }

  // 1. Create high-quality circular mask for 512x512
  // Radius 248 allows anti-aliasing without hitting 512x512 boundaries
  const clipMaskSvg = Buffer.from(
    '<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">' +
    '  <circle cx="256" cy="256" r="248" fill="#ffffff" />' +
    '</svg>'
  );

  // 2. Clean Circle Icon (purpose: "any", favicons, mockups, etc.)
  // Transparent outside the perfect circle
  const cleanCircle512 = await sharp(iconSrc)
    .composite([{
      input: clipMaskSvg,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(root, 'public', 'icons', 'icon-512x512.png'), cleanCircle512);
  
  const cleanCircle192 = await sharp(cleanCircle512).resize(192, 192).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'icons', 'icon-192x192.png'), cleanCircle192);

  fs.writeFileSync(path.join(root, 'public', 'icon.png'), cleanCircle512);
  fs.writeFileSync(path.join(root, 'src', 'app', 'icon.png'), cleanCircle512);

  // 3. Clean Maskable Icon (purpose: "maskable" for Android Home Screen & WebAPK Splash)
  // Background is 100% solid warm cream #FAF0E6.
  // The floral "A" mark is centered and scaled safely to 80% (within radius 204.8 safe zone).
  // There are ZERO dark green edges, ZERO cut-off artifacts.
  const scaledMark = await sharp(iconSrc)
    .resize(410, 410, { fit: 'contain' })
    .toBuffer();

  const maskable512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 250, g: 240, b: 230, alpha: 1 } // #FAF0E6
    }
  })
  .composite([{
    input: scaledMark,
    gravity: 'center'
  }])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(root, 'public', 'icons', 'icon-maskable-512x512.png'), maskable512);

  const maskable192 = await sharp(maskable512).resize(192, 192).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'icons', 'icon-maskable-192x192.png'), maskable192);

  // 4. Apple Touch Icon (180x180 solid #FAF0E6 with centered mark)
  const appleTouch = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 250, g: 240, b: 230, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp(scaledMark).resize(144, 144, { fit: 'contain' }).toBuffer(),
    gravity: 'center'
  }])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(root, 'public', 'apple-icon.png'), appleTouch);
  fs.writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), appleTouch);
  fs.writeFileSync(path.join(root, 'src', 'app', 'apple-icon.png'), appleTouch);

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
