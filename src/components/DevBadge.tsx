import React from 'react';
import { Terminal, Shield, Crown, Code2, Zap, Flame, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { DevBadgeConfig, reportStorage } from '../storage/reportStorage';

interface DevBadgeProps {
  config?: DevBadgeConfig;
  onClick?: () => void;
  size?: 'sm' | 'md';
  tooltip?: string;
}

export const renderDevSvgIcon = (preset: string, customSvg?: string, color: string = '#fbbf24', size: number = 13) => {
  if ((preset === 'custom' || customSvg) && customSvg && customSvg.trim().startsWith('<svg')) {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5"
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
  const config = propConfig || reportStorage.getDevConfig();
  if (!config.isDev) return null;

  const hexColor = config.color || '#fbbf24';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black uppercase tracking-wider transition-all select-none cursor-pointer border shadow-sm ${
        size === 'sm' ? 'text-[9px]' : 'text-[10px]'
      }`}
      style={{
        backgroundColor: `${hexColor}18`,
        borderColor: `${hexColor}60`,
        color: hexColor,
        boxShadow: `0 0 10px ${hexColor}30`,
      }}
      title={tooltip || 'DEV'}
    >
      {/* 1st Customizable Icon */}
      {renderDevSvgIcon(config.iconPreset1, config.customSvg1, hexColor, size === 'sm' ? 11 : 13)}

      {/* Title Tag */}
      <span className="font-mono font-black leading-none">{config.title || 'DEV'}</span>

      {/* 2nd Customizable Icon */}
      {renderDevSvgIcon(config.iconPreset2, config.customSvg2, hexColor, size === 'sm' ? 11 : 13)}
    </button>
  );
};
