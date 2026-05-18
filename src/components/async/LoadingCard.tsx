type Props = {
	label: string;
};

export function LoadingCard({ label }: Props) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-soil-200 bg-white p-4 text-sm text-soil-600">
			<span className="inline-block h-2 w-2 animate-pulse-soft rounded-full bg-leaf-500" />
			{label}
		</div>
	);
}
