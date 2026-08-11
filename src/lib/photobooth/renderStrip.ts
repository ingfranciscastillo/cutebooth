import type { StripTheme } from "./themes";

export const PHOTO_ASPECT = 4 / 3;

const W = 600;
const PAD = 26;
const GAP = 14;
const PHOTO_W = W - PAD * 2;
const PHOTO_H = Math.round(PHOTO_W / PHOTO_ASPECT);
const HEADER = 54;
const FOOTER = 132;
export const STRIP_W = W;
export const STRIP_H = PAD + HEADER + PHOTO_H * 4 + GAP * 3 + FOOTER;

export type StripOptions = {
	photos: CanvasImageSource[];
	theme: StripTheme;
	caption: string;
	scale?: number;
};

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function drawHeart(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	s: number,
) {
	ctx.beginPath();
	ctx.moveTo(x, y + s * 0.3);
	ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.3);
	ctx.bezierCurveTo(x - s / 2, y + s * 0.62, x, y + s * 0.8, x, y + s);
	ctx.bezierCurveTo(
		x,
		y + s * 0.8,
		x + s / 2,
		y + s * 0.62,
		x + s / 2,
		y + s * 0.3,
	);
	ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3);
	ctx.closePath();
	ctx.fill();
}

function drawStar(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	s: number,
) {
	ctx.beginPath();
	for (let i = 0; i < 10; i++) {
		const r = i % 2 === 0 ? s : s * 0.42;
		const a = (Math.PI / 5) * i - Math.PI / 2;
		const px = x + Math.cos(a) * r;
		const py = y + Math.sin(a) * r;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
	ctx.fill();
}

function drawSparkle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	s: number,
) {
	ctx.beginPath();
	ctx.moveTo(x, y - s);
	ctx.quadraticCurveTo(x + s * 0.16, y - s * 0.16, x + s, y);
	ctx.quadraticCurveTo(x + s * 0.16, y + s * 0.16, x, y + s);
	ctx.quadraticCurveTo(x - s * 0.16, y + s * 0.16, x - s, y);
	ctx.quadraticCurveTo(x - s * 0.16, y - s * 0.16, x, y - s);
	ctx.closePath();
	ctx.fill();
}

/** deterministic pseudo-random so re-renders look identical */
function rand(seed: number) {
	const x = Math.sin(seed * 9301 + 49297) * 233280;
	return x - Math.floor(x);
}

function drawDecor(ctx: CanvasRenderingContext2D, theme: StripTheme) {
	if (theme.decor === "none") return;
	ctx.save();
	ctx.fillStyle = theme.accent;
	ctx.globalAlpha = 0.85;

	const spots: Array<[number, number, number]> = [];
	for (let i = 0; i < 26; i++) {
		const left = i % 2 === 0;
		const x = left
			? rand(i) * (PAD - 8) + 5
			: W - PAD + 3 + rand(i + 40) * (PAD - 9);
		const y = HEADER + 8 + rand(i + 90) * (STRIP_H - HEADER - FOOTER - 16);
		spots.push([x, y, 3 + rand(i + 130) * 4]);
	}
	for (const [x, y, s] of spots) {
		switch (theme.decor) {
			case "dots":
				ctx.beginPath();
				ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
				ctx.fill();
				break;
			case "stars":
				drawStar(ctx, x, y, s);
				break;
			case "sparkles":
				drawSparkle(ctx, x, y, s);
				break;
			case "hearts":
				drawHeart(ctx, x, y - s / 2, s);
				break;
			case "confetti":
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(rand(x + y) * Math.PI);
				ctx.fillRect(-s * 0.25, -s * 0.7, s * 0.5, s * 1.4);
				ctx.restore();
				break;
		}
	}
	ctx.restore();
}

function drawGrain(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.globalAlpha = 0.035;
	for (let i = 0; i < 2600; i++) {
		const x = rand(i * 1.7) * W;
		const y = rand(i * 2.3 + 11) * STRIP_H;
		ctx.fillStyle = i % 2 ? "#000" : "#fff";
		ctx.fillRect(x, y, 1, 1);
	}
	ctx.restore();
}

