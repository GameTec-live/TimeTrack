import Link from "next/link";

export default function NoProjects() {
    return (
        <div className="mt-10 flex flex-col items-center justify-center text-center mx-2">
            <Link
                href="/projects/new"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 dark:border-white/15 dark:hover:border-white/25 dark:focus:outline-blue-500 max-w-lg"
                prefetch
            >
                <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="mx-auto size-12 text-gray-400 dark:text-gray-500"
                >
                    <path
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    Create a new Project
                </span>
            </Link>
        </div>
    );
}
