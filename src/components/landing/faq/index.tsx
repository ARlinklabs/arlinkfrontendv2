import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedDescription from "../effects/animated-description";
import { motion } from "framer-motion";

const FAQSection = () => {
    const faqItems = [
        {
            question: "What is Arlink?",
            answer: "Arlink is a decentralized hosting platform that allows you to build, deploy, and host your projects forever on the Arweave blockchain. With features like CI/CD, custom ARNS support, and permanent storage, it's designed to simplify your deployment process.",
        },
        {
            question: "What types of projects can I host on Arlink?",
            answer: "",
        },
        {
            question: "Do I need a custom domain to use Arlink?",
            answer: "",
        },
        {
            question: "How can I monitor my deployments?",
            answer: "",
        },
    ];

    const headline = ["Frequently Asked", "Question"];
    return (
        <div className="w-full flex items-center mt-[200px] px-4 justify-center flex-col  p-4 space-y-3">
            <header className="flex mb-8 items-center justify-center flex-col space-y-6">
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="px-4 border border-neutral-700 py-1 bg-neutral-800 rounded-full"
                >
                    Faq
                </motion.div>

                <h2 className="md:text-5xl text-3xl leading-[0.9] lg:leading-[0.9] lg:text-6xl text-center font-bold capitalize flex flex-col space-y-2">
                    <AnimatedDescription descriptionString={headline} />
                </h2>
            </header>
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mx-auto w-full max-w-2xl"
            >
                <Accordion
                    type="single"
                    className="space-y-4 w-full max-w-2xl"
                    defaultValue="item-0"
                    collapsible
                >
                    {faqItems.map((item, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-0 rounded-lg bg-zinc-900/30"
                        >
                            <AccordionTrigger className="relative flex-row-reverse flex justify-between items-center w-full p-4 hover:no-underline">
                                <span className="text-white text-lg font-normal">
                                    {item.question}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-6 pt-0">
                                <p className="text-neutral-400 text-base leading-relaxed">
                                    {item.answer ||
                                        "This information will be updated soon."}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </div>
    );
};

export default FAQSection;
