import {
	FORMATS,
	SHOT_COUNTS,
	type ShotCount,
	type StripFormat,
} from "@/lib/photobooth/layouts";

const pill = (active: boolean) =>
	`rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
		active
			? "border-booth-ink/70 bg-booth-ink text-booth-paper shadow-booth"
			: "border-booth-ink/15 bg-booth-paper text-booth-ink/70 hover:-translate-y-0.5 hover:border-booth-ink/40"
	}`;

export function FormatPicker({
	value,
	onChange,
}: {
	value: StripFormat;
	onChange: (f: StripFormat) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			{FORMATS.map((f) => (
				<button
					key={f.id}
					type="button"
					onClick={() => onChange(f.id)}
					aria-pressed={value === f.id}
					title={f.hint}
					className={pill(value === f.id)}
				>
					{f.name}
				</button>
			))}
		</div>
	);
}

export function ShotCountPicker({
	value,
	onChange,
}: {
	value: ShotCount;
	onChange: (n: ShotCount) => void;
}) {
	return (
		<div className="flex items-center justify-center gap-2">
			{SHOT_COUNTS.map((n) => (
				<button
					key={n}
					type="button"
					onClick={() => onChange(n)}
					aria-pressed={value === n}
					className={pill(value === n)}
				>
					{n} photos
				</button>
			))}
		</div>
	);
}
