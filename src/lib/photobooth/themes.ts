export type StripTheme = {
	id: string;
	name: string;
	/** strip paper background */
	paper: string;
	/** ink / text color */
	ink: string;
	/** accent used for decorations */
	accent: string;
	/** subtle inner border around each photo */
	photoEdge: string;
	/** css filter applied to photos when compositing */
	filter?: string;
	/** small swatch preview colors for the picker */
	swatch: [string, string];
	decor: "dots" | "stars" | "sparkles" | "none" | "confetti" | "hearts";
};

export const THEMES: StripTheme[] = [
	{
		id: "mono",
		name: "Minimal B&W",
		paper: "#161616",
		ink: "#FFFDF1",
		accent: "#FFFDF1",
		photoEdge: "rgba(255,253,241,0.18)",
		filter: "grayscale(1) contrast(1.08)",
		swatch: ["#161616", "#FFFDF1"],
		decor: "none",
	},
	{
		id: "mantis",
		name: "Mantis",
		paper: "#59C749",
		ink: "#FFFDF1",
		accent: "#FFFDF1",
		photoEdge: "rgba(255,253,241,0.4)",
		swatch: ["#59C749", "#FFFDF1"],
		decor: "sparkles",
	},
	{
		id: "pink",
		name: "Baby Pink",
		paper: "#FBD7E2",
		ink: "#8E4560",
		accent: "#F49AB8",
		photoEdge: "rgba(142,69,96,0.18)",
		swatch: ["#FBD7E2", "#8E4560"],
		decor: "hearts",
	},
	{
		id: "sky",
		name: "Sky Blue",
		paper: "#D3E9FA",
		ink: "#2F5B85",
		accent: "#8FC5EE",
		photoEdge: "rgba(47,91,133,0.18)",
		swatch: ["#D3E9FA", "#2F5B85"],
		decor: "dots",
	},
	{
		id: "cream",
		name: "Cream",
		paper: "#FFFDF1",
		ink: "#4A4130",
		accent: "#E4D5AE",
		photoEdge: "rgba(74,65,48,0.16)",
		filter: "sepia(0.18) saturate(1.05)",
		swatch: ["#FFFDF1", "#4A4130"],
		decor: "stars",
	},
	{
		id: "pastel",
		name: "Cute Pastel",
		paper: "#F3E9FF",
		ink: "#6B4B95",
		accent: "#C3A6F2",
		photoEdge: "rgba(107,75,149,0.16)",
		swatch: ["#F3E9FF", "#6B4B95"],
		decor: "confetti",
	},
];

export const DEFAULT_THEME = THEMES.find((t) => t.id === "mantis") ?? THEMES[0];

export function getTheme(id: string): StripTheme {
	return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}
