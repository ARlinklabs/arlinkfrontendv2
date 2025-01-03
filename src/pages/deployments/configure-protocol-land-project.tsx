import { useState } from "react";

const ConfigureProtocolLandProject = () => {
    const [editedConfig, setEditedConfig] = useState({
        installCommand: "bun install",
        buildCommand: "npm run build",
        outputDir: "./dist",
    });
    return <div>ConfigureProtocolLandProject</div>;
};

export default ConfigureProtocolLandProject;
