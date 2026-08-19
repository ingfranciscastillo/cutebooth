import { type AspectId, DEFAULT_ASPECT } from "./aspects";
import type { ShotCount, StripFormat } from "./layouts";

export const DEFAULT_FORMAT_STATE: {
	format: StripFormat;
	shotCount: ShotCount;
	aspect: AspectId;
} = {
	format: "vertical",
	shotCount: 4,
	aspect: DEFAULT_ASPECT,
};
