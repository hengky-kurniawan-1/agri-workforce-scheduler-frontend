type Props = {
	message: string;
};

export function ErrorAlert({ message }: Props) {
	return (
		<div
			className="rounded-lg border border-red-200 bg-red-50/90 p-4 text-sm text-red-800"
			role="alert"
		>
			{message}
		</div>
	);
}
