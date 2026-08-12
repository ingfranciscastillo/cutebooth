import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
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
	onCanvas,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	caption: string;
	format: StripFormat;
	shotCount: ShotCount;
	onCanvas?: (canvas: HTMLCanvasElement) => void;
}) {
	const [url, setUrl] = useState<string | null>(null);
	const onCanvasRef = useRef(onCanvas);
	onCanvasRef.current = onCanvas;
	const layout = getLayout(format, shotCount);

	const render = useDebouncedCallback(
		(
			p: HTMLCanvasElement[],
			t: StripTheme,
			c: string,
			f: StripFormat,
			sc: ShotCount,
		) => {
			const canvas = renderStrip({
				photos: p,
				theme: t,
				caption: c,
				format: f,
				shotCount: sc,
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

		render(photos, theme, caption, format, shotCount);

		return () => {
			render.cancel();
		};
	}, [photos, theme, caption, render, format, shotCount]);

	return (
		<div
			className="animate-scale-in relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl shadow-booth-lg"
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
