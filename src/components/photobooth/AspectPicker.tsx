import {
	type AspectId,
	aspectsFor,
	getAspect,
	ORIENTATIONS,
	type Orientation,
	orientationOf,
} from "@/lib/photobooth/aspects";

const pill = (active: boolean) =>
	`flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
		active
			? "border-booth-ink/70 bg-booth-ink text-booth-paper shadow-booth"
			: "border-booth-ink/15 bg-booth-paper text-booth-ink/70 hover:-translate-y-0.5 hover:border-booth-ink/40"
	}`;

const ratioPill = (active: boolean) =>
	`flex min-h-11 items-center rounded-full border px-4 font-mono text-xs font-semibold transition-all duration-200 ${
		active
			? "border-booth-accent bg-booth-accent/15 text-booth-ink"
			: "border-booth-ink/15 text-booth-ink/60 hover:border-booth-ink/40"
	}`;

export function AspectPicker({
	value,
	onChange,
}: {
	value: AspectId;
	onChange: (a: AspectId) => void;
}) {
	const orientation = orientationOf(value);

	const pickOrientation = (o: Orientation) => {
		if (o === orientation) return;
		const first = aspectsFor(o)[0];
		if (first) onChange(first.id);
	};

	const ratios = aspectsFor(orientation);

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex flex-wrap items-center justify-center gap-2">
				{ORIENTATIONS.map((o) => (
					<button
						key={o.id}
						type="button"
						onClick={() => pickOrientation(o.id)}
						aria-pressed={orientation === o.id}
						className={pill(orientation === o.id)}
					>
						{o.name}
					</button>
				))}
			</div>
			{ratios.length > 1 && (
				<div className="flex items-center justify-center gap-2">
					{ratios.map((a) => (
						<button
							key={a.id}
							type="button"
							onClick={() => onChange(a.id)}
							aria-pressed={value === a.id}
							className={ratioPill(value === a.id)}
						>
							{a.label}
						</button>
					))}
				</div>
			)}
			<span className="sr-only">{getAspect(value).label} photo shape</span>
		</div>
	);
}
