import React from "react";

export function ProductionEditorialIllustration() {
  return (
    <svg
      viewBox="0 0 720 880"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="prod-amb1" cx="28%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prod-amb2" cx="78%" cy="72%" r="48%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <filter id="prod-blur-md" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="prod-blur-xl" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="36" />
        </filter>
      </defs>

      <rect width="720" height="880" fill="#0f172a" />
      <rect width="720" height="880" fill="url(#prod-amb1)" />
      <rect width="720" height="880" fill="url(#prod-amb2)" />

      {Array.from({ length: 19 }, (_, row) =>
        Array.from({ length: 15 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 48 + 24}
            cy={row * 48 + 24}
            r="1"
            fill="#06b6d4"
            fillOpacity="0.04"
          />
        ))
      )}

      <circle
        cx="400"
        cy="210"
        r="190"
        stroke="#1e293b"
        strokeWidth="0.6"
        strokeOpacity="0.25"
        strokeDasharray="4 12"
      />
      <circle
        cx="400"
        cy="210"
        r="125"
        stroke="#1e293b"
        strokeWidth="0.4"
        strokeOpacity="0.15"
      />

      <g transform="rotate(-9 100 155)">
        <rect
          x="68"
          y="118"
          width="72"
          height="94"
          rx="5"
          fill="#0c1827"
          stroke="#1e293b"
          strokeWidth="0.8"
        />
        <rect
          x="78"
          y="132"
          width="52"
          height="5"
          rx="2.5"
          fill="#22d3ee"
          fillOpacity="0.18"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x="78"
            y={143 + i * 11}
            width={i % 2 === 0 ? 42 : 30}
            height="3.5"
            rx="1.5"
            fill="#475569"
            fillOpacity="0.1"
          />
        ))}
      </g>

      <g transform="translate(572 108)" opacity="0.6">
        <rect
          x="12"
          y="18"
          width="40"
          height="32"
          rx="3"
          fill="#0c1827"
          stroke="#06b6d4"
          strokeWidth="0.7"
        />
        <path
          d="M12 28 L52 28"
          stroke="#06b6d4"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        <path
          d="M20 18 L16 10 L16 14 Q16 16 18 16 L22 16 L22 18 L20 18 Z"
          fill="#06b6d4"
        />
        <path
          d="M44 18 L48 10 L48 14 Q48 16 46 16 L42 16 L42 18 L44 18 Z"
          fill="#06b6d4"
        />
        <circle cx="60" cy="40" r="3" fill="#06b6d4" fillOpacity="0.5" />
      </g>

      <g transform="rotate(7 622 340)">
        <rect
          x="598"
          y="295"
          width="84"
          height="106"
          rx="5"
          fill="#0c1827"
          stroke="#1e293b"
          strokeWidth="0.8"
        />
        <rect
          x="608"
          y="312"
          width="64"
          height="5"
          rx="2.5"
          fill="#d946ef"
          fillOpacity="0.15"
        />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="608"
            y={324 + i * 13}
            width={i % 2 === 0 ? 54 : 38}
            height="3.5"
            rx="1.5"
            fill="#475569"
            fillOpacity="0.1"
          />
        ))}
        <circle
          cx="640"
          cy="382"
          r="11"
          stroke="#a21caf"
          strokeWidth="0.9"
          strokeOpacity="0.4"
        />
        <path
          d="M634 382 L638 386 L646 377"
          stroke="#a21caf"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path d="M638 376 L640 371 L642 376 Z" fill="#d946ef" />
      </g>

      {[
        [78, 75, 2.6, 0.22],
        [638, 115, 2.1, 0.18],
        [158, 248, 1.9, 0.16],
        [554, 254, 2.3, 0.2],
        [96, 375, 1.6, 0.14],
        [676, 370, 2, 0.18],
        [374, 58, 2.6, 0.25],
        [496, 162, 1.9, 0.17],
        [218, 115, 2.1, 0.19],
        [422, 288, 1.6, 0.14],
        [296, 184, 2, 0.16],
        [500, 350, 1.8, 0.15],
      ].map(([cx, cy, r, op], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="#22d3ee"
          fillOpacity={op}
          style={{
            animation: `lp-arc ${7 + i * 1.2}s ease-in-out ${i * 0.65}s infinite`,
          }}
        />
      ))}

      {[
        [78, 75, 374, 58],
        [374, 58, 496, 162],
        [638, 115, 554, 254],
        [158, 248, 96, 375],
        [422, 288, 500, 350],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#6366f1"
          strokeWidth="0.4"
          strokeOpacity="0.08"
        />
      ))}

      <rect
        x="0"
        y="500"
        width="720"
        height="380"
        fill="#0f172a"
        fillOpacity="0.8"
      />
      <line
        x1="0"
        y1="500"
        x2="720"
        y2="500"
        stroke="#1e293b"
        strokeWidth="1.2"
      />

      <rect x="30" y="548" width="660" height="26" rx="5" fill="#1f2937" />
      <rect
        x="30"
        y="548"
        width="660"
        height="26"
        rx="5"
        stroke="#334155"
        strokeWidth="0.9"
      />
      <rect
        x="30"
        y="548"
        width="660"
        height="3"
        rx="2"
        fill="#334155"
        fillOpacity="0.4"
      />
      <rect x="72" y="574" width="18" height="200" rx="4" fill="#0c1827" />
      <rect x="630" y="574" width="18" height="200" rx="4" fill="#0c1827" />

      <rect
        x="100"
        y="390"
        width="200"
        height="175"
        rx="24"
        fill="#06b6d4"
        fillOpacity="0.04"
        filter="url(#prod-blur-xl)"
      />

      <rect x="118" y="408" width="148" height="102" rx="6" fill="#0c1827" />
      <rect
        x="118"
        y="408"
        width="148"
        height="102"
        rx="6"
        stroke="#1e293b"
        strokeWidth="0.9"
      />
      <rect x="120" y="410" width="144" height="98" rx="5" fill="#0c1827" />
      <rect
        x="120"
        y="410"
        width="144"
        height="98"
        rx="5"
        fill="#06b6d4"
        fillOpacity="0.03"
      />
      <rect
        x="130"
        y="421"
        width="56"
        height="4.5"
        rx="2"
        fill="#22d3ee"
        fillOpacity="0.3"
      />
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect
          key={i}
          x="130"
          y={430 + i * 9}
          width={i % 3 === 0 ? 80 : i % 3 === 1 ? 64 : 44}
          height="4"
          rx="2"
          fill={i % 2 === 0 ? "#6366f1" : "#22d3ee"}
          fillOpacity="0.12"
        />
      ))}

      <line
        x1="118"
        y1="509"
        x2="266"
        y2="509"
        stroke="#1e293b"
        strokeWidth="1.8"
      />
      <rect
        x="110"
        y="509"
        width="164"
        height="13"
        rx="5"
        fill="#1f2937"
        stroke="#1e293b"
        strokeWidth="0.7"
      />
      <rect
        x="169"
        y="514"
        width="46"
        height="5"
        rx="2"
        fill="#1f2937"
        stroke="#1e293b"
        strokeWidth="0.5"
      />

      <rect x="162" y="458" width="62" height="102" rx="16" fill="#475569" />
      <circle cx="193" cy="434" r="29" fill="#475569" />
      <path d="M165 428 Q167 404 193 401 Q219 404 221 428" fill="#1e293b" />
      <rect x="186" y="461" width="14" height="12" fill="#475569" />
      <path
        d="M162 492 Q138 518 155 540"
        stroke="#475569"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M224 492 Q248 518 231 540"
        stroke="#475569"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      <rect
        x="430"
        y="420"
        width="220"
        height="150"
        rx="24"
        fill="#6366f1"
        fillOpacity="0.03"
        filter="url(#prod-blur-xl)"
      />

      <rect x="476" y="448" width="62" height="106" rx="16" fill="#475569" />
      <circle cx="507" cy="423" r="28" fill="#475569" />
      <path d="M480 415 Q482 393 507 391 Q532 393 534 415" fill="#1e293b" />
      <rect x="500" y="450" width="14" height="10" fill="#475569" />
      <path
        d="M476 490 Q450 526 462 550"
        stroke="#475569"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M538 490 Q564 526 552 550"
        stroke="#475569"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      <rect x="446" y="453" width="162" height="112" rx="9" fill="#0c1827" />
      <rect
        x="446"
        y="453"
        width="162"
        height="112"
        rx="9"
        stroke="#1e293b"
        strokeWidth="0.9"
      />
      <rect x="448" y="455" width="158" height="108" rx="8" fill="#0c1827" />
      <rect
        x="448"
        y="455"
        width="158"
        height="108"
        rx="8"
        fill="#6366f1"
        fillOpacity="0.03"
      />
      <rect
        x="458"
        y="467"
        width="100"
        height="5.5"
        rx="2.5"
        fill="#818cf8"
        fillOpacity="0.25"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x="458"
          y={479 + i * 13}
          width={i % 3 === 0 ? 130 : i % 3 === 1 ? 95 : 112}
          height="4"
          rx="2"
          fill="#475569"
          fillOpacity={0.08 + (i % 2) * 0.05}
        />
      ))}
      <rect
        x="508"
        y="555"
        width="38"
        height="4"
        rx="2"
        fill="#1e293b"
        fillOpacity="0.6"
      />

      {[516, 505, 494].map((y, i) => (
        <React.Fragment key={i}>
          <rect
            x={296 - i * 3}
            y={y}
            width="86"
            height="13"
            rx="3"
            fill="#1f2937"
          />
          <rect
            x={296 - i * 3}
            y={y}
            width="6"
            height="13"
            rx="2"
            fill="#6366f1"
            fillOpacity="0.5"
          />
        </React.Fragment>
      ))}

      <path
        d="M302 488 Q346 476 346 488 Q346 476 390 488"
        stroke="#334155"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M302 493 L346 482 L390 493"
        fill="#0c1827"
        stroke="#1e293b"
        strokeWidth="0.7"
      />
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <line
            x1={308}
            y1={490 - i * 2.5}
            x2={342}
            y2={486 - i * 2.5}
            stroke="#1e293b"
            strokeWidth="0.55"
            strokeOpacity="0.7"
          />
          <line
            x1={350}
            y1={486 - i * 2.5}
            x2={386}
            y2={490 - i * 2.5}
            stroke="#1e293b"
            strokeWidth="0.55"
            strokeOpacity="0.7"
          />
        </React.Fragment>
      ))}

      <rect
        x="388"
        y="530"
        width="68"
        height="6"
        rx="3"
        fill="#06b6d4"
        fillOpacity="0.6"
        transform="rotate(-15 388 530)"
      />
      <circle
        cx="390"
        cy="537"
        r="4"
        fill="#0c1827"
        transform="rotate(-15 390 537)"
      />

      <rect
        x="410"
        y="512"
        width="28"
        height="36"
        rx="5"
        fill="#1f2937"
        stroke="#1e293b"
        strokeWidth="0.7"
      />
      <path
        d="M438 521 Q450 521 450 528 Q450 535 438 535"
        stroke="#1e293b"
        strokeWidth="1.2"
        fill="none"
      />
      <rect
        x="413"
        y="512"
        width="22"
        height="5"
        rx="2"
        fill="#1e293b"
        fillOpacity="0.5"
      />
      <path
        d="M419 508 Q417 498 421 492"
        stroke="#22d3ee"
        strokeWidth="0.8"
        strokeOpacity="0.12"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M425 508 Q427 497 423 492"
        stroke="#22d3ee"
        strokeWidth="0.8"
        strokeOpacity="0.1"
        fill="none"
        strokeLinecap="round"
      />

      <rect
        x="590"
        y="508"
        width="34"
        height="42"
        rx="5"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="0.7"
      />
      {[584, 630].map((x, i) => (
        <path
          key={i}
          d={`M607 510 Q${x} 492 ${x} 472`}
          stroke="#1e293b"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {[598, 614].map((x, i) => (
        <path
          key={i}
          d={`M607 510 Q${x} 488 ${x} 468`}
          stroke="#1e293b"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <ellipse
        cx="605"
        cy="510"
        rx="22"
        ry="8"
        fill="#0f172a"
        fillOpacity="0.9"
      />

      <rect
        x="548"
        y="520"
        width="24"
        height="30"
        rx="4"
        fill="#1f2937"
        stroke="#1e293b"
        strokeWidth="0.6"
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={552 + i * 5}
          y={506}
          width="3"
          height="16"
          rx="1.5"
          fill={["#6366f1", "#06b6d4", "#475569"][i]}
          fillOpacity="0.5"
        />
      ))}

      <ellipse
        cx="360"
        cy="760"
        rx="290"
        ry="16"
        fill="#6366f1"
        fillOpacity="0.03"
        filter="url(#prod-blur-md)"
      />
    </svg>
  );
}
