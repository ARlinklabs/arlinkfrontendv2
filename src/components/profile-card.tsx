import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileCard({
    name,
    avatarUrl,
    initials,
    onlineStatus = false,
}: {
    name: string;
    avatarUrl: string;
    initials: string;
    role?: string;
    onlineStatus?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-xs">
            {/* <div className="flex flex-col">
                <span className="text-base font-semibold text-white">
                    {name}
                </span>
                {role && (
                    <span className="text-xs text-neutral-400">{role}</span>
                )}
            </div> */}
            <div className="relative">
                <Avatar className="size-10 border border-neutral-800">
                    <AvatarImage
                        src={avatarUrl}
                        alt={name}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-neutral-800 text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                {onlineStatus && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-black" />
                )}
            </div>
        </div>
    );
}
