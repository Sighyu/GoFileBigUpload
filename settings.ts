/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

const UPLOAD_REGIONS = [
    { label: "Automatic (Closest Region)", value: "upload.gofile.io", default: true },
    { label: "Europe (Paris)", value: "upload-eu-par.gofile.io" },
    { label: "North America (Phoenix)", value: "upload-na-phx.gofile.io" },
    { label: "Asia Pacific (Singapore)", value: "upload-ap-sgp.gofile.io" },
    { label: "Asia Pacific (Hong Kong)", value: "upload-ap-hkg.gofile.io" },
    { label: "Asia Pacific (Tokyo)", value: "upload-ap-tyo.gofile.io" },
    { label: "South America (São Paulo)", value: "upload-sa-sao.gofile.io" },
];

export const settings = definePluginSettings({
    apiToken: {
        type: OptionType.STRING,
        description: "GoFile API token (get it from your profile page at gofile.io). Leave empty for guest uploads.",
        default: "",
    },
    uploadRegion: {
        type: OptionType.SELECT,
        description: "Upload server region for optimized performance",
        options: UPLOAD_REGIONS,
    },
    sizeThresholdMB: {
        type: OptionType.NUMBER,
        description: "Minimum file size (in MB) to trigger GoFile upload. Files below this are sent normally via Discord.",
        default: 500,
    },
});
