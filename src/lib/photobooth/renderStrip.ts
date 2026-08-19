import {
	getLayout,
	type Layout,
	POLAROID,
	type ShotCount,
	type StripFormat,
} from "./layouts";
import type { StripTheme } from "./themes";

export const PHOTO_ASPECT = 4 / 3;

export type StripOptions = {
	photos: CanvasImageSource[];
	theme: StripTheme;
	caption: string;
	format?: StripFormat;
	shotCount?: ShotCount | number;
	scale?: number;
};

export function getStripSize(format: StripFormat, shotCount: number) {
	const l = getLayout(format, shotCount);
	return { width: l.width, height: l.height };
}

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

/** decorations live in the margins around the photo area */
function drawDecor(
	ctx: CanvasRenderingContext2D,
	theme: StripTheme,
	layout: Layout,
) {
	if (theme.decor === "none") return;
	const { decor, cells, unit } = layout;
	const left = Math.min(...cells.map((c) => c.x));
	const right = Math.max(...cells.map((c) => c.x + c.w));
	const gutter = Math.max(left, decor.x + decor.w - right);
	if (gutter < 10) return;

	ctx.save();
	ctx.fillStyle = theme.accent;
	ctx.globalAlpha = 0.85;

	for (let i = 0; i < 26; i++) {
		const onLeft = i % 2 === 0;
		const x = onLeft
			? 5 + rand(i) * (left - 10)
			: right + 4 + rand(i + 40) * (decor.x + decor.w - right - 9);
		const y = decor.y + rand(i + 90) * decor.h;
		const s = (3 + rand(i + 130) * 4) * unit;
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

function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
	ctx.save();
	ctx.globalAlpha = 0.035;
	const count = Math.round((w * h) / 320);
	for (let i = 0; i < count; i++) {
		const x = rand(i * 1.7) * w;
		const y = rand(i * 2.3 + 11) * h;
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

function dateStamp() {
	const d = new Date();
	return `${String(d.getFullYear())}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
		d.getDate(),
	).padStart(2, "0")}`;
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

function drawPhoto(
	ctx: CanvasRenderingContext2D,
	theme: StripTheme,
	src: CanvasImageSource | undefined,
	x: number,
	y: number,
	w: number,
	h: number,
	radius: number,
	scale: number,
) {
	ctx.save();
	roundRect(ctx, x, y, w, h, radius);
	ctx.clip();
	ctx.fillStyle = "rgba(0,0,0,0.08)";
	ctx.fillRect(x, y, w, h);
	if (src) {
		drawCover(ctx, src, x, y, w, h);
		if (theme.filter) {
			applyManualFilter(ctx, x, y, w, h, theme.filter, scale);
		}
	}
	ctx.restore();

	ctx.save();
	roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
	ctx.strokeStyle = theme.photoEdge;
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
}

export function renderStrip({
	photos,
	theme,
	caption,
	format = "vertical",
	shotCount,
	scale = 2,
}: StripOptions) {
	const n = shotCount ?? photos.length ?? 4;
	const layout = getLayout(format, n);
	const { width: W, height: H, unit } = layout;

	const canvas = document.createElement("canvas");
	canvas.width = W * scale;
	canvas.height = H * scale;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) {
		throw new Error("2D canvas context unavailable");
	}
	ctx.scale(scale, scale);

	// paper
	ctx.fillStyle = theme.paper;
	ctx.fillRect(0, 0, W, H);

	// header wordmark
	ctx.fillStyle = theme.ink;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = `700 ${layout.wordmark.size}px 'Baloo 2', system-ui, sans-serif`;
	ctx.letterSpacing = `${Math.round(6 * unit)}px`;
	ctx.fillText("PHOTOBOOTH", layout.wordmark.x, layout.wordmark.y);
	ctx.letterSpacing = "0px";

	const stamp = dateStamp();
	const text = (caption || "").toUpperCase().slice(0, 28);

	layout.cells.forEach((cell, i) => {
		const photo = photos[i];
		ctx.save();
		if (cell.rotate) {
			ctx.translate(cell.x + cell.w / 2, cell.y + cell.h / 2);
			ctx.rotate(cell.rotate);
			ctx.translate(-(cell.x + cell.w / 2), -(cell.y + cell.h / 2));
		}

		if (cell.polaroid) {
			ctx.save();
			ctx.shadowColor = "rgba(0,0,0,0.22)";
			ctx.shadowBlur = 16;
			ctx.shadowOffsetY = 6;
			ctx.fillStyle = "#FFFFFF";
			roundRect(ctx, cell.x, cell.y, cell.w, cell.h, 6);
			ctx.fill();
			ctx.restore();

			const img = cell.w - POLAROID.BORDER * 2;
			drawPhoto(
				ctx,
				theme,
				photo,
				cell.x + POLAROID.BORDER,
				cell.y + POLAROID.BORDER,
				img,
				img,
				3,
				scale,
			);
		} else {
			drawPhoto(
				ctx,
				theme,
				photo,
				cell.x,
				cell.y,
				cell.w,
				cell.h,
				10 * (unit > 1 ? 1.4 : 1),
				scale,
			);
		}
		ctx.restore();
	});

	drawDecor(ctx, theme, layout);

	// footer
	ctx.fillStyle = theme.ink;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	if (layout.rule) {
		ctx.globalAlpha = 0.35;
		ctx.fillRect(layout.rule.x, layout.rule.y, layout.rule.w, 2);
		ctx.globalAlpha = 1;
	}

	ctx.font = `700 ${layout.caption.size}px 'Baloo 2', system-ui, sans-serif`;
	ctx.letterSpacing = `${Math.round(2 * unit)}px`;
	ctx.fillText(text, layout.caption.x, layout.caption.y);

	ctx.letterSpacing = `${Math.round(3 * unit)}px`;
	ctx.globalAlpha = 0.6;
	ctx.font = `500 ${layout.stamp.size}px 'DM Mono', ui-monospace, monospace`;
	ctx.fillText(stamp, layout.stamp.x, layout.stamp.y);
	ctx.globalAlpha = 1;
	ctx.letterSpacing = "0px";

	drawGrain(ctx, W, H);

	return canvas;
}
