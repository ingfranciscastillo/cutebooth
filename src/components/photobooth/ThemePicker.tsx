import { type StripTheme, THEMES } from "@/lib/photobooth/themes";

export function ThemePicker({
	value,
	onChange,
}: {
	value: StripTheme;
	onChange: (t: StripTheme) => void;
}) {
	return (
		<div className="flex  justify-center">
			<div className="flex w-fit flex-wrap items-center gap-2">
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
								className="size-5 rounded-full"
								style={{
									background: `conic-gradient(from 135deg, ${t.swatch[0]} 0deg 180deg, ${t.swatch[1]} 180deg 360deg)`,
									boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
									backfaceVisibility: "hidden",
								}}
							/>
							{t.name}
						</button>
					);
				})}
			</div>
		</div>
	);
}
