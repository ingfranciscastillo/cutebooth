import { type AspectId, DEFAULT_ASPECT, getAspect } from "./aspects";

export type StripFormat = "vertical" | "horizontal" | "square" | "polaroid";
export type ShotCount = 2 | 4 | 6;

export const SHOT_COUNTS: ShotCount[] = [2, 4, 6];

export const FORMATS: { id: StripFormat; name: string; hint: string }[] = [
	{ id: "vertical", name: "Vertical strip", hint: "Classic booth strip" },
	{ id: "horizontal", name: "Horizontal", hint: "Wide print" },
	{ id: "square", name: "Square", hint: "1080 for socials" },
	{ id: "polaroid", name: "Polaroid", hint: "Instant cards" },
];

export type Cell = {
	x: number;
	y: number;
	w: number;
	h: number;
	/** rotation in radians, used by polaroid cards */
	rotate?: number;
	/** draw a white instant-photo card around the image */
	polaroid?: boolean;
	/** polaroid: inner image window size (image may be smaller than the card if aspect doesn't fill it) */
	imgW?: number;
	imgH?: number;
};

export type Layout = {
	format: StripFormat;
	width: number;
	height: number;
	/** font scale relative to the 600px vertical strip */
	unit: number;
	cells: Cell[];
	wordmark: { x: number; y: number; size: number };
	caption: { x: number; y: number; size: number };
	stamp: { x: number; y: number; size: number };
	rule: { x: number; y: number; w: number } | null;
	decor: { x: number; y: number; w: number; h: number };
	/** polaroid: caption/date printed on the bottom lip of each card */
	lipText: boolean;
};

function grid(n: number) {
	if (n <= 2) return { cols: 2, rows: 1 };
	if (n <= 4) return { cols: 2, rows: 2 };
	return { cols: 3, rows: 2 };
}

/** cell size for a target aspect, capped so tall ratios don't create endless sheets */
function cell(maxW: number, maxH: number, aspect: number) {
	let w = maxW;
	let h = w / aspect;
	if (h > maxH) {
		h = maxH;
		w = h * aspect;
	}
	return { w: Math.round(w), h: Math.round(h) };
}

function vertical(n: number, aspect: number): Layout {
	const W = 600;
	const PAD = 26;
	const GAP = 14;
	const HEADER = 54;
	const FOOTER = 132;

	// custom 2x3 grid for 6 shots — keeps the strip from becoming an
	// endless single-column sheet instead of stacking all 6 vertically
	if (n === 6) {
		const cols = 2;
		const rows = 3;
		const areaW = W - PAD * 2;
		const boxW = (areaW - GAP * (cols - 1)) / cols;
		// 250 cap ~= the original fixed 4:3 height (200px) with headroom for other aspects
		const { w: cellW, h: cellH } = cell(boxW, 250, aspect);
		const offX = (boxW - cellW) / 2;
		const cells: Cell[] = [];
		for (let i = 0; i < n; i++) {
			const c = i % cols;
			const r = Math.floor(i / cols);
			cells.push({
				x: PAD + c * (boxW + GAP) + offX,
				y: HEADER + r * (cellH + GAP),
				w: cellW,
				h: cellH,
			});
		}
		const H = PAD + HEADER + cellH * rows + GAP * (rows - 1) + FOOTER;
		const footTop = HEADER + rows * cellH + (rows - 1) * GAP;
		return {
			format: "vertical",
			width: W,
			height: H,
			unit: 1,
			cells,
			wordmark: { x: W / 2, y: PAD + 8, size: 22 },
			caption: { x: W / 2, y: footTop + 58, size: 26 },
			stamp: { x: W / 2, y: footTop + 90, size: 13 },
			rule: { x: W / 2 - 42, y: footTop + 26, w: 84 },
			decor: { x: 0, y: HEADER + 8, w: W, h: footTop - HEADER - 16 },
			lipText: false,
		};
	}

	const maxH = n <= 2 ? 660 : 440;
	const { w: pw, h: ph } = cell(W - PAD * 2, maxH, aspect);
	const left = Math.round((W - pw) / 2);
	const H = PAD + HEADER + ph * n + GAP * (n - 1) + FOOTER;
	const cells: Cell[] = [];
	for (let i = 0; i < n; i++)
		cells.push({ x: left, y: HEADER + i * (ph + GAP), w: pw, h: ph });
	const footTop = HEADER + n * ph + (n - 1) * GAP;
	return {
		format: "vertical",
		width: W,
		height: H,
		unit: 1,
		cells,
		wordmark: { x: W / 2, y: PAD + 8, size: 22 },
		caption: { x: W / 2, y: footTop + 58, size: 26 },
		stamp: { x: W / 2, y: footTop + 90, size: 13 },
		rule: { x: W / 2 - 42, y: footTop + 26, w: 84 },
		decor: { x: 0, y: HEADER + 8, w: W, h: footTop - HEADER - 16 },
		lipText: false,
	};
}