/** Draws a source frame center-cropped into the target rect. */
function drawCover(
	ctx: CanvasRenderingContext2D,
	src: CanvasImageSource,
	x: number,
	y: number,
	w: number,
	h: number,
) {
	const sw =
		(src as HTMLCanvasElement).width ??
		(src as HTMLVideoElement).videoWidth ??
		w;
	const sh =
		(src as HTMLCanvasElement).height ??
		(src as HTMLVideoElement).videoHeight ??
		h;
	const scale = Math.max(w / sw, h / sh);
	const dw = sw * scale;
	const dh = sh * scale;
	ctx.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function renderStrip({
	photos,
	theme,
	caption,
	scale = 2,
}: StripOptions) {
	const canvas = document.createElement("canvas");
	canvas.width = STRIP_W * scale;
	canvas.height = STRIP_H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("2D canvas context unavailable");
	}
	ctx.scale(scale, scale);

	// paper
	ctx.fillStyle = theme.paper;
	ctx.fillRect(0, 0, W, STRIP_H);

	// header wordmark
	ctx.fillStyle = theme.ink;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "700 22px 'Baloo 2', system-ui, sans-serif";
	ctx.letterSpacing = "6px";
	ctx.fillText("PHOTOBOOTH", W / 2, PAD + 8);
	ctx.letterSpacing = "0px";

	// photos
	for (let i = 0; i < 4; i++) {
		const y = HEADER + i * (PHOTO_H + GAP);
		ctx.save();
		roundRect(ctx, PAD, y, PHOTO_W, PHOTO_H, 10);
		ctx.clip();
		ctx.fillStyle = "rgba(0,0,0,0.08)";
		ctx.fillRect(PAD, y, PHOTO_W, PHOTO_H);
		const photo = photos[i];
		if (photo) {
			drawCover(ctx, photo, PAD, y, PHOTO_W, PHOTO_H);
			if (theme.filter) {
				applyManualFilter(ctx, PAD, y, PHOTO_W, PHOTO_H, theme.filter, scale);
			}
		}
		ctx.restore();

		ctx.save();
		roundRect(ctx, PAD + 0.5, y + 0.5, PHOTO_W - 1, PHOTO_H - 1, 10);
		ctx.strokeStyle = theme.photoEdge;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();
	}

	drawDecor(ctx, theme);

	// footer
	const footTop = HEADER + 4 * PHOTO_H + 3 * GAP;
	ctx.fillStyle = theme.ink;
	ctx.textAlign = "center";

	ctx.globalAlpha = 0.35;
	ctx.fillRect(W / 2 - 42, footTop + 26, 84, 2);
	ctx.globalAlpha = 1;

	ctx.font = "700 26px 'Baloo 2', system-ui, sans-serif";
	ctx.letterSpacing = "2px";
	const text = (caption || "").toUpperCase().slice(0, 28);
	ctx.fillText(text, W / 2, footTop + 58);

	ctx.letterSpacing = "3px";
	ctx.globalAlpha = 0.6;
	ctx.font = "500 13px 'DM Mono', ui-monospace, monospace";
	const d = new Date();
	const stamp = `${String(d.getFullYear())}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
		d.getDate(),
	).padStart(2, "0")}`;
	ctx.fillText(stamp, W / 2, footTop + 90);
	ctx.globalAlpha = 1;
	ctx.letterSpacing = "0px";

	drawGrain(ctx);

	return canvas;
}

/** Manual pixel-level filter replacement for ctx.filter, which isn't
 * reliably supported on mobile Safari / some Android WebViews. */
function applyManualFilter(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	filter: string,
	scale: number,
) {
	const px = Math.round(x * scale);
	const py = Math.round(y * scale);
	const pw = Math.round(w * scale);
	const ph = Math.round(h * scale);

	const imgData = ctx.getImageData(px, py, pw, ph);
	const d = imgData.data;

	const wantsGrayscale = filter.includes("grayscale");
	const contrastMatch = filter.match(/contrast\(([\d.]+)\)/);
	const contrast = contrastMatch ? parseFloat(contrastMatch[1]) : 1;

	const wantsSepia = filter.includes("sepia");
	const sepiaMatch = filter.match(/sepia\(([\d.]+)\)/);
	const sepiaAmt = sepiaMatch ? parseFloat(sepiaMatch[1]) : 0;
	const satMatch = filter.match(/saturate\(([\d.]+)\)/);
	const saturate = satMatch ? parseFloat(satMatch[1]) : 1;

	for (let i = 0; i < d.length; i += 4) {
		let r = d[i];
		let g = d[i + 1];
		let b = d[i + 2];

		if (wantsGrayscale) {
			const gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
			r = g = b = gray;
		}

		if (wantsSepia && sepiaAmt > 0) {
			const sr = r * 0.393 + g * 0.769 + b * 0.189;
			const sg = r * 0.349 + g * 0.686 + b * 0.168;
			const sb = r * 0.272 + g * 0.534 + b * 0.131;
			r += (sr - r) * sepiaAmt;
			g += (sg - g) * sepiaAmt;
			b += (sb - b) * sepiaAmt;
		}

		if (saturate !== 1) {
			const gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
			r = gray + (r - gray) * saturate;
			g = gray + (g - gray) * saturate;
			b = gray + (b - gray) * saturate;
		}

		if (contrast !== 1) {
			// CSS contrast() is a plain multiplier around the midpoint, NOT
			// the classic -255..255 "contrast level" formula.
			r = (r - 128) * contrast + 128;
			g = (g - 128) * contrast + 128;
			b = (b - 128) * contrast + 128;
		}

		d[i] = Math.min(255, Math.max(0, r));
		d[i + 1] = Math.min(255, Math.max(0, g));
		d[i + 2] = Math.min(255, Math.max(0, b));
	}

	ctx.putImageData(imgData, px, py);
}
