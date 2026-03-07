interface IconProps {
  size?: number;
}

export function TrainIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="14" rx="2" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M4 8h16" />
      <path d="M9 21l-2-4" />
      <path d="M15 21l2-4" />
    </svg>
  );
}

export function STrainIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="14" rx="2" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M4 8h16" />
      <path d="M9 21l-2-4" />
      <path d="M15 21l2-4" />
      <line x1="10" y1="5" x2="14" y2="5" />
    </svg>
  );
}

export function TramIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M5 10h14" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <path d="M9 1v4" />
      <path d="M15 1v4" />
      <path d="M8 23l-1-4" />
      <path d="M16 23l1-4" />
    </svg>
  );
}

export function BusIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="15" rx="2" />
      <path d="M3 9h18" />
      <circle cx="7.5" cy="15" r="1" fill="currentColor" />
      <circle cx="16.5" cy="15" r="1" fill="currentColor" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
    </svg>
  );
}

export function ShipIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v8" />
      <path d="M4 14l8-4 8 4" />
      <path d="M2 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
      <path d="M2 22c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
    </svg>
  );
}

export function FunicularIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4l20-1" />
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M12 3v4" />
      <path d="M10 21l-1-4" />
      <path d="M14 21l1-4" />
    </svg>
  );
}

export function StationIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
