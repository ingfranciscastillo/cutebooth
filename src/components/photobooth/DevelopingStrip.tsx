import { useEffect, useRef, useState } from "react";
import {
	getLayout,
	type ShotCount,
	type StripFormat,
} from "@/lib/photobooth/layouts";
import { renderStrip } from "@/lib/photobooth/renderStrip";
import type { StripTheme } from "@/lib/photobooth/themes";

const DURATION = 2600;

export function DevelopingStrip({
	photos,
	theme,
	caption,
	format,
	shotCount,
	onDone,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	caption: string;
	format: StripFormat;
	shotCount: ShotCount;
	onDone: () => void;
}) {
	const [url, setUrl] = useState<string | null>(null);
	const layout = getLayout(format, shotCount);
	const doneRef = useRef(onDone);
	doneRef.current = onDone;

	useEffect(() => {
		if (photos.length === 0) return;
		const canvas = renderStrip({
			photos,
			theme,
			caption,
			format,
			shotCount,
			scale: 2,
		});
		setUrl(canvas.toDataURL("image/png"));
	}, [photos, theme, caption, format, shotCount]);

	useEffect(() => {
		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		const t = window.setTimeout(
			() => doneRef.current(),
			reduced ? 400 : DURATION,
		);
		return () => window.clearTimeout(t);
	}, []);

	return (
		<button
			type="button"
			onClick={() => doneRef.current()}
			aria-label="Skip the developing animation"
			className="animate-fade-in flex w-full flex-col items-center gap-6"
		>
			<p className="font-mono text-xs font-semibold tracking-[0.35em] text-booth-ink/50">
				DEVELOPING…
			</p>

			<div className="relative w-full max-w-85">
				{/* printer slot */}
				<div className="mx-auto h-3 w-[112%] translate-x-[-6%] rounded-full bg-booth-ink/85 shadow-booth" />

				<div
					className="animate-print-reveal relative mx-auto -mt-0.5 w-full overflow-hidden rounded-b-xl shadow-booth-lg"
					style={{
						aspectRatio: `${layout.width} / ${layout.height}`,
						backgroundColor: theme.paper,
					}}
				>
					{url && (
						<img
							src={url}
							alt="Your strip developing"
							className="animate-develop size-full object-contain"
						/>
					)}
					<div className="animate-shimmer pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.55),transparent)]" />
				</div>
			</div>

			<p className="text-sm text-booth-ink/45">Tap to skip</p>
		</button>
	);
}
