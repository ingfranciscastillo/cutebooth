import { Lock, Sparkles } from "lucide-react";

export function LandingScreen({ onStart }: { onStart: () => void }) {
	return (
		<div className="animate-fade-in flex flex-col items-center text-center">
			<span className="inline-flex items-center gap-2 rounded-full border border-booth-ink/10 bg-booth-paper px-4 py-1.5 font-mono text-xs font-semibold tracking-[0.25em] text-booth-ink/60">
				<Sparkles className="size-3.5" /> 4 SHOTS · 1 STRIP
			</span>

			<h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] text-booth-ink sm:text-8xl">
				photo
				<span className="text-booth-accent">booth</span>
			</h1>
			<p className="mt-5 max-w-md text-lg text-booth-ink/60">
				Step in, pick a frame, strike four poses. Your strip prints out in
				seconds.
			</p>

			<button
				type="button"
				onClick={onStart}
				className="group relative mt-10 rounded-full bg-booth-accent px-16 py-6 font-display text-3xl font-bold tracking-wide text-booth-paper shadow-booth-lg transition-transform duration-200 hover:scale-105 active:scale-95"
			>
				<span className="absolute inset-0 animate-booth-glow rounded-full bg-booth-accent" />
				<span className="relative">START</span>
			</button>

			<p className="mt-8 inline-flex items-center gap-2 text-sm text-booth-ink/45">
				<Lock className="size-3.5" /> Everything stays on your device — nothing
				is uploaded.
			</p>
		</div>
	);
}
