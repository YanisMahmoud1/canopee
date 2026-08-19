import type { WeatherState } from "@/types";

export function WeatherIcon({ state, size = 22 }: { state: WeatherState; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;

  if (state === "sun") {
    return (
      <svg {...common} fill="none">
        <circle cx="12" cy="12" r="5" fill="var(--weather-sun)" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 12 + Math.cos(angle) * 7.5;
          const y1 = 12 + Math.sin(angle) * 7.5;
          const x2 = 12 + Math.cos(angle) * 10.5;
          const y2 = 12 + Math.sin(angle) * 10.5;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--weather-sun)" strokeWidth="1.6" strokeLinecap="round" />
          );
        })}
      </svg>
    );
  }
  if (state === "cloud") {
    return (
      <svg {...common} fill="none">
        <path
          d="M7 16.5a4 4 0 0 1 .4-7.98A5 5 0 0 1 17 10a3.5 3.5 0 0 1-.6 6.95H7Z"
          fill="var(--weather-cloud)"
        />
      </svg>
    );
  }
  if (state === "rain") {
    return (
      <svg {...common} fill="none">
        <path
          d="M7 13.5a3.6 3.6 0 0 1 .35-7.18A4.5 4.5 0 0 1 16 7a3.1 3.1 0 0 1-.5 6.15"
          fill="var(--weather-rain)"
          opacity="0.85"
        />
        <line x1="8" y1="16" x2="7" y2="19.5" stroke="var(--weather-rain)" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12" y1="16" x2="11" y2="19.5" stroke="var(--weather-rain)" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="16" y1="16" x2="15" y2="19.5" stroke="var(--weather-rain)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="none">
      <circle cx="12" cy="12" r="8" stroke="var(--weather-empty)" strokeWidth="1.6" strokeDasharray="3 3" />
    </svg>
  );
}

export const WEATHER_LABELS: Record<WeatherState, string> = {
  sun: "Ensoleillé",
  cloud: "Nuageux",
  rain: "Pluvieux",
  empty: "Pas encore renseigné",
};
