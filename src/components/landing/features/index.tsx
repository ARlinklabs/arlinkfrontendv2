import { motion } from "framer-motion";
import AnimatedDescription from "../effects/animated-description";
import { Link } from "lucide-react";

const Features = () => {
    const headLine = ["Empowering Your", "Decentralized Vision"];
    const description = [
        "Tools and Features Designed to Empower",
        "Developers and Innovators.",
    ];

    return (
        <section
            id="features"
            className="flex flex-col mt-auto sm:mt-[180px] relative w-full items-center justify-center"
        >
            <div className="absolute top-0 -translate-x-1/2 left-1/2 ">
                <img src={"/Spotlight.png"} />
            </div>
            <div className="max-w-6xl mt-] mx-auto px-4 py-16">
                <header className="flex items-center justify-center flex-col space-y-6">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="px-4 border border-neutral-700 py-1 bg-neutral-800 rounded-full"
                    >
                        Features
                    </motion.div>

                    <h2 className="md:text-5xl text-3xl leading-[0.9] lg:leading-[0.9] lg:text-6xl text-center font-bold capitalize flex flex-col space-y-2">
                        <AnimatedDescription descriptionString={headLine} />
                    </h2>

                    <div className="text-center text-md text-neutral-400">
                        <AnimatedDescription descriptionString={description} />
                    </div>
                </header>
            </div>
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mt-[-50px]"
            >
                <BentoGrid />
            </motion.div>
        </section>
    );
};

export default Features;

interface GradientCardProps {
    children: React.ReactNode;
    angle: string;
    className?: string;
}

const GradientCard: React.FC<GradientCardProps> = ({
    children,
    className = "",
    angle,
}) => (
    <div
        className={`relative group rounded-3xl p-[1px] overflow-hidden ${className}`}
        style={{
            background: `linear-gradient(${angle}deg, rgba(255, 255, 255, 0.2) 19.65%, rgba(255, 255, 255, 0) 80.35%)`,
        }}
    >
        <div
            className="absolute inset-[1px] rounded-[23px]"
            style={{
                background: "linear-gradient(180deg, #18181B 0%, #09090B 100%)",
            }}
        />
        <div className="relative h-full rounded-3xl p-6">{children}</div>
    </div>
);

const getRandomDuration = () => Math.random() * 2 + 1.5;

function BentoGrid() {
    return (
        <div className="w-full p-4 md:p-8 lg:p-12 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl">
                {/* Effortless Deployments */}
                <GradientCard
                    className="md:col-span-5 lg:col-span-5"
                    angle="200"
                >
                    <div className="relative group z-10">
                        <div className="flex  md:h-[280px] h-[250px] -mt-8 gap-6 mb-6">
                            <div className="relative z-40 mx-auto aspect-[4/3] w-full mt-[30px]">
                                <div className="h-full relative scale-125 w-[50%] z-50 mx-auto">
                                    <GradientFrame />
                                </div>
                                <motion.div
                                    className="absolute size-36 z-50 top-[20%] left-[35%]"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: getRandomDuration(),
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ArlinkLogo />
                                </motion.div>
                                <motion.div
                                    className="absolute size-20 z-50 top-[20%] left-[10%]"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: getRandomDuration(),
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <RocketLogo />
                                </motion.div>
                                <motion.div
                                    className="absolute size-20 z-50 top-[20%] left-[70%]"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: getRandomDuration(),
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <GithubLogo />
                                </motion.div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            Effortless Deployments
                        </h3>
                        <p className="text-neutral-600 transition-all group-hover:text-neutral-400 md:text-md text-sm">
                            Build and deploy apps in a few clicks, with no
                            complex setup or configuration. Arlink simplifies
                            your deployment process so you can focus on
                            building.
                        </p>
                    </div>
                </GradientCard>

                {/* Integrated CI/CD */}
                <GradientCard
                    className="md:col-span-7 group lg:col-span-7"
                    angle="150"
                >
                    <div className="relative flex flex-col h-full justify-between z-10">
                        <div className="absolute inset-0 left-1/2 -translate-x-1/2">
                            <GridBackground />
                        </div>
                        <div className="h-[200px] md:scale-125 scale-75 z-40 w-full flex items-center justify-center">
                            <Orbit />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                Git-connected Deploys
                            </h3>
                            <p className="text-neutral-600 transition-all group-hover:text-neutral-400  md:text-md text-sm">
                                Arlink automates your deployment pipeline,
                                ensuring smooth,{" "}
                                <br className="md:inline-block hidden" />
                                continuous updates without manual effort,
                                letting you innovate faster.
                            </p>
                        </div>
                    </div>
                </GradientCard>

                {/* Permanent Storage */}
                <GradientCard
                    className="md:col-span-8 group lg:col-span-8"
                    angle="-150"
                >
                    <div className="relative h-full z-10 flex flex-col justify-between">
                        <div>
                            <GridBackground />
                        </div>
                        <div className="mx-auto max-h-[243.3969761731195px] md:scale-125 scale-75 aspect-square">
                            <PermanenetStorageIcon />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                Permanent Hosting
                            </h3>
                            <p className="text-neutral-600 transition-all group-hover:text-neutral-400  md:text-md text-sm">
                                Your apps and data are stored on Arweaves
                                decentralized permaweb, always
                                <br className="md:inline-block hidden" />
                                online, secure, and resistant to censorship and
                                data loss.
                            </p>
                        </div>
                    </div>
                </GradientCard>

                {/* Custom ARNS Support */}
                <GradientCard
                    className="md:col-span-4 group lg:col-span-4"
                    angle="180"
                >
                    <div className="relative z-10">
                        <div className="-mt-6">
                            <BrowserFrame>myapp.arweave.dev</BrowserFrame>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            ARNS Support
                        </h3>
                        <p className="text-neutral-600 transition-all group-hover:text-neutral-400  md:text-md text-sm">
                            Use custom, user-friendly domain names with Arlink's
                            ARNS integration, eliminating the need for long,
                            confusing transaction IDs.
                        </p>
                    </div>
                </GradientCard>
            </div>
        </div>
    );
}

const GridBackground = ({
    className = "",
    imageSrc = "/grid-bg.svg",
    translateX = "-50%",
    translateY = "-80px",
    zIndex = -1,
}) => {
    return (
        <div className="relative w-full h-full">
            <img
                src={imageSrc}
                className={`absolute inset-0 left-1/2 ${className}`}
                style={{
                    transform: `translate(${translateX}, ${translateY})`,
                    zIndex: zIndex,
                }}
            />
        </div>
    );
};

