import React from 'react';
import { Terminal, Shield, Crown, Code2, Zap, Flame, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { DevBadgeConfig, reportStorage } from '../storage/reportStorage';

interface DevBadgeProps {
  config?: Partial<DevBadgeConfig> & {
    enabled?: boolean;
    label?: string;
    svgPreset?: string;
  };
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md';
  tooltip?: string;
}

export const renderDevSvgIcon = (preset: string = 'code', customSvg?: string, color: string = '#fbbf24', size: number = 13) => {
  if ((preset === 'custom' || customSvg) && customSvg && customSvg.trim().startsWith('<svg')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 [&>svg]:w-3 [&>svg]:h-3"
        style={{ color }}
        dangerouslySetInnerHTML={{ __html: customSvg }}
      />
    );
  }

  switch (preset) {
    case 'terminal':
      return <Terminal style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'shield':
      return <Shield style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'crown':
      return <Crown style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'code':
      return <Code2 style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'zap':
      return <Zap style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'flame':
      return <Flame style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'star':
      return <Star style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'sparkles':
      return <Sparkles style={{ width: size, height: size, color }} className="shrink-0" />;
    case 'check':
      return <CheckCircle2 style={{ width: size, height: size, color }} className="shrink-0" />;
    default:
      return <Code2 style={{ width: size, height: size, color }} className="shrink-0" />;
  }
};

export const DevBadge: React.FC<DevBadgeProps> = ({ config: propConfig, onClick, size = 'sm', tooltip }) => {
  const localConfig = reportStorage.getDevConfig();
  const config = propConfig
    ? {
        ...localConfig,
        ...propConfig,
        isDev: propConfig.isDev ?? propConfig.enabled ?? true,
        title: propConfig.title || propConfig.label || localConfig.title || 'DEV',
        color: propConfig.color || localConfig.color || '#fbbf24',
        iconPreset1: propConfig.iconPreset1 || propConfig.svgPreset || localConfig.iconPreset1 || 'code',
        iconPreset2: propConfig.iconPreset2 || localConfig.iconPreset2 || 'shield',
        customSvg1: propConfig.customSvg1 ?? localConfig.customSvg1,
        customSvg2: propConfig.customSvg2 ?? localConfig.customSvg2,
      }
    : localConfig;

  if (!config.isDev) return null;

  const hexColor = config.color || '#fbbf24';
  const iconSize = size === 'xs' ? 8 : size === 'sm' ? 9.5 : 11;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-black uppercase tracking-wider transition-all select-none cursor-pointer border shadow-sm shrink-0 ${
        size === 'xs'
          ? 'gap-0.5 px-1.5 py-0.5 text-[7px]'
          : size === 'sm'
          ? 'gap-1 px-1.5 py-0.5 text-[8px]'
          : 'gap-1 px-2 py-0.5 text-[9px]'
      }`}
      style={{
        backgroundColor: `${hexColor}22`,
        borderColor: `${hexColor}75`,
        color: hexColor,
        boxShadow: `0 0 8px ${hexColor}30`,
      }}
      title={tooltip || config.title || 'DEV'}
    >
      {/* 1st Customizable Icon */}
      {renderDevSvgIcon(config.iconPreset1, config.customSvg1, hexColor, iconSize)}

      {/* Title Tag */}
      <span className="font-mono font-black leading-none whitespace-nowrap">
        {config.title || 'DEV'}
      </span>

      {/* 2nd Customizable Icon */}
      {renderDevSvgIcon(config.iconPreset2, config.customSvg2, hexColor, iconSize)}
    </button>
  );
};
