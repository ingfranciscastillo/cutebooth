import { PlayIcon } from "@solar-icons/react/bold";
import {
	ArrowLeftIcon,
	CameraRotateIcon,
	VolumeCrossIcon,
	VolumeLoudIcon,
} from "@solar-icons/react/outline";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AspectPicker } from "@/components/photobooth/AspectPicker";
import { CameraStage } from "@/components/photobooth/CameraStage";
import { ConfirmDialog } from "@/components/photobooth/ConfirmDialog";
import { DevelopingStrip } from "@/components/photobooth/DevelopingStrip";
import { ShotCountPicker } from "@/components/photobooth/FormatPicker";
import { LandingScreen } from "@/components/photobooth/LandingScreen";
import { ResultScreen } from "@/components/photobooth/ResultScreen";
import type { AspectId } from "@/lib/photobooth/aspects";
import { DEFAULT_FORMAT_STATE } from "@/lib/photobooth/constants";
import type { ShotCount, StripFormat } from "@/lib/photobooth/layouts";
import { DEFAULT_THEME, type StripTheme } from "@/lib/photobooth/themes";
import { useCamera } from "@/lib/photobooth/useCamera";
import { useSession } from "@/lib/photobooth/useSession";
import { useSound } from "@/lib/photobooth/useSound";

export const Route = createFileRoute("/")({
	component: Index,
});

type Stage = "landing" | "booth" | "developing" | "result";