const BrowserFrame = ({
    children,
}: {
    url?: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="w-full h mx-auto z-40 mix-blend-screen relative">
            <div className="border-2 rounded-md absolute flex items-center justify-center gap-2 text-center py-1 -top-4 bg-[#39393b] border-[#69696b] z-50 left-1/2 -translate-x-1/2 w-2/3 ">
                <Link size={14} />
                {children}
            </div>
            {/* <GridBackground /> */}
            <div className="relative z-40 mx-auto aspect-[4/3] w-full mt-[30px]">
                <div className="absolute z-[100] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="p-6 realtive z-50 rounded-full">
                        <svg
                            width="58"
                            height="58"
                            viewBox="0 0 58 58"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M36.9398 56.2552C21.8791 60.7829 6.00061 52.2448 1.47287 37.1842C-3.05487 22.1236 5.48321 6.24505 20.5438 1.71731C35.6045 -2.81042 51.483 5.72765 56.0107 20.7883C60.5385 35.8489 52.0004 51.7274 36.9398 56.2552ZM28.7826 51.7707C24.3767 46.8729 20.9621 41.1675 18.7277 34.9702L7.91552 38.2207C9.70772 42.2576 12.6338 45.6871 16.3381 48.0925C20.0425 50.4979 24.3658 51.7757 28.7826 51.7707ZM24.1896 33.3281C26.6009 39.8552 30.3797 45.5312 35.0969 50.1251C36.5377 43.5209 36.4819 36.678 34.9336 30.0981L24.1896 33.3281ZM51.2077 25.2056L40.3956 28.4561C41.9489 34.8582 42.2465 41.5007 41.2718 48.016C44.9592 45.5847 47.8611 42.1347 49.625 38.0854C51.3888 34.036 51.9386 29.5615 51.2077 25.2056ZM6.27593 32.7669L17.0881 29.5164C15.5347 23.1143 15.2371 16.4718 16.2118 9.95649C12.5244 12.3878 9.6225 15.8378 7.85865 19.8871C6.0948 23.9365 5.54496 28.411 6.27593 32.7669ZM22.5528 27.8735L33.2913 24.6452C30.9555 18.3023 27.2296 12.5627 22.3867 7.84737C20.9459 14.4516 21.0017 21.2945 22.55 27.8744L22.5528 27.8735ZM28.701 6.20182C33.1069 11.0996 36.5215 16.805 38.756 23.0023L49.5681 19.7518C47.7759 15.7149 44.8498 12.2854 41.1455 9.87999C37.4411 7.47456 33.1178 6.19675 28.701 6.20182Z"
                                fill="url(#paint0_linear_2355_725)"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_2355_725"
                                    x1="20.5438"
                                    y1="1.71731"
                                    x2="36.9398"
                                    y2="56.2552"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="white" />
                                    <stop
                                        offset="1"
                                        stop-color="white"
                                        stop-opacity="0.24"
                                    />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className="absolute top-1/2 z-0 opacity-20 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="p-2 animate-[ping_3s_ease-in-out_infinite] rounded-full bg-[#313133]">
                        <svg
                            width="58"
                            height="58"
                            viewBox="0 0 58 58"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        ></svg>
                    </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="p-0 animate-[ping_3s_ease-in-out_infinite] opacity-30 rounded-full bg-[#313133]">
                        <svg
                            width="58"
                            height="58"
                            viewBox="0 0 58 58"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        ></svg>
                    </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="p-6 animate-[ping_3s_ease-in-out_infinite] opacity-20 rounded-full bg-[#313133]">
                        <svg
                            width="58"
                            height="58"
                            viewBox="0 0 58 58"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        ></svg>
                    </div>
                </div>
                <GradientFrame />
            </div>
        </div>
    );
};

const GradientFrame = () => {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 280 252"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clip-path="url(#clip0_2_430)">
                <g filter="url(#filter0_b_2_430)">
                    <rect
                        width="280"
                        height="251.525"
                        rx="14"
                        fill="url(#paint0_linear_2_430)"
                    />
                    <rect
                        x="0.875"
                        y="0.875"
                        width="278.25"
                        height="249.775"
                        rx="13.125"
                        stroke="url(#paint1_linear_2_430)"
                        stroke-width="1.75"
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_b_2_430"
                    x="-75.9322"
                    y="-75.9322"
                    width="431.864"
                    height="403.39"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur
                        in="BackgroundImageFix"
                        stdDeviation="37.9661"
                    />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_2_430"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_2_430"
                        result="shape"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_2_430"
                    x1="140"
                    y1="-275.63"
                    x2="117.913"
                    y2="272.194"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="0.8" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_2_430"
                    x1="140"
                    y1="0"
                    x2="140"
                    y2="236.254"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="0.8" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <clipPath id="clip0_2_430">
                    <rect width="280" height="251.525" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};

const PermanenetStorageIcon = () => {
    return (
        <svg
            width="280"
            height="271"
            viewBox="0 0 280 271"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clip-path="url(#clip0_4_72)">
                <rect
                    x="4.08239"
                    y="30.0528"
                    width="216.564"
                    height="216.564"
                    rx="31.3957"
                    transform="rotate(-6.61862 4.08239 30.0528)"
                    fill="url(#paint0_radial_4_72)"
                />
                <rect
                    x="4.08239"
                    y="30.0528"
                    width="216.564"
                    height="216.564"
                    rx="31.3957"
                    transform="rotate(-6.61862 4.08239 30.0528)"
                    stroke="url(#paint1_linear_4_72)"
                    stroke-width="3.11111"
                />
                <g filter="url(#filter1_d_4_72)">
                    <path
                        d="M151.535 98.8589L149.427 99.2097C146.101 92.4239 140.74 86.8449 134.092 83.2501C127.445 79.6554 119.842 78.2239 112.342 79.1551C92.3622 81.6083 78.109 99.8516 80.5622 119.831L80.6617 120.591C75.6457 122.575 71.4285 126.164 68.6696 130.799C65.9107 135.434 64.7657 140.853 65.4137 146.207C67.0492 159.527 79.2114 169.029 92.5312 167.394L122.721 163.687L119.321 135.997L112.473 144.762C111.982 145.394 111.372 145.922 110.677 146.317C109.982 146.711 109.215 146.965 108.422 147.062C107.628 147.159 106.823 147.099 106.053 146.884C105.283 146.67 104.563 146.305 103.935 145.811C102.664 144.817 101.84 143.36 101.643 141.759C101.446 140.158 101.894 138.544 102.887 137.273L118.771 116.942C119.263 116.311 119.875 115.783 120.571 115.388C121.267 114.994 122.034 114.741 122.828 114.643C123.622 114.545 124.428 114.606 125.199 114.82C125.97 115.034 126.691 115.399 127.321 115.892L147.652 131.777C148.923 132.77 149.748 134.227 149.945 135.828C150.141 137.429 149.694 139.043 148.701 140.314C147.707 141.585 146.25 142.41 144.649 142.607C143.048 142.803 141.434 142.356 140.163 141.363L131.397 134.514L134.797 162.204L158.949 159.239C175.596 157.195 187.476 141.989 185.432 125.342C183.388 108.695 168.182 96.8149 151.535 98.8589Z"
                        fill="white"
                    />
                </g>
                <g clip-path="url(#clip1_4_72)">
                    <rect
                        x="205.283"
                        y="168.238"
                        width="65.9025"
                        height="65.9025"
                        rx="32.9512"
                        transform="rotate(9.21951 205.283 168.238)"
                        fill="#18181B"
                    />
                    <g opacity="0.6" filter="url(#filter3_f_4_72)">
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M235.169 189.78C242.354 190.946 247.706 194.804 247.123 198.397L247.123 198.397L247.121 198.412C246.835 200.125 245.205 201.554 242.566 202.378C239.928 203.202 236.508 203.35 233.057 202.79C229.607 202.23 226.409 201.008 224.167 199.392C221.918 197.771 220.824 195.893 221.103 194.173L221.103 194.173C221.686 190.581 227.984 188.614 235.169 189.78ZM220.125 200.198L219.519 203.931L219.519 203.931C219.24 205.651 220.334 207.528 222.583 209.149C224.825 210.765 228.023 211.988 231.474 212.548C234.924 213.108 238.345 212.96 240.982 212.136C243.621 211.312 245.251 209.883 245.537 208.169L246.146 204.421C245.313 204.885 244.426 205.249 243.549 205.524C240.31 206.535 236.355 206.664 232.529 206.043C228.704 205.422 224.992 204.049 222.24 202.065C221.494 201.527 220.768 200.901 220.125 200.198ZM244.562 214.179C243.729 214.643 242.842 215.007 241.965 215.281C238.727 216.293 234.771 216.421 230.946 215.801C227.12 215.18 223.408 213.806 220.656 211.823L221.62 210.486L220.656 211.823C219.911 211.285 219.184 210.659 218.541 209.956L217.935 213.689L217.935 213.689C217.352 217.281 222.704 221.139 229.89 222.306C237.075 223.472 243.373 221.505 243.956 217.912L243.957 217.907L244.562 214.179Z"
                            fill="url(#paint2_linear_4_72)"
                        />
                    </g>
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M225.718 196.591C226.447 192.101 230.678 189.051 235.169 189.78C239.66 190.509 242.71 194.74 241.981 199.231L241.717 200.857L241.716 200.864C242.524 201.007 243.242 201.156 243.854 201.341C244.897 201.658 245.867 202.147 246.561 203.11C247.255 204.074 247.413 205.148 247.383 206.237C247.355 207.254 247.154 208.496 246.919 209.938L246.919 209.938L246.902 210.045L246.374 213.297L246.356 213.412L246.356 213.412C245.998 215.614 245.703 217.43 245.277 218.836C244.829 220.312 244.171 221.573 242.93 222.467C241.69 223.36 240.286 223.586 238.744 223.544C237.275 223.504 235.46 223.21 233.257 222.852L233.257 222.852L233.257 222.852L233.142 222.833L226.637 221.778L226.523 221.759L226.522 221.759L226.522 221.759C224.32 221.401 222.504 221.107 221.099 220.68C219.623 220.233 218.362 219.574 217.468 218.334C216.574 217.094 216.348 215.689 216.39 214.147C216.43 212.679 216.725 210.863 217.083 208.661L217.101 208.546L217.629 205.293L217.646 205.186C217.88 203.745 218.082 202.502 218.377 201.529C218.693 200.487 219.183 199.517 220.146 198.823C221.109 198.128 222.184 197.971 223.273 198.001C223.912 198.018 224.641 198.105 225.453 198.224L225.454 198.218L225.718 196.591ZM238.728 198.703L238.464 200.329L228.706 198.746L228.97 197.119C229.408 194.425 231.947 192.595 234.641 193.032C237.336 193.47 239.165 196.009 238.728 198.703ZM223.183 201.295C222.462 201.275 222.216 201.392 222.073 201.496C221.929 201.6 221.74 201.796 221.53 202.486C221.307 203.222 221.138 204.242 220.882 205.821L220.354 209.074C219.973 211.42 219.717 213.016 219.684 214.237C219.652 215.41 219.838 215.986 220.141 216.407C220.444 216.828 220.932 217.186 222.055 217.527C223.224 217.882 224.819 218.144 227.165 218.525L233.67 219.581C236.016 219.962 237.613 220.217 238.834 220.25C240.007 220.282 240.583 220.097 241.004 219.793C241.424 219.49 241.783 219.003 242.124 217.879C242.478 216.71 242.741 215.115 243.122 212.769L243.65 209.517C243.906 207.937 244.068 206.916 244.089 206.148C244.109 205.427 243.992 205.181 243.888 205.037C243.784 204.893 243.588 204.704 242.898 204.495C242.162 204.271 241.142 204.102 239.563 203.846L226.552 201.734C224.973 201.478 223.952 201.316 223.183 201.295ZM231.21 214.174C233.006 214.466 234.699 213.246 234.99 211.45C235.282 209.653 234.062 207.961 232.266 207.669C230.469 207.377 228.777 208.597 228.485 210.394C228.193 212.19 229.413 213.883 231.21 214.174Z"
                        fill="url(#paint3_linear_4_72)"
                    />
                </g>
                <rect
                    x="206.419"
                    y="169.813"
                    width="63.1565"
                    height="63.1565"
                    rx="31.5783"
                    transform="rotate(9.21951 206.419 169.813)"
                    stroke="url(#paint4_linear_4_72)"
                    stroke-width="2.74594"
                />
            </g>
            <defs>
                <filter
                    id="filter1_d_4_72"
                    x="51.437"
                    y="65.0783"
                    width="148.024"
                    height="116.299"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="6.9" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.22 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_4_72"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_4_72"
                        result="shape"
                    />
                </filter>
                <filter
                    id="filter3_f_4_72"
                    x="190.076"
                    y="163.589"
                    width="84.9074"
                    height="84.9074"
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
                        stdDeviation="9.88537"
                        result="effect1_foregroundBlur_4_72"
                    />
                </filter>
                <radialGradient
                    id="paint0_radial_4_72"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(112.195 138.524) rotate(90) scale(109.837)"
                >
                    <stop stop-color="#272727" />
                    <stop offset="1" stop-color="#18181B" />
                </radialGradient>
                <linearGradient
                    id="paint1_linear_4_72"
                    x1="112.195"
                    y1="28.6869"
                    x2="77.8712"
                    y2="160.492"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_4_72"
                    x1="235.169"
                    y1="189.78"
                    x2="229.89"
                    y2="222.306"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0.24" />
                </linearGradient>
                <linearGradient
                    id="paint3_linear_4_72"
                    x1="235.169"
                    y1="189.78"
                    x2="229.89"
                    y2="222.306"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0.24" />
                </linearGradient>
                <linearGradient
                    id="paint4_linear_4_72"
                    x1="238.235"
                    y1="168.238"
                    x2="227.937"
                    y2="207.779"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <clipPath id="clip0_4_72">
                    <rect width="280" height="270.462" fill="white" />
                </clipPath>
                <clipPath id="clip1_4_72">
                    <rect
                        x="205.283"
                        y="168.238"
                        width="65.9025"
                        height="65.9025"
                        rx="32.9512"
                        transform="rotate(9.21951 205.283 168.238)"
                        fill="white"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

export const Orbit = () => {
    return (
        <div className="z-50 md:mt-[20px] mt-[-50px] scale-125 relative">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 320 206"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g filter="url(#filter0_b_2376_2621)">
                    <path
                        d="M295.581 87.8515V87.8515C291.71 49.4989 247.363 30.324 216.655 53.7254L87.7624 151.95C57.0545 175.351 12.7071 156.176 8.83594 117.824V117.824C4.96476 79.471 44.5556 51.5225 79.297 68.0828L225.12 137.592C259.861 154.152 299.452 126.204 295.581 87.8515Z"
                        stroke="url(#paint0_linear_2376_2621)"
                        stroke-width="16"
                    />
                </g>
                <g filter="url(#filter1_b_2376_2621)">
                    <rect
                        width="62.9039"
                        height="63.988"
                        rx="31.452"
                        transform="matrix(0.994329 0.10635 -0.102738 0.994708 257.453 21.9136)"
                        fill="#18181B"
                    />
                    <rect
                        x="0.792525"
                        y="0.978718"
                        width="61.1262"
                        height="62.2102"
                        rx="30.5631"
                        transform="matrix(0.994329 0.10635 -0.102738 0.994708 257.558 21.8345)"
                        stroke="url(#paint1_linear_2376_2621)"
                        stroke-width="1.77778"
                    />
                    <g opacity="0.6" filter="url(#filter2_f_2376_2621)">
                        <path
                            d="M287.493 42.3667C279.252 41.4854 271.888 47.4485 271.037 55.6921C270.711 58.8242 271.38 61.9827 272.949 64.7196C274.517 67.4565 276.905 69.6328 279.773 70.9396C280.506 71.1492 280.831 70.7314 280.871 70.339C280.908 69.9854 281.01 68.8091 281.139 67.5587C277.321 67.8488 276.517 66.1412 276.305 65.2692C276.181 64.8215 275.592 63.4203 274.994 62.9974C274.501 62.6626 273.827 61.892 275.077 62.0076C276.254 62.1139 276.979 63.3047 277.213 63.7823C278.322 66.1819 280.533 65.7772 281.429 65.4778C281.661 64.522 282.119 63.9118 282.587 63.5847C279.307 62.8567 275.972 61.1982 276.561 55.491C276.729 53.8677 277.445 52.5881 278.504 51.6439C278.394 51.2549 278.03 49.6697 279.062 47.7059C279.062 47.7059 280.351 47.4485 283.005 49.6754C284.254 49.4682 285.526 49.4327 286.786 49.5699C288.054 49.7055 289.305 50.0082 290.463 50.4716C293.515 48.8369 294.723 49.3824 294.723 49.3824C295.331 51.5217 294.651 52.9952 294.463 53.3523C295.305 54.4984 295.747 55.8837 295.578 57.525C294.987 63.2515 291.37 64.147 288.013 64.165C288.505 64.6883 288.879 65.6335 288.734 67.033C288.528 69.0279 288.343 70.6298 288.291 71.1341C288.251 71.5251 288.483 72.0206 289.244 71.9511C292.308 71.2678 295.078 69.6394 297.162 67.2951C299.247 64.9507 300.543 62.0086 300.866 58.8826C301.718 50.639 295.733 43.2481 287.493 42.3667Z"
                            fill="white"
                        />
                    </g>
                    <path
                        d="M286.981 42.1626C278.74 41.2813 271.376 47.2444 270.525 55.488C270.199 58.6201 270.868 61.7786 272.437 64.5155C274.005 67.2524 276.393 69.4287 279.261 70.7355C279.994 70.9451 280.319 70.5273 280.359 70.1349C280.396 69.7813 280.498 68.605 280.627 67.3546C276.809 67.6447 276.005 65.9371 275.794 65.0651C275.669 64.6174 275.08 63.2162 274.482 62.7933C273.989 62.4585 273.315 61.6879 274.565 61.8035C275.742 61.9098 276.467 63.1006 276.701 63.5782C277.81 65.9778 280.021 65.5731 280.917 65.2737C281.149 64.3179 281.607 63.7077 282.075 63.3806C278.795 62.6526 275.46 60.9941 276.049 55.2869C276.217 53.6636 276.933 52.3839 277.992 51.4398C277.882 51.0508 277.518 49.4656 278.55 47.5018C278.55 47.5018 279.839 47.2444 282.494 49.4713C283.742 49.2641 285.015 49.2286 286.274 49.3658C287.542 49.5014 288.793 49.8041 289.951 50.2675C293.003 48.6328 294.211 49.1783 294.211 49.1783C294.819 51.3176 294.139 52.7911 293.951 53.1482C294.794 54.2943 295.236 55.6796 295.066 57.3209C294.475 63.0474 290.858 63.9429 287.501 63.9609C287.993 64.4842 288.367 65.4294 288.222 66.8289C288.016 68.8238 287.831 70.4257 287.779 70.93C287.739 71.321 287.971 71.8165 288.732 71.747C291.796 71.0637 294.566 69.4353 296.65 67.091C298.735 64.7466 300.031 61.8045 300.354 58.6785C301.206 50.4349 295.221 43.044 286.981 42.1626Z"
                        fill="white"
                    />
                </g>
                <g filter="url(#filter3_b_2376_2621)">
                    <rect
                        width="62.9039"
                        height="63.988"
                        rx="31.452"
                        transform="matrix(0.994329 0.10635 -0.102738 0.994708 32.9988 128.171)"
                        fill="#18181B"
                    />
                    <rect
                        x="0.792525"
                        y="0.978718"
                        width="61.1262"
                        height="62.2102"
                        rx="30.5631"
                        transform="matrix(0.994329 0.10635 -0.102738 0.994708 33.1038 128.092)"
                        stroke="url(#paint2_linear_2376_2621)"
                        stroke-width="1.77778"
                    />
                    <g opacity="0.6" filter="url(#filter4_f_2376_2621)">
                        <path
                            d="M63.0385 148.624C54.798 147.743 47.4339 153.706 46.5825 161.949C46.2573 165.082 46.9262 168.24 48.4944 170.977C50.0626 173.714 52.4505 175.89 55.3191 177.197C56.0515 177.407 56.3766 176.989 56.4172 176.596C56.4537 176.243 56.5556 175.066 56.6847 173.816C52.8667 174.106 52.0629 172.398 51.8514 171.527C51.7272 171.079 51.1376 169.678 50.5404 169.255C50.0471 168.92 49.3728 168.149 50.623 168.265C51.8003 168.371 52.5248 169.562 52.7589 170.04C53.8683 172.439 56.0785 172.034 56.975 171.735C57.2065 170.779 57.6646 170.169 58.1326 169.842C54.8526 169.114 51.5179 167.456 52.1073 161.748C52.275 160.125 52.9907 158.845 54.0503 157.901C53.9397 157.512 53.5757 155.927 54.6079 153.963C54.6079 153.963 55.8966 153.706 58.5514 155.933C59.8004 155.725 61.0724 155.69 62.3322 155.827C63.6 155.963 64.8505 156.266 66.009 156.729C69.0611 155.094 70.2684 155.64 70.2684 155.64C70.8768 157.779 70.1968 159.253 70.0092 159.61C70.8514 160.756 71.2934 162.141 71.1239 163.782C70.5324 169.509 66.9158 170.404 63.5587 170.422C64.0505 170.946 64.4249 171.891 64.2804 173.29C64.0743 175.285 63.8893 176.887 63.8372 177.391C63.7968 177.782 64.0291 178.278 64.7903 178.208C67.8542 177.525 70.6235 175.897 72.7083 173.552C74.7932 171.208 76.0886 168.266 76.4123 165.14C77.2638 156.896 71.279 149.505 63.0385 148.624Z"
                            fill="white"
                        />
                    </g>
                    <path
                        d="M53.1899 167.349C54.1249 167.84 54.8591 168.643 55.2644 169.619C55.6698 170.594 55.7205 171.68 55.4078 172.686C55.0951 173.693 54.4387 174.556 53.5533 175.126C52.6678 175.695 51.6096 175.935 50.5631 175.803C49.5166 175.671 48.5484 175.176 47.8274 174.403C47.1064 173.631 46.6784 172.631 46.6181 171.577C46.5578 170.523 46.869 169.483 47.4974 168.638C48.1258 167.793 49.0315 167.197 50.0564 166.954L51.0335 157.494C50.0743 157.036 49.3067 156.253 48.8665 155.285C48.4262 154.317 48.3416 153.225 48.6276 152.203C48.9137 151.181 49.5519 150.294 50.4295 149.7C51.3071 149.105 52.3676 148.841 53.4235 148.954C54.4794 149.067 55.4627 149.55 56.1997 150.317C56.9367 151.084 57.3798 152.086 57.4508 153.147C57.5217 154.207 57.2159 155.257 56.5875 156.111C55.959 156.965 55.0484 157.568 54.0165 157.813L53.528 162.543C54.8716 161.739 56.4771 161.35 58.1565 161.529L64.1225 162.167C65.1041 162.273 66.0918 162.052 66.9335 161.539C67.7753 161.027 68.4244 160.251 68.781 159.332C67.8414 158.839 67.1045 158.031 66.7 157.05C66.2956 156.068 66.2494 154.977 66.5698 153.968C66.8901 152.959 67.5564 152.096 68.4513 151.532C69.3462 150.968 70.4123 150.739 71.462 150.885C72.5117 151.03 73.4777 151.542 74.1899 152.329C74.9021 153.116 75.3148 154.129 75.3554 155.188C75.396 156.248 75.0618 157.286 74.4118 158.121C73.7618 158.956 72.8376 159.533 71.8018 159.752C71.3226 161.451 70.2585 162.925 68.7973 163.913C67.336 164.901 65.5713 165.339 63.8143 165.152L57.8483 164.514C56.8668 164.408 55.8791 164.629 55.0373 165.142C54.1956 165.654 53.5464 166.43 53.1899 167.349ZM51.2659 169.844C50.8704 169.801 50.4748 169.918 50.1661 170.168C49.8575 170.418 49.6612 170.78 49.6203 171.176C49.5795 171.572 49.6974 171.968 49.9482 172.278C50.199 172.588 50.5621 172.785 50.9577 172.828C51.3533 172.87 51.7489 172.753 52.0575 172.504C52.3661 172.254 52.5624 171.891 52.6033 171.495C52.6442 171.1 52.5262 170.703 52.2754 170.393C52.0246 170.084 51.6615 169.886 51.2659 169.844ZM53.1152 151.939C52.7196 151.897 52.324 152.013 52.0154 152.263C51.7068 152.513 51.5105 152.876 51.4696 153.271C51.4287 153.667 51.5467 154.063 51.7975 154.373C52.0483 154.683 52.4114 154.881 52.807 154.923C53.2026 154.965 53.5982 154.849 53.9068 154.599C54.2154 154.349 54.4117 153.986 54.4526 153.591C54.4935 153.195 54.3755 152.798 54.1247 152.489C53.8739 152.179 53.5108 151.981 53.1152 151.939ZM71.0131 153.853C70.6176 153.811 70.2219 153.928 69.9133 154.177C69.6047 154.427 69.4084 154.79 69.3675 155.186C69.3266 155.581 69.4446 155.978 69.6954 156.288C69.9462 156.597 70.3093 156.795 70.7049 156.837C71.1005 156.88 71.4961 156.763 71.8047 156.513C72.1133 156.263 72.3096 155.901 72.3505 155.505C72.3914 155.109 72.2734 154.713 72.0226 154.403C71.7718 154.093 71.4087 153.896 71.0131 153.853Z"
                        fill="white"
                    />
                </g>
                <defs>
                    <filter
                        id="filter0_b_2376_2621"
                        x="-31.4263"
                        y="3.51489"
                        width="367.27"
                        height="198.645"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feGaussianBlur
                            in="BackgroundImageFix"
                            stdDeviation="16"
                        />
                        <feComposite
                            in2="SourceAlpha"
                            operator="in"
                            result="effect1_backgroundBlur_2376_2621"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_backgroundBlur_2376_2621"
                            result="shape"
                        />
                    </filter>
                    <filter
                        id="filter1_b_2376_2621"
                        x="225.279"
                        y="-3.68643"
                        width="120.321"
                        height="121.539"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feGaussianBlur
                            in="BackgroundImageFix"
                            stdDeviation="12.8"
                        />
                        <feComposite
                            in2="SourceAlpha"
                            operator="in"
                            result="effect1_backgroundBlur_2376_2621"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_backgroundBlur_2376_2621"
                            result="shape"
                        />
                    </filter>
                    <filter
                        id="filter2_f_2376_2621"
                        x="247.004"
                        y="18.2683"
                        width="77.8944"
                        height="78.0382"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                        />
                        <feGaussianBlur
                            stdDeviation="9.6"
                            result="effect1_foregroundBlur_2376_2621"
                        />
                    </filter>
                    <filter
                        id="filter3_b_2376_2621"
                        x="0.824802"
                        y="102.571"
                        width="120.321"
                        height="121.539"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feGaussianBlur
                            in="BackgroundImageFix"
                            stdDeviation="12.8"
                        />
                        <feComposite
                            in2="SourceAlpha"
                            operator="in"
                            result="effect1_backgroundBlur_2376_2621"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_backgroundBlur_2376_2621"
                            result="shape"
                        />
                    </filter>
                    <filter
                        id="filter4_f_2376_2621"
                        x="22.5502"
                        y="124.526"
                        width="77.8944"
                        height="78.0382"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                        />
                        <feGaussianBlur
                            stdDeviation="9.6"
                            result="effect1_foregroundBlur_2376_2621"
                        />
                    </filter>
                    <linearGradient
                        id="paint0_linear_2376_2621"
                        x1="115.5"
                        y1="0.312018"
                        x2="246.5"
                        y2="280.312"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stop-color="#18181B" />
                        <stop offset="1" stop-color="#3F3F46" />
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear_2376_2621"
                        x1="31.452"
                        y1="0"
                        x2="21.304"
                        y2="38.3082"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stop-color="white" stop-opacity="0.24" />
                        <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient
                        id="paint2_linear_2376_2621"
                        x1="31.452"
                        y1="0"
                        x2="21.304"
                        y2="38.3082"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stop-color="white" stop-opacity="0.24" />
                        <stop offset="1" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

const ArlinkLogo = () => {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 131 132"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="md:size-[131px] size-[90px]"
        >
            <g filter="url(#filter0_b_2362_1460)">
                <rect
                    x="0.612061"
                    y="16.3877"
                    width="115.722"
                    height="115.722"
                    rx="22.5"
                    transform="rotate(-7.68963 0.612061 16.3877)"
                    fill="#18181B"
                />
                <rect
                    x="1.87748"
                    y="17.352"
                    width="113.472"
                    height="113.472"
                    rx="21.375"
                    transform="rotate(-7.68963 1.87748 17.352)"
                    stroke="url(#paint0_linear_2362_1460)"
                    stroke-width="2.25"
                />
                <g filter="url(#filter1_f_2362_1460)">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M67.107 41.4752C67.1098 41.2833 67.1114 41.1443 67.0772 41.0153L67.0725 40.8865L67.0145 40.8584C66.979 40.7929 66.9304 40.7254 66.8641 40.6501L66.8573 40.651C66.7713 40.6097 66.6905 40.5766 66.6125 40.5514L66.5904 40.5193C66.3983 40.4825 66.2476 40.4762 66.0919 40.4975C65.9842 40.5096 65.8707 40.535 65.7449 40.5729L65.422 40.7047L64.8466 40.9398L64.4239 41.1145L63.5039 41.4878C62.7217 41.8066 61.9381 42.1218 61.1529 42.4331C60.5937 42.6562 60.0347 42.8799 59.4757 43.1041L58.0463 43.6759L56.6055 44.2527L56.0591 44.4718L55.2892 44.7781L55.0545 44.8721C54.6424 45.035 54.2401 45.2069 53.8542 45.4233C53.52 45.6518 53.4427 45.7833 53.3643 46.1762L53.328 46.4198C53.2746 46.7407 53.2252 47.0622 53.1797 47.3842L53.1293 47.7543L53.0214 48.5438L52.8527 49.7791L52.7405 50.5882L52.6876 50.9776C52.5767 51.7709 52.4903 52.5523 52.4616 53.3519L52.4557 53.56L52.2935 53.4761L52.1738 53.4115L51.8 53.218C51.6106 53.1191 51.5186 53.0711 51.424 53.0286C51.3347 52.9884 51.2431 52.9533 51.0649 52.8849C50.6054 52.8894 50.2218 53.018 49.8671 53.2165C49.8476 53.2256 49.8273 53.2357 49.8061 53.2468L49.7731 53.2711C49.5202 53.4232 49.2802 53.6093 49.0354 53.8088L49.0326 53.8079L48.7763 53.9981L48.4839 54.2538L48.2584 54.4517L48.104 54.5785L47.1559 55.3586C45.817 56.4488 44.4839 57.5461 43.1567 58.6506C42.8831 58.8789 42.6083 59.1069 42.3323 59.3344L41.8092 59.7648L41.565 59.9673L41.1259 60.3276C41.0468 60.396 40.9711 60.4622 40.8996 60.528C40.577 60.798 40.3506 61.0449 40.2304 61.4846C40.248 61.5478 40.261 61.5946 40.2723 61.6321C40.2709 61.6467 40.2696 61.6616 40.2685 61.6766L40.2954 62.0172C39.9778 62.0601 39.9778 62.0601 39.7222 62.2935L39.7221 62.2935C39.4721 62.7476 39.497 62.983 39.5595 63.4848L39.6089 63.8119C39.657 64.1768 39.7069 64.5419 39.7585 64.9074C39.7961 65.1687 39.8331 65.4301 39.8696 65.6916C39.9621 66.3767 40.057 67.0627 40.1544 67.7495C40.2345 68.3176 40.3135 68.8852 40.3912 69.4524C40.466 70.0062 40.5418 70.5593 40.6187 71.1117L40.7292 71.9045C40.7816 72.2838 40.8345 72.6629 40.888 73.042L40.9384 73.3898C41.0465 74.1899 41.1663 74.8466 41.6134 75.5317L41.799 75.7661C42.2857 76.3992 42.9618 76.7559 43.6741 77.087L43.9027 77.191L44.4211 77.4307L45.3492 77.8606L45.3639 77.8675L45.3644 77.8707C45.52 77.9508 45.6769 78.0282 45.8351 78.1029L46.0433 78.1976C46.411 78.3663 46.7793 78.5335 47.1483 78.6991C47.8204 79.0103 48.4934 79.3196 49.1672 79.6271L49.1667 79.6285L49.2315 79.6564C49.6303 79.8383 50.0293 80.0195 50.4287 80.2L50.795 80.3633L51.5333 80.6943C52.1965 80.9833 52.8487 81.2968 53.4885 81.6342C53.7636 81.7891 53.7637 81.7891 54.0115 81.8957L54.0116 81.8957L54.0623 81.8909C54.1374 81.8867 54.1859 81.8836 54.2341 81.8779C54.3075 81.8692 54.3801 81.8547 54.5448 81.8219C54.7516 81.6889 54.8978 81.5733 55.0039 81.4217L55.2156 81.1917C55.5318 81.2407 55.5318 81.2407 55.7543 81.3387L55.7543 81.3387L55.9831 81.4444L56.2061 81.5458L56.7206 81.7825L56.9697 81.8976L57.2093 82.0071L57.3881 82.0885C57.0086 83.9328 56.6392 85.7787 56.2798 87.6262L56.0908 88.5961L55.8518 89.8115L55.7622 90.2751L55.722 90.4775C55.5927 91.1262 55.4635 91.7751 55.3893 92.4322C55.3825 92.8431 55.3825 92.8431 55.633 93.1483L55.633 93.1483C55.7953 93.2199 55.8826 93.2584 55.9671 93.2754L55.986 93.303C56.0279 93.2973 56.0676 93.2918 56.1055 93.2862C56.1709 93.2848 56.2508 93.2769 56.3649 93.2657C56.4372 93.2309 56.4973 93.202 56.5493 93.1741C56.6023 93.1525 56.657 93.1267 56.7156 93.0955C56.9311 92.8226 57.1011 92.5184 57.2205 92.1946L57.3376 91.9374L57.4929 91.6016L57.9263 90.6609L58.013 90.4572C58.4419 89.5339 58.8775 88.6136 59.3198 87.6966L59.4922 87.3379C59.7225 86.859 59.9526 86.3808 60.1753 85.8981L60.3354 85.5461L60.4944 85.2023L60.5194 85.2307C60.6943 84.889 60.8427 84.5685 60.9421 84.2102C60.9837 84.1167 61.008 84.0833 61.0954 83.9628L61.4148 83.9197C61.6219 84.0211 61.8306 84.1192 62.0409 84.214L62.3721 84.3612L62.7437 84.5255C63.8254 85.0006 64.9027 85.4854 65.9757 85.9797C66.375 86.1691 66.7787 86.3487 67.1866 86.5185L67.4288 86.6086C67.5404 86.6514 67.5936 86.6718 67.6484 86.6867C67.6984 86.7004 67.7496 86.7094 67.8477 86.7267L67.8478 86.7267C68.1277 86.6474 68.2583 86.5641 68.4753 86.3653L68.6415 86.1871C68.8237 86.2762 68.91 86.3185 69.0007 86.3472C69.0229 86.3542 69.0455 86.3604 69.0698 86.3663C69.1282 86.3875 69.2063 86.4051 69.3301 86.4331L69.3303 86.4331L69.3303 86.4331C69.4761 86.4286 69.5779 86.4254 69.6741 86.4003C69.8514 86.3541 70.0094 86.2334 70.3876 85.8925L70.4459 85.8432L70.7007 85.6168L71.2481 85.1485C71.578 84.8608 71.911 84.5765 72.2469 84.2958C73.1087 83.581 73.9637 82.8549 74.817 82.1291C75.6452 81.4246 76.4787 80.7262 77.3173 80.0341C77.9458 79.5234 78.5578 78.9925 79.1521 78.4424C79.3206 78.2849 79.4903 78.1288 79.6614 77.9741C79.9633 77.8018 79.9633 77.8019 80.3459 77.9837C80.5799 78.1069 80.8332 78.1891 81.0949 78.2268C81.2544 78.2097 81.3315 78.2015 81.4006 78.1736C81.4652 78.1475 81.5228 78.1043 81.6343 78.0208L81.6344 78.0208L81.6344 78.0208L81.8904 77.8028C83.0162 76.8821 84.1309 75.948 85.2344 75.0006C85.7319 74.5726 86.2307 74.146 86.7308 73.721L87.0412 73.4577C87.5651 73.0103 88.0922 72.5667 88.6223 72.1268L88.9461 71.8599L89.5721 71.3464C90.1912 70.846 90.7928 70.3565 91.2852 69.7244C91.9417 68.745 92.0069 67.6136 91.8612 66.4709L91.8156 66.1588C91.77 65.804 91.7227 65.4489 91.6735 65.0934C91.6383 64.841 91.6035 64.588 91.5693 64.3343L91.3531 62.7462C91.2571 62.0604 91.1633 61.3742 91.0717 60.6878L90.8538 59.074L90.7485 58.3064C90.7001 57.9393 90.6499 57.5719 90.5979 57.2041L90.5508 56.868L90.5094 56.5484L90.4668 56.2584C90.4311 56.0072 90.4311 56.0072 90.3746 55.7935L90.3746 55.7934L90.3745 55.7934L90.3745 55.7934L90.3745 55.7933C90.2334 55.6328 90.1702 55.5609 90.0921 55.5139C90.0289 55.4758 89.9558 55.4541 89.8235 55.4146L89.5604 55.3619L89.5593 55.356L89.5692 55.3626C89.535 55.2043 89.5166 55.119 89.4936 55.0351C89.4667 54.9372 89.4335 54.8411 89.3617 54.633L89.3616 54.6329C89.2587 54.5273 89.1885 54.4553 89.1096 54.3945C89.0282 54.3319 88.9376 54.2814 88.7923 54.2182C88.5768 54.0887 88.3499 53.9797 88.1037 53.8739C87.9301 53.8005 87.7563 53.7265 87.5825 53.6519L87.2962 53.5297C86.7592 53.298 86.2244 53.0612 85.6919 52.8192L85.3457 52.6636L83.9216 52.0187L81.8488 51.0791L81.16 50.7691C80.8002 50.6066 80.4406 50.4453 80.0811 50.2851L79.7351 50.1312C79.4286 49.9917 79.1203 49.8563 78.8102 49.7251C78.4748 49.5972 78.1593 49.4787 77.8451 49.4177L77.8398 49.3786C77.4939 49.3533 77.2141 49.3505 76.9494 49.4377C76.857 49.4629 76.7633 49.4961 76.6679 49.5386C76.652 49.5597 76.6359 49.5802 76.6197 49.6004C76.558 49.6417 76.4959 49.6896 76.4328 49.745L76.2109 49.9843C76.1587 50.0397 76.1066 50.0952 76.0548 50.1508C75.637 50.5018 75.2195 50.8545 74.812 51.218C74.0096 51.9323 73.187 52.6237 72.3451 53.2911C72.1439 53.4515 71.9434 53.6128 71.7437 53.775L71.7301 53.7703L71.5393 53.8947L71.3294 54.07L71.3154 54.0815C71.1659 54.2035 71.0751 54.2776 71.0122 54.3763C70.6355 54.6897 70.2615 55.0063 69.8904 55.3264C69.4416 55.7168 68.9908 56.1023 68.5306 56.478C68.4828 56.4882 68.4407 56.5006 68.4008 56.518C68.2748 56.5733 68.1711 56.6793 67.9826 56.9266C67.8068 57.0774 67.6358 57.2336 67.4697 57.395C66.925 57.9477 66.5233 58.2649 65.769 58.4688L65.7285 58.13C65.7839 57.6313 65.8868 57.5344 66.2571 57.2284L66.4717 57.0628L66.9284 56.6915C67.0929 56.5612 67.2566 56.43 67.4197 56.298L67.4238 56.2994L67.6149 56.1646L67.827 55.9803L68.1264 55.7186L68.6563 55.282L68.842 55.1299C68.9121 55.1103 68.9561 55.0766 69.0763 54.9848L69.2889 54.8039L69.6608 54.4844L69.6644 54.4851L69.664 54.4817L69.6608 54.4844L69.6324 54.4795C69.8723 54.2813 70.1119 54.0828 70.3512 53.8838C70.5261 53.738 70.7011 53.5923 70.8763 53.4468C70.9611 53.4219 71.0212 53.3724 71.2061 53.2202L71.5237 52.9334L71.847 52.6428C71.9925 52.5226 72.1382 52.4026 72.2839 52.2826C72.4467 52.2379 72.5663 52.1367 72.9072 51.7726C73.229 51.5124 73.5526 51.2561 73.8883 51.0123C74.25 50.7576 74.5803 50.5141 74.8885 50.1958C74.9142 50.1108 74.9329 50.0261 74.9458 49.9416L74.9884 49.8727C74.9986 49.4354 74.9271 49.0213 74.8164 48.5986L74.7928 48.5668C74.5638 48.2326 74.5364 48.2199 73.6252 47.796L73.2608 47.6462L72.8505 47.4768L71.7427 47.0227L71.5174 46.9303C70.9154 46.681 70.3171 46.4228 69.7228 46.1557L69.7273 46.1498L69.4956 46.0479L69.1885 45.9129C69.1436 45.8931 69.099 45.8737 69.0544 45.8549C68.2834 45.513 67.5049 45.1885 66.7193 44.8815L66.4053 44.7596C66.3629 44.5352 66.3629 44.5352 66.4391 44.2793L66.5287 43.9438L66.7277 43.1887C66.7497 43.1062 66.772 43.0237 66.7944 42.9412L66.7945 42.9408L66.7946 42.9403L66.7948 42.9398C66.9254 42.4578 67.0564 41.975 67.107 41.4752ZM63.6635 43.1562L63.9375 43.0465L63.9448 43.049C63.9918 43.03 64.0385 43.011 64.0849 42.992C64.4336 42.8497 64.769 42.7129 65.1482 42.6616C65.1886 42.8707 65.1886 42.8707 65.1374 43.0679L65.1374 43.0679L65.0764 43.3079L65.0061 43.582L64.9275 43.8832C64.844 44.2128 64.7594 44.543 64.6738 44.874L64.6705 44.8866L64.5871 44.8979L64.4238 45.444L64.3588 45.6673C64.3432 45.7185 64.3275 45.7676 64.3122 45.8151C64.2219 46.0967 64.1496 46.3219 64.23 46.599C64.0681 47.2259 63.9051 47.8525 63.741 48.4788C63.715 48.4485 63.685 48.4144 63.6503 48.3748L63.3978 49.7079L63.4185 49.7052L63.3638 49.9121C63.3425 49.8509 63.3187 49.7875 63.2923 49.7205L63.1182 50.8268L63.1214 50.8255C62.5921 52.8166 62.0702 54.8096 61.5556 56.8046L61.2633 57.9321C61.1561 58.3421 61.0495 58.7526 60.9435 59.1636L60.8298 59.6027L60.8104 59.678L60.7461 59.6867L60.6868 59.9144L60.6079 60.2139C60.5058 60.5979 60.4432 60.954 60.4295 61.3519L60.4571 61.3409C60.4455 61.5623 60.4724 61.7639 60.6301 61.9665C60.9955 62.1109 60.9955 62.1109 61.7012 61.8669L62.0737 61.718L62.507 61.5453C62.9175 61.3826 63.3275 61.2206 63.737 61.0592L64.0064 60.9537C65.0859 60.5285 66.1673 60.1081 67.2506 59.6923L67.9494 59.4232L68.1662 59.3393L68.3453 59.2699C69.4728 58.8326 70.5975 58.3964 71.7703 58.0909C71.824 58.3223 71.824 58.3223 71.6476 58.5658C71.5059 58.7957 71.4646 58.8628 71.3907 59.0032L71.3435 58.9073L71.3442 58.9061L71.3422 58.9046L71.3435 58.9073C71.1941 59.1992 71.0453 59.4917 70.8972 59.7846L70.7142 60.1466L70.5321 60.5016L70.3588 60.845C70.162 61.2302 70.0172 61.5845 69.9258 62.0057L69.8696 62.1216C69.8559 62.096 69.8393 62.0663 69.8181 62.0284L69.8181 62.0284L69.6909 62.2652L69.5271 62.5762C69.3212 62.9639 69.172 63.3147 69.0798 63.7447C68.9357 64.0401 68.7916 64.3354 68.6473 64.6306L68.4348 65.0663C68.4193 65.0306 68.4005 64.9889 68.3726 64.9273L68.3725 64.9271L67.9599 65.8044L67.7847 66.1723C67.431 66.9227 67.07 67.6697 66.7018 68.4132C66.5361 68.7388 66.4157 69.0398 66.3279 69.3822L66.1596 69.7267C65.1165 71.8589 64.0811 73.9948 63.0533 76.1344C62.4998 77.2892 61.9422 78.4421 61.3806 79.5931L61.058 80.2524L60.9348 80.506L60.5107 81.3745L60.3548 81.6931L60.1618 81.6344L59.9107 81.5558L59.9107 81.5558C59.6643 81.4853 59.6642 81.4853 59.4478 81.3814C59.2745 81.0969 59.2745 81.0969 59.3264 80.8408L59.3931 80.5533L59.4689 80.2179L59.5588 79.846C59.6394 79.4949 59.7207 79.1449 59.8028 78.796L60.0988 77.5296L60.125 77.416L60.125 77.416C60.4825 75.8677 60.8402 74.3182 61.2181 72.7741L61.2192 72.812L61.3262 72.7976C61.4879 72.0986 61.6245 71.394 61.7357 70.6852L61.8115 70.383L61.8687 70.1538C61.9214 69.9458 61.9686 69.7364 62.01 69.5258C62.156 69.331 62.159 69.3033 62.2014 68.9153C62.1891 68.5295 62.1606 68.4849 61.8793 68.1821C61.6875 68.0833 61.5701 68.0227 61.4465 68.0051C61.2515 67.9772 61.0413 68.0561 60.4991 68.2595L60.4991 68.2595L60.499 68.2595L60.5128 68.3615L60.4353 68.3893L59.8676 68.5922L59.4488 68.7439L59.4482 68.7441C57.8278 69.3277 57.5964 69.411 53.9648 70.7603C53.8289 70.7702 53.7323 70.7785 53.6375 70.7964C53.4336 70.8348 53.2379 70.9173 52.6755 71.1546L52.7665 71.2056L51.8497 71.5464L51.6472 71.6222C51.6274 71.0021 51.7028 70.4073 51.7844 69.7943L51.8722 69.1511L52.0289 67.9797L52.1977 66.7323L52.4004 65.2225C52.5167 64.3643 52.6314 63.5059 52.7445 62.6472C52.8095 62.1485 52.8752 61.6498 52.9414 61.1511L52.945 61.1725L53.052 61.158C53.1284 60.6591 53.1905 60.1581 53.2383 59.6557L53.2618 59.4069L53.345 58.5239L53.2938 58.5308C53.4757 57.1925 53.6603 55.8547 53.8453 54.5177L53.9768 53.5572L54.0283 53.1826L54.0362 53.2413L54.1433 53.2269L54.1833 52.9724L54.2319 52.6407L54.2427 52.5715C54.2904 52.2694 54.316 52.1064 54.2138 51.8449C54.2857 51.3296 54.3582 50.8144 54.4312 50.2993L54.4683 50.0389L54.4698 50.0467L54.5768 50.0322L54.6205 49.8049L54.6734 49.5055C54.7355 49.1735 54.763 48.9528 54.6587 48.6749C54.6863 48.4741 54.7143 48.2733 54.7429 48.0726L54.7913 47.7392L54.8312 47.4328L54.8723 47.1609L54.9034 46.9301C55.407 46.4193 55.407 46.4193 56.141 46.1801L56.3985 46.0761L57.2613 45.7278L57.8783 45.4802L59.1647 44.964L60.8382 44.2918L62.1441 43.7661L62.7676 43.5158L63.6635 43.1562ZM64.4264 51.7296C64.7127 50.5797 65.0051 49.4326 65.3152 48.2901C65.3361 48.3479 65.3615 48.406 65.3921 48.4648C65.5267 47.99 65.5336 47.966 65.6835 46.9676C65.7428 46.7603 65.8028 46.5532 65.8637 46.3462L65.8668 46.3441C66.2979 46.3723 66.2979 46.3723 66.6972 46.5623L66.9523 46.6714C67.3258 46.8295 67.6979 46.9908 68.0686 47.1552L68.0381 47.2444L68.8395 47.5687L68.8511 47.508L68.8632 47.5135L68.8632 47.5135C69.8665 47.9748 69.8665 47.9748 72.9174 49.2407L73.1921 49.3541C73.0059 49.6145 72.8233 49.8381 72.5841 50.052L72.3094 50.2724L71.9991 50.5236C71.716 50.7498 71.4337 50.9776 71.1522 51.207L70.9775 51.3482C70.4584 51.7698 69.9441 52.1973 69.4348 52.6307C68.7311 53.2354 68.0135 53.8236 67.2825 54.395C66.7366 54.8162 66.2079 55.2593 65.6975 55.723C65.4863 55.9199 65.2685 56.1097 65.0444 56.292C64.7417 56.4453 64.6109 56.4889 64.2821 56.4105L64.0456 56.2989L64.0455 56.2989C63.8056 56.1998 63.8056 56.1998 63.6077 56.0536C63.4731 55.8123 63.4394 55.6785 63.4748 55.4021L63.5486 55.1292L63.6303 54.812L63.8208 54.0962L63.922 53.7054L63.9771 53.4964C63.9937 53.5336 64.0131 53.5746 64.0351 53.6211L64.1122 53.346L64.2117 52.9815C64.3308 52.5572 64.417 52.1702 64.4284 51.7293L64.4264 51.7296ZM46.496 57.9402C47.1333 57.4295 47.7645 56.9113 48.3895 56.3856C48.5202 56.2751 48.6698 56.1338 48.8329 55.9798C49.5181 55.3327 50.4423 54.4598 51.2161 54.6962L51.4538 54.8042C51.692 54.9035 51.692 54.9035 51.9043 55.0409L51.9043 55.0409C52.1385 55.2895 52.1752 55.4074 52.1701 55.754L52.1153 56.142C52.084 56.376 52.0516 56.6098 52.018 56.8435L51.9437 57.3569L51.7859 58.4939C51.669 59.3213 51.5548 60.1491 51.4432 60.9773L51.3833 61.4178L51.0004 64.244L50.9449 64.6407L50.7736 65.8954L50.7736 65.8954C50.4467 65.8444 50.4467 65.8444 50.187 65.7272L49.8884 65.5911L49.5512 65.4377L48.8136 65.0997L48.4322 64.9263C47.8669 64.6683 47.2996 64.4127 46.7304 64.1598C46.477 64.0475 46.2232 63.9358 45.9693 63.824C45.6914 63.7018 45.4134 63.5795 45.1358 63.4562C45.1682 63.4409 45.205 63.4228 45.2478 63.4017L44.2196 62.9991L44.2215 63.0006L44.2497 63.0576C43.4587 62.6958 42.6753 62.3184 41.9109 61.9039L43.465 60.6138L43.4665 60.6119C43.4153 60.6023 43.3711 60.594 43.3317 60.5878C43.4685 60.4744 43.6048 60.3605 43.7406 60.2461L43.7418 60.2546C43.9541 60.226 43.9541 60.226 44.1217 60.084L44.302 59.9074L44.6244 59.5923L44.5616 59.5444C45.198 58.9997 45.8429 58.4649 46.496 57.9402ZM76.8434 51.518L77.0591 51.3349L77.0553 51.3319C77.373 51.059 77.5652 50.9448 77.9829 51.1046C78.1553 51.1857 78.3286 51.2649 78.5027 51.3423L79.2107 51.6532C79.7023 51.8704 80.1945 52.0865 80.6871 52.3014C81.0896 52.475 81.4913 52.6502 81.8923 52.8272L81.8746 52.833L81.8893 52.9418L82.1358 53.0641L82.4521 53.2031C82.7686 53.3437 82.7686 53.3437 83.0384 53.4335L83.0385 53.4335L83.1217 53.3765C83.5172 53.5552 83.912 53.7357 84.306 53.9179C84.8287 54.1651 85.3552 54.4042 85.8853 54.6353L86.2173 54.7755C86.4277 54.8647 86.6385 54.9533 86.8499 55.0412L87.1481 55.1618L87.4212 55.2754L87.4464 55.2858C87.7702 55.4183 87.8291 55.4424 87.9967 55.7841C86.5312 57.0356 85.0594 58.2797 83.5813 59.5163C83.1875 59.845 82.7944 60.1749 82.402 60.5057C82.1823 60.6925 81.9626 60.8791 81.7426 61.0653C81.6806 61.0741 81.64 61.0817 81.6023 61.0966C81.5426 61.1202 81.4902 61.1623 81.3723 61.257L81.3722 61.2571L81.1364 61.4705L80.7141 61.8527L80.7796 61.8754C80.5055 62.1041 80.2304 62.3316 79.954 62.5574L79.8297 62.5153L79.5752 62.7054L79.2828 62.9611L78.7631 63.417L78.8567 63.4418C78.6402 63.6049 78.4331 63.7217 78.1615 63.8165C78.0124 63.5962 78.0124 63.5962 77.4558 63.3807C77.3086 63.3245 77.162 63.2676 77.0158 63.2101L76.5721 63.0365L76.0684 62.8416L75.1734 62.4902C74.7913 62.3423 74.4092 62.1938 74.027 62.0448L73.64 61.8946L73.262 61.7468L72.9059 61.608C72.5465 61.4697 72.2503 61.3385 71.957 61.0875L72.2396 60.5287L72.3622 60.2838C72.5834 59.8405 72.8093 59.3994 73.0397 58.9608L73.1834 58.6923L73.4621 58.1686L73.4676 58.1584L73.5296 58.2842C73.5725 58.202 73.6176 58.1189 73.6632 58.0349L73.6633 58.0348L73.6633 58.0347C73.9128 57.5755 74.1763 57.0905 74.1638 56.5761C73.9285 56.2429 73.9285 56.2429 73.756 56.1053L73.7577 56.1051C73.2112 55.8623 72.4944 56.1131 71.9688 56.3328L71.9751 56.3792L71.8595 56.4062L71.8594 56.4062L71.8594 56.4062C71.6882 56.4505 71.5159 56.4899 71.3426 56.5244L71.2211 56.4319C71.3419 56.2526 71.4725 56.0966 71.6129 55.9517C71.8067 55.9255 71.8116 55.9213 71.9742 55.7836L72.1545 55.6071L72.4769 55.292L72.3947 55.2636L72.6458 55.0564L72.9027 54.8453C73.3487 54.4765 73.7927 54.1052 74.2346 53.7314L74.7702 53.2785C75.0092 53.0775 75.2478 52.8759 75.4859 52.6739L75.5858 52.7084L75.8423 52.5198L76.1347 52.2641L76.6543 51.8082L76.6465 51.8067L76.6461 51.8067C76.6027 51.7983 76.5651 51.791 76.5318 51.7851L76.6094 51.7191L76.8434 51.518ZM62.8736 57.8167L62.9433 57.5513L62.9412 57.5481C63.4032 57.4857 63.7017 57.672 64.0747 57.9365C64.1845 58.2359 64.2399 58.3871 64.2749 58.5429C64.3105 58.7018 64.3248 58.8655 64.3537 59.1961C64.0551 59.3419 63.7504 59.4678 63.4401 59.591L63.2103 59.6826L62.4091 60C62.3447 59.6766 62.3447 59.6766 62.4497 59.3528C62.5296 59.0845 62.6062 58.8153 62.6797 58.5451L62.7783 58.1738L62.8736 57.8167ZM70.8266 56.6996L71.0102 56.4586L71.3583 56.6278L70.8266 56.6996ZM41.7894 67.6377C41.6053 66.2257 41.4244 64.8133 41.2467 63.4005L41.2487 63.402C41.6358 63.4639 41.6358 63.4639 41.9999 63.6621L41.9999 63.6621L42.2722 63.7827C42.7348 63.9864 43.1955 64.1944 43.6542 64.4066L43.6654 64.4801C44.0949 64.7487 44.5239 64.9514 45.0224 65.0488C45.4865 65.2652 45.9522 65.4781 46.4195 65.6876C46.8885 65.8987 47.3576 66.1104 47.8268 66.3227L48.1474 66.4679C48.272 66.5241 48.3965 66.5807 48.5208 66.6375L48.4954 66.6371L48.5096 66.7424L48.7175 66.8475C49.1396 67.0396 49.5469 67.225 49.9175 67.5106L49.953 67.5404C50.1929 68.3056 50.3174 68.7312 50.3442 69.1629C50.3748 69.6561 50.2778 70.1571 50.0794 71.1817C50.041 71.4441 50.0055 71.7066 49.973 71.9693L49.9439 72.2154C49.9266 72.3225 49.9138 72.4303 49.9055 72.5384C49.8758 72.4942 49.8453 72.4501 49.814 72.406C49.7633 72.6961 49.7635 72.6982 49.7931 73.0578L49.7932 73.0591C49.9225 73.2226 49.9877 73.3051 50.064 73.3753C50.1417 73.4468 50.2309 73.5057 50.4109 73.6244C50.9046 73.6277 51.1082 73.5514 51.5048 73.2855C51.5908 73.2529 51.6872 73.216 51.7962 73.1743C52.0961 73.0466 52.4038 72.9381 52.7175 72.8493L52.9686 72.7877L53.4172 72.677C53.5315 73.4722 53.6442 74.2682 53.7553 75.0651C53.8113 75.4715 53.8684 75.8777 53.9267 76.2838C53.984 76.6814 54.04 77.0792 54.0948 77.4772L54.1579 77.9322L54.2229 78.3749L54.2784 78.786C54.3397 79.229 54.3307 79.5073 54.1717 79.8728L54.0744 79.9395L53.7566 79.8406C53.4947 79.7442 53.2277 79.662 52.9569 79.5946C52.7375 79.5009 52.5193 79.4045 52.3023 79.3053L51.7525 79.0509L51.4592 78.9158C50.9894 78.699 50.5192 78.4829 50.0484 78.2674L48.3853 77.5072L48.4428 77.4567L47.5216 77.0397L47.5315 77.1158C47.0887 76.9112 46.6446 76.7084 46.1991 76.5074L45.9008 76.3729L45.3185 76.1091C45.0605 75.9933 44.8035 75.8752 44.5477 75.7548L44.3018 75.6375L44.0523 75.519L43.8091 75.3961C43.5857 75.2914 43.5857 75.2914 43.3647 75.1154L43.3647 75.1154C42.8663 74.6395 42.6428 74.2269 42.5457 73.5464L42.5119 73.2448C42.4658 72.9062 42.4218 72.5674 42.3799 72.2283C42.3507 71.9866 42.3204 71.745 42.2889 71.5037C42.2046 70.8704 42.1226 70.2375 42.0429 69.6048C41.9602 68.9494 41.8757 68.2937 41.7894 67.6377ZM87.9247 57.7622L88.2288 57.5032L88.231 57.5064C88.2719 57.4713 88.3102 57.4369 88.3471 57.4037L88.3472 57.4036C88.5279 57.2412 88.6747 57.1092 88.9371 57.0738C89.1138 58.3311 89.2886 59.5874 89.4616 60.8429L89.7282 62.7667L89.9894 64.6497L90.0879 65.3663C90.1378 65.7102 90.1859 66.0536 90.2322 66.3968L90.2751 66.7145C90.3293 67.0773 90.3791 67.4338 90.3853 67.7997L90.3852 67.7999L90.3851 67.8004L90.3843 67.8027C90.326 67.9708 90.2754 68.1171 90.2289 68.2463L90.226 68.2467L90.221 68.2681C90.1658 68.4206 90.1163 68.5489 90.0667 68.6614C89.9913 68.7907 89.8954 68.9073 89.7758 69.0374L89.5041 69.318L89.5859 69.3462C89.4094 69.514 89.1731 69.7011 88.8307 69.9722L88.8303 69.9724L88.8303 69.9725L88.83 69.9727L88.83 69.9727L88.8298 69.9728L88.8297 69.973L88.2144 70.4764L87.897 70.7389C87.4437 71.111 86.992 71.485 86.5419 71.8611L86.4052 71.9761L86.3947 71.8984L85.7066 72.4254L85.8102 72.4758C85.5524 72.6934 85.2953 72.9118 85.039 73.1312C84.7033 73.4199 84.3668 73.7081 84.0297 73.9957L83.7911 74.2009C83.4862 74.4617 83.1805 74.7215 82.874 74.9803L82.5588 75.246L82.2564 75.5048L81.969 75.746C81.6039 76.053 81.3032 76.2337 80.8319 76.3302C80.5166 75.968 80.5166 75.968 80.4693 75.4641L80.4316 75.1717C80.3854 74.847 80.3405 74.5227 80.2967 74.1988L80.201 73.5025L80.0032 72.0503C79.9191 71.4194 79.8335 70.7892 79.7462 70.1599C79.6776 69.6687 79.6102 69.1779 79.5439 68.6875L79.449 67.9842C79.4021 67.6458 79.356 67.3083 79.3106 66.972L79.2705 66.6626L79.2704 66.6615C79.2207 66.3192 79.1718 65.9819 79.1715 65.6347C79.8652 64.4824 79.8652 64.4824 80.9699 63.6448L81.0408 63.5867L81.1705 63.6315L81.3479 63.5107L81.5536 63.3307L81.7765 63.1363L82.0081 62.9303C82.2786 62.6949 82.5482 62.4584 82.817 62.2209L82.7303 62.1909C83.0032 61.9632 83.2755 61.7348 83.5474 61.5057L83.5945 61.5745L84.4649 60.8083L84.3982 60.7853C84.6866 60.5399 84.9744 60.2938 85.2616 60.047L85.846 59.546L86.297 59.1582C86.6195 58.8818 86.9425 58.6052 87.2661 58.3286L87.5994 58.0431L87.9247 57.7622ZM71.0668 62.9563C71.1012 62.8909 71.1404 62.828 71.2128 62.7119L71.215 62.715C71.5632 62.668 71.7457 62.7385 72.0659 62.8683L72.5256 63.057L72.7818 63.1608C72.9572 63.2324 73.0812 63.283 73.2054 63.3331C73.505 63.4541 73.8058 63.5722 74.832 63.9752L74.8325 63.9754L75.5448 64.2545L76.2159 64.5237L76.5478 64.6501L76.8586 64.7742C77.1328 64.8704 77.1328 64.8704 77.3637 65.0174C77.6547 65.4053 77.71 65.7888 77.7747 66.2557L77.811 66.55C77.8567 66.8794 77.9005 67.2085 77.9426 67.5372L78.0344 68.2427C78.1164 68.8589 78.1979 69.4752 78.2788 70.0916C78.3627 70.7295 78.4471 71.3679 78.5322 72.0068C78.7158 73.3831 78.8981 74.759 79.0792 76.1344L78.8813 76.2701L78.6371 76.1785C77.8618 75.8018 77.0781 75.4428 76.2864 75.1018L76.0824 75.0134C75.1032 74.5852 74.1209 74.1638 73.1355 73.7491C72.5074 73.4868 71.882 73.2195 71.2595 72.9472L71.0442 72.8518L69.9739 72.3805C69.7519 72.2819 69.5303 72.185 69.308 72.0909C69.3445 72.0737 69.3872 72.0527 69.4384 72.0275L69.4384 72.0275L69.3469 71.9903C68.8568 71.7911 68.3729 71.5945 67.8515 71.4841L67.8585 71.533C67.812 71.5172 67.7654 71.5017 67.7187 71.4863L67.5252 71.4242C67.4273 70.9427 67.3802 70.6706 67.5308 70.1971L67.7199 69.817C67.8246 69.6006 67.931 69.385 68.039 69.1702C68.1117 69.0255 68.1844 68.8802 68.2569 68.7343C68.6056 68.0174 68.9676 67.3071 69.3426 66.6037C69.7842 65.7693 70.1956 64.9193 70.5761 64.0554L70.7495 63.6618L70.9189 63.2895C70.9925 63.1139 71.0263 63.0333 71.0668 62.9563ZM59.2588 70.437L59.5425 70.3347C59.816 70.2338 60.0356 70.1695 60.3261 70.1303C60.2079 70.6543 60.0848 71.1772 59.9567 71.6989C59.702 72.736 59.4517 73.7742 59.2057 74.8134L59.1145 74.8258L59.0284 75.1107L58.9245 75.481C58.9095 75.5321 58.895 75.5795 58.8814 75.624C58.7946 75.9071 58.7435 76.074 58.8463 76.3464C58.5613 77.5732 58.2825 78.8014 58.0097 80.0309L57.9279 80.3983C57.6054 80.4695 57.6054 80.4695 57.3082 80.3055C57.1789 80.235 57.0481 80.1674 56.9158 80.1025C56.6304 80.0252 56.3782 79.9381 56.113 79.8061C55.9924 79.6176 55.9025 79.477 55.8344 79.3571L54.8897 72.3602L54.856 72.0589C55.067 71.9739 55.2796 71.8916 55.4937 71.812L55.7427 71.7213L56.9726 71.2733L57.6418 71.029L58.6391 70.6643L58.9539 70.5491L59.2588 70.437ZM66.0349 73.5353L66.0724 73.4625L66.1778 73.4483C66.3577 74.764 66.5371 76.0797 66.7159 77.3955L66.9892 79.4066L67.2589 81.3784L67.3617 82.1273L67.5093 83.2075L67.5538 83.537L67.5977 83.8494L67.6345 84.135C67.6758 84.4408 67.681 84.62 67.6209 84.9308C67.5266 84.9003 67.4328 84.8687 67.3396 84.8354L67.3734 84.7376L66.8685 84.5082L66.6605 84.4152C66.226 84.2174 65.808 84.0423 65.3426 83.9396C65.023 83.7947 64.7024 83.652 64.3799 83.5124L63.9665 83.333L63.3528 83.0664L62.9507 82.8941L62.5776 82.7318C62.5366 82.7142 62.4982 82.6982 62.4621 82.6831C62.1491 82.5525 62.0086 82.4939 61.8357 82.1435L61.9093 81.9329L62.0404 81.6869L62.1856 81.4044C62.291 81.2026 62.3939 80.9996 62.4943 80.7953L62.4946 80.7947C62.6438 80.4862 62.7184 80.3318 62.7935 80.1776C62.8687 80.0232 62.9443 79.869 63.0956 79.5604C63.4492 78.837 63.8017 78.1131 64.1533 77.3887L64.7585 76.1446L65.0604 75.5243L65.4987 74.6193L65.6342 74.3416C65.6656 74.2761 65.6973 74.2108 65.7291 74.1455C65.9167 73.9306 66.0022 73.7732 66.0349 73.5353ZM67.7423 74.1209C67.7033 73.8322 67.6952 73.7208 67.8458 73.4653L67.8371 73.4526L67.8372 73.4526L67.8373 73.4525C68.0392 73.3515 68.1454 73.2983 68.2526 73.2965C68.3714 73.2944 68.4913 73.3554 68.7443 73.484L69.0014 73.5946C69.3363 73.7351 69.6719 73.8765 70.0083 74.0191L70.3974 74.1845C71.5872 74.6882 72.7737 75.1997 73.9567 75.719L73.9576 75.7194C74.1803 75.8177 74.4031 75.916 74.6262 76.0138L74.6354 76.0824C75.0473 76.3018 75.433 76.4677 75.8902 76.5616L75.8893 76.5553L76.0195 76.6098L76.6521 76.8755L76.9431 76.9937L77.2053 77.1035L77.208 77.1047C77.5443 77.243 77.5902 77.2618 77.759 77.6048C76.7907 78.4417 75.8185 79.2743 74.8426 80.1024L74.741 80.0673L74.485 80.2593L74.1926 80.515L73.673 80.9709L73.7462 81.0267L73.4308 81.2915L73.3835 81.2226L73.3831 81.2192C73.1852 81.3549 73.1852 81.3549 72.9936 81.5122L72.7623 81.7077L72.5122 81.9179L72.2497 82.1385L71.3393 82.9031L71.4749 82.9291L71.2055 83.1547L70.89 83.4187L70.587 83.6724L70.3025 83.9097C70.1958 84.0007 70.0859 84.0877 69.9729 84.1705C69.7855 84.196 69.7758 84.2034 69.5271 84.3933L69.3002 84.5826C69.2803 84.5567 69.2633 84.5344 69.2487 84.5148L69.1968 84.4391C69.1593 84.3758 69.1521 84.3286 69.1329 84.2025L69.0991 83.9649L69.0605 83.6917L69.0201 83.3927C68.973 83.0612 68.9265 82.7296 68.8806 82.3979L68.7826 81.6847L68.5789 80.2021C68.4919 79.5577 68.4032 78.913 68.3126 78.2679C68.2426 77.7665 68.1732 77.2651 68.1043 76.7635L68.0056 76.0452C67.9567 75.7001 67.9089 75.3548 67.8623 75.0094L67.8213 74.6932L67.7775 74.3947L67.7423 74.1209ZM59.2128 82.9009C59.1299 82.8972 59.0476 82.8814 58.8998 82.8531L58.8988 82.8574L58.871 83.1042L58.8294 83.4367L58.789 83.7656C58.7378 84.0649 58.7378 84.0649 58.5683 84.4112L58.5661 84.4067L58.5521 84.4705L58.4796 84.8176L58.4102 85.1366C58.3535 85.421 58.3535 85.421 58.5292 85.7104L59.0195 84.589L59.1614 84.2689L59.2959 83.9584L59.4217 83.6733C59.5077 83.4495 59.557 83.2133 59.5677 82.9738C59.5125 82.9404 59.4664 82.9125 59.4265 82.8896C59.3367 82.8999 59.2746 82.9037 59.2128 82.9009ZM77.6395 77.5138L77.4127 77.4354L77.4416 77.6495L77.6395 77.5138Z"
                        fill="white"
                    />
                </g>
                <g clip-path="url(#clip0_2362_1460)">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M66.919 41.2081C66.9218 41.0162 66.9234 40.8772 66.8893 40.7483L66.8845 40.6194L66.8266 40.5913C66.791 40.5258 66.7424 40.4583 66.6761 40.383L66.6693 40.3839C66.5833 40.3426 66.5025 40.3095 66.4245 40.2843L66.4024 40.2522C66.2103 40.2154 66.0596 40.2091 65.9039 40.2304C65.7962 40.2425 65.6827 40.2679 65.5569 40.3058L65.234 40.4376L64.6586 40.6727L64.2359 40.8474L63.3159 41.2207C62.5338 41.5396 61.7501 41.8547 60.9649 42.166C60.4057 42.3891 59.8467 42.6128 59.2877 42.837L57.8583 43.4088L56.4175 43.9856L55.8711 44.2047L55.1012 44.511L54.8666 44.605C54.4544 44.7679 54.0521 44.9398 53.6662 45.1562C53.3321 45.3847 53.2547 45.5162 53.1763 45.9091L53.14 46.1527C53.0867 46.4736 53.0372 46.7951 52.9917 47.1171L52.9413 47.4872L52.8335 48.2767L52.6647 49.512L52.5525 50.3211L52.4996 50.7105C52.3888 51.5038 52.3023 52.2852 52.2736 53.0848L52.2677 53.2929L52.1055 53.209L51.9858 53.1444L51.6121 52.951C51.4226 52.852 51.3306 52.804 51.236 52.7615C51.1467 52.7213 51.0551 52.6862 50.8769 52.6178C50.4174 52.6223 50.0338 52.7509 49.6792 52.9494C49.6596 52.9586 49.6393 52.9687 49.6181 52.9797L49.5851 53.004C49.3322 53.1561 49.0922 53.3422 48.8474 53.5418L48.8446 53.5408L48.5883 53.7311L48.2959 53.9867L48.0704 54.1846L47.916 54.3114L46.9679 55.0915C45.629 56.1817 44.2959 57.279 42.9687 58.3835C42.6951 58.6118 42.4203 58.8398 42.1443 59.0673L41.6213 59.4977L41.377 59.7002L40.9379 60.0605C40.8588 60.1289 40.7831 60.1951 40.7116 60.2609C40.389 60.5309 40.1626 60.7778 40.0424 61.2175C40.06 61.2808 40.073 61.3275 40.0844 61.365C40.0829 61.3797 40.0816 61.3945 40.0805 61.4095L40.1074 61.7501C39.7898 61.793 39.7898 61.793 39.5342 62.0264L39.5342 62.0264C39.2841 62.4805 39.309 62.7159 39.3715 63.2177L39.4209 63.5449C39.469 63.9097 39.5189 64.2748 39.5705 64.6403C39.6081 64.9016 39.6452 65.163 39.6816 65.4245C39.7741 66.1096 39.869 66.7956 39.9664 67.4824C40.0466 68.0505 40.1255 68.6181 40.2032 69.1854C40.278 69.7392 40.3538 70.2922 40.4307 70.8446L40.5412 71.6374C40.5936 72.0167 40.6465 72.3958 40.7 72.7749L40.7504 73.1227C40.8585 73.9228 40.9783 74.5795 41.4254 75.2646L41.611 75.499C42.0977 76.1321 42.7738 76.4888 43.4862 76.8199L43.7147 76.9239L44.2331 77.1636L45.1612 77.5935L45.1759 77.6004L45.1764 77.6036C45.332 77.6837 45.4889 77.7611 45.6471 77.8359L45.8554 77.9305C46.223 78.0992 46.5913 78.2664 46.9603 78.432C47.6324 78.7432 48.3054 79.0525 48.9792 79.36L48.9787 79.3614L49.0435 79.3893C49.4423 79.5712 49.8413 79.7524 50.2407 79.9329L50.607 80.0962L51.3453 80.4272C52.0085 80.7162 52.6607 81.0297 53.3005 81.3671C53.5757 81.522 53.5757 81.522 53.8235 81.6286L53.8236 81.6286L53.8742 81.6239C53.9493 81.6197 53.9979 81.6165 54.0461 81.6108C54.1195 81.6021 54.1921 81.5876 54.3568 81.5548C54.5636 81.4218 54.7098 81.3062 54.8159 81.1546L55.0276 80.9247C55.3438 80.9736 55.3438 80.9736 55.5663 81.0716L55.5663 81.0716L55.7951 81.1774L56.0181 81.2787L56.5326 81.5154L56.7817 81.6305L57.0213 81.74L57.2001 81.8214C56.8207 83.6657 56.4512 85.5117 56.0918 87.3591L55.9028 88.329L55.6639 89.5444L55.5742 90.008L55.534 90.2104C55.4048 90.8592 55.2755 91.5081 55.2013 92.1651C55.1945 92.576 55.1945 92.576 55.445 92.8812L55.4451 92.8812C55.6073 92.9528 55.6946 92.9913 55.7791 93.0083L55.798 93.0359C55.8399 93.0302 55.8796 93.0247 55.9175 93.0191C55.9829 93.0177 56.0628 93.0098 56.1769 92.9986C56.2492 92.9639 56.3094 92.935 56.3613 92.907C56.4143 92.8854 56.469 92.8597 56.5276 92.8284C56.7431 92.5555 56.9131 92.2513 57.0325 91.9275L57.1496 91.6703L57.3049 91.3345L57.7383 90.3938L57.825 90.1901C58.2539 89.2668 58.6895 88.3465 59.1318 87.4295L59.3042 87.0708C59.5346 86.5919 59.7646 86.1137 59.9873 85.631L60.1474 85.279L60.3065 84.9352L60.3314 84.9636C60.5063 84.6219 60.6547 84.3014 60.7541 83.9431C60.7957 83.8497 60.82 83.8162 60.9074 83.6957L61.2268 83.6526C61.4339 83.754 61.6426 83.8521 61.8529 83.9469L62.1841 84.0941L62.5557 84.2584C63.6374 84.7335 64.7148 85.2183 65.7877 85.7126C66.187 85.902 66.5907 86.0816 66.9986 86.2514L67.2408 86.3415C67.3524 86.3843 67.4056 86.4047 67.4604 86.4197C67.5104 86.4333 67.5616 86.4423 67.6597 86.4596L67.6598 86.4597C67.9397 86.3803 68.0703 86.297 68.2873 86.0982L68.4536 85.92C68.6357 86.0092 68.722 86.0514 68.8127 86.0801C68.8223 86.0831 68.832 86.086 68.8418 86.0888L68.8552 86.0925L68.8665 86.0954L68.8818 86.0992C68.9402 86.1204 69.0182 86.138 69.1419 86.1659L69.142 86.166L69.1423 86.166C69.2881 86.1615 69.3899 86.1583 69.4861 86.1332C69.6634 86.087 69.8214 85.9663 70.1996 85.6254L70.2579 85.5761L70.5127 85.3497L71.0601 84.8814C71.3901 84.5937 71.723 84.3094 72.0589 84.0287C72.9207 83.3139 73.7757 82.5878 74.6291 81.862C75.4572 81.1575 76.2907 80.4591 77.1293 79.767C77.7578 79.2563 78.3698 78.7255 78.9641 78.1753C79.1326 78.0178 79.3023 77.8617 79.4734 77.707C79.7753 77.5348 79.7753 77.5348 80.158 77.7166C80.3919 77.8398 80.6452 77.922 80.9069 77.9597C81.0664 77.9426 81.1435 77.9344 81.2127 77.9065C81.2772 77.8804 81.3349 77.8372 81.4463 77.7537L81.4464 77.7537L81.4464 77.7537L81.7024 77.5358C82.8282 76.615 83.9429 75.6809 85.0464 74.7336C85.5439 74.3055 86.0427 73.8789 86.5428 73.4539L86.8532 73.1906C87.3771 72.7433 87.9042 72.2996 88.4343 71.8597L88.7581 71.5928L89.3841 71.0794C90.0032 70.5789 90.6048 70.0895 91.0972 69.4574C91.7537 68.4779 91.8189 67.3465 91.6732 66.2038L91.6276 65.8917C91.5821 65.5369 91.5347 65.1818 91.4855 64.8263C91.4503 64.574 91.4156 64.3209 91.3813 64.0672L91.1652 62.4791C91.0691 61.7933 90.9753 61.1072 90.8838 60.4207L90.6659 58.8069L90.5605 58.0393C90.5121 57.6722 90.4619 57.3048 90.4099 56.937L90.3628 56.6009L90.3214 56.2813L90.2788 55.9913C90.2431 55.7401 90.2431 55.7401 90.1866 55.5264L90.1866 55.5263L90.1866 55.5263L90.1865 55.5263L90.1865 55.5262C90.0454 55.3657 89.9823 55.2938 89.9042 55.2468C89.8409 55.2087 89.7678 55.187 89.6356 55.1475L89.3724 55.0949L89.3713 55.0889L89.3812 55.0955C89.347 54.9372 89.3286 54.8519 89.3056 54.768C89.2787 54.6702 89.2455 54.574 89.1737 54.3659L89.1737 54.3658C89.0707 54.2602 89.0005 54.1882 88.9216 54.1275C88.8403 54.0648 88.7496 54.0143 88.6043 53.9512C88.3888 53.8216 88.1619 53.7127 87.9157 53.6068C87.7421 53.5334 87.5684 53.4594 87.3945 53.3848L87.1082 53.2626C86.5712 53.0309 86.0364 52.7941 85.504 52.5521L85.1578 52.3965L83.7336 51.7516L81.6608 50.812L80.972 50.502C80.6122 50.3395 80.2526 50.1782 79.8931 50.018L79.5471 49.8641C79.2406 49.7246 78.9323 49.5892 78.6222 49.458C78.2868 49.3302 77.9713 49.2116 77.6571 49.1506L77.6518 49.1115C77.3059 49.0862 77.0261 49.0834 76.7614 49.1706C76.669 49.1958 76.5753 49.229 76.4799 49.2716C76.464 49.2926 76.4479 49.3132 76.4317 49.3333C76.37 49.3746 76.3079 49.4225 76.2448 49.4779L76.0229 49.7172C75.9707 49.7726 75.9187 49.8281 75.8668 49.8837C75.449 50.2347 75.0315 50.5875 74.624 50.9509C73.8216 51.6652 72.999 52.3566 72.1572 53.0241C71.9559 53.1844 71.7555 53.3457 71.5558 53.508L71.5421 53.5032L71.3513 53.6276L71.1415 53.8029L71.1274 53.8144C70.9779 53.9365 70.8871 54.0105 70.8242 54.1093C70.4475 54.4226 70.0735 54.7393 69.7025 55.0593C69.2536 55.4497 68.8028 55.8352 68.3426 56.2109C68.2948 56.2211 68.2527 56.2335 68.2128 56.251C68.0868 56.3062 67.9831 56.4122 67.7946 56.6595C67.6189 56.8103 67.4478 56.9665 67.2817 57.128C66.7371 57.6806 66.3353 57.9978 65.581 58.2017L65.5405 57.8629C65.596 57.3642 65.6988 57.2673 66.0691 56.9613L66.2837 56.7957L66.7404 56.4244C66.9049 56.2941 67.0686 56.1629 67.2317 56.0309L67.2358 56.0323L67.4269 55.8975L67.639 55.7132L67.9384 55.4515L68.4684 55.0149L68.654 54.8628C68.7241 54.8432 68.7682 54.8095 68.8884 54.7177L69.1009 54.5368L69.4728 54.2173L69.4764 54.218L69.476 54.2146L69.4728 54.2173L69.4444 54.2124C69.6843 54.0142 69.924 53.8157 70.1632 53.6167C70.3381 53.4709 70.5131 53.3252 70.6883 53.1797C70.7731 53.1548 70.8332 53.1053 71.0181 52.9531L71.3357 52.6663L71.659 52.3757C71.8045 52.2556 71.9502 52.1355 72.0959 52.0156C72.2587 51.9708 72.3783 51.8696 72.7193 51.5055C73.041 51.2453 73.3646 50.989 73.7003 50.7452C74.062 50.4906 74.3923 50.247 74.7005 49.9287C74.7262 49.8437 74.7449 49.759 74.7578 49.6745L74.8004 49.6056C74.8106 49.1683 74.7391 48.7542 74.6284 48.3315L74.6048 48.2997C74.3758 47.9655 74.3484 47.9528 73.4372 47.5289L73.0728 47.3792L72.6625 47.2097L71.5547 46.7556L71.3294 46.6632C70.7274 46.4139 70.1291 46.1557 69.5348 45.8886L69.5393 45.8827L69.3076 45.7808L69.0005 45.6458C68.9556 45.626 68.911 45.6066 68.8665 45.5878C68.0955 45.246 67.3169 44.9214 66.5313 44.6144L66.2173 44.4925C66.175 44.2682 66.175 44.2682 66.2511 44.0123L66.3407 43.6767L66.5397 42.9216C66.5617 42.8391 66.584 42.7566 66.6064 42.6741L66.6065 42.6738L66.6066 42.6733L66.6068 42.6728C66.7375 42.1908 66.8684 41.7079 66.919 41.2081ZM63.4755 42.8891L63.7495 42.7794L63.7568 42.7819C63.8038 42.763 63.8505 42.7439 63.8969 42.725C64.2456 42.5826 64.581 42.4458 64.9603 42.3946C65.0006 42.6036 65.0006 42.6036 64.9494 42.8008L64.9494 42.8008L64.8884 43.0408L64.8181 43.3149L64.7395 43.6161C64.656 43.9457 64.5714 44.2759 64.4858 44.6069L64.4825 44.6195L64.3991 44.6308L64.2358 45.177L64.1708 45.4002C64.1552 45.4514 64.1395 45.5005 64.1242 45.548C64.0339 45.8296 63.9617 46.0548 64.0421 46.3319C63.8801 46.9588 63.7171 47.5854 63.5531 48.2117C63.527 48.1814 63.497 48.1473 63.4623 48.1078L63.2098 49.4409L63.2305 49.4381L63.1758 49.645C63.1545 49.5838 63.1307 49.5205 63.1043 49.4534L62.9302 50.5597L62.9335 50.5584C62.4041 52.5495 61.8822 54.5425 61.3676 56.5375L61.0753 57.665C60.9681 58.075 60.8615 58.4855 60.7555 58.8965L60.6418 59.3356L60.6224 59.4109L60.5581 59.4196L60.4989 59.6473L60.4199 59.9468C60.3178 60.3308 60.2552 60.6869 60.2415 61.0848L60.2691 61.0738C60.2575 61.2952 60.2844 61.4968 60.4421 61.6994C60.8075 61.8438 60.8075 61.8438 61.5132 61.5998L61.8857 61.4509L62.3191 61.2782C62.7295 61.1155 63.1395 60.9535 63.549 60.7921L63.8184 60.6866C64.898 60.2614 65.9794 59.841 67.0626 59.4252L67.7614 59.1561L67.9782 59.0723L68.1573 59.0028C69.2848 58.5655 70.4095 58.1293 71.5823 57.8238C71.636 58.0553 71.636 58.0553 71.4596 58.2987C71.3179 58.5286 71.2766 58.5957 71.2028 58.7361L71.1556 58.6402L71.1562 58.639L71.1542 58.6375L71.1556 58.6402C71.0061 58.9321 70.8573 59.2246 70.7092 59.5175L70.5263 59.8795L70.3441 60.2345L70.1708 60.5779C69.974 60.9631 69.8292 61.3174 69.7378 61.7387L69.6816 61.8546C69.6679 61.8289 69.6513 61.7992 69.6301 61.7613L69.6301 61.7613L69.5029 61.9982L69.3391 62.3091C69.1332 62.6968 68.984 63.0476 68.8918 63.4777C68.7478 63.773 68.6036 64.0683 68.4593 64.3635L68.2468 64.7992C68.2313 64.7635 68.2125 64.7218 68.1845 64.66L67.7719 65.5373L67.5968 65.9052C67.243 66.6556 66.882 67.4026 66.5138 68.1461C66.3481 68.4717 66.2278 68.7727 66.1399 69.1151L65.9716 69.4596C64.9285 71.5918 63.8931 73.7277 62.8653 75.8673C62.3118 77.0221 61.7542 78.175 61.1927 79.326L60.87 79.9853L60.7468 80.2389L60.3227 81.1074L60.1668 81.426L59.9738 81.3673L59.7228 81.2888L59.7227 81.2887C59.4763 81.2183 59.4763 81.2183 59.2599 81.1143C59.0865 80.8298 59.0865 80.8298 59.1384 80.5737L59.2051 80.2862L59.2809 79.9508L59.3708 79.5789C59.4514 79.2278 59.5327 78.8778 59.6148 78.5289L59.9108 77.2625L59.937 77.1489L59.937 77.1489C60.2945 75.6006 60.6522 74.0511 61.0301 72.507L61.0312 72.545L61.1382 72.5305C61.2999 71.8315 61.4365 71.1269 61.5477 70.4181L61.6235 70.1159L61.6807 69.8867C61.7335 69.6787 61.7806 69.4693 61.822 69.2587C61.968 69.0639 61.971 69.0362 62.0134 68.6482C62.0011 68.2624 61.9726 68.2178 61.6913 67.915C61.4995 67.8162 61.3821 67.7556 61.2586 67.738C61.0636 67.7101 60.8533 67.789 60.3111 67.9924L60.3111 67.9924L60.3111 67.9924L60.3248 68.0944L60.2473 68.1222L59.6796 68.3251L59.2608 68.4768L59.2602 68.477C57.6398 69.0606 57.4084 69.1439 53.7769 70.4932C53.6409 70.5031 53.5443 70.5115 53.4495 70.5293C53.2456 70.5677 53.0499 70.6503 52.4875 70.8875L52.5785 70.9385L51.6617 71.2793L51.4592 71.3551C51.4394 70.735 51.5148 70.1402 51.5964 69.5273L51.6842 68.884L51.8409 67.7126L52.0097 66.4652L52.2124 64.9555C52.3287 64.0972 52.4434 63.2388 52.5565 62.3801C52.6216 61.8814 52.6872 61.3827 52.7534 60.884L52.757 60.9054L52.864 60.8909C52.9404 60.392 53.0025 59.891 53.0504 59.3886L53.0738 59.1398L53.157 58.2568L53.1058 58.2637C53.2877 56.9254 53.4723 55.5876 53.6574 54.2506L53.7889 53.2901L53.8403 52.9155L53.8483 52.9742L53.9553 52.9598L53.9953 52.7053L54.0439 52.3736L54.0548 52.3044C54.1024 52.0023 54.1281 51.8394 54.0258 51.5778C54.0977 51.0625 54.1702 50.5474 54.2432 50.0322L54.2804 49.7718L54.2818 49.7796L54.3888 49.7651L54.4325 49.5378L54.4855 49.2384C54.5475 48.9064 54.575 48.6857 54.4707 48.4078C54.4983 48.207 54.5263 48.0062 54.5549 47.8055L54.6033 47.4721L54.6432 47.1657L54.6843 46.8938L54.7155 46.663C55.219 46.1522 55.219 46.1522 55.953 45.913L56.2105 45.809L57.0733 45.4607L57.6903 45.2131L58.9767 44.6969L60.6502 44.0247L61.9561 43.499L62.5796 43.2487L63.4755 42.8891ZM64.2384 51.4625C64.5248 50.3127 64.8171 49.1655 65.1272 48.023C65.1481 48.0808 65.1735 48.1389 65.2041 48.1977C65.3388 47.723 65.3456 47.6989 65.4955 46.7006C65.5548 46.4932 65.6148 46.2861 65.6757 46.0791L65.6789 46.077C66.1099 46.1053 66.1099 46.1053 66.5092 46.2952L66.7644 46.4043C67.1378 46.5624 67.5099 46.7237 67.8806 46.8881L67.8501 46.9773L68.6515 47.3016L68.6631 47.2409L68.6752 47.2464L68.6753 47.2464C69.6785 47.7077 69.6785 47.7077 72.7294 48.9736L73.0042 49.087C72.8179 49.3474 72.6353 49.571 72.3961 49.7849L72.1215 50.0053L71.8112 50.2565C71.528 50.4827 71.2457 50.7105 70.9642 50.94L70.7895 51.0812C70.2704 51.5027 69.7561 51.9302 69.2468 52.3636C68.5431 52.9683 67.8255 53.5565 67.0946 54.1279C66.5486 54.5492 66.0199 54.9922 65.5095 55.4559C65.2983 55.6529 65.0805 55.8426 64.8564 56.0249C64.5537 56.1782 64.4229 56.2218 64.0941 56.1434L63.8576 56.0318L63.8575 56.0318C63.6176 55.9327 63.6176 55.9327 63.4197 55.7865C63.2851 55.5452 63.2514 55.4114 63.2868 55.135L63.3606 54.8621L63.4423 54.545L63.6328 53.8291L63.734 53.4383L63.7891 53.2293C63.8057 53.2665 63.8251 53.3075 63.8471 53.354L63.9242 53.0789L64.0237 52.7144C64.1428 52.2901 64.229 51.9031 64.2404 51.4622L64.2384 51.4625ZM46.3081 57.6731C46.9453 57.1625 47.5765 56.6442 48.2015 56.1185C48.3323 56.008 48.4818 55.8667 48.6449 55.7127C49.3301 55.0656 50.2543 54.1927 51.0281 54.4291L51.2658 54.5372C51.504 54.6364 51.5041 54.6364 51.7163 54.7738L51.7163 54.7738C51.9506 55.0224 51.9872 55.1403 51.9821 55.4869L51.9273 55.8749C51.896 56.1089 51.8636 56.3427 51.83 56.5764L51.7557 57.0898L51.5979 58.2268C51.481 59.0542 51.3668 59.8821 51.2552 60.7102L51.1953 61.1507L50.8124 63.9769L50.757 64.3736L50.5856 65.6283L50.5856 65.6283C50.2587 65.5773 50.2587 65.5773 49.999 65.4601L49.7004 65.324L49.3632 65.1706L48.6256 64.8326L48.2442 64.6592C47.6789 64.4012 47.1116 64.1456 46.5424 63.8927C46.289 63.7804 46.0352 63.6687 45.7813 63.557C45.5034 63.4347 45.2254 63.3124 44.9478 63.1891C44.9802 63.1738 45.017 63.1557 45.0598 63.1346L44.0316 62.732L44.0335 62.7335L44.0617 62.7905C43.2708 62.4287 42.4873 62.0513 41.7229 61.6368L43.2771 60.3467L43.2785 60.3448C43.2273 60.3352 43.1831 60.3269 43.1438 60.3207C43.2805 60.2073 43.4168 60.0934 43.5526 59.979L43.5538 59.9875C43.7661 59.9589 43.7661 59.9589 43.9337 59.8169L44.114 59.6403L44.4364 59.3252L44.3736 59.2773C45.01 58.7326 45.6549 58.1978 46.3081 57.6731ZM76.6554 51.2509L76.8712 51.0678L76.8673 51.0649C77.185 50.7919 77.3772 50.6777 77.7949 50.8376C77.9673 50.9186 78.1406 50.9978 78.3147 51.0753L79.0227 51.3862C79.5143 51.6033 80.0065 51.8194 80.4992 52.0344C80.9016 52.2079 81.3033 52.3832 81.7043 52.5601L81.6866 52.566L81.7013 52.6747L81.9479 52.7971L82.2641 52.936C82.5806 53.0766 82.5806 53.0766 82.8504 53.1664L82.8505 53.1664L82.9337 53.1094C83.3292 53.2882 83.724 53.4686 84.118 53.6508C84.6407 53.898 85.1672 54.1371 85.6973 54.3682L86.0293 54.5084C86.2397 54.5976 86.4505 54.6862 86.6619 54.7741L86.9601 54.8947L87.2332 55.0083L87.2584 55.0187C87.5822 55.1512 87.6411 55.1753 87.8087 55.517C86.3432 56.7685 84.8714 58.0126 83.3933 59.2492C82.9995 59.5779 82.6064 59.9078 82.214 60.2387C81.9943 60.4254 81.7746 60.612 81.5546 60.7983C81.4927 60.8071 81.452 60.8146 81.4143 60.8295C81.3546 60.8532 81.3022 60.8952 81.1843 60.9899L81.1843 60.99L80.9484 61.2034L80.5261 61.5857L80.5916 61.6083C80.3175 61.837 80.0424 62.0645 79.766 62.2903L79.6417 62.2482L79.3872 62.4383L79.0948 62.694L78.5751 63.1499L78.6687 63.1747C78.4522 63.3378 78.2451 63.4546 77.9735 63.5494C77.8244 63.3291 77.8244 63.3291 77.2678 63.1136C77.1206 63.0574 76.974 63.0005 76.8279 62.943L76.3841 62.7694L75.8804 62.5745L74.9854 62.2231C74.6033 62.0752 74.2212 61.9267 73.839 61.7777L73.452 61.6276L73.074 61.4797L72.718 61.3409C72.3585 61.2027 72.0623 61.0714 71.769 60.8204L72.0516 60.2616L72.1742 60.0167C72.3954 59.5734 72.6213 59.1323 72.8518 58.6937L72.9954 58.4252L73.2741 57.9015L73.2797 57.8913L73.3416 58.0171C73.3845 57.9349 73.4296 57.8518 73.4752 57.7679L73.4753 57.7677L73.4753 57.7676C73.7248 57.3084 73.9883 56.8235 73.9758 56.309C73.7406 55.9758 73.7406 55.9758 73.568 55.8382L73.5697 55.838C73.0232 55.5952 72.3064 55.846 71.7808 56.0657L71.7871 56.1122L71.6715 56.1391L71.6715 56.1391L71.6714 56.1391C71.5003 56.1834 71.3279 56.2228 71.1546 56.2574L71.0331 56.1648C71.1539 55.9855 71.2846 55.8295 71.4249 55.6847C71.6187 55.6584 71.6237 55.6542 71.7862 55.5165L71.9665 55.34L72.2889 55.0249L72.2067 54.9965L72.4578 54.7893L72.7147 54.5782C73.1608 54.2094 73.6048 53.8381 74.0466 53.4643L74.5822 53.0114C74.8212 52.8104 75.0598 52.6088 75.2979 52.4068L75.3978 52.4413L75.6543 52.2527L75.9467 51.997L76.4663 51.5411L76.4585 51.5396L76.4581 51.5396C76.4147 51.5312 76.3771 51.5239 76.3438 51.518L76.4214 51.452L76.6554 51.2509ZM62.6857 57.5496L62.7553 57.2842L62.7532 57.281C63.2152 57.2186 63.5137 57.4049 63.8867 57.6694C63.9965 57.9688 64.0519 58.12 64.0869 58.2758C64.1225 58.4347 64.1368 58.5984 64.1657 58.929C63.8672 59.0748 63.5624 59.2007 63.2521 59.3239L63.0224 59.4155L62.2211 59.733C62.1567 59.4095 62.1567 59.4095 62.2617 59.0857C62.3416 58.8174 62.4183 58.5482 62.4917 58.278L62.5903 57.9067L62.6857 57.5496ZM70.6386 56.4325L70.8222 56.1915L71.1703 56.3607L70.6386 56.4325ZM41.6015 67.3706C41.4173 65.9587 41.2364 64.5463 41.0588 63.1334L41.0607 63.1349C41.4478 63.1968 41.4478 63.1968 41.8119 63.395L41.8119 63.395L42.0842 63.5156C42.5468 63.7193 43.0075 63.9273 43.4663 64.1395L43.4774 64.2131C43.9069 64.4816 44.336 64.6843 44.8344 64.7817C45.2985 64.9981 45.7642 65.2111 46.2315 65.4205C46.7005 65.6316 47.1696 65.8433 47.6388 66.0556L47.9594 66.2008C48.084 66.257 48.2085 66.3136 48.3329 66.3704L48.3074 66.37L48.3216 66.4753L48.5295 66.5804C48.9516 66.7725 49.3589 66.9579 49.7295 67.2435L49.765 67.2733C50.0049 68.0385 50.1294 68.4641 50.1562 68.8958C50.1868 69.389 50.0898 69.8901 49.8914 70.9146C49.853 71.177 49.8175 71.4395 49.785 71.7022L49.7559 71.9483C49.7386 72.0554 49.7258 72.1632 49.7175 72.2713C49.6878 72.2271 49.6573 72.183 49.626 72.1389C49.5753 72.429 49.5755 72.4311 49.6051 72.7907L49.6052 72.7921C49.7345 72.9556 49.7997 73.038 49.8761 73.1083C49.9537 73.1797 50.043 73.2386 50.2229 73.3573C50.7166 73.3606 50.9202 73.2843 51.3168 73.0184C51.4028 72.9858 51.4992 72.9489 51.6082 72.9073C51.9081 72.7795 52.2158 72.671 52.5295 72.5822L52.7806 72.5206L53.2293 72.4099C53.3435 73.2051 53.4562 74.0012 53.5673 74.798C53.6233 75.2044 53.6805 75.6107 53.7387 76.0168C53.796 76.4144 53.852 76.8121 53.9068 77.2101L53.97 77.6651L54.0349 78.1078L54.0904 78.5189C54.1517 78.9619 54.1427 79.2402 53.9837 79.6057L53.8864 79.6724L53.5686 79.5735C53.3067 79.4771 53.0397 79.395 52.769 79.3275C52.5495 79.2338 52.3313 79.1374 52.1143 79.0382L51.5645 78.7838L51.2712 78.6487C50.8014 78.4319 50.3312 78.2158 49.8604 78.0003L48.1973 77.2401L48.2548 77.1896L47.3336 76.7726L47.3435 76.8487C46.9007 76.6441 46.4566 76.4413 46.0111 76.2403L45.7128 76.1058L45.1305 75.842C44.8725 75.7262 44.6156 75.6081 44.3597 75.4877L44.1138 75.3704L43.8643 75.2519L43.6211 75.129C43.3977 75.0243 43.3977 75.0243 43.1767 74.8483L43.1767 74.8483C42.6783 74.3724 42.4548 73.9598 42.3577 73.2793L42.3239 72.9777C42.2778 72.6391 42.2338 72.3003 42.1919 71.9612C42.1627 71.7195 42.1324 71.4779 42.1009 71.2366C42.0166 70.6034 41.9346 69.9704 41.8549 69.3377C41.7722 68.6823 41.6877 68.0267 41.6015 67.3706ZM87.7368 57.4952L88.0408 57.2361L88.043 57.2393C88.0839 57.2042 88.1222 57.1698 88.1591 57.1366L88.1592 57.1365C88.3399 56.9741 88.4867 56.8421 88.7491 56.8067C88.9258 58.064 89.1006 59.3204 89.2736 60.5758L89.5402 62.4996L89.8014 64.3826L89.8999 65.0993C89.9498 65.4431 89.9979 65.7866 90.0442 66.1297L90.0871 66.4474C90.1413 66.8102 90.1912 67.1667 90.1973 67.5326L90.1973 67.5328L90.1971 67.5333L90.1963 67.5356C90.1381 67.7037 90.0874 67.85 90.0409 67.9792L90.038 67.9796L90.033 68.001C89.9778 68.1535 89.9283 68.2819 89.8787 68.3943C89.8033 68.5237 89.7075 68.6403 89.5878 68.7703L89.3161 69.0509L89.3979 69.0791C89.2214 69.2469 88.9851 69.434 88.6427 69.7051L88.6424 69.7053L88.6423 69.7054L88.642 69.7056L88.642 69.7056L88.6419 69.7057L88.6417 69.7059L88.0264 70.2093L87.709 70.4718C87.2557 70.8439 86.804 71.218 86.3539 71.594L86.2173 71.709L86.2068 71.6313L85.5186 72.1584L85.6222 72.2087C85.3644 72.4263 85.1073 72.6447 84.8511 72.8642C84.5153 73.1528 84.1788 73.441 83.8417 73.7286L83.6031 73.9338C83.2982 74.1946 82.9925 74.4544 82.686 74.7132L82.3708 74.9789L82.0684 75.2377L81.781 75.4789C81.416 75.7859 81.1152 75.9666 80.6439 76.0631C80.3286 75.7009 80.3286 75.7009 80.2813 75.197L80.2436 74.9046C80.1974 74.5799 80.1525 74.2556 80.1087 73.9317L80.013 73.2354L79.8152 71.7832C79.7312 71.1523 79.6455 70.5221 79.5582 69.8928C79.4896 69.4016 79.4222 68.9108 79.356 68.4204L79.261 67.7171C79.2141 67.3787 79.168 67.0413 79.1226 66.7049L79.0826 66.3955L79.0824 66.3944C79.0327 66.0521 78.9838 65.7149 78.9835 65.3676C79.6773 64.2153 79.6773 64.2153 80.7819 63.3777L80.8528 63.3196L80.9825 63.3644L81.1599 63.2436L81.3656 63.0636L81.5885 62.8692L81.8201 62.6632C82.0906 62.4278 82.3603 62.1913 82.629 61.9538L82.5423 61.9238C82.8152 61.6961 83.0875 61.4677 83.3594 61.2386L83.4065 61.3074L84.2769 60.5412L84.2102 60.5182C84.4986 60.2728 84.7864 60.0267 85.0736 59.7799L85.6581 59.2789L86.109 58.8911C86.4315 58.6147 86.7545 58.3381 87.0781 58.0615L87.4114 57.776L87.7368 57.4952ZM70.8788 62.6892C70.9132 62.6238 70.9524 62.561 71.0248 62.4448L71.027 62.448C71.3752 62.4009 71.5577 62.4714 71.878 62.6012L72.3376 62.7899L72.5938 62.8937C72.7692 62.9653 72.8932 63.0159 73.0174 63.0661C73.317 63.187 73.6178 63.3051 74.644 63.7081L74.6445 63.7083L75.3568 63.9874L76.0279 64.2566L76.3598 64.383L76.6706 64.5071C76.9448 64.6033 76.9448 64.6033 77.1757 64.7503C77.4668 65.1382 77.522 65.5217 77.5868 65.9886L77.623 66.2829C77.6687 66.6123 77.7125 66.9414 77.7546 67.2701L77.8464 67.9756C77.9284 68.5918 78.0099 69.2081 78.0908 69.8245C78.1747 70.4624 78.2591 71.1008 78.3442 71.7397C78.5278 73.116 78.7101 74.4919 78.8912 75.8673L78.6933 76.003L78.4491 75.9115C77.6739 75.5347 76.8901 75.1757 76.0984 74.8347L75.8944 74.7463C74.9153 74.3181 73.9329 73.8967 72.9475 73.482C72.3194 73.2197 71.694 72.9524 71.0715 72.6802L70.8562 72.5847L69.7859 72.1134C69.5639 72.0148 69.3423 71.9179 69.12 71.8238C69.1565 71.8066 69.1992 71.7856 69.2504 71.7604L69.2504 71.7604L69.1589 71.7232C68.6688 71.5241 68.1849 71.3274 67.6636 71.217L67.6706 71.2659C67.624 71.2501 67.5774 71.2346 67.5307 71.2192L67.3372 71.1571C67.2393 70.6756 67.1922 70.4035 67.3428 69.93L67.5319 69.5499C67.6366 69.3335 67.743 69.1179 67.851 68.9031C67.9237 68.7584 67.9964 68.6131 68.0689 68.4672C68.4176 67.7503 68.7796 67.04 69.1547 66.3366C69.5962 65.5022 70.0076 64.6522 70.3881 63.7883L70.5615 63.3947L70.7309 63.0224C70.8046 62.8468 70.8383 62.7663 70.8788 62.6892ZM59.0708 70.1699L59.3545 70.0676C59.628 69.9667 59.8476 69.9024 60.1381 69.8632C60.02 70.3872 59.8968 70.9101 59.7687 71.4318C59.514 72.4689 59.2637 73.5071 59.0177 74.5463L58.9265 74.5587L58.8404 74.8436L58.7365 75.2139C58.7215 75.265 58.707 75.3124 58.6934 75.3569C58.6066 75.64 58.5555 75.8069 58.6583 76.0794C58.3733 77.3061 58.0945 78.5343 57.8217 79.7638L57.7399 80.1312C57.4174 80.2024 57.4174 80.2024 57.1202 80.0384C56.9909 79.968 56.8601 79.9003 56.7278 79.8354C56.4424 79.7581 56.1902 79.671 55.925 79.5391C55.8044 79.3505 55.7145 79.2099 55.6464 79.09L54.7017 72.0931L54.668 71.7919C54.879 71.7069 55.0916 71.6245 55.3057 71.5449L55.5547 71.4542L56.7846 71.0062L57.4538 70.7619L58.4511 70.3972L58.7659 70.282L59.0708 70.1699ZM65.8469 73.2682L65.8844 73.1954L65.9898 73.1812C66.1697 74.4969 66.3491 75.8126 66.5279 77.1284L66.8012 79.1395L67.0709 81.1113L67.1737 81.8602L67.3213 82.9404L67.3658 83.27L67.4097 83.5823L67.4465 83.8679C67.4878 84.1737 67.493 84.3529 67.4329 84.6637C67.3386 84.6332 67.2448 84.6017 67.1516 84.5683L67.1854 84.4705L66.6805 84.2411L66.4725 84.1482C66.038 83.9503 65.62 83.7752 65.1546 83.6725C64.835 83.5277 64.5145 83.3849 64.1919 83.2453L63.7785 83.0659L63.1648 82.7994L62.7627 82.6271L62.3896 82.4647C62.3486 82.4471 62.3102 82.4311 62.2741 82.416C61.9611 82.2854 61.8206 82.2268 61.6477 81.8764L61.7213 81.6658L61.8524 81.4198L61.9976 81.1373C62.103 80.9355 62.2059 80.7325 62.3063 80.5282L62.3066 80.5276C62.4558 80.2191 62.5304 80.0647 62.6055 79.9105C62.6807 79.7561 62.7563 79.6019 62.9076 79.2933C63.2612 78.5699 63.6137 77.846 63.9653 77.1216L64.5705 75.8775L64.8725 75.2573L65.3107 74.3523L65.4462 74.0745C65.4776 74.009 65.5093 73.9437 65.5412 73.8784C65.7287 73.6635 65.8142 73.5061 65.8469 73.2682ZM67.5543 73.8539C67.5153 73.5651 67.5072 73.4537 67.6578 73.1982L67.6491 73.1855L67.6492 73.1855L67.6493 73.1854C67.8512 73.0844 67.9575 73.0312 68.0646 73.0294C68.1834 73.0273 68.3033 73.0883 68.5563 73.217L68.8134 73.3275C69.1483 73.468 69.484 73.6095 69.8203 73.752L70.2094 73.9174C71.3992 74.4211 72.5857 74.9326 73.7688 75.452L73.7696 75.4523C73.9923 75.5506 74.2151 75.6489 74.4382 75.7467L74.4474 75.8153C74.8593 76.0347 75.245 76.2006 75.7022 76.2945L75.7013 76.2882L75.8315 76.3427L76.4641 76.6084L76.7551 76.7266L77.0173 76.8365L77.02 76.8376C77.3564 76.9759 77.4022 76.9948 77.571 77.3377C76.6027 78.1746 75.6305 79.0072 74.6546 79.8353L74.553 79.8002L74.297 79.9922L74.0046 80.2479L73.485 80.7038L73.5583 80.7596L73.2428 81.0244L73.1955 80.9555L73.1951 80.9521C72.9972 81.0878 72.9972 81.0878 72.8057 81.2451L72.5743 81.4406L72.3242 81.6508L72.0617 81.8714L71.1513 82.636L71.2869 82.662L71.0175 82.8876L70.702 83.1516L70.399 83.4053L70.1145 83.6426C70.0078 83.7337 69.8979 83.8206 69.7849 83.9034C69.5975 83.929 69.5878 83.9363 69.3391 84.1262L69.1122 84.3155C69.0923 84.2896 69.0753 84.2673 69.0607 84.2477L69.0089 84.172C68.9713 84.1088 68.9641 84.0615 68.9449 83.9354L68.9111 83.6978L68.8725 83.4246L68.8321 83.1256C68.7851 82.7941 68.7386 82.4625 68.6926 82.1308L68.5946 81.4176L68.391 79.935C68.304 79.2906 68.2152 78.6459 68.1246 78.0008C68.0546 77.4994 67.9852 76.998 67.9163 76.4964L67.8176 75.7781C67.7687 75.433 67.7209 75.0877 67.6743 74.7423L67.6333 74.4261L67.5895 74.1276L67.5543 73.8539ZM59.0248 82.6338C58.9419 82.6301 58.8596 82.6143 58.7118 82.586L58.7108 82.5903L58.683 82.8371L58.6414 83.1696L58.601 83.4986C58.5498 83.7978 58.5498 83.7978 58.3803 84.1441L58.3781 84.1396L58.3641 84.2034L58.2916 84.5505L58.2223 84.8695C58.1655 85.1539 58.1655 85.1539 58.3412 85.4433L58.8316 84.3219L58.9734 84.0018L59.1079 83.6913L59.2338 83.4062C59.3197 83.1824 59.369 82.9462 59.3797 82.7067C59.3245 82.6733 59.2784 82.6454 59.2385 82.6225C59.1487 82.6328 59.0866 82.6366 59.0248 82.6338ZM77.4515 77.2467L77.2247 77.1683L77.2536 77.3824L77.4515 77.2467Z"
                        fill="white"
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_b_2362_1460"
                    x="-20.9879"
                    y="-20.6967"
                    width="173.365"
                    height="173.365"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur
                        in="BackgroundImageFix"
                        stdDeviation="10.8"
                    />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_2362_1460"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_2362_1460"
                        result="shape"
                    />
                </filter>
                <filter
                    id="filter1_f_2362_1460"
                    x="10.0737"
                    y="10.444"
                    width="111.618"
                    height="111.618"
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
                        stdDeviation="9.6"
                        result="effect1_foregroundBlur_2362_1460"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_2362_1460"
                    x1="58.4729"
                    y1="16.3877"
                    x2="40.3914"
                    y2="85.8207"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
                <clipPath id="clip0_2362_1460">
                    <rect
                        width="57.8608"
                        height="57.8608"
                        fill="white"
                        transform="translate(33.1533 41.1868) rotate(-7.68963)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

export const GithubLogo = () => {
    return (
        <svg
            width="86"
            height="86"
            viewBox="0 0 86 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="md:size-[86px] size-[60px]"
        >
            <g filter="url(#filter0_b_2362_1636)">
                <rect
                    x="8.7749"
                    y="0.95874"
                    width="77.1478"
                    height="77.1478"
                    rx="16"
                    transform="rotate(6 8.7749 0.95874)"
                    fill="#18181B"
                />
                <rect
                    x="9.6649"
                    y="2.05779"
                    width="75.1478"
                    height="75.1478"
                    rx="15"
                    transform="rotate(6 9.6649 2.05779)"
                    stroke="url(#paint0_linear_2362_1636)"
                    stroke-width="2"
                />
                <g opacity="0.6" filter="url(#filter1_f_2362_1636)">
                    <path
                        d="M45.701 25.5392C35.7657 24.495 26.8727 31.6963 25.8285 41.6316C25.4297 45.4064 26.2297 49.2109 28.1149 52.5055C30.0002 55.8 32.8751 58.4172 36.3316 59.9858C37.2143 60.2367 37.6073 59.7326 37.657 59.2596C37.7018 58.8335 37.8271 57.4158 37.9855 55.9089C33.3808 56.2667 32.4151 54.2107 32.1619 53.1605C32.0131 52.6212 31.305 50.9342 30.5858 50.4258C29.9917 50.0234 29.1801 49.0963 30.6875 49.2329C32.107 49.3585 32.9781 50.7918 33.2595 51.3668C34.5921 54.2559 37.2583 53.7634 38.34 53.4008C38.6211 52.2485 39.1749 51.5122 39.74 51.1171C35.7862 50.247 31.7684 48.2557 32.4913 41.3774C32.6969 39.4209 33.5628 37.8774 34.8425 36.7374C34.71 36.269 34.2743 34.3596 35.5232 31.991C35.5232 31.991 37.0779 31.6781 40.2745 34.3558C41.7811 34.1033 43.3151 34.0578 44.834 34.2205C46.3625 34.3811 47.8698 34.7432 49.2659 35.299C52.9498 33.3226 54.4046 33.9773 54.4046 33.9773C55.1338 36.5539 54.3106 38.3309 54.0836 38.7616C55.0967 40.1407 55.6268 41.8091 55.4189 43.7872C54.6935 50.6889 50.3304 51.7757 46.282 51.8047C46.874 52.4342 47.3235 53.5723 47.1462 55.259C46.8935 57.6633 46.6669 59.5939 46.6031 60.2017C46.5535 60.6729 46.8326 61.2695 47.7507 61.1841C51.4469 60.3541 54.7898 58.3859 57.3089 55.5566C59.828 52.7272 61.3964 49.1791 61.7934 45.4117C62.8376 35.4764 55.6363 26.5834 45.701 25.5392Z"
                        fill="white"
                    />
                </g>
                <path
                    d="M44.9954 25.3707C35.0601 24.3265 26.1672 31.5279 25.1229 41.4632C24.7241 45.238 25.5241 49.0425 27.4094 52.337C29.2947 55.6315 32.1695 58.2487 35.626 59.8173C36.5087 60.0683 36.9017 59.5641 36.9514 59.0912C36.9962 58.665 37.1216 57.2473 37.28 55.7404C32.6753 56.0982 31.7096 54.0422 31.4563 52.992C31.3076 52.4528 30.5995 50.7657 29.8802 50.2574C29.2862 49.855 28.4745 48.9279 29.9819 49.0645C31.4014 49.19 32.2725 50.6234 32.5539 51.1984C33.8866 54.0874 36.5528 53.595 37.6345 53.2323C37.9156 52.0801 38.4693 51.3438 39.0344 50.9486C35.0806 50.0785 31.0628 48.0872 31.7857 41.2089C31.9914 39.2525 32.8572 37.709 34.137 36.569C34.0044 36.1005 33.5687 34.1912 34.8177 31.8225C34.8177 31.8225 36.3723 31.5096 39.5689 34.1873C41.0755 33.9349 42.6095 33.8893 44.1284 34.052C45.6569 34.2127 47.1643 34.5747 48.5603 35.1305C52.2443 33.1542 53.699 33.8089 53.699 33.8089C54.4282 36.3854 53.6051 38.1625 53.378 38.5931C54.3912 39.9723 54.9213 41.6407 54.7134 43.6187C53.988 50.5204 49.6248 51.6072 45.5765 51.6362C46.1685 52.2657 46.6179 53.4038 46.4406 55.0906C46.1879 57.4948 45.9614 59.4255 45.8975 60.0333C45.848 60.5044 46.1271 61.101 47.0451 61.0157C50.7413 60.1857 54.0842 58.2175 56.6033 55.3881C59.1224 52.5587 60.6908 49.0106 61.0878 45.2432C62.132 35.3079 54.9307 26.415 44.9954 25.3707Z"
                    fill="white"
                />
            </g>
            <defs>
                <filter
                    id="filter0_b_2362_1636"
                    x="-20.8893"
                    y="-20.6413"
                    width="127.989"
                    height="127.989"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur
                        in="BackgroundImageFix"
                        stdDeviation="10.8"
                    />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_2362_1636"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_2362_1636"
                        result="shape"
                    />
                </filter>
                <filter
                    id="filter1_f_2362_1636"
                    x="0.763866"
                    y="0.474804"
                    width="86.0941"
                    height="86.0938"
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
                        stdDeviation="9.6"
                        result="effect1_foregroundBlur_2362_1636"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_2362_1636"
                    x1="47.3488"
                    y1="0.95874"
                    x2="35.2944"
                    y2="47.2474"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const RocketLogo = () => {
    return (
        <svg
            width="86"
            height="86"
            viewBox="0 0 86 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="md:size-[86px] size-[60px]"
        >
            <g filter="url(#filter0_b_2376_2164)">
                <rect
                    x="0.5"
                    y="8.39722"
                    width="77.1478"
                    height="77.1478"
                    rx="16"
                    transform="rotate(-6 0.5 8.39722)"
                    fill="#18181B"
                />
                <rect
                    x="1.59905"
                    y="9.28721"
                    width="75.1478"
                    height="75.1478"
                    rx="15"
                    transform="rotate(-6 1.59905 9.28721)"
                    stroke="url(#paint0_linear_2376_2164)"
                    stroke-width="2"
                />
                <g opacity="0.6" filter="url(#filter1_f_2376_2164)">
                    <path
                        d="M30.1748 52.2617L41.1424 58.5939C38.6759 60.4735 35.5684 61.3062 32.4925 60.9116C30.6129 58.4451 29.7802 55.3376 30.1748 52.2617ZM49.7507 52.7174L50.8321 58.077L49.0899 61.0945L24.0355 46.6293L25.7776 43.6118L30.9599 41.8685L36.208 32.7784C39.3569 27.3244 45.9576 24.9468 52.4247 26.3881C56.9064 31.2681 58.1478 38.1733 54.9989 43.6273L49.7507 52.7174ZM43.7953 41.3347C44.6259 41.8142 45.613 41.9442 46.5394 41.6959C47.4658 41.4477 48.2557 40.8416 48.7353 40.011C49.2148 39.1804 49.3448 38.1933 49.0965 37.2669C48.8483 36.3405 48.2422 35.5506 47.4116 35.0711C46.581 34.5915 45.5939 34.4616 44.6675 34.7098C43.7411 34.958 42.9512 35.5641 42.4716 36.3947C41.9921 37.2253 41.8621 38.2124 42.1104 39.1388C42.3586 40.0653 42.9647 40.8551 43.7953 41.3347Z"
                        fill="white"
                    />
                </g>
                <path
                    d="M30.1782 52.0889L41.1458 58.421C38.6794 60.3007 35.5718 61.1333 32.496 60.7388C30.6163 58.2723 29.7836 55.1648 30.1782 52.0889ZM49.7541 52.5445L50.8355 57.9042L49.0933 60.9217L24.0389 46.4565L25.781 43.439L30.9633 41.6956L36.2114 32.6056C39.3603 27.1515 45.961 24.774 52.4281 26.2153C56.9098 31.0953 58.1512 38.0004 55.0023 43.4545L49.7541 52.5445ZM43.7987 41.1618C44.6293 41.6414 45.6164 41.7713 46.5428 41.5231C47.4693 41.2749 48.2591 40.6688 48.7387 39.8382C49.2182 39.0076 49.3482 38.0205 49.0999 37.094C48.8517 36.1676 48.2456 35.3778 47.415 34.8982C46.5844 34.4187 45.5973 34.2887 44.6709 34.5369C43.7445 34.7852 42.9546 35.3913 42.4751 36.2219C41.9955 37.0525 41.8656 38.0396 42.1138 38.966C42.362 39.8924 42.9681 40.6823 43.7987 41.1618Z"
                    fill="white"
                />
            </g>
            <defs>
                <filter
                    id="filter0_b_2376_2164"
                    x="-21.1"
                    y="-21.267"
                    width="127.989"
                    height="127.989"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feGaussianBlur
                        in="BackgroundImageFix"
                        stdDeviation="10.8"
                    />
                    <feComposite
                        in2="SourceAlpha"
                        operator="in"
                        result="effect1_backgroundBlur_2376_2164"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_backgroundBlur_2376_2164"
                        result="shape"
                    />
                </filter>
                <filter
                    id="filter1_f_2376_2164"
                    x="-10.8572"
                    y="-10.8479"
                    width="107.497"
                    height="107.497"
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
                        stdDeviation="12.0543"
                        result="effect1_foregroundBlur_2376_2164"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_2376_2164"
                    x1="39.0739"
                    y1="8.39722"
                    x2="27.0195"
                    y2="54.6859"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="white" stop-opacity="0.24" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};
