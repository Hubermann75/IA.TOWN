/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN CODEX COLLECTION CONNECT — Design System des 16 Robots Agents
 * Universal DNA + Building-specific Visual Specializations (Image 3)
 */

import React from 'react';

export type RobotRoleDesign =
  | 'DIRECTEUR'        // AI.GENCY (costume sombre, cravate, casque argenté)
  | 'MINEUR'           // CENTMINE (casque de chantier jaune/or avec lampe frontale)
  | 'BANQUIER'         // BANK.IA (costume bleu nuit, badge doré, monocle scanner)
  | 'DEVELOPPEUR'      // FACTORY.IA (casque cyber noir, lunettes matrix vertes)
  | 'VENDEUR'          // MARKET.IA (casque blanc et rouge, mégaphone antenne)
  | 'TECHNICIEN'       // ARE.IA.CENTER (casque bleu/or avec antennes radar et outils)
  | 'SCIENTIFIQUE'     // R&D.IA (combinaison blanche et bleue labo, atome)
  | 'COMMUNICANT'      // TRAFFIC.IA (ailes holographiques violettes, casque néon)
  | 'LIVREUR'          // MARKET.IA (casquette jaune/orange de coursier, sacoche)
  | 'DESIGNER'         // FACTORY.IA (casque rose néon, visière prismatique)
  | 'ANALYSTE'         // FINANCE (visière holographique bleue avec courbe financière)
  | 'SECURITE'         // SECURITY.CORE (armure noire/rouge renforcée, visière rouge)
  | 'EBOUER'           // DUMP & INCI. (casque vert toxique recyclage)
  | 'SUPPORT'          // SUBSCRIPTION.IA (casque audio orange, micro, sourire)
  | 'EDITEUR'          // MEDIA.IA (casque rouge vif avec lentille caméra)
  | 'EXPLORATEUR';     // OPPORTUNITY.LAB (scaphandre astronaute or avec boussole)

interface Props {
  role: RobotRoleDesign | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  glow?: boolean;
}

export const RobotAvatar: React.FC<Props> = ({
  role,
  size = 'md',
  animated = true,
  className = '',
  glow = true,
}) => {
  // Normalize role
  const normalizedRole = getNormalizedRole(role);

  const dim = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const roleConfig = ROLE_CONFIGS[normalizedRole];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl p-1 select-none ${dim} ${
        glow ? roleConfig.glowClass : ''
      } ${className}`}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${roleConfig.bgLight}, ${roleConfig.bgDark})`,
        border: `1.5px solid ${roleConfig.borderColor}`,
      }}
      title={`${roleConfig.title} — ${roleConfig.building}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full overflow-visible ${animated ? 'transition-transform duration-300 hover:scale-110' : ''}`}
      >
        <defs>
          <radialGradient id={`glow-${normalizedRole}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={roleConfig.visorColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={roleConfig.visorColor} stopOpacity="0.2" />
          </radialGradient>
          <filter id={`filter-${normalizedRole}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer accessory / Back effects */}
        {roleConfig.renderBack(roleConfig)}

        {/* Base Robot Head Chassis */}
        <rect
          x="20"
          y="24"
          width="60"
          height="52"
          rx="18"
          fill={roleConfig.headColor}
          stroke={roleConfig.headStroke}
          strokeWidth="2.5"
        />

        {/* Ear Bolts / Side modules */}
        <rect x="13" y="42" width="7" height="16" rx="3" fill={roleConfig.accentColor} />
        <rect x="80" y="42" width="7" height="16" rx="3" fill={roleConfig.accentColor} />

        {/* Visor Area */}
        <rect
          x="27"
          y="35"
          width="46"
          height="28"
          rx="10"
          fill="#060913"
          stroke={roleConfig.visorBorder}
          strokeWidth="2"
        />

        {/* Illuminated Eyes / HUD display inside Visor */}
        {roleConfig.renderVisor(roleConfig, normalizedRole)}

        {/* Forehead / Helmet Accessory (Headlamp, Camera, Hat, Horn, Wings, etc.) */}
        {roleConfig.renderForehead(roleConfig)}

        {/* Neck & Chest collar / badge */}
        <path
          d="M32 76 L68 76 L62 92 L38 92 Z"
          fill={roleConfig.chestColor}
          stroke={roleConfig.headStroke}
          strokeWidth="1.5"
        />
        {roleConfig.renderChestBadge(roleConfig)}

        {/* Dynamic animated scanline beam across visor */}
        {animated && (
          <line
            x1="30"
            y1="49"
            x2="70"
            y2="49"
            stroke={roleConfig.visorColor}
            strokeWidth="1.5"
            strokeDasharray="8 12"
            strokeOpacity="0.85"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Tiny lively animated status dot on bottom right */}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: roleConfig.statusColor }}
        />
        <span 
          className="relative inline-flex rounded-full h-2.5 w-2.5 border border-[#0A0F1E]"
          style={{ backgroundColor: roleConfig.statusColor }}
        />
      </span>
    </div>
  );
};

