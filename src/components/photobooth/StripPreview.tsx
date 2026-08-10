import { useEffect, useRef, useState } from "react";
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

	useEffect(() => {
		if (photos.length === 0) return;
		const canvas = renderStrip({ photos, theme, caption, scale: 2 });
		onCanvasRef.current?.(canvas);
		setUrl(canvas.toDataURL("image/png"));
	}, [photos, theme, caption]);

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
