'use client';

interface Props {
    label: string;
    value: number;
    max: number;
    color?: string;
}

export function ScoreBar({ label, value, max, color = 'bg-blue-600' }: Props) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
                <span className="text-gray-900 dark:text-white font-bold">{value}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
