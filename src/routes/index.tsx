import { ArrowLeftIcon } from "@solar-icons/react/bold/arrow-left";
import { CameraRotateIcon } from "@solar-icons/react/bold/camera-rotate";
import { PlayIcon } from "@solar-icons/react/bold/play";
import { VolumeCrossIcon } from "@solar-icons/react/bold/volume-cross";
import { VolumeLoudIcon } from "@solar-icons/react/bold/volume-loud";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CameraStage } from "@/components/photobooth/CameraStage";
import { LandingScreen } from "@/components/photobooth/LandingScreen";
import { ResultScreen } from "@/components/photobooth/ResultScreen";
import { DEFAULT_THEME, type StripTheme } from "@/lib/photobooth/themes";
import { useCamera } from "@/lib/photobooth/useCamera";
import { SHOT_COUNT, useSession } from "@/lib/photobooth/useSession";
import { useSound } from "@/lib/photobooth/useSound";

const TITLE = "Photobooth — Cute Korean Photo Strip Maker";
const DESC =
	"Take four webcam photos and print a cute Korean-style vertical photo strip. Fully in your browser, nothing uploaded.";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: DESC },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESC },
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	}),
	component: Index,
});

type Stage = "landing" | "booth" | "result";

function Index() {
	const [stage, setStage] = useState<Stage>("landing");
	const [theme, setTheme] = useState<StripTheme>(DEFAULT_THEME);
	const [caption, setCaption] = useState("KEEP YOURSELF ALIVE");
	const [photos, setPhotos] = useState<HTMLCanvasElement[]>([]);

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
			setStage("result");
			stopCamera();
		},
		[stopCamera],
	);

	const session = useSession(videoRef, handleComplete, {
		mirror: facing === "user",
		onTick: beep,
		onShutter: shutter,
	});
	const { phase, reset } = session;

	const enterBooth = () => {
		setPhotos([]);
		reset();
		setStage("booth");
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
		<main className="min-h-screen bg-booth-paper font-sans text-booth-ink">
			<div className="pointer-events-none fixed inset-0 opacity-[0.5] [background:radial-gradient(circle_at_15%_10%,var(--color-booth-accent-soft),transparent_45%),radial-gradient(circle_at_85%_85%,var(--color-booth-accent-soft),transparent_45%)]" />

			<div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-12">
				{stage === "landing" && <LandingScreen onStart={enterBooth} />}

				{stage === "booth" && (
					<div className="animate-fade-in w-full max-w-3xl space-y-6">
						<div className="flex items-center justify-between">
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
							<div className="flex items-center gap-3">
								<p className="font-mono text-xs font-semibold tracking-[0.3em] text-booth-ink/45">
									{shooting ? "SMILE!" : `PICK A FRAME · ${SHOT_COUNT} SHOTS`}
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
						/>

						{!shooting ? (
							<div className="space-y-5">
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
										className="inline-flex items-center gap-3 rounded-full bg-booth-accent px-12 py-5 font-display text-2xl font-bold text-booth-paper shadow-booth-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<PlayIcon className="size-6 fill-current" /> Start session
									</button>
								</div>
							</div>
						) : (
							<div className="flex justify-center">
								<button
									type="button"
									onClick={reset}
									className="rounded-full border-2 border-booth-ink/15 px-6 py-3 text-sm font-bold text-booth-ink/70 transition-colors hover:border-booth-ink/40"
								>
									Cancel &amp; retake session
								</button>
							</div>
						)}
					</div>
				)}

				{stage === "result" && (
					<ResultScreen
						photos={photos}
						theme={theme}
						onThemeChange={setTheme}
						caption={caption}
						onCaptionChange={setCaption}
						onRestart={enterBooth}
					/>
				)}
			</div>
		</main>
	);
}
