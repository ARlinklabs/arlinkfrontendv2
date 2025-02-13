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
            answer: "Arlink is a web hosting platform that allows developers to deploy and host websites permanently on Arweave. Unlike traditional hosting services that rely on centralized servers and require ongoing payments, Arlink ensures that once a website is deployed, it remains online forever without maintenance. With features like CI/CD, custom ARNS support, and permanent storage, Arlink simplifies the deployment process while ensuring your projects are securely stored on the Arweave blockchain.",
        },
        {
            question: "What types of projects can I host on Arlink?",
            answer: "Arlink supports hosting for a wide range of web applications, including static sites, single-page applications (SPAs), and front-end frameworks like React and Next.js. Any project that runs in a browser and doesn’t require a traditional backend server can be deployed on Arlink. This makes it ideal for personal websites, portfolio pages, dApps, documentation sites, and web3 projects.",
        },
        {
            question: "Do I need a custom domain to use Arlink?",
            answer: "No, you don’t need a custom domain to use Arlink. Every deployment automatically gets a unique, human-readable Arlink Undername. If you prefer, you can also connect your own ARNS (Arweave Name System) domain for a fully customized and permanent web address. Your website will be accessible across 250+ gateways, ensuring maximum availability and decentralization.",
        }
        
    ];

    const headline = ["Frequently Asked", "Question"];
    return (
        <section
            id="faq"
            className="w-full flex items-center mt-[200px] mb-[100px] px-4 justify-center flex-col  p-4 space-y-3"
        >
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
        </section>
    );
};

export default FAQSection;
