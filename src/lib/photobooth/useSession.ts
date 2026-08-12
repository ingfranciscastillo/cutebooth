import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTO_ASPECT } from "./renderStrip";

export const SHOT_COUNT = 4;

type Phase = "idle" | "countdown" | "flash" | "review" | "done";

function captureFrame(video: HTMLVideoElement, mirror: boolean) {
	const vw = video.videoWidth;
	const vh = video.videoHeight;
	if (!vw || !vh) return null;
	// center-crop to the strip cell aspect
	let sw = vw;
	let sh = Math.round(vw / PHOTO_ASPECT);
	if (sh > vh) {
		sh = vh;
		sw = Math.round(vh * PHOTO_ASPECT);
	}
	const sx = (vw - sw) / 2;
	const sy = (vh - sh) / 2;
	const canvas = document.createElement("canvas");
	canvas.width = sw;
	canvas.height = sh;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("2D canvas context unavailable");
	}
	// the selfie preview is mirrored, the print should read naturally
	if (mirror) {
		ctx.translate(sw, 0);
		ctx.scale(-1, 1);
	}
	ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
	return canvas;
}

type Options = {
	mirror?: boolean;
	shotCount?: number;
	onTick?: () => void;
	onShutter?: () => void;
};

export function useSession(
	videoRef: React.RefObject<HTMLVideoElement | null>,
	onComplete: (photos: HTMLCanvasElement[]) => void,
	options: Options = {},
) {
	const [phase, setPhase] = useState<Phase>("idle");
	const [count, setCount] = useState(3);
	const [shotIndex, setShotIndex] = useState(0);
	const [preview, setPreview] = useState<string | null>(null);

	const photosRef = useRef<HTMLCanvasElement[]>([]);
	const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const clear = useCallback(() => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
	}, []);

	const later = useCallback((fn: () => void, ms: number) => {
		timers.current.push(setTimeout(fn, ms));
	}, []);

	const runShot = useCallback(
		(index: number) => {
			setShotIndex(index);
			setPreview(null);
			setPhase("countdown");
			setCount(3);
			optionsRef.current.onTick?.();
			later(() => {
				setCount(2);
				optionsRef.current.onTick?.();
			}, 1000);
			later(() => {
				setCount(1);
				optionsRef.current.onTick?.();
			}, 2000);
			later(() => {
				const video = videoRef.current;
				const frame = video
					? captureFrame(video, optionsRef.current.mirror !== false)
					: null;
				if (frame) photosRef.current.push(frame);
				optionsRef.current.onShutter?.();
				setPhase("flash");
				setPreview(frame ? frame.toDataURL("image/jpeg", 0.92) : null);
				later(() => setPhase("review"), 260);
				later(() => {
					const target = optionsRef.current.shotCount ?? SHOT_COUNT;
					if (photosRef.current.length >= target) {
						setPhase("done");
						onCompleteRef.current(photosRef.current);
					} else {
						runShot(index + 1);
					}
				}, 1300);
			}, 3000);
		},
		[later, videoRef],
	);

	const start = useCallback(() => {
		clear();
		photosRef.current = [];
		runShot(0);
	}, [clear, runShot]);

	const reset = useCallback(() => {
		clear();
		photosRef.current = [];
		setPhase("idle");
		setShotIndex(0);
		setPreview(null);
	}, [clear]);

	useEffect(() => () => clear(), [clear]);

	return { phase, count, shotIndex, preview, start, reset };
}
