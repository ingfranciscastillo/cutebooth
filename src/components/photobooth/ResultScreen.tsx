import {
	DownloadMinimalisticIcon,
	RestartIcon,
	ShareIcon,
} from "@solar-icons/react/bold";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { AspectId } from "@/lib/photobooth/aspects";
import type { ShotCount, StripFormat } from "@/lib/photobooth/layouts";
import { canShareFiles, shareStrip } from "@/lib/photobooth/share";
import type { StripTheme } from "@/lib/photobooth/themes";
import { FormatPicker } from "./FormatPicker";
import { StripPreview } from "./StripPreview";
import { ThemePicker } from "./ThemePicker";

export function ResultScreen({
	photos,
	theme,
	onThemeChange,
	caption,
	onCaptionChange,
	format,
	onFormatChange,
	shotCount,
	aspect,
	onRestart,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	onThemeChange: (t: StripTheme) => void;
	caption: string;
	onCaptionChange: (c: string) => void;
	format: StripFormat;
	onFormatChange: (f: StripFormat) => void;
	shotCount: ShotCount;
	aspect: AspectId;
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

		if (!canvas) {
			toast.error("Couldn't save the photo.");
			return;
		}

		setSaving(true);

		canvas.toBlob((blob) => {
			setSaving(false);

			if (!blob) {
				toast.error("Couldn't save the photo.");
				return;
			}

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");

			a.href = url;
			a.download = `photobooth-${Date.now()}.png`;
			a.click();

			URL.revokeObjectURL(url);

			toast.success("Photo saved!");
		}, "image/png");
	};

	const share = async () => {
		const canvas = canvasRef.current;

		if (!canvas) {
			toast.error("Couldn't share the photo.");
			return;
		}

		setSharing(true);

		const result = await shareStrip(canvas, `photobooth-${Date.now()}.png`);

		setSharing(false);

		switch (result) {
			case "shared":
				toast.success("Photo shared!");
				break;
			case "failed":
				toast.error("Couldn't share the photo.");
				break;
		}
	};

	return (
		<div
			aria-live="polite"
			className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]"
		>
			<StripPreview
				photos={photos}
				theme={theme}
				caption={caption}
				format={format}
				shotCount={shotCount}
				aspect={aspect}
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
						One last touch, then it's yours.
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
						aria-describedby="caption-hint"
						onChange={(e) => onCaptionChange(e.target.value)}
						className="w-full rounded-2xl border-2 border-booth-ink/10 bg-booth-paper px-4 py-3 font-semibold uppercase tracking-wide text-booth-ink outline-none transition-colors placeholder:text-booth-ink/30 focus:border-booth-accent"
						placeholder="KEEP YOURSELF ALIVE"
					/>
					<div
						id="caption-hint"
						aria-live="polite"
						className="flex items-center justify-between font-mono text-[10px] font-semibold tracking-[0.2em] text-booth-ink/45"
					>
						<span className="sr-only">
							Characters used: {caption.length} of 28 maximum
						</span>
						<span aria-hidden="true">
							{caption.length === 28 ? "MAX" : `${caption.length} / 28`}
						</span>
					</div>
				</div>

				<div className="space-y-3">
					<p className="font-mono text-xs font-semibold tracking-[0.2em] text-booth-ink/50">
						FORMAT
					</p>
					<FormatPicker value={format} onChange={onFormatChange} />
				</div>

				<div className="space-y-3">
					<p className="font-mono text-xs font-semibold tracking-[0.2em] text-booth-ink/50">
						FRAME
					</p>

					<ThemePicker value={theme} onChange={onThemeChange} />
				</div>

				<div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
					<button
						type="button"
						onClick={download}
						disabled={saving}
						className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-booth-accent px-7 py-3.5 font-display text-lg font-bold text-booth-ink shadow-booth transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 md:basis-full"
					>
						<DownloadMinimalisticIcon aria-hidden="true" className="size-5" />{" "}
						{saving ? "Saving..." : "Save photo"}
					</button>

					{canShare && (
						<button
							type="button"
							onClick={share}
							disabled={sharing}
							className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-booth-ink/15 px-6 py-2.5 font-display text-base font-bold text-booth-ink transition-colors hover:border-booth-ink/40 disabled:opacity-60 md:w-auto md:flex-1"
						>
							<ShareIcon aria-hidden="true" className="size-5" />{" "}
							{sharing ? "Sharing..." : "Share"}
						</button>
					)}

					<button
						type="button"
						onClick={onRestart}
						className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-booth-ink/15 px-6 py-2.5 font-display text-base font-bold text-booth-ink transition-colors hover:border-booth-ink/40 md:w-auto md:flex-1"
					>
						<RestartIcon aria-hidden="true" className="size-5" /> Take another
					</button>
				</div>
			</div>
		</div>
	);
}
