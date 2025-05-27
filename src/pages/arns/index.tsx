import BuyArns from "@/components/arns/buy-arns";
import DomainCommandPallete from "@/components/arns/domain-command-pallete";
import DomainGreet from "@/components/arns/domain-greet";
import Layout from "@/layouts/layout";
import { useState } from "react";

import { useSearchParams } from "react-router-dom";

export default function Arns() {
    const [searchParams] = useSearchParams();
    const [active, setActive] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");

    const hanldeOpenDomainCommandPallete = (value: string) => {
        setValue(value);
    };

    const name = searchParams.get("name");
    if (name) {
        return <BuyArns arnsName={name} />;
    }

    return (
        <Layout>
            {value.length !== 0 ? (
                <DomainCommandPallete value={value} setValue={setValue} />
            ) : (
                <DomainGreet
                    active={active}
                    value={value}
                    setActive={setActive}
                    hanldeOpenDomainCommandPallete={
                        hanldeOpenDomainCommandPallete
                    }
                />
            )}
        </Layout>
    );
}
