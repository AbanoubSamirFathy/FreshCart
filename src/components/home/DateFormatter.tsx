'use client';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const datePart = date.toLocaleDateString("en-US", {
    month: options.month,
    day: options.day,
    year: options.year,
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: options.hour,
    minute: options.minute,
    hour12: options.hour12,
  });

  return `${datePart} at ${timePart}`;
}

interface DateFormatterProps {
  dateString: string;
}

export default function DateFormatter({ dateString }: DateFormatterProps) {
  return <span suppressHydrationWarning>{formatDate(dateString)}</span>;
}