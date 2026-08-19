import {
	GalleryFavoriteIcon,
	GalleryIcon,
	GalleryRoundIcon,
	GalleryWideIcon,
} from "@solar-icons/react/bold";
import {
	FORMATS,
	SHOT_COUNTS,
	type ShotCount,
	type StripFormat,
} from "@/lib/photobooth/layouts";

const pill = (active: boolean) =>
	`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
		active
			? "border-booth-ink/70 bg-booth-ink text-booth-paper shadow-booth"
			: "border-booth-ink/15 bg-booth-paper text-booth-ink/70 hover:-translate-y-0.5 hover:border-booth-ink/40"
	}`;

const FORMAT_ICONS: Record<
	StripFormat,
	React.ComponentType<{ className?: string }>
> = {
	vertical: GalleryIcon,
	horizontal: GalleryWideIcon,
	square: GalleryRoundIcon,
	polaroid: GalleryFavoriteIcon,
};

export function FormatPicker({
	value,
	onChange,
}: {
	value: StripFormat;
	onChange: (f: StripFormat) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{FORMATS.map((f) => {
				const Icon = FORMAT_ICONS[f.id];
				const active = value === f.id;
				return (
					<button
						key={f.id}
						type="button"
						onClick={() => onChange(f.id)}
						aria-pressed={active}
						title={f.hint}
						className={pill(active)}
					>
						<Icon className="size-4" />
						{f.name}
					</button>
				);
			})}
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
		<div className="flex flex-wrap items-center gap-2">
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
