// Icons from the UX portfolio (lucide geometry, round caps).
import { cx } from "./cx";

type P = { className?: string; strokeWidth?: number };
const svg = (strokeWidth: number) =>
  ({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }) as const;

export const SunIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={cx("icon sun", className)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const MoonIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={cx("icon moon", className)}>
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
);

const speaker =
  "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z";

export const SoundOffIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={cx("icon off", className)}>
    <path d={speaker} />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
);

export const SoundOnIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={cx("icon on", className)}>
    <path d={speaker} />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </svg>
);

export const ArrowRight = ({ className, strokeWidth = 2.5 }: P) => (
  <svg aria-hidden="true" {...svg(strokeWidth)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = ({ className, strokeWidth = 2.5 }: P) => (
  <svg aria-hidden="true" {...svg(strokeWidth)} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const ArrowUp = ({ className, strokeWidth = 2.5 }: P) => (
  <svg aria-hidden="true" {...svg(strokeWidth)} className={className}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const ChevronUp = ({ className, strokeWidth = 2.5 }: P) => (
  <svg aria-hidden="true" {...svg(strokeWidth)} className={className}>
    <path d="M6 15l6-6 6 6" />
  </svg>
);

export const ArrowUpRight = ({ className, strokeWidth = 2.25 }: P) => (
  <svg aria-hidden="true" {...svg(strokeWidth)} className={className}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export const Check = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(3)} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const InfoIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const GaugeIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={className}>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

export const ExpandIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={className}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const HomeIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(1.75)} className={className}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const UserIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(1.75)} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg aria-hidden="true" {...svg(2)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
