import { Input } from "@/components/ui/input";
import Layout from "@/layouts/layout";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArnsTableRow } from "@/types";
import ArnsTable from "@/components/arns/arns-table";
import { useSearchParams } from "react-router-dom";
import SelectedArns from "@/components/arns/selected-arns";

export const tableData: ArnsTableRow[] = [
    {
        name: "Arlink",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Zythia",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Swagger",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Elysia",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Nest Js",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Next Js",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "Vite Js",
        role: "Owner",
        processId: "Qweryt..sdalj",
        targetId: "Teqsjdl..sdalj",
        expiry: "Arlink",
    },
    {
        name: "React",
        role: "Admin",
        processId: "Asdfgh..lkjhg",
        targetId: "Ytrewq..kjhgf",
        expiry: "React",
    },
    {
        name: "Vue",
        role: "Admin",
        processId: "Poiuyt..mnbvc",
        targetId: "Lkjhgf..qwerty",
        expiry: "Vue",
    },
    {
        name: "Angular",
        role: "Admin",
        processId: "Mnbvcx..zxcvbn",
        targetId: "Asdfgh..poiuyt",
        expiry: "Angular",
    },
    {
        name: "Svelte",
        role: "User",
        processId: "Zxcvbn..asdfgh",
        targetId: "Qwerty..mnbvcx",
        expiry: "Svelte",
    },
    {
        name: "Solid",
        role: "User",
        processId: "Trewql..zxcvbn",
        targetId: "Plmokn..yuihjk",
        expiry: "Solid",
    },
    {
        name: "Remix",
        role: "User",
        processId: "Yuihjk..lkjhgf",
        targetId: "Poiuyt..mnbvcx",
        expiry: "Remix",
    },
    {
        name: "Nuxt",
        role: "User",
        processId: "Lkjhgf..qwerty",
        targetId: "Mnbvcx..asdfgh",
        expiry: "Nuxt",
    },
    {
        name: "Astro",
        role: "User",
        processId: "Asdfgh..poiuyt",
        targetId: "Qwerty..zxcvbn",
        expiry: "Astro",
    },
    {
        name: "Electron",
        role: "User",
        processId: "Poiuyt..mnbvcx",
        targetId: "Lkjhgf..qwerty",
        expiry: "Electron",
    },
    {
        name: "Capacitor",
        role: "User",
        processId: "Zxcvbn..asdfgh",
        targetId: "Plmokn..yuihjk",
        expiry: "Capacitor",
    },
    {
        name: "Ionic",
        role: "User",
        processId: "Trewql..zxcvbn",
        targetId: "Plmokn..yuihjk",
        expiry: "Ionic",
    },
    {
        name: "Expo",
        role: "User",
        processId: "Yuihjk..lkjhgf",
        targetId: "Poiuyt..mnbvcx",
        expiry: "Expo",
    },
];

const ArnsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredData = useMemo(() => {
        return tableData.filter((row) =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm]);
    const [searchParams] = useSearchParams();
    const name = searchParams.get("name");
    if (name) {
        return <SelectedArns name={name} />;
    }

    return (
        <Layout className="container">
            <header className="mt-[60px] flex items-center justify-between">
                <div className="relative w-full md:max-w-[600px]">
                    <Search className="absolute left-3 top-1/2 h-[18px] md:h-[20px] w-[18px] md:w-[20px] transform -translate-y-1/2 text-neutral-600" />
                    <Input
                        className="pl-10 w-full rounded-md bg-arlink-bg-secondary-color hover:border-neutral-600 transition-colors placeholder:text-neutral-400 font-light border-[#383838] focus:ring-neutral-700 focus-visible:ring-neutral-700 text-sm md:text-base"
                        placeholder="Search Repositories and Projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select>
                    <SelectTrigger className="w-[180px] bg-arlink-bg-secondary-color">
                        <SelectValue placeholder="Sort by Activity" />
                    </SelectTrigger>
                    <SelectContent className="capitalize">
                        <SelectItem value="date">date</SelectItem>
                        <SelectItem value="expiry">expiry</SelectItem>
                        <SelectItem value="name">name</SelectItem>
                    </SelectContent>
                </Select>
            </header>
            <div className="w-ful mt-[50px]">
                <ArnsTable data={filteredData} />
            </div>
        </Layout>
    );
};

export default ArnsDashboard;
