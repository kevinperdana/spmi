export default function HeadingSmall({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <header>
            <h3 className="mb-0.5 text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
        </header>
    );
}
