interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({
  category,
  size = 24,
  className = "",
}: CategoryIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    className,
  };

  switch (category) {
    case "kolye":
      return (
        <svg {...common}>
          <path d="M12 3v3" />
          <circle cx="12" cy="12" r="7.2" />
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        </svg>
      );
    case "boncuk-kolye":
      return (
        <svg {...common}>
          <path d="M4 6c2 6 4.5 10 8 10s6-4 8-10" />
          <circle cx="4.6" cy="5.2" r="1" />
          <circle cx="7.4" cy="9.4" r="1" />
          <circle cx="10.6" cy="12.6" r="1" />
          <circle cx="13.4" cy="12.6" r="1" />
          <circle cx="16.6" cy="9.4" r="1" />
          <circle cx="19.4" cy="5.2" r="1" />
        </svg>
      );
    case "kupe":
      return (
        <svg {...common}>
          <path d="M12 4a3 3 0 0 1 3 3c0 1.6-1.2 2.4-3 4-1.8-1.6-3-2.4-3-4a3 3 0 0 1 3-3Z" />
          <path d="M12 11v6" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
      );
    case "bileklik":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="8.5" ry="6" />
          <path d="M4.2 10.5c3.5 1.6 12.1 1.6 15.6 0" />
        </svg>
      );
    case "kelepce":
      return (
        <svg {...common}>
          <path d="M4.5 9.5a8 5.6 0 0 1 15 0" />
          <path d="M4.5 14.5a8 5.6 0 0 0 15 0" />
          <circle cx="4.5" cy="12" r="1" />
          <circle cx="19.5" cy="12" r="1" />
        </svg>
      );
    case "yuzuk":
      return (
        <svg {...common}>
          <circle cx="12" cy="14.5" r="6" />
          <path d="M9 8.5 12 3l3 5.5" />
        </svg>
      );
    case "set":
      return (
        <svg {...common}>
          <circle cx="9.5" cy="9.5" r="5" />
          <circle cx="14.5" cy="14.5" r="5" />
        </svg>
      );
    case "saat":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6.5" />
          <path d="M12 8.5V12l2.8 1.6" />
          <path d="M9.5 2.5h5" />
          <path d="M9.5 21.5h5" />
        </svg>
      );
    case "sahmeran":
      return (
        <svg {...common}>
          <path d="M6 18c0-3 1-4.5 3-4.5s3 1.5 3-1 -1-2.5-3-2.5-3-1.5-3-3 1.5-3 4-3c3.2 0 6 2.5 6 6.5S13.2 18 10 18" />
          <circle cx="16.5" cy="6.2" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "halhal":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="10.5" rx="8" ry="5.5" />
          <path d="M4.2 9c3.5 1.5 12.1 1.5 15.6 0" />
          <path d="M9 15.5 8.2 18" />
          <path d="M12 16v2.6" />
          <path d="M15 15.5l0.8 2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 3 5 9.5 12 21l7-11.5L12 3Z" />
          <path d="M5 9.5h14" />
        </svg>
      );
  }
}
