/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";

for (const domain of [
    "gofile.io",
    "upload.gofile.io",
    "upload-eu-par.gofile.io",
    "upload-na-phx.gofile.io",
    "upload-ap-sgp.gofile.io",
    "upload-ap-hkg.gofile.io",
    "upload-ap-tyo.gofile.io",
    "upload-sa-sao.gofile.io",
]) {
    CspPolicies[domain] = ["connect-src"];
}
