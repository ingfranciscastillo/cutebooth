import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "idle" | "requesting" | "ready" | "error";
export type CameraError =
	| "denied"
	| "notfound"
	| "busy"
	| "unsupported"
	| "unknown";

export const CAMERA_MESSAGES: Record<
	CameraError,
	{ title: string; body: string }
> = {
	denied: {
		title: "Camera permission blocked",
		body: "Allow camera access in your browser's address bar, then try again.",
	},
	notfound: {
		title: "No camera found",
		body: "Connect a webcam or try a device with a built-in camera.",
	},
	busy: {
		title: "Camera is in use",
		body: "Another app or tab is using your camera. Close it and try again.",
	},
	unsupported: {
		title: "Camera not supported",
		body: "This browser can't access a webcam. Try Chrome, Edge or Safari.",
	},
	unknown: {
		title: "Couldn't start the camera",
		body: "Something went wrong reaching your webcam. Give it another go.",
	},
};

function classify(err: unknown): CameraError {
	const name = (err as DOMException)?.name;
	if (name === "NotAllowedError" || name === "SecurityError") return "denied";
	if (name === "NotFoundError" || name === "OverconstrainedError")
		return "notfound";
	if (name === "NotReadableError" || name === "AbortError") return "busy";
	return "unknown";
}

export function useCamera() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [status, setStatus] = useState<CameraStatus>("idle");
	const [error, setError] = useState<CameraError | null>(null);

	const stop = useCallback(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		if (videoRef.current) videoRef.current.srcObject = null;
		setStatus("idle");
	}, []);

	const start = useCallback(async () => {
		if (
			typeof navigator === "undefined" ||
			!navigator.mediaDevices?.getUserMedia
		) {
			setError("unsupported");
			setStatus("error");
			return;
		}
		setStatus("requesting");
		setError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 960 },
					facingMode: "user",
				},
				audio: false,
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play().catch(() => {});
			}
			setStatus("ready");
		} catch (err) {
			setError(classify(err));
			setStatus("error");
		}
	}, []);

	useEffect(() => () => stop(), [stop]);

	return { videoRef, status, error, start, stop };
}
