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

const ASPECT = 4 / 3;

function grid(n: number) {
	if (n <= 2) return { cols: 2, rows: 1 };
	if (n <= 4) return { cols: 2, rows: 2 };
	return { cols: 3, rows: 2 };
}

function vertical(n: number): Layout {
	const W = 600;
	const PAD = 26;
	const GAP = 14;
	const HEADER = 54;
	const FOOTER = 132;

	if (n === 6) {
		const cols = 2;
		const rows = 3;
		const areaW = W - PAD * 2;
		const cellW = (areaW - GAP * (cols - 1)) / cols;
		const cellH = Math.round(cellW / ASPECT);
		const cells: Cell[] = [];
		for (let i = 0; i < n; i++) {
			const c = i % cols;
			const r = Math.floor(i / cols);
			cells.push({
				x: PAD + c * (cellW + GAP),
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

	const pw = W - PAD * 2;
	const ph = Math.round(pw / ASPECT);
	const H = PAD + HEADER + ph * n + GAP * (n - 1) + FOOTER;
	const cells: Cell[] = [];
	for (let i = 0; i < n; i++)
		cells.push({ x: PAD, y: HEADER + i * (ph + GAP), w: pw, h: ph });
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

function horizontal(n: number): Layout {
	const PAD = 28;
	const GAP = 14;
	const HEADER = 54;
	const FOOTER = 120;
	const cols = n <= 4 ? n : 3;
	const rows = Math.ceil(n / cols);
	const pw = 300;
	const ph = Math.round(pw / ASPECT);
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

function square(n: number): Layout {
	const S = 1080;
	const M = 68;
	const GAP = 18;
	const TOP = 118;
	const BAND = 176;
	const { cols, rows } = grid(n);
	const areaW = S - M * 2;
	const areaH = S - BAND - TOP;

	const cell = Math.min(
		(areaW - GAP * (cols - 1)) / cols,
		(areaH - GAP * (rows - 1)) / rows,
	);
	const gridW = cols * cell + GAP * (cols - 1);
	const gridH = rows * cell + GAP * (rows - 1);
	const startX = M + (areaW - gridW) / 2;
	const startY = TOP + (areaH - gridH) / 2;

	const cells: Cell[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % cols;
		const r = Math.floor(i / cols);
		cells.push({
			x: startX + c * (cell + GAP),
			y: startY + r * (cell + GAP),
			w: cell,
			h: cell,
		});
	}
	const footTop = startY + rows * cell + (rows - 1) * GAP;
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

function polaroid(n: number): Layout {
	const CARD_W = 300;
	const BORDER = 18;
	const IMG = CARD_W - BORDER * 2;
	const LIP = 70;
	const CARD_H = BORDER + IMG + LIP;
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

export function getLayout(format: StripFormat, shots: number): Layout {
	const n = Math.max(1, shots);
	switch (format) {
		case "horizontal":
			return horizontal(n);
		case "square":
			return square(n);
		case "polaroid":
			return polaroid(n);
		default:
			return vertical(n);
	}
}
