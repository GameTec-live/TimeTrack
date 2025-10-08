export function FormatTime(diffMs: number) {
    const seconds = Math.floor(diffMs / 1000);
    const ms = diffMs % 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}.${ms.toString().padStart(3, "0")}s`;
    }
    return `${seconds}.${ms.toString().padStart(3, "0")}s`;
}
