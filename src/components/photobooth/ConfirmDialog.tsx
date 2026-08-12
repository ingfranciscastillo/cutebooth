import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Yes, retake",
	cancelLabel = "Keep them",
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="rounded-3xl border-2 border-booth-ink/10 bg-booth-paper">
				<AlertDialogHeader>
					<AlertDialogTitle className="font-display text-2xl font-bold text-booth-ink">
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-booth-ink/60">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-full border-2 border-booth-ink/15 font-bold text-booth-ink hover:bg-booth-ink/5">
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="rounded-full bg-booth-accent font-bold text-booth-paper hover:bg-booth-accent/90"
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
