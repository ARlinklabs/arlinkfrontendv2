import { Card } from "@/components/ui/card";

export function TemplateSelection() {
    return (
        <Card className="bg-arlink-bg-secondary-color overflow-hidden relative p-6 rounded-lg flex flex-col">
            <div className="absolute z-20 bg-neutral-950/80 font-black text-3xl flex items-center justify-center backdrop-blur-lg inset-0">
                Coming soon.
            </div>
            <h2 className="text-2xl font-semibold mb-4">
                Start with a template
            </h2>
            <div className="grid grid-cols-2 flex-grow gap-4">
                <TemplateCard
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx69fFerG53XDUMs_zX2f43AdWjISIcRZBxg&s"
                    title="Next js Project"
                    className="col-span-2"
                />
                <TemplateCard
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3BwY1ZuYmYWwbHjE8ux9sICfClYFyx4dQxA&s"
                    title="Svelete kit Project"
                />
                <TemplateCard
                    src="https://uizard.io/static/7ecb7ccd3a09a104bc982ce12d7bfd81/a8e47/ce75ab1fd42e56647767e53159a1f1e63cc9eda1-1440x835.png"
                    title="Astro Project"
                />
            </div>
        </Card>
    );
}

function TemplateCard({
    title,
    className = "",
    src,
}: {
    title: string;
    className?: string;
    src: string;
}) {
    return (
        <Card
            className={` bg-arlink-bg-secondary-color rounded flex flex-col  space-x-3 ${className}`}
        >
            <div className="relative -z-1 flex-grow w-full">
                <img className="h-[120px] w-full max-w-full" src={src} />
            </div>
            <div className="px-2 py-4 flex gap-2">
                <span>{title}</span>
            </div>
        </Card>
    );
}
