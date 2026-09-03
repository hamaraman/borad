/**
 * PWA 아이콘 생성 스크립트
 * - client/public/logo.jpg(1024x1024)를 읽어 설치 가능한 PNG 아이콘을 생성합니다.
 * - Chrome 설치 기준: 선언된 sizes와 실제 이미지 크기가 일치해야 합니다.
 *   (실제 크기와 다른 sizes를 선언하면 아이콘이 무시되어 설치 불가 처리됩니다.)
 *
 * 사용법: pnpm icons
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "client", "public", "logo.jpg");
const outDir = path.join(root, "client", "public");

// manifest background_color와 동일하게 유지
const BACKGROUND = "#f7f5f0";
// maskable 안전 영역(80%) 안에 로고가 들어가도록 70%로 축소
const MASKABLE_RATIO = 0.7;

await sharp(src).resize(192, 192, { fit: "cover" }).png().toFile(path.join(outDir, "icon-192.png"));
await sharp(src).resize(512, 512, { fit: "cover" }).png().toFile(path.join(outDir, "icon-512.png"));

const maskableSize = Math.round(512 * MASKABLE_RATIO);
const offset = Math.round((512 - maskableSize) / 2);
const logo = await sharp(src).resize(maskableSize, maskableSize, { fit: "cover" }).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: BACKGROUND } })
  .composite([{ input: logo, left: offset, top: offset }])
  .png()
  .toFile(path.join(outDir, "icon-maskable-512.png"));

await sharp(src).resize(180, 180, { fit: "cover" }).png().toFile(path.join(outDir, "apple-touch-icon.png"));

console.log("PWA icons generated in client/public/: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png");