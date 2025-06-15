export function Skeleton({ width = "100%", height = "1.5rem" }) {
    return (
        <div
            className="animate-pulse bg-gray-200 rounded"
            style={{ width, height }}
        />
    );
}