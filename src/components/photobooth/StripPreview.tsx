import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { type AspectId, DEFAULT_ASPECT } from "@/lib/photobooth/aspects";
import {
	getLayout,
	type ShotCount,
	type StripFormat,
} from "@/lib/photobooth/layouts";
import { renderStrip } from "@/lib/photobooth/renderStrip";
import type { StripTheme } from "@/lib/photobooth/themes";

export function StripPreview({
	photos,
	theme,
	caption,
	format,
	shotCount,
	aspect = DEFAULT_ASPECT,
	onCanvas,
	className,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	caption: string;
	format: StripFormat;
	shotCount: ShotCount;
	aspect?: AspectId;
	onCanvas?: (canvas: HTMLCanvasElement) => void;
	className?: string;
}) {
	const [url, setUrl] = useState<string | null>(null);
	const onCanvasRef = useRef(onCanvas);
	onCanvasRef.current = onCanvas;
	const layout = getLayout(format, shotCount, aspect);

	const render = useDebouncedCallback(
		(
			p: HTMLCanvasElement[],
			t: StripTheme,
			c: string,
			f: StripFormat,
			sc: ShotCount,
			a: AspectId,
		) => {
			const canvas = renderStrip({
				photos: p,
				theme: t,
				caption: c,
				format: f,
				shotCount: sc,
				aspect: a,
				scale: 2,
			});
			onCanvasRef.current?.(canvas);
			canvas.toBlob(
				(blob) => {
					if (!blob) return;
					const next = URL.createObjectURL(blob);
					setUrl((prev) => {
						if (prev) URL.revokeObjectURL(prev);
						return next;
					});
				},
				"image/jpeg",
				0.85,
			);
		},
		150,
	);

	useEffect(() => {
		if (photos.length === 0) {
			render.cancel();
			return;
		}

		render(photos, theme, caption, format, shotCount, aspect);

		return () => {
			render.cancel();
		};
	}, [photos, theme, caption, render, format, shotCount, aspect]);

	return (
		<div
			className={`animate-scale-in relative mx-auto w-full overflow-hidden rounded-xl shadow-booth-lg ${
				className ?? (format === "vertical" ? "max-w-[320px]" : "max-w-130")
			}`}
			style={{
				aspectRatio: `${layout.width} / ${layout.height}`,
				backgroundColor: theme.paper,
			}}
		>
			{url && (
				<img src={url} alt="Your strip" className="size-full object-contain" />
			)}
		</div>
	);
}
