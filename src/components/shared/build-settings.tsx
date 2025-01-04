"use client";

import { SettingInput } from "../setting-input";

export interface BuildSetting {
    value: string;
    enabled: boolean;
}

export interface BuildSettings {
    buildCommand: BuildSetting;
    installCommand: BuildSetting;
    outPutDir: BuildSetting;
}

interface BuildSettingsProps {
    buildSettings: BuildSettings;
    onSettingChange: (
        setting: keyof BuildSettings,
        field: keyof BuildSetting,
        value: string | boolean
    ) => void;
    type?: "protocol" | "github";
}

export function BuildDeploymentSetting({
    buildSettings,
    onSettingChange,
    type = "github",
}: BuildSettingsProps) {
    return (
        <>
            <SettingInput
                label="Build command"
                placeholder="npm run build"
                value={buildSettings.buildCommand.value}
                enabled={buildSettings.buildCommand.enabled}
                onValueChange={(value) =>
                    onSettingChange("buildCommand", "value", value)
                }
                onEnabledChange={(enabled) =>
                    onSettingChange("buildCommand", "enabled", enabled)
                }
                className={`${type === "protocol" ? "bg-[#0D0D0D] " : ""}`}
            />
            <SettingInput
                label="Install command"
                placeholder="Enter your install command"
                value={buildSettings.installCommand.value}
                enabled={buildSettings.installCommand.enabled}
                onValueChange={(value) =>
                    onSettingChange("installCommand", "value", value)
                }
                onEnabledChange={(enabled) =>
                    onSettingChange("installCommand", "enabled", enabled)
                }
            />
            <SettingInput
                label="Output dir"
                placeholder="Enter your output dir"
                value={buildSettings.outPutDir.value}
                enabled={buildSettings.outPutDir.enabled}
                onValueChange={(value) =>
                    onSettingChange("outPutDir", "value", value)
                }
                onEnabledChange={(enabled) =>
                    onSettingChange("outPutDir", "enabled", enabled)
                }
            />
        </>
    );
}
