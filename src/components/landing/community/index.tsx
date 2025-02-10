import { motion } from "framer-motion";
import AnimatedDescription from "../effects/animated-description";

const Community = () => {
    const headline = ["Join the", "Arlink Community"];
    const description = [
        "Collaborate, learn, and grow with builders around the world.",
    ];
    return (
        <div className="md:px-8 px-4">
            <section
                id="community"
                className="bg-gradient-to-b relative rounded-[38px] from-[#17171a] to-transparent "
            >
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2">
                    <TopPart />
                </div>
                <header className="flex items-center relative z-50 pt-[200px] justify-center flex-col space-y-6">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="px-4 border border-neutral-700 py-1 bg-neutral-800 rounded-full"
                    >
                        Community
                    </motion.div>

                    <h2 className="md:text-5xl text-3xl leading-[0.9] lg:leading-[0.9] lg:text-6xl text-center font-bold capitalize flex flex-col space-y-2">
                        <AnimatedDescription descriptionString={headline} />
                    </h2>

                    <div className="text-center text-md text-neutral-400">
                        <AnimatedDescription descriptionString={description} />
                    </div>
                </header>
                <motion.a
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    href="https://discord.com/invite/PZjQH8DVTP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white sm:w-fit w-full px-4 py-2 gap-2 text-black flex items-center justify-center font-semibold hover:bg-neutral-300 rounded-xl mx-auto mt-12"
                >
                    <svg
                        width="21"
                        height="21"
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clip-path="url(#clip0_2382_776)">
                            <path
                                d="M8.89667 9.47852C9.39667 9.47852 9.80167 9.85352 9.7925 10.3118C9.7925 10.7702 9.3975 11.1452 8.89667 11.1452C8.405 11.1452 8 10.7702 8 10.3118C8 9.85352 8.39583 9.47852 8.89667 9.47852ZM12.1033 9.47852C12.6042 9.47852 13 9.85352 13 10.3118C13 10.7702 12.6042 11.1452 12.1033 11.1452C11.6117 11.1452 11.2075 10.7702 11.2075 10.3118C11.2075 9.85352 11.6025 9.47852 12.1033 9.47852ZM16.2425 1.97852C17.2117 1.97852 18 2.78352 18 3.78102V19.4785L16.1575 17.816L15.12 16.836L14.0225 15.7943L14.4775 17.4135H4.7575C3.78833 17.4135 3 16.6085 3 15.611V3.78102C3 2.78352 3.78833 1.97852 4.7575 1.97852H16.2417H16.2425ZM12.9342 13.406C14.8283 13.3452 15.5575 12.076 15.5575 12.076C15.5575 9.25851 14.3225 6.97435 14.3225 6.97435C13.0892 6.03018 11.9142 6.05602 11.9142 6.05602L11.7942 6.19602C13.2517 6.65102 13.9283 7.30768 13.9283 7.30768C13.1326 6.85934 12.2555 6.5738 11.3483 6.46768C10.7729 6.40269 10.1916 6.40828 9.6175 6.48435C9.56583 6.48435 9.5225 6.49352 9.47167 6.50185C9.17167 6.52852 8.4425 6.64185 7.52583 7.05352C7.20917 7.20185 7.02 7.30768 7.02 7.30768C7.02 7.30768 7.73167 6.61602 9.27417 6.16102L9.18833 6.05602C9.18833 6.05602 8.01417 6.03018 6.78 6.97518C6.78 6.97518 5.54583 9.25851 5.54583 12.076C5.54583 12.076 6.26583 13.3443 8.16 13.406C8.16 13.406 8.47667 13.0127 8.735 12.6802C7.64583 12.3468 7.235 11.6468 7.235 11.6468C7.235 11.6468 7.32 11.7085 7.47417 11.796C7.4825 11.8043 7.49083 11.8135 7.50833 11.8218C7.53417 11.8402 7.56 11.8485 7.58583 11.866C7.8 11.9885 8.01417 12.0843 8.21083 12.1635C8.5625 12.3035 8.9825 12.4435 9.47167 12.5402C10.2044 12.6838 10.9578 12.6866 11.6917 12.5485C12.1191 12.4722 12.5361 12.3461 12.9342 12.1727C13.2342 12.0585 13.5683 11.8918 13.92 11.656C13.92 11.656 13.4917 12.3735 12.3683 12.6977C12.6258 13.0302 12.935 13.406 12.935 13.406H12.9342Z"
                                fill="#09090B"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_2382_776">
                                <rect
                                    width="20"
                                    height="20"
                                    fill="white"
                                    transform="translate(0.5 0.312012)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                    Join the community
                </motion.a>
            </section>
        </div>
    );
};

export default Community;

