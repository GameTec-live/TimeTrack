export function FormatTime(diffMs: number) {
    const seconds = Math.floor(diffMs / 1000);
    const ms = Math.floor(diffMs % 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const msStr = ms.toString().padStart(3, "0");

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}.${msStr}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}.${msStr}s`;
    }
    return `${seconds}.${msStr}s`;
}
