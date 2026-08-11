import { CameraIcon } from "@solar-icons/react/bold/camera";
import { LockIcon } from "@solar-icons/react/bold/lock";

export function LandingScreen({ onStart }: { onStart: () => void }) {
	return (
		<div className="animate-fade-in flex flex-col items-center text-center">
			<div className="flex items-center gap-0">
				<span className="relative flex size-14 shrink-0 items-center justify-center sm:size-20">
					<span className="booth-camera-flash absolute inset-0 rounded-full bg-booth-accent/50" />
					<CameraIcon className="booth-camera-snap relative size-9 text-booth-ink sm:size-14" />
				</span>
				<h1 className="font-display text-6xl font-bold leading-[0.95] text-booth-ink sm:text-8xl">
					photo
					<span className="text-booth-accent">booth</span>
				</h1>
			</div>

			<p className="mt-5 max-w-md text-lg text-booth-ink/60">
				Pick a frame, strike a pose, and make a little memory.
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
				<LockIcon className="size-3.5" /> Everything stays on your device —
				nothing is uploaded.
			</p>
		</div>
	);
}
