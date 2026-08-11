export function canShareFiles() {
	if (
		typeof navigator === "undefined" ||
		!navigator.share ||
		!navigator.canShare
	)
		return false;
	try {
		const probe = new File(
			[new Blob([""], { type: "image/png" })],
			"probe.png",
			{
				type: "image/png",
			},
		);
		return navigator.canShare({ files: [probe] });
	} catch {
		return false;
	}
}

function toBlob(canvas: HTMLCanvasElement) {
	return new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, "image/png"),
	);
}

export type ShareResult = "shared" | "cancelled" | "unsupported" | "failed";

/** Hands the PNG straight to the OS share sheet — nothing is uploaded. */
export async function shareStrip(
	canvas: HTMLCanvasElement,
	filename: string,
): Promise<ShareResult> {
	if (!canShareFiles()) return "unsupported";
	const blob = await toBlob(canvas);
	if (!blob) return "failed";
	const file = new File([blob], filename, { type: "image/png" });
	if (!navigator.canShare?.({ files: [file] })) return "unsupported";
	try {
		await navigator.share({ files: [file], title: "My photo strip" });
		return "shared";
	} catch (err) {
		if ((err as DOMException)?.name === "AbortError") return "cancelled";
		return "failed";
	}
}
