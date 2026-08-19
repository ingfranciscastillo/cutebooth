export type Orientation = "portrait" | "landscape" | "square";
export type AspectId = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export type Aspect = {
	id: AspectId;
	orientation: Orientation;
	label: string;
	/** width / height */
	value: number;
};

export const ASPECTS: Aspect[] = [
	{ id: "3:4", orientation: "portrait", label: "3:4", value: 3 / 4 },
	{ id: "9:16", orientation: "portrait", label: "9:16", value: 9 / 16 },
	{ id: "4:3", orientation: "landscape", label: "4:3", value: 4 / 3 },
	{ id: "16:9", orientation: "landscape", label: "16:9", value: 16 / 9 },
	{ id: "1:1", orientation: "square", label: "1:1", value: 1 },
];

export const ORIENTATIONS: { id: Orientation; name: string }[] = [
	{ id: "portrait", name: "Portrait" },
	{ id: "landscape", name: "Landscape" },
	{ id: "square", name: "Square" },
];

export const DEFAULT_ASPECT: AspectId = "4:3";

export function getAspect(id: AspectId | undefined): Aspect {
	return (
		ASPECTS.find((a) => a.id === id) ??
		ASPECTS.find((a) => a.id === DEFAULT_ASPECT)!
	);
}

export function aspectsFor(orientation: Orientation): Aspect[] {
	return ASPECTS.filter((a) => a.orientation === orientation);
}

export function orientationOf(id: AspectId): Orientation {
	return getAspect(id).orientation;
}
