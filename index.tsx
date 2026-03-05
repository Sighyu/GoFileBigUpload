/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { HeaderBarButton } from "@api/HeaderBar";
import { copyWithToast, insertTextIntoChatInputBox } from "@utils/discord";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { Popout, showToast, Toasts, useEffect, useRef, useState } from "@webpack/common";

import { settings } from "./settings";

const logger = new Logger("GoFileBigUpload");

// ---- Reactive upload state ----

interface HistoryEntry {
    fileName: string;
    url: string;
    timestamp: number;
}

let uploadProgress = 0;
let isUploading = false;
let uploadHistory: HistoryEntry[] = [];
const stateListeners = new Set<() => void>();

function notify() {
    for (const fn of stateListeners) fn();
}

function setProgress(pct: number) {
    uploadProgress = Math.round(pct);
    notify();
}

function setUploading(v: boolean) {
    isUploading = v;
    notify();
}

function addHistoryEntry(entry: HistoryEntry) {
    uploadHistory = [entry, ...uploadHistory].slice(0, 50);
    notify();
}

function clearHistory() {
    uploadHistory = [];
    notify();
}

function useUploadState() {
    const [, rerender] = useState(0);
    useEffect(() => {
        const cb = () => rerender(n => n + 1);
        stateListeners.add(cb);
        return () => { stateListeners.delete(cb); };
    }, []);
    return { uploadProgress, isUploading, uploadHistory };
}

// ---- GoFile upload via XHR (supports progress) ----

function uploadFile(file: File, onProgress: (pct: number) => void): Promise<string> {
    const { apiToken, uploadRegion } = settings.store;
    const endpoint = uploadRegion || "upload.gofile.io";

    const body = new FormData();
    body.append("file", file, file.name);

    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://${endpoint}/uploadfile`);

        if (apiToken) xhr.setRequestHeader("Authorization", `Bearer ${apiToken}`);

        xhr.upload.onprogress = e => {
            if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
        };

        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && data.status === "ok" && data.data?.downloadPage) {
                    resolve(data.data.downloadPage);
                } else {
                    reject(new Error(data.status || `HTTP ${xhr.status}`));
                }
            } catch {
                reject(new Error(`GoFile returned non-JSON (HTTP ${xhr.status})`));
            }
        };

        xhr.onerror = () => reject(new Error("Network error during GoFile upload"));
        xhr.send(body);
    });
}

async function handleBigFiles(bigFiles: File[]) {
    setUploading(true);
    setProgress(0);

    showToast(
        `Uploading ${bigFiles.length} large file${bigFiles.length > 1 ? "s" : ""} to GoFile...`,
        Toasts.Type.MESSAGE,
    );

    const urls: string[] = [];
    const total = bigFiles.length;

    for (let i = 0; i < total; i++) {
        const file = bigFiles[i];
        try {
            const url = await uploadFile(file, pct => {
                setProgress((i / total) * 100 + (pct / total));
            });
            urls.push(`${file.name}: ${url}`);
            addHistoryEntry({ fileName: file.name, url, timestamp: Date.now() });
        } catch (e) {
            showToast(`Failed to upload ${file.name}: ${e instanceof Error ? e.message : e}`, Toasts.Type.FAILURE);
            logger.error("Upload error:", e);
        }
    }

    setUploading(false);
    setProgress(0);

    if (urls.length > 0) {
        insertTextIntoChatInputBox(urls.join("\n"));
        showToast(`${urls.length} file${urls.length > 1 ? "s" : ""} uploaded to GoFile!`, Toasts.Type.SUCCESS);
    }
}

// ---- UI Components ----

function GoFileIcon({ size = 20 }: { size?: number; }) {
    return (
        <img
            src="https://cdn.discordapp.com/emojis/1478859753877671946.png"
            alt="GoFile"
            width={size}
            height={size}
            style={{ borderRadius: 2 }}
        />
    );
}

function GoFilePopoutContent() {
    const { isUploading: uploading, uploadProgress: progress, uploadHistory: history } = useUploadState();

    return (
        <div className="vc-gofile-popout">
            <div className="vc-gofile-popout-header">
                <span className="vc-gofile-popout-title">GoFile Uploads</span>
                {history.length > 0 && (
                    <button className="vc-gofile-popout-clear" onClick={clearHistory}>Clear</button>
                )}
            </div>

            {uploading && (
                <div className="vc-gofile-uploading-status">
                    <div className="vc-gofile-uploading-bar">
                        <div className="vc-gofile-uploading-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="vc-gofile-uploading-text">{progress}%</span>
                </div>
            )}

            <div className="vc-gofile-history-list">
                {history.length === 0 ? (
                    <div className="vc-gofile-history-empty">
                        No uploads yet. Files over {settings.store.sizeThresholdMB || 500} MB will appear here.
                    </div>
                ) : (
                    history.map((entry, i) => (
                        <div className="vc-gofile-history-item" key={`${entry.timestamp}-${i}`}>
                            <span className="vc-gofile-history-name" title={entry.fileName}>
                                {entry.fileName}
                            </span>
                            <button className="vc-gofile-history-copy" onClick={() => copyWithToast(entry.url)}>
                                Copy
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function GoFilePopoutButton() {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    const { isUploading: uploading, uploadProgress: progress } = useUploadState();

    return (
        <Popout
            position="bottom"
            align="center"
            spacing={0}
            animation={Popout.Animation.NONE}
            shouldShow={show}
            onRequestClose={() => setShow(false)}
            targetElementRef={buttonRef}
            renderPopout={() => <GoFilePopoutContent />}
        >
            {(_, { isShown }) => (
                <div className="vc-gofile-btn-wrapper">
                    <HeaderBarButton
                        ref={buttonRef}
                        className="vc-gofile-btn"
                        onClick={() => setShow(v => !v)}
                        tooltip={isShown ? null : uploading ? `Uploading... ${progress}%` : "GoFile Uploads"}
                        icon={() => <GoFileIcon />}
                        selected={isShown}
                    />
                    {uploading && (
                        <span className="vc-gofile-progress-badge">{progress}%</span>
                    )}
                </div>
            )}
        </Popout>
    );
}

// ---- Plugin Definition ----

export default definePlugin({
    name: "GoFileBigUpload",
    description: "Automatically uploads large files (over a configurable size threshold) to GoFile and sends the download link instead",
    authors: [{ name: "Ryu", id: 1020416187219316766n }],
    dependencies: ["HeaderBarAPI"],
    settings,

    headerBarButton: {
        icon: GoFileIcon,
        render: GoFilePopoutButton,
        priority: 100,
    },

    patches: [
        {
            find: "Unexpected mismatch between files and file metadata",
            replacement: {
                match: /(async function \i\()(\i)(,\i,\i\){)(let\{filesMetadata:)/,
                replace: "$1$2$3$2=$self.filterBigFiles($2);$4",
            },
        },
    ],

    filterBigFiles(files: File[]) {
        const thresholdBytes = (settings.store.sizeThresholdMB || 500) * 1024 * 1024;
        const smallFiles: File[] = [];
        const bigFiles: File[] = [];

        for (const file of files) {
            (file.size >= thresholdBytes ? bigFiles : smallFiles).push(file);
        }

        if (bigFiles.length > 0) handleBigFiles(bigFiles);

        return smallFiles;
    },
});