function getNormalizedRole(input: string): RobotRoleDesign {
  const s = (input || '').toUpperCase();
  if (s.includes('DIR') || s.includes('GENCY') || s.includes('DIRECTEUR')) return 'DIRECTEUR';
  if (s.includes('MINE') || s.includes('CENTMINE') || s.includes('PROSPECT')) return 'MINEUR';
  if (s.includes('BANK') || s.includes('BANQUIER') || s.includes('VAULT')) return 'BANQUIER';
  if (s.includes('DEV') || s.includes('FACTORY') || s.includes('CODE') || s.includes('INGENIEUR')) return 'DEVELOPPEUR';
  if (s.includes('VEND') || s.includes('MARKET') || s.includes('COMMERCE')) return 'VENDEUR';
  if (s.includes('TECH') || s.includes('ARE_IA') || s.includes('SUPERVIS')) return 'TECHNICIEN';
  if (s.includes('SCI') || s.includes('RD_IA') || s.includes('R&D') || s.includes('LAB')) return 'SCIENTIFIQUE';
  if (s.includes('COMMUNIC') || s.includes('TRAFFIC') || s.includes('SEO')) return 'COMMUNICANT';
  if (s.includes('LIVR') || s.includes('ORDER') || s.includes('DISPATCH')) return 'LIVREUR';
  if (s.includes('DESIGN') || s.includes('UI') || s.includes('UX')) return 'DESIGNER';
  if (s.includes('ANALYS') || s.includes('FINANCE') || s.includes('COMPTA')) return 'ANALYSTE';
  if (s.includes('SEC') || s.includes('GUARD') || s.includes('PROTECT')) return 'SECURITE';
  if (s.includes('EBOU') || s.includes('DUMP') || s.includes('INCIN') || s.includes('WASTE')) return 'EBOUER';
  if (s.includes('SUPP') || s.includes('SUBSCRIPT') || s.includes('CLIENT')) return 'SUPPORT';
  if (s.includes('EDIT') || s.includes('MEDIA') || s.includes('VIDEO') || s.includes('REDACT')) return 'EDITEUR';
  if (s.includes('EXPLOR') || s.includes('OPPORT') || s.includes('LAB')) return 'EXPLORATEUR';
  return 'TECHNICIEN';
}

interface RoleConfig {
  title: string;
  building: string;
  headColor: string;
  headStroke: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  accentColor: string;
  visorColor: string;
  visorBorder: string;
  chestColor: string;
  statusColor: string;
  glowClass: string;
  renderBack: (cfg: RoleConfig) => React.ReactNode;
  renderForehead: (cfg: RoleConfig) => React.ReactNode;
  renderVisor: (cfg: RoleConfig, roleId: string) => React.ReactNode;
  renderChestBadge: (cfg: RoleConfig) => React.ReactNode;
}

