import { CameraIcon, LockIcon, RefreshIcon } from "@solar-icons/react/outline";
import {
	CAMERA_MESSAGES,
	type CameraError,
	type CameraStatus,
} from "@/lib/photobooth/useCamera";
import { CountdownOverlay } from "./CountdownOverlay";

type Props = {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	status: CameraStatus;
	error: CameraError | null;
	onRetry: () => void;
	phase: "idle" | "countdown" | "flash" | "review" | "done";
	count: number;
	shotIndex: number;
	preview: string | null;
	mirrored?: boolean;
	shotCount: number;
};

export function CameraStage({
	videoRef,
	status,
	error,
	onRetry,
	phase,
	count,
	shotIndex,
	preview,
	mirrored = true,
	shotCount,
}: Props) {
	const shooting = phase !== "idle" && phase !== "done";

	return (
		<div
			className={`relative aspect-4/3 w-full overflow-hidden rounded-4xl border-4 border-booth-ink/10 bg-booth-ink shadow-booth-lg ${
				phase === "flash" ? "animate-shutter-shake" : ""
			}`}
		>
			<video
				ref={videoRef}
				aria-label="Camera preview"
				aria-hidden={status !== "ready" || undefined}
				playsInline
				muted
				autoPlay
				className={`size-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
			/>

			{status !== "ready" && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-booth-ink px-6 text-center text-booth-paper">
					{status === "error" && error ? (
						<>
							<p className="font-display text-xl font-bold">
								{CAMERA_MESSAGES[error].title}
							</p>
							<p className="max-w-sm text-sm opacity-70">
								{CAMERA_MESSAGES[error].body}
							</p>
							<button
								type="button"
								onClick={onRetry}
								className="mt-2 inline-flex items-center gap-2 rounded-full bg-booth-paper px-5 py-2.5 text-sm font-bold text-booth-ink transition-transform hover:scale-105"
							>
								<RefreshIcon className="size-4" /> Try again
							</button>
						</>
					) : (
						<>
							<CameraIcon className="size-8 animate-pulse opacity-70" />
							<p className="text-sm opacity-70">Waking up the camera…</p>
						</>
					)}
				</div>
			)}

			{preview && (phase === "flash" || phase === "review") && (
				<img
					src={preview}
					alt={`Captured shot ${shotIndex + 1}`}
					className="animate-fade-in absolute inset-0 size-full object-cover"
				/>
			)}

			{phase === "flash" && (
				<div className="animate-flash absolute inset-0 bg-white" />
			)}

			{phase === "countdown" && <CountdownOverlay count={count} />}

			{shooting && (
				<div
					role="status"
					aria-live="polite"
					aria-label={`Photo ${Math.min(shotIndex + 1, shotCount)} of ${shotCount}`}
					className="absolute left-4 top-4 rounded-full bg-booth-ink/55 px-4 py-1.5 font-mono text-sm font-semibold tracking-widest text-booth-paper backdrop-blur-sm"
				>
					{Math.min(shotIndex + 1, shotCount)} / {shotCount}
				</div>
			)}

			{status === "ready" && !shooting && (
				<div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-booth-ink/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-booth-paper backdrop-blur-sm">
					<span className="size-2 animate-pulse rounded-full bg-booth-accent" />{" "}
					LIVE
				</div>
			)}

			{status === "ready" && !shooting && (
				<>
					<div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-booth-ink/55 px-3 py-1.5 text-xs font-semibold tracking-wide text-booth-paper backdrop-blur-sm">
						<span className="size-2 animate-pulse rounded-full bg-booth-accent" />{" "}
						LIVE
					</div>
					<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-booth-ink/55 px-3 py-1.5 text-xs font-medium text-booth-paper/80 backdrop-blur-sm">
						<LockIcon aria-hidden="true" className="size-3" /> Nothing is
						uploaded — it all stays on your device.
					</div>
				</>
			)}
		</div>
	);
}