function horizontal(n: number, aspect: number): Layout {
	const PAD = 28;
	const GAP = 14;
	const HEADER = 54;
	const FOOTER = 120;
	const cols = n <= 4 ? n : 3;
	const rows = Math.ceil(n / cols);
	const { w: pw, h: ph } = cell(300, rows === 1 ? 460 : 340, aspect);
	const W = PAD * 2 + cols * pw + GAP * (cols - 1);
	const H = HEADER + rows * ph + GAP * (rows - 1) + FOOTER;
	const cells: Cell[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % cols;
		const r = Math.floor(i / cols);
		cells.push({
			x: PAD + c * (pw + GAP),
			y: HEADER + r * (ph + GAP),
			w: pw,
			h: ph,
		});
	}
	const footTop = HEADER + rows * ph + (rows - 1) * GAP;
	return {
		format: "horizontal",
		width: W,
		height: H,
		unit: 1,
		cells,
		wordmark: { x: W / 2, y: 30, size: 22 },
		caption: { x: W / 2, y: footTop + 52, size: 28 },
		stamp: { x: W / 2, y: footTop + 84, size: 13 },
		rule: { x: W / 2 - 46, y: footTop + 22, w: 92 },
		decor: { x: 0, y: HEADER + 8, w: W, h: footTop - HEADER - 16 },
		lipText: false,
	};
}

function square(n: number, aspect: number): Layout {
	const S = 1080;
	const M = 68;
	const GAP = 18;
	const TOP = 118;
	const BAND = 176;
	const { cols, rows } = grid(n);
	const areaW = S - M * 2;
	const areaH = S - BAND - TOP;

	// force uniform SQUARE boxes (grid-of-squares look), same as before —
	// then fit the chosen photo aspect inside each square box, centered
	const box = Math.min(
		(areaW - GAP * (cols - 1)) / cols,
		(areaH - GAP * (rows - 1)) / rows,
	);
	const gridW = cols * box + GAP * (cols - 1);
	const gridH = rows * box + GAP * (rows - 1);
	const startX = M + (areaW - gridW) / 2;
	const startY = TOP + (areaH - gridH) / 2;

	const { w: pw, h: ph } = cell(box, box, aspect);
	const offX = (box - pw) / 2;
	const offY = (box - ph) / 2;

	const cells: Cell[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % cols;
		const r = Math.floor(i / cols);
		cells.push({
			x: startX + c * (box + GAP) + offX,
			y: startY + r * (box + GAP) + offY,
			w: pw,
			h: ph,
		});
	}
	const footTop = startY + rows * box + (rows - 1) * GAP;
	return {
		format: "square",
		width: S,
		height: S,
		unit: 1.6,
		cells,
		wordmark: { x: S / 2, y: 62, size: 30 },
		caption: { x: S / 2, y: footTop + 78, size: 44 },
		stamp: { x: S / 2, y: footTop + 126, size: 20 },
		rule: { x: S / 2 - 60, y: footTop + 38, w: 120 },
		decor: { x: 0, y: TOP + 8, w: S, h: footTop - TOP - 16 },
		lipText: false,
	};
}

function polaroid(n: number, aspect: number): Layout {
	const BORDER = 18;
	const LIP = 70;
	const { w: imgW, h: imgH } = cell(264, 420, aspect);
	const CARD_W = imgW + BORDER * 2;
	const CARD_H = BORDER + imgH + LIP;
	const M = 46;
	const GAP = 28;
	const HEADER = 62;
	const FOOTER = 116;
	const cols = n <= 2 ? 2 : n <= 4 ? 2 : 3;
	const rows = Math.ceil(n / cols);
	const W = M * 2 + cols * CARD_W + GAP * (cols - 1);
	const H = HEADER + rows * CARD_H + GAP * (rows - 1) + FOOTER;
	const cells: Cell[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % cols;
		const r = Math.floor(i / cols);
		cells.push({
			x: M + c * (CARD_W + GAP),
			y: HEADER + r * (CARD_H + GAP),
			w: CARD_W,
			h: CARD_H,
			imgW,
			imgH,
			rotate: ((i % 2 === 0 ? -1 : 1) * 1.3 * Math.PI) / 180,
			polaroid: true,
		});
	}
	const footTop = HEADER + rows * CARD_H + (rows - 1) * GAP;
	return {
		format: "polaroid",
		width: W,
		height: H,
		unit: 1,
		cells,
		wordmark: { x: W / 2, y: 34, size: 22 },
		caption: { x: W / 2, y: footTop + 52, size: 26 },
		stamp: { x: W / 2, y: footTop + 82, size: 13 },
		rule: { x: W / 2 - 42, y: footTop + 22, w: 84 },
		decor: { x: 0, y: HEADER, w: W, h: footTop - HEADER },
		lipText: true,
	};
}

export const POLAROID = { BORDER: 18, LIP: 70 };

export function getLayout(
	format: StripFormat,
	shots: number,
	aspectId: AspectId = DEFAULT_ASPECT,
): Layout {
	const n = Math.max(1, shots);
	const aspect = getAspect(aspectId).value;
	switch (format) {
		case "horizontal":
			return horizontal(n, aspect);
		case "square":
			return square(n, aspect);
		case "polaroid":
			return polaroid(n, aspect);
		default:
			return vertical(n, aspect);
	}
}
