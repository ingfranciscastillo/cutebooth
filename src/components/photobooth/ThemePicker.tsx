import { type StripTheme, THEMES } from "@/lib/photobooth/themes";

export function ThemePicker({
	value,
	onChange,
}: {
	value: StripTheme;
	onChange: (t: StripTheme) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			{THEMES.map((t) => {
				const active = t.id === value.id;
				return (
					<button
						key={t.id}
						type="button"
						onClick={() => onChange(t)}
						aria-pressed={active}
						className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
							active
								? "border-booth-ink/70 bg-booth-ink text-booth-paper shadow-booth"
								: "border-booth-ink/15 bg-booth-paper text-booth-ink/70 hover:-translate-y-0.5 hover:border-booth-ink/40"
						}`}
					>
						<span
							className="size-4 rounded-full border border-black/10"
							style={{
								background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`,
							}}
						/>
						{t.name}
					</button>
				);
			})}
		</div>
	);
}
