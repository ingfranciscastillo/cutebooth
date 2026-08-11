import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { renderStrip, STRIP_H, STRIP_W } from "@/lib/photobooth/renderStrip";
import type { StripTheme } from "@/lib/photobooth/themes";

export function StripPreview({
	photos,
	theme,
	caption,
	onCanvas,
}: {
	photos: HTMLCanvasElement[];
	theme: StripTheme;
	caption: string;
	onCanvas?: (canvas: HTMLCanvasElement) => void;
}) {
	const [url, setUrl] = useState<string | null>(null);
	const onCanvasRef = useRef(onCanvas);
	onCanvasRef.current = onCanvas;

	const render = useDebouncedCallback(
		(p: HTMLCanvasElement[], t: StripTheme, c: string) => {
			const canvas = renderStrip({ photos: p, theme: t, caption: c, scale: 2 });
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
		if (photos.length === 0) return;
		render(photos, theme, caption);
		return () => render.cancel();
	}, [photos, theme, caption, render]);

	return (
		<div
			className="animate-scale-in relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl shadow-booth-lg"
			style={{
				aspectRatio: `${STRIP_W} / ${STRIP_H}`,
				backgroundColor: theme.paper,
			}}
		>
			{url && (
				<img src={url} alt="Your strip" className="size-full object-contain" />
			)}
		</div>
	);
}