function Index() {
	const [stage, setStage] = useState<Stage>("landing");
	const [theme, setTheme] = useState<StripTheme>(DEFAULT_THEME);
	const [caption, setCaption] = useState("KEEP YOURSELF ALIVE");
	const [photos, setPhotos] = useState<HTMLCanvasElement[]>([]);
	const [format, setFormat] = useState<StripFormat>(
		DEFAULT_FORMAT_STATE.format,
	);
	const [shotCount, setShotCount] = useState<ShotCount>(
		DEFAULT_FORMAT_STATE.shotCount,
	);
	const [aspect, setAspect] = useState<AspectId>(DEFAULT_FORMAT_STATE.aspect);
	const [confirmRetake, setConfirmRetake] = useState(false);

	const {
		videoRef,
		status,
		error,
		start: startCamera,
		stop: stopCamera,
		facing,
		setFacing,
		hasMultipleCameras,
	} = useCamera();
	const { muted, toggleMuted, unlock, beep, shutter } = useSound();

	const handleComplete = useCallback(
		(shots: HTMLCanvasElement[]) => {
			setPhotos(shots);
			setStage("developing");
			stopCamera();
		},
		[stopCamera],
	);

	const session = useSession(videoRef, handleComplete, {
		mirror: facing === "user",
		shotCount,
		aspect,
		onTick: beep,
		onShutter: shutter,
	});
	const { phase, reset } = session;

	const enterBooth = () => {
		setPhotos([]);
		reset();
		setStage("booth");
	};

	const askRetake = () => setConfirmRetake(true);

	const confirmedRetake = () => {
		setConfirmRetake(false);
		enterBooth();
	};

	useEffect(() => {
		if (stage === "booth") void startCamera();
	}, [stage, startCamera]);

	const shooting = phase !== "idle" && phase !== "done";

	const beginSession = () => {
		unlock();
		session.start();
	};

	return (
		<main
			id="main-content"
			className="min-h-screen bg-booth-paper font-sans text-booth-ink"
		>
			<div className="pointer-events-none fixed inset-0 opacity-[0.5] [background:radial-gradient(circle_at_15%_10%,var(--color-booth-accent-soft),transparent_45%),radial-gradient(circle_at_85%_85%,var(--color-booth-accent-soft),transparent_45%)]" />

			<div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-12">
				{stage === "landing" && <LandingScreen onStart={enterBooth} />}

				{stage === "booth" && (
					<div className="animate-fade-in w-full max-w-3xl space-y-6">
						<div className="flex items-center justify-between gap-4">
							<button
								type="button"
								onClick={() => {
									reset();
									stopCamera();
									setStage("landing");
								}}
								className="inline-flex items-center gap-2 text-sm font-semibold text-booth-ink/50 transition-colors hover:text-booth-ink"
							>
								<ArrowLeftIcon className="size-4" /> Back
							</button>
							<div className="flex min-w-0 items-center gap-2">
								<p className="truncate font-mono text-[10px] font-semibold tracking-[0.2em] text-booth-ink/45 sm:text-xs sm:tracking-[0.3em]">
									{shooting ? "SMILE!" : `GET READY · ${shotCount} SHOTS`}
								</p>
								<button
									type="button"
									onClick={toggleMuted}
									aria-pressed={muted}
									aria-label={
										muted ? "Unmute shutter sounds" : "Mute shutter sounds"
									}
									title={muted ? "Sound off" : "Sound on"}
									className="inline-flex size-9 items-center justify-center rounded-full border-2 border-booth-ink/15 text-booth-ink/60 transition-colors hover:border-booth-ink/40 hover:text-booth-ink"
								>
									{muted ? (
										<VolumeCrossIcon className="size-4" />
									) : (
										<VolumeLoudIcon className="size-4" />
									)}
								</button>
							</div>
						</div>

						<CameraStage
							videoRef={videoRef}
							status={status}
							error={error}
							onRetry={() => void startCamera()}
							phase={phase}
							count={session.count}
							shotIndex={session.shotIndex}
							preview={session.preview}
							mirrored={facing === "user"}
							shotCount={shotCount}
							aspect={aspect}
						/>

						{!shooting ? (
							<div className="space-y-5">
								<ShotCountPicker value={shotCount} onChange={setShotCount} />
								<AspectPicker value={aspect} onChange={setAspect} />
								{hasMultipleCameras && (
									<div className="flex justify-center">
										<div className="inline-flex items-center gap-1 rounded-full border-2 border-booth-ink/15 p-1">
											<CameraRotateIcon className="ml-2 mr-1 size-4 text-booth-ink/40" />
											{(["user", "environment"] as const).map((f) => (
												<button
													key={f}
													type="button"
													onClick={() => setFacing(f)}
													aria-pressed={facing === f}
													className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
														facing === f
															? "bg-booth-ink text-booth-paper"
															: "text-booth-ink/60 hover:text-booth-ink"
													}`}
												>
													{f === "user" ? "Front" : "Rear"}
												</button>
											))}
										</div>
									</div>
								)}
								<div className="flex justify-center">
									<button
										type="button"
										onClick={beginSession}
										disabled={status !== "ready"}
										className="inline-flex items-center gap-3 rounded-full bg-booth-accent px-12 py-5 font-display text-2xl font-bold text-booth-ink shadow-booth-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<PlayIcon
											aria-hidden="true"
											className="size-6 fill-current"
										/>{" "}
										Start session
									</button>
								</div>
							</div>
						) : (
							<div className="flex justify-center">
								<button
									type="button"
									onClick={askRetake}
									className="rounded-full border-2 border-booth-ink/15 px-6 py-3 text-sm font-bold text-booth-ink/70 transition-colors hover:border-booth-ink/40"
								>
									Cancel &amp; retake session
								</button>
							</div>
						)}
					</div>
				)}

				{stage === "developing" && (
					<DevelopingStrip
						photos={photos}
						theme={theme}
						caption={caption}
						format={format}
						shotCount={shotCount}
						aspect={aspect}
						onDone={() => setStage("result")}
					/>
				)}

				{stage === "result" && (
					<ResultScreen
						photos={photos}
						theme={theme}
						onThemeChange={setTheme}
						caption={caption}
						onCaptionChange={setCaption}
						format={format}
						onFormatChange={setFormat}
						shotCount={shotCount}
						aspect={aspect}
						onRestart={askRetake}
					/>
				)}
			</div>
			<ConfirmDialog
				open={confirmRetake}
				onOpenChange={setConfirmRetake}
				title="Retake the whole session?"
				description={`This clears the ${photos.length || shotCount} photo${
					(photos.length || shotCount) === 1 ? "" : "s"
				} from this session and starts a fresh one. There's no undo.`}
				onConfirm={confirmedRetake}
			/>
		</main>
	);
}
