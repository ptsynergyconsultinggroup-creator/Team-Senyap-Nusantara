import React from 'react';

interface TSNLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  logoUrl?: string;
  orgName?: string;
  subTitle?: string;
}

export const TSNLogo: React.FC<TSNLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  logoUrl,
  orgName = 'TEAM SENYAP NUSANTARA',
  subTitle = 'Solid • Integritas • Kebersamaan',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    hero: 'w-48 h-48 md:w-64 md:h-64',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={orgName}
            className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(234,179,8,0.4)]"
          />
        ) : (
          <svg
            viewBox="0 0 500 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_4px_20px_rgba(234,179,8,0.35)]"
          >
            <defs>
              {/* Gold metallic gradients */}
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEE180" />
                <stop offset="25%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#AA771C" />
                <stop offset="75%" stopColor="#FFDF73" />
                <stop offset="100%" stopColor="#8A5A00" />
              </linearGradient>
              <linearGradient id="goldLightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
              <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="goldShine" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glow background circle */}
            <circle cx="250" cy="270" r="220" fill="url(#goldGlow)" />

            {/* Outer Shield Outline */}
            <path
              d="M 250,30 L 440,80 C 440,280 380,480 250,560 C 120,480 60,280 60,80 Z"
              fill="#0C0A09"
              stroke="url(#goldGradient)"
              strokeWidth="12"
              strokeLinejoin="round"
            />
            {/* Inner Shield Accent line */}
            <path
              d="M 250,50 L 420,95 C 420,270 365,455 250,530 C 135,455 80,270 80,95 Z"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.85"
            />

            {/* Star at top of Shield */}
            <path
              d="M 250,15 L 257,32 L 275,32 L 260,43 L 266,60 L 250,49 L 234,60 L 240,43 L 225,32 L 243,32 Z"
              fill="url(#goldGradient)"
              stroke="#5C3B00"
              strokeWidth="1"
            />

            {/* Eagle Wings (Left & Right) */}
            <g fill="url(#goldGradient)">
              <path d="M 230,130 Q 110,120 90,260 Q 140,230 180,210 Q 120,290 105,330 Q 160,270 210,240 Z" />
              <path d="M 220,150 Q 130,150 110,290 Q 160,250 200,225 Z" />
              <path d="M 210,180 Q 150,180 135,310 Q 175,270 205,245 Z" />

              <path d="M 270,130 Q 390,120 410,260 Q 360,230 320,210 Q 380,290 395,330 Q 340,270 290,240 Z" />
              <path d="M 280,150 Q 370,150 390,290 Q 340,250 300,225 Z" />
              <path d="M 290,180 Q 350,180 365,310 Q 325,270 295,245 Z" />
            </g>

            {/* Eagle Head Center */}
            <path
              d="M 250,125 C 235,135 235,160 250,175 C 265,160 265,135 250,125 Z"
              fill="url(#goldGradient)"
            />
            <path
              d="M 250,135 L 244,148 L 250,152 L 256,148 Z"
              fill="#0C0A09"
            />

            {/* Indonesia Archipelago Silhouette Placeholder */}
            <g fill="url(#goldGradient)" opacity="0.6">
              <path d="M 120,105 Q 160,115 180,125 Q 150,130 120,105 Z" />
              <path d="M 180,138 Q 230,140 250,142 Q 220,145 180,138 Z" />
              <path d="M 210,102 Q 240,105 235,122 Q 210,118 210,102 Z" />
              <path d="M 260,105 Q 285,115 275,125 Q 255,118 260,105 Z" />
              <path d="M 330,110 Q 370,115 360,128 Q 320,125 330,110 Z" />
            </g>

            {/* TSN Bold Letters Center */}
            <g filter="url(#goldShine)">
              <text
                x="250"
                y="325"
                fontFamily="Cinzel, Georgia, serif"
                fontWeight="900"
                fontSize="86"
                fill="url(#goldGradient)"
                textAnchor="middle"
                letterSpacing="6"
                stroke="#000"
                strokeWidth="3"
              >
                TSN
              </text>
            </g>

            {/* Scales of Justice & Pillar */}
            <g stroke="url(#goldGradient)" strokeWidth="4" fill="none">
              <line x1="250" y1="350" x2="250" y2="440" strokeWidth="6" strokeLinecap="round" />
              <path d="M 220,440 L 280,440 L 270,455 L 230,455 Z" fill="url(#goldGradient)" />

              <path d="M 170,365 Q 250,350 330,365" strokeWidth="5" />
              <circle cx="250" cy="355" r="7" fill="url(#goldGradient)" />

              <line x1="170" y1="365" x2="140" y2="415" strokeWidth="2" />
              <line x1="170" y1="365" x2="200" y2="415" strokeWidth="2" />
              <path d="M 130,415 Q 170,435 210,415 Z" fill="url(#goldGradient)" opacity="0.9" />

              <line x1="330" y1="365" x2="300" y2="415" strokeWidth="2" />
              <line x1="330" y1="365" x2="360" y2="415" strokeWidth="2" />
              <path d="M 290,415 Q 330,435 370,415 Z" fill="url(#goldGradient)" opacity="0.9" />
            </g>

            <path
              d="M 110,480 Q 250,540 390,480"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="3"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="mt-3 text-center">
          <div className="text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif uppercase drop-shadow">
            {orgName}
          </div>
          <div className="text-xs md:text-sm font-semibold text-amber-200/90 tracking-widest uppercase mt-0.5">
            {subTitle}
          </div>
        </div>
      )}
    </div>
  );
};

