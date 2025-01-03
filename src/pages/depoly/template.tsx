import { Card } from "@/components/ui/card";

export function TemplateSelection() {
	return (
		<Card className="bg-arlink-bg-secondary-color overflow-hidden relative p-6 rounded-lg flex flex-col">
			<div className="absolute bg-neutral-950/80 font-black text-3xl flex items-center justify-center backdrop-blur-lg inset-0">
				Coming soon.
			</div>
			<h2 className="text-2xl font-semibold mb-4">Start with a template</h2>
			<div className="grid grid-cols-2 flex-grow gap-4">
				<TemplateCard title="Next js Project" className="col-span-2" />
				<TemplateCard title="Svelete kit Project" />
				<TemplateCard title="Astro Project" />
			</div>
		</Card>
	);
}

function TemplateCard({
	title,
	className = "",
}: { title: string; className?: string }) {
	return (
		<Card
			className={` bg-arlink-bg-secondary-color rounded flex flex-col  space-x-3 ${className}`}
		>
			<div className="bg-neutral-800 flex-grow w-full" />
			<div className="px-2 py-4 flex gap-2">
				<span>{title}</span>
			</div>
		</Card>
	);
}