const ROLE_CONFIGS: Record<RobotRoleDesign, RoleConfig> = {
  DIRECTEUR: {
    title: 'Directeur AI.GENCY',
    building: 'AI.GENCY',
    headColor: '#1c2234',
    headStroke: '#d4af37',
    bgLight: '#2a324b',
    bgDark: '#0d111d',
    borderColor: '#FFB800',
    accentColor: '#FFB800',
    visorColor: '#00EDFF',
    visorBorder: '#FFB800',
    chestColor: '#101422',
    statusColor: '#21EC71',
    glowClass: 'glow-gold',
    renderBack: () => (
      <polygon points="50,6 56,18 44,18" fill="#FFB800" opacity="0.8" />
    ),
    renderForehead: () => (
      <g>
        <path d="M40 20 L50 12 L60 20 L56 24 L44 24 Z" fill="#FFB800" stroke="#FFE082" strokeWidth="1" />
        <circle cx="50" cy="18" r="2.5" fill="#FFFFFF" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <rect x="34" y="44" width="10" height="9" rx="3" fill="#00EDFF" />
        <rect x="56" y="44" width="10" height="9" rx="3" fill="#00EDFF" />
        <circle cx="37" cy="46" r="1.5" fill="#FFFFFF" />
        <circle cx="59" cy="46" r="1.5" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <g>
        <polygon points="48,78 52,78 53,88 50,91 47,88" fill="#FFB800" />
        <circle cx="50" cy="82" r="1.5" fill="#FFFFFF" />
      </g>
    ),
  },

  MINEUR: {
    title: 'Mineur CENTMINE',
    building: 'AI.DEPTH.CENTMINE',
    headColor: '#2d2417',
    headStroke: '#FF8A3D',
    bgLight: '#3a2e1d',
    bgDark: '#120d08',
    borderColor: '#FF8A3D',
    accentColor: '#FFB800',
    visorColor: '#FFB800',
    visorBorder: '#FF8A3D',
    chestColor: '#241b12',
    statusColor: '#21EC71',
    glowClass: 'glow-gold',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Yellow Miner Construction Helmet Top */}
        <path d="M22 26 Q50 12 78 26 L74 31 Q50 20 26 31 Z" fill="#FFB800" stroke="#FF8A3D" strokeWidth="1.5" />
        {/* Headlamp */}
        <circle cx="50" cy="22" r="6" fill="#00EDFF" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="50,22 30,2 70,2" fill="#00EDFF" opacity="0.15" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <ellipse cx="38" cy="49" rx="6" ry="6" fill="#FFB800" />
        <ellipse cx="62" cy="49" rx="6" ry="6" fill="#FFB800" />
        <line x1="44" y1="49" x2="56" y2="49" stroke="#FF8A3D" strokeWidth="2" />
        <circle cx="36" cy="47" r="2" fill="#FFFFFF" />
        <circle cx="60" cy="47" r="2" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <path d="M46 80 L54 88 M54 80 L46 88" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" />
    ),
  },

  BANQUIER: {
    title: 'Banquier BANK.IA',
    building: 'BANK.IA',
    headColor: '#131b2e',
    headStroke: '#21EC71',
    bgLight: '#1d2a45',
    bgDark: '#090e18',
    borderColor: '#FFB800',
    accentColor: '#21EC71',
    visorColor: '#21EC71',
    visorBorder: '#FFB800',
    chestColor: '#0d1322',
    statusColor: '#21EC71',
    glowClass: 'glow-green',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        <circle cx="50" cy="24" r="4" fill="#FFB800" />
        <text x="50" y="26.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#0A0F1E">€</text>
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Gold Monocle HUD on right eye */}
        <rect x="33" y="45" width="9" height="8" rx="2" fill="#21EC71" />
        <circle cx="61" cy="49" r="8" fill="none" stroke="#FFB800" strokeWidth="2" />
        <circle cx="61" cy="49" r="5" fill="#21EC71" opacity="0.9" />
        <circle cx="59" cy="47" r="1.5" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3.5" fill="#FFB800" stroke="#FFE082" strokeWidth="1" />
    ),
  },

  DEVELOPPEUR: {
    title: 'Développeur FACTORY.IA',
    building: 'FACTORY.IA',
    headColor: '#151c24',
    headStroke: '#00EDFF',
    bgLight: '#1f2a36',
    bgDark: '#080d14',
    borderColor: '#00EDFF',
    accentColor: '#21EC71',
    visorColor: '#21EC71',
    visorBorder: '#00EDFF',
    chestColor: '#10161f',
    statusColor: '#00EDFF',
    glowClass: 'glow-cyan',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        <rect x="42" y="19" width="16" height="5" rx="2" fill="#1B1F2A" stroke="#00EDFF" strokeWidth="1" />
        <circle cx="50" cy="21.5" r="1.5" fill="#21EC71" />
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Matrix Code Visor */}
        <text x="32" y="47" fontSize="5" fontFamily="monospace" fill="#21EC71">{`>_`}</text>
        <rect x="43" y="43" width="2" height="12" fill="#21EC71" opacity="0.6" />
        <rect x="52" y="45" width="2" height="10" fill="#21EC71" opacity="0.8" />
        <rect x="61" y="42" width="2" height="13" fill="#21EC71" />
      </g>
    ),
    renderChestBadge: () => (
      <text x="50" y="87" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle" fill="#00EDFF">{`{ }`}</text>
    ),
  },

  VENDEUR: {
    title: 'Vendeur MARKET.IA',
    building: 'MARKET.IA',
    headColor: '#2a1a1f',
    headStroke: '#E74C3C',
    bgLight: '#3a242c',
    bgDark: '#120b0e',
    borderColor: '#FF8A3D',
    accentColor: '#E74C3C',
    visorColor: '#FFB800',
    visorBorder: '#E74C3C',
    chestColor: '#201217',
    statusColor: '#21EC71',
    glowClass: 'glow-red',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Megaphone Antenna */}
        <line x1="50" y1="24" x2="50" y2="12" stroke="#E74C3C" strokeWidth="2" />
        <polygon points="46,12 54,12 58,6 42,6" fill="#FF8A3D" stroke="#E74C3C" strokeWidth="1" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <circle cx="37" cy="48" r="5" fill="#FFB800" />
        <circle cx="63" cy="48" r="5" fill="#FFB800" />
        <path d="M44 55 Q50 59 56 55" stroke="#FF8A3D" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
    renderChestBadge: () => (
      <polygon points="47,81 53,81 55,87 45,87" fill="#E74C3C" />
    ),
  },

  TECHNICIEN: {
    title: 'Technicien ARE.IA.CENTER',
    building: 'ARE.IA.CENTER',
    headColor: '#172233',
    headStroke: '#00EDFF',
    bgLight: '#23344d',
    bgDark: '#0a101a',
    borderColor: '#00EDFF',
    accentColor: '#00EDFF',
    visorColor: '#00EDFF',
    visorBorder: '#00EDFF',
    chestColor: '#101926',
    statusColor: '#00EDFF',
    glowClass: 'glow-cyan',
    renderBack: () => (
      <g>
        <line x1="30" y1="24" x2="22" y2="10" stroke="#00EDFF" strokeWidth="2" />
        <circle cx="21" cy="9" r="2.5" fill="#00EDFF" />
        <line x1="70" y1="24" x2="78" y2="10" stroke="#00EDFF" strokeWidth="2" />
        <circle cx="79" cy="9" r="2.5" fill="#00EDFF" />
      </g>
    ),
    renderForehead: () => (
      <g>
        <polygon points="46,16 54,16 57,24 43,24" fill="#00EDFF" opacity="0.8" />
        <circle cx="50" cy="20" r="2" fill="#FFFFFF" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <rect x="32" y="44" width="12" height="9" rx="3" fill="#00EDFF" />
        <rect x="56" y="44" width="12" height="9" rx="3" fill="#00EDFF" />
        <line x1="32" y1="48" x2="68" y2="48" stroke="#00EDFF" strokeWidth="0.8" strokeDasharray="2,2" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3" fill="#00EDFF" />
    ),
  },

  SCIENTIFIQUE: {
    title: 'Scientifique R&D.IA',
    building: 'R&D.IA',
    headColor: '#1c2838',
    headStroke: '#3498DB',
    bgLight: '#2b3e57',
    bgDark: '#0d1520',
    borderColor: '#3498DB',
    accentColor: '#00EDFF',
    visorColor: '#3498DB',
    visorBorder: '#00EDFF',
    chestColor: '#131e2d',
    statusColor: '#00EDFF',
    glowClass: 'glow-cyan',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        <circle cx="50" cy="20" r="5" fill="none" stroke="#00EDFF" strokeWidth="1.5" />
        <ellipse cx="50" cy="20" rx="7" ry="2.5" fill="none" stroke="#00EDFF" strokeWidth="1" transform="rotate(30 50 20)" />
        <ellipse cx="50" cy="20" rx="7" ry="2.5" fill="none" stroke="#00EDFF" strokeWidth="1" transform="rotate(-30 50 20)" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <ellipse cx="38" cy="48" rx="6" ry="6" fill="#00EDFF" />
        <ellipse cx="62" cy="48" rx="6" ry="6" fill="#00EDFF" />
        <circle cx="36" cy="46" r="2" fill="#FFFFFF" />
        <circle cx="60" cy="46" r="2" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3" fill="#3498DB" />
    ),
  },

  COMMUNICANT: {
    title: 'Communicant TRAFFIC.IA',
    building: 'TRAFFIC.IA',
    headColor: '#241738',
    headStroke: '#8A2BFF',
    bgLight: '#372355',
    bgDark: '#10091c',
    borderColor: '#8A2BFF',
    accentColor: '#8A2BFF',
    visorColor: '#8A2BFF',
    visorBorder: '#8A2BFF',
    chestColor: '#180e28',
    statusColor: '#8A2BFF',
    glowClass: 'glow-purple',
    renderBack: () => (
      <g>
        {/* Holographic Fairy Wings / Antennas */}
        <path d="M18 40 Q4 25 10 12 Q22 25 22 36 Z" fill="#8A2BFF" opacity="0.6" />
        <path d="M82 40 Q96 25 90 12 Q78 25 78 36 Z" fill="#8A2BFF" opacity="0.6" />
      </g>
    ),
    renderForehead: () => (
      <g>
        <circle cx="50" cy="18" r="3" fill="#8A2BFF" />
        <path d="M43 14 Q50 8 57 14" stroke="#8A2BFF" strokeWidth="1.5" fill="none" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <polygon points="34,44 42,40 42,52 34,48" fill="#8A2BFF" />
        <polygon points="66,44 58,40 58,52 66,48" fill="#8A2BFF" />
        <circle cx="50" cy="46" r="2.5" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3" fill="#8A2BFF" />
    ),
  },

  LIVREUR: {
    title: 'Livreur MARKET.IA',
    building: 'MARKET.IA',
    headColor: '#2b2114',
    headStroke: '#FF8A3D',
    bgLight: '#3f301d',
    bgDark: '#130e07',
    borderColor: '#FF8A3D',
    accentColor: '#FFB800',
    visorColor: '#FF8A3D',
    visorBorder: '#FFB800',
    chestColor: '#1f160c',
    statusColor: '#21EC71',
    glowClass: 'glow-gold',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Courier Cap */}
        <path d="M25 28 Q50 14 75 28 L82 32 L18 32 Z" fill="#FF8A3D" />
        <rect x="35" y="22" width="30" height="4" rx="1" fill="#FFB800" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <circle cx="38" cy="48" r="5" fill="#FFB800" />
        <circle cx="62" cy="48" r="5" fill="#FFB800" />
        <circle cx="36" cy="46" r="1.5" fill="#FFFFFF" />
        <circle cx="60" cy="46" r="1.5" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <rect x="46" y="80" width="8" height="7" rx="1" fill="#FF8A3D" stroke="#FFB800" strokeWidth="1" />
    ),
  },

  DESIGNER: {
    title: 'Designer FACTORY.IA',
    building: 'FACTORY.IA',
    headColor: '#30162a',
    headStroke: '#FF007F',
    bgLight: '#47213e',
    bgDark: '#170914',
    borderColor: '#FF007F',
    accentColor: '#FF007F',
    visorColor: '#FF007F',
    visorBorder: '#00EDFF',
    chestColor: '#220d1c',
    statusColor: '#FF007F',
    glowClass: 'glow-purple',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        <circle cx="44" cy="20" r="2.5" fill="#00EDFF" />
        <circle cx="50" cy="18" r="2.5" fill="#FF007F" />
        <circle cx="56" cy="20" r="2.5" fill="#FFB800" />
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Chromatic Iridescent Visor */}
        <rect x="29" y="42" width="42" height="14" rx="4" fill="url(#prismGrad)" />
        <circle cx="37" cy="48" r="3.5" fill="#FFFFFF" />
        <circle cx="63" cy="48" r="3.5" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <polygon points="50,79 55,87 45,87" fill="#FF007F" />
    ),
  },

  ANALYSTE: {
    title: 'Analyste FINANCE',
    building: 'BANK.IA',
    headColor: '#121f2d',
    headStroke: '#00EDFF',
    bgLight: '#1d3248',
    bgDark: '#08101a',
    borderColor: '#00EDFF',
    accentColor: '#21EC71',
    visorColor: '#00EDFF',
    visorBorder: '#00EDFF',
    chestColor: '#0c1622',
    statusColor: '#21EC71',
    glowClass: 'glow-cyan',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        <line x1="42" y1="20" x2="58" y2="20" stroke="#00EDFF" strokeWidth="2" />
        <polygon points="58,18 63,20 58,22" fill="#00EDFF" />
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Stock Chart Waveform Visor */}
        <path d="M30 52 L38 46 L45 50 L53 42 L61 47 L69 38" stroke="#21EC71" strokeWidth="2" fill="none" />
        <circle cx="69" cy="38" r="2" fill="#00EDFF" />
      </g>
    ),
    renderChestBadge: () => (
      <text x="50" y="87" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#21EC71">%</text>
    ),
  },

  SECURITE: {
    title: 'Sécurité SECURITY.CORE',
    building: 'SECURITY.CORE',
    headColor: '#261313',
    headStroke: '#E74C3C',
    bgLight: '#391a1a',
    bgDark: '#120707',
    borderColor: '#E74C3C',
    accentColor: '#E74C3C',
    visorColor: '#E74C3C',
    visorBorder: '#E74C3C',
    chestColor: '#1b0b0b',
    statusColor: '#E74C3C',
    glowClass: 'glow-red',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Tactical Crest */}
        <polygon points="44,14 56,14 53,24 47,24" fill="#E74C3C" />
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Narrow Cylon Laser Visor */}
        <rect x="29" y="47" width="42" height="5" rx="2" fill="#E74C3C" />
        <circle cx="50" cy="49.5" r="3" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <polygon points="50,79 56,82 54,88 50,91 46,88 44,82" fill="#E74C3C" stroke="#FFA39E" strokeWidth="0.8" />
    ),
  },

  EBOUER: {
    title: 'Éboueur DUMP & INCINERATOR',
    building: 'DUMP_INCINERATOR',
    headColor: '#16281a',
    headStroke: '#21EC71',
    bgLight: '#223c27',
    bgDark: '#0a160d',
    borderColor: '#21EC71',
    accentColor: '#21EC71',
    visorColor: '#21EC71',
    visorBorder: '#21EC71',
    chestColor: '#0f1d12',
    statusColor: '#21EC71',
    glowClass: 'glow-green',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Biohazard / Recycling Icon */}
        <circle cx="50" cy="20" r="4.5" fill="#21EC71" />
        <circle cx="50" cy="20" r="2" fill="#16281a" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <circle cx="38" cy="48" r="6" fill="#21EC71" />
        <circle cx="62" cy="48" r="6" fill="#21EC71" />
        <circle cx="36" cy="46" r="2" fill="#FFFFFF" />
        <circle cx="60" cy="46" r="2" fill="#FFFFFF" />
      </g>
    ),
    renderChestBadge: () => (
      <path d="M46 82 L50 78 L54 82 L52 82 L52 88 L48 88 L48 82 Z" fill="#21EC71" />
    ),
  },

  SUPPORT: {
    title: 'Support SUBSCRIPTION.IA',
    building: 'SUBSCRIPTION.IA',
    headColor: '#2d1f14',
    headStroke: '#FF8A3D',
    bgLight: '#422d1d',
    bgDark: '#140c06',
    borderColor: '#FF8A3D',
    accentColor: '#FF8A3D',
    visorColor: '#FF8A3D',
    visorBorder: '#FF8A3D',
    chestColor: '#1f140c',
    statusColor: '#21EC71',
    glowClass: 'glow-gold',
    renderBack: () => (
      <g>
        {/* Headset Arc */}
        <path d="M20 45 Q50 10 80 45" stroke="#FF8A3D" strokeWidth="3" fill="none" />
      </g>
    ),
    renderForehead: () => null,
    renderVisor: () => (
      <g>
        {/* Friendly eyes with boom mic */}
        <circle cx="37" cy="47" r="5" fill="#FFB800" />
        <circle cx="63" cy="47" r="5" fill="#FFB800" />
        <path d="M44 54 Q50 58 56 54" stroke="#FF8A3D" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Boom mic */}
        <path d="M78 52 Q68 64 56 62" stroke="#FF8A3D" strokeWidth="2" fill="none" />
        <circle cx="56" cy="62" r="2" fill="#FFB800" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3" fill="#FF8A3D" />
    ),
  },

  EDITEUR: {
    title: 'Éditeur MEDIA.IA',
    building: 'MEDIA.IA',
    headColor: '#2d141e',
    headStroke: '#E74C3C',
    bgLight: '#411c2a',
    bgDark: '#14080d',
    borderColor: '#E74C3C',
    accentColor: '#E74C3C',
    visorColor: '#E74C3C',
    visorBorder: '#00EDFF',
    chestColor: '#1f0d14',
    statusColor: '#00EDFF',
    glowClass: 'glow-red',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Camera aperture / broadcasting badge */}
        <rect x="44" y="16" width="12" height="7" rx="1.5" fill="#E74C3C" />
        <circle cx="50" cy="19.5" r="2" fill="#00EDFF" />
      </g>
    ),
    renderVisor: () => (
      <g>
        {/* Camera Lens Eye on Left, Standard Visor on Right */}
        <circle cx="38" cy="48" r="8" fill="none" stroke="#00EDFF" strokeWidth="1.5" />
        <circle cx="38" cy="48" r="5" fill="#E74C3C" />
        <circle cx="36" cy="46" r="1.5" fill="#FFFFFF" />
        <rect x="56" y="44" width="12" height="8" rx="2" fill="#00EDFF" />
      </g>
    ),
    renderChestBadge: () => (
      <polygon points="48,81 54,84 48,87" fill="#E74C3C" />
    ),
  },

  EXPLORATEUR: {
    title: 'Explorateur OPPORTUNITY.LAB',
    building: 'OPPORTUNITY.LAB',
    headColor: '#261b2b',
    headStroke: '#FFB800',
    bgLight: '#392841',
    bgDark: '#120c15',
    borderColor: '#FFB800',
    accentColor: '#FFB800',
    visorColor: '#FFB800',
    visorBorder: '#FFB800',
    chestColor: '#1b121f',
    statusColor: '#00EDFF',
    glowClass: 'glow-gold',
    renderBack: () => null,
    renderForehead: () => (
      <g>
        {/* Holographic Compass / Horizon HUD */}
        <circle cx="50" cy="20" r="5" fill="none" stroke="#FFB800" strokeWidth="1" />
        <polygon points="50,16 52,20 50,19 48,20" fill="#FFB800" />
      </g>
    ),
    renderVisor: () => (
      <g>
        <rect x="30" y="42" width="40" height="15" rx="5" fill="#FFB800" opacity="0.9" />
        <line x1="30" y1="49.5" x2="70" y2="49.5" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        <circle cx="40" cy="49.5" r="2.5" fill="#120c15" />
        <circle cx="60" cy="49.5" r="2.5" fill="#120c15" />
      </g>
    ),
    renderChestBadge: () => (
      <circle cx="50" cy="84" r="3" fill="#FFB800" />
    ),
  },
};
