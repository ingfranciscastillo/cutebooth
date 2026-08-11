import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "photobooth:muted";

type Ctor = typeof AudioContext;

function getCtx(ref: React.RefObject<AudioContext | null>) {
	if (typeof window === "undefined") return null;
	if (!ref.current) {
		const Ctx: Ctor | undefined =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
		if (!Ctx) return null;
		ref.current = new Ctx();
	}
	return ref.current;
}

export function useSound() {
	const ctxRef = useRef<AudioContext | null>(null);
	const [muted, setMuted] = useState(false);

	useEffect(() => {
		try {
			setMuted(window.localStorage.getItem(STORAGE_KEY) === "1");
		} catch {
			/* ignore */
		}
	}, []);

	const toggleMuted = useCallback(() => {
		setMuted((m) => {
			const next = !m;
			try {
				window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
			} catch {
				/* ignore */
			}
			return next;
		});
	}, []);

	/** Call from a user gesture so mobile browsers allow audio. */
	const unlock = useCallback(() => {
		const ctx = getCtx(ctxRef);
		if (ctx && ctx.state === "suspended") void ctx.resume();
	}, []);

	const tone = useCallback(
		(freq: number, duration: number, type: OscillatorType, gain: number) => {
			if (muted) return;
			const ctx = getCtx(ctxRef);
			if (!ctx) return;
			if (ctx.state === "suspended") void ctx.resume();
			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const amp = ctx.createGain();
			osc.type = type;
			osc.frequency.setValueAtTime(freq, now);
			amp.gain.setValueAtTime(0.0001, now);
			amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
			amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
			osc.connect(amp).connect(ctx.destination);
			osc.start(now);
			osc.stop(now + duration + 0.02);
		},
		[muted],
	);

	/** soft countdown tick */
	const beep = useCallback(() => tone(880, 0.09, "sine", 0.12), [tone]);

	/** shutter: bright click + short noise-ish thunk */
	const shutter = useCallback(() => {
		tone(2200, 0.045, "square", 0.1);
		window.setTimeout(() => tone(1200, 0.07, "triangle", 0.09), 55);
	}, [tone]);

	return { muted, toggleMuted, unlock, beep, shutter };
}
