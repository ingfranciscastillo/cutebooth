import { DownloadMinimalisticIcon } from "@solar-icons/react/bold/download-minimalistic";
import { RestartIcon } from "@solar-icons/react/bold/restart";
import { ShareIcon } from "@solar-icons/react/bold/share";
import { useEffect, useRef, useState } from "react";
import { canShareFiles, shareStrip } from "@/lib/photobooth/share";
import type { StripTheme } from "@/lib/photobooth/themes";
import { StripPreview } from "./StripPreview";
import { ThemePicker } from "./ThemePicker";

export function ResultScreen({
	photos,
	theme,
	onThemeChange,
	caption,
	onCaptionChange,
	onRestart,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	onThemeChange: (t: StripTheme) => void;
	caption: string;
	onCaptionChange: (c: string) => void;
	onRestart: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [saving, setSaving] = useState(false);
	const [sharing, setSharing] = useState(false);
	const [canShare, setCanShare] = useState(false);

	useEffect(() => {
		setCanShare(canShareFiles());
	}, []);

	const download = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		setSaving(true);
		canvas.toBlob((blob) => {
			setSaving(false);
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `photobooth-${Date.now()}.png`;
			a.click();
			URL.revokeObjectURL(url);
		}, "image/png");
	};

	const share = async () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		setSharing(true);
		const result = await shareStrip(canvas, `photobooth-${Date.now()}.png`);
		setSharing(false);
	};

	return (
		<div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
			<StripPreview
				photos={photos}
				theme={theme}
				caption={caption}
				onCanvas={(c) => (canvasRef.current = c)}
			/>

			<div className="space-y-6">
				<div>
					<p className="font-mono text-xs font-semibold tracking-[0.3em] text-booth-ink/50">
						FRESHLY PRINTED
					</p>
					<h2 className="font-display text-4xl font-bold text-booth-ink">
						Looking good.
					</h2>
					<p className="mt-1 text-booth-ink/60">
						Switch the frame or reword the caption — it re-prints instantly.
					</p>
				</div>

				<div className="space-y-3">
					<label
						htmlFor="caption"
						className="font-mono text-xs font-semibold tracking-[0.2em] text-booth-ink/50"
					>
						CAPTION
					</label>
					<input
						id="caption"
						value={caption}
						maxLength={28}
						onChange={(e) => onCaptionChange(e.target.value)}
						className="w-full rounded-2xl border-2 border-booth-ink/10 bg-booth-paper px-4 py-3 font-semibold uppercase tracking-wide text-booth-ink outline-none transition-colors placeholder:text-booth-ink/30 focus:border-booth-accent"
						placeholder="KEEP YOURSELF ALIVE"
					/>
				</div>

				<ThemePicker value={theme} onChange={onThemeChange} />

				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={download}
						disabled={saving}
						className="inline-flex items-center gap-2 rounded-full bg-booth-accent px-7 py-3.5 font-display text-lg font-bold text-booth-paper shadow-booth transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
					>
						<DownloadMinimalisticIcon className="size-5" /> Download PNG
					</button>
					{canShare && (
						<button
							type="button"
							onClick={share}
							disabled={sharing}
							className="inline-flex items-center gap-2 rounded-full border-2 border-booth-ink/15 px-7 py-3.5 font-display text-lg font-bold text-booth-ink transition-colors hover:border-booth-ink/40 disabled:opacity-60"
						>
							<ShareIcon className="size-5" /> Share
						</button>
					)}
					<button
						type="button"
						onClick={onRestart}
						className="inline-flex items-center gap-2 rounded-full border-2 border-booth-ink/15 px-7 py-3.5 font-display text-lg font-bold text-booth-ink transition-colors hover:border-booth-ink/40"
					>
						<RestartIcon className="size-5" /> Take another
					</button>
				</div>
			</div>
		</div>
	);
}
