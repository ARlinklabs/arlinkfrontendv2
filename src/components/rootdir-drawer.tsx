import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DirectoryStructure } from "@/types";
import { Folder } from "lucide-react";
import { useState } from "react";

interface RootDirectoryDrawerProps {
    subDir: DirectoryStructure[];
    isOpen: boolean;
    onClose: () => void;
    onSelect: (directory: string) => void;
}

export default function RootDirectoryDrawer({
    subDir,
    isOpen,
    onClose,
    onSelect,
}: RootDirectoryDrawerProps) {
    // This is a mock list of directories. In a real application, you'd fetch this dynamically.
    const directories: DirectoryStructure[] = [
        {
            name: "root",
            path: "./",
            type: "dir",
            children: [],
        },

        ...subDir,
    ];

    const [customDir, setCustomDir] = useState<string>("");

    const handleCustomDirSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customDir) {
            onSelect(customDir);
            onClose();
        }
    };

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Select Root Directory</DrawerTitle>
                </DrawerHeader>

                <div className="p-4 max-w-md mx-auto">
                    <Button
                        variant="outline"
                        className="w-full justify-start mb-2 bg-[#0C0C0C] border-[#383838] text-white hover:bg-[#1C1C1C]"
                        onClick={() => {
                            onSelect(`./`);
                            onClose();
                        }}
                    >
                        <Folder className="mr-2 h-4 w-4" />
                        ./
                    </Button>
                    {subDir.map((dir) => (
                        <Button
                            key={dir.name}
                            variant="outline"
                            className="w-full justify-start mb-2 bg-[#0C0C0C] border-[#383838] text-white hover:bg-[#1C1C1C]"
                            onClick={() => {
                                onSelect(`./${dir.path}`);
                                onClose();
                            }}
                        >
                            <Folder className="mr-2 h-4 w-4" />
                            ./{dir.path}
                        </Button>
                    ))}

                    <Separator className="my-4" />

                    <form
                        onSubmit={handleCustomDirSubmit}
                        className="space-y-2"
                    >
                        <Input
                            type="text"
                            placeholder="Enter custom directory"
                            value={customDir}
                            onChange={(e) => setCustomDir(e.target.value)}
                            className="bg-[#0C0C0C] border-[#383838] text-white"
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full justify-center bg-[#0C0C0C] border-[#383838] text-white hover:bg-[#1C1C1C]"
                        >
                            <Folder className="mr-2 h-4 w-4" />
                            Use Custom Directory
                        </Button>
                    </form>
                </div>
                <DrawerClose asChild>
                    <Button variant="outline" className="m-4">
                        Cancel
                    </Button>
                </DrawerClose>
            </DrawerContent>
        </Drawer>
    );
}
