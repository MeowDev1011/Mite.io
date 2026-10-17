import React, { useState } from 'react';
import { Palette, Sparkles, Check, Lock, X } from 'lucide-react';
import { profileStorage, PlayerProfile } from '../storage/profileStorage';
import { MICROBE_SKINS, SPORE_STYLES, MicrobeSkin, SporeStyle } from '../game/skins';

interface SkinsModalProps {
  onClose: () => void;
  onSkinChanged: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({ onClose, onSkinChanged }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => profileStorage.getProfile());
  const [activeTab, setActiveTab] = useState<'microbes' | 'spores'>('microbes');

  const handleSelectSkin = (skin: MicrobeSkin) => {
    const isUnlocked = profile.unlockedSkinIds.includes(skin.id);
    if (!isUnlocked) return;
    profileStorage.selectSkin(skin.id);
    setProfile(profileStorage.getProfile());
    onSkinChanged();
  };

  const handleSelectSpore = (spore: SporeStyle) => {
    profileStorage.selectSpore(spore.id);
    setProfile(profileStorage.getProfile());
    onSkinChanged();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-2xl max-h-[85vh] p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Casillero de Mutación</h2>
              <p className="text-xs text-neutral-400">Personalizá la membrana de tu microbio y el estilo de tus esporas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-4 pb-3">
          <button
            onClick={() => setActiveTab('microbes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'microbes'
                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Membrana del Microbio
          </button>
          <button
            onClick={() => setActiveTab('spores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'spores'
                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Estilos de Espora [W]
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-2 flex-1 pr-1">
          {activeTab === 'microbes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MICROBE_SKINS.map((skin) => {
                const isUnlocked = profile.unlockedSkinIds.includes(skin.id);
                const isEquipped = profile.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : isUnlocked
                        ? 'bg-white/[0.06] border-white/10 hover:border-white/30'
                        : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Live preview icon with skin colors */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md border-2 relative"
                      style={{
                        backgroundColor: skin.secondaryColor,
                        borderColor: skin.ciliaColor,
                        boxShadow: `0 0 12px ${skin.color}`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: skin.color }}
                      />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {skin.name}
                        </span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {skin.description}
                      </p>
                      {!isUnlocked && (
                        <span className="text-[9px] text-amber-400 font-medium mt-1">
                          Bloqueado · {skin.unlockRequirement}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPORE_STYLES.map((spore) => {
                const isEquipped = profile.selectedSporeId === spore.id;

                return (
                  <div
                    key={spore.id}
                    onClick={() => handleSelectSpore(spore)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-white/[0.06] border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Spore Preview Orb */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2"
                      style={{
                        backgroundColor: spore.color,
                        borderColor: spore.glowColor,
                        boxShadow: `0 0 15px ${spore.glowColor}`,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-neutral-950" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {spore.name}
                        </span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        Estela: {spore.trailType}
                      </p>
                      <span className="text-[9px] text-emerald-400 font-mono mt-0.5">
                        {spore.unlockRequirement}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