const TopPart = () => {
    return (
        <svg
            width="361"
            height="180"
            viewBox="0 0 361 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <mask
                id="mask0_2012_113"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="361"
                height="361"
            >
                <circle
                    cx="180.5"
                    cy="180.5"
                    r="180.139"
                    stroke="#27272A"
                    stroke-width="0.722"
                />
                <circle
                    cx="180.5"
                    cy="180.5"
                    r="72.0556"
                    stroke="#27272A"
                    stroke-width="0.2888"
                />
                <circle
                    cx="180.5"
                    cy="180.5"
                    r="108.083"
                    stroke="#27272A"
                    stroke-width="0.4332"
                />
                <circle
                    cx="180.5"
                    cy="180.5"
                    r="144.111"
                    stroke="#27272A"
                    stroke-width="0.5776"
                />
            </mask>
            <g mask="url(#mask0_2012_113)">
                <g filter="url(#filter0_f_2012_113)">
                    <ellipse
                        cx="180.67"
                        cy="46.4299"
                        rx="169.67"
                        ry="78.698"
                        fill="#27272A"
                    />
                </g>
            </g>
            <g filter="url(#filter1_b_2012_113)">
                <path
                    d="M140 47.312C140 38.4755 147.163 31.312 156 31.312H204C212.837 31.312 220 38.4755 220 47.312V95.312C220 104.149 212.837 111.312 204 111.312H156C147.163 111.312 140 104.149 140 95.312V47.312Z"
                    fill="#18181B"
                />
                <path
                    d="M141 47.312C141 39.0277 147.716 32.312 156 32.312H204C212.284 32.312 219 39.0277 219 47.312V95.312C219 103.596 212.284 110.312 204 110.312H156C147.716 110.312 141 103.596 141 95.312V47.312Z"
                    stroke="url(#paint0_linear_2012_113)"
                    stroke-width="2"
                />
                <g clip-path="url(#clip0_2012_113)">
                    <path
                        d="M176.152 69.312C177.352 69.312 178.324 70.212 178.302 71.312C178.302 72.412 177.354 73.312 176.152 73.312C174.972 73.312 174 72.412 174 71.312C174 70.212 174.95 69.312 176.152 69.312ZM183.848 69.312C185.05 69.312 186 70.212 186 71.312C186 72.412 185.05 73.312 183.848 73.312C182.668 73.312 181.698 72.412 181.698 71.312C181.698 70.212 182.646 69.312 183.848 69.312ZM193.782 51.312C196.108 51.312 198 53.244 198 55.638V93.312L193.578 89.322L191.088 86.97L188.454 84.47L189.546 88.356H166.218C163.892 88.356 162 86.424 162 84.03V55.638C162 53.244 163.892 51.312 166.218 51.312H193.78H193.782ZM185.842 78.738C190.388 78.592 192.138 75.546 192.138 75.546C192.138 68.784 189.174 63.302 189.174 63.302C186.214 61.036 183.394 61.098 183.394 61.098L183.106 61.434C186.604 62.526 188.228 64.102 188.228 64.102C186.318 63.026 184.213 62.3407 182.036 62.086C180.655 61.93 179.26 61.9435 177.882 62.126C177.758 62.126 177.654 62.148 177.532 62.168C176.812 62.232 175.062 62.504 172.862 63.492C172.102 63.848 171.648 64.102 171.648 64.102C171.648 64.102 173.356 62.442 177.058 61.35L176.852 61.098C176.852 61.098 174.034 61.036 171.072 63.304C171.072 63.304 168.11 68.784 168.11 75.546C168.11 75.546 169.838 78.59 174.384 78.738C174.384 78.738 175.144 77.794 175.764 76.996C173.15 76.196 172.164 74.516 172.164 74.516C172.164 74.516 172.368 74.664 172.738 74.874C172.758 74.894 172.778 74.916 172.82 74.936C172.882 74.98 172.944 75 173.006 75.042C173.52 75.336 174.034 75.566 174.506 75.756C175.35 76.092 176.358 76.428 177.532 76.66C179.291 77.0047 181.099 77.0115 182.86 76.68C183.886 76.4969 184.887 76.1942 185.842 75.778C186.562 75.504 187.364 75.104 188.208 74.538C188.208 74.538 187.18 76.26 184.484 77.038C185.102 77.836 185.844 78.738 185.844 78.738H185.842Z"
                        fill="url(#paint1_linear_2012_113)"
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_f_2012_113"
                    x="-35.208"
                    y="-78.4761"
                    width="431.756"
                    height="249.812"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feGaussianBlur
                        stdDeviation="23.104"
                        result="effect1_foregroundBlur_2012_113"
                    />
                </filter>
                <filter
                    id="filter1_b_2012_113"
                    x="52.13"
                    y="-56.558"
                    width="255.74"
                    height="255.74"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur
                        in="BackgroundImageFix"
                        stdDeviation="43.935"
                    />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_2012_113"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_2012_113"
                        result="shape"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_2012_113"
                    x1="180"
                    y1="31.312"
                    x2="167.5"
                    y2="79.312"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_2012_113"
                    x1="180"
                    y1="51.312"
                    x2="180"
                    y2="93.312"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0.24" />
                </linearGradient>
                <clipPath id="clip0_2012_113">
                    <rect
                        width="48"
                        height="48"
                        fill="white"
                        transform="translate(156 47.312)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};
