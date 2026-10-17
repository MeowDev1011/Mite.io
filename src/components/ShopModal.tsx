import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Lock, X } from 'lucide-react';
import { profileStorage, PlayerProfile } from '../storage/profileStorage';
import { MICROBE_SKINS, SPORE_STYLES, MicrobeSkin, SporeStyle } from '../game/skins';
import { soundEngine } from '../audio/soundEngine';

interface ShopModalProps {
  onClose: () => void;
  onSkinChanged: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, onSkinChanged }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => profileStorage.getProfile());
  const [activeTab, setActiveTab] = useState<'skins' | 'spores'>('skins');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleBuySkin = (skin: MicrobeSkin) => {
    if (profile.unlockedSkinIds.includes(skin.id)) {
      // Equip it
      profileStorage.selectSkin(skin.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      return;
    }

    if (profile.cytes < skin.priceCytes) {
      setFeedbackMsg('¡Cytes insuficientes! Sobreviví más tiempo y devorá eritrocitos para ganar más.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const ok = profileStorage.spendCytes(skin.priceCytes);
    if (ok) {
      profileStorage.unlockSkin(skin.id);
      profileStorage.selectSkin(skin.id);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Has adquirido ${skin.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleBuySpore = (spore: SporeStyle) => {
    if (profile.unlockedSporeIds.includes(spore.id)) {
      // Equip it
      profileStorage.selectSpore(spore.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      return;
    }

    if (profile.cytes < spore.priceCytes) {
      setFeedbackMsg('¡Cytes insuficientes!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const ok = profileStorage.spendCytes(spore.priceCytes);
    if (ok) {
      profileStorage.unlockSpore(spore.id);
      profileStorage.selectSpore(spore.id);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Has adquirido ${spore.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-2xl max-h-[88vh] p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] flex flex-col">
        {/* Header with Cytes Red Blood Cell Balance */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Mercado de Cytes</h2>
              <p className="text-xs text-neutral-400">Canjeá tus glóbulos rojos por aspectos y partículas</p>
            </div>
          </div>

          {/* Balance Pill with Erythrocyte SVG Coin */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] shrink-0">
            {/* Erythrocyte Cyte Icon */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border border-rose-300 shadow-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-950/70" />
            </div>
            <span className="text-base sm:text-lg font-black text-white font-mono tabular-nums leading-none">
              {profile.cytes}
            </span>
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Cytes</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mt-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-semibold text-center animate-fade-in">
            {feedbackMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Skins de Microbio
          </button>
          <button
            onClick={() => setActiveTab('spores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'spores'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Estilos de Espora [W]
          </button>
        </div>

        {/* Items Grid */}
        <div className="overflow-y-auto py-3 flex-1 pr-1">
          {activeTab === 'skins' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MICROBE_SKINS.map((skin) => {
                const isUnlocked = profile.unlockedSkinIds.includes(skin.id);
                const isEquipped = profile.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                      isEquipped
                        ? 'bg-rose-500/15 border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : isUnlocked
                        ? 'bg-white/[0.06] border-white/10'
                        : 'bg-black/40 border-white/5'
                    }`}
                  >
                    {/* Skin Preview Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md border-2 relative"
                      style={{
                        backgroundColor: skin.secondaryColor,
                        borderColor: skin.ciliaColor,
                        boxShadow: `0 0 12px ${skin.color}`,
                      }}
                    >
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: skin.color }} />
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
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {skin.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        {isUnlocked ? (
                          <button
                            onClick={() => handleBuySkin(skin)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            {isEquipped ? 'En uso' : 'Equipar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuySkin(skin)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-neutral-950 text-[11px] font-black cursor-pointer shadow-md"
                          >
                            {/* Cyte Icon */}
                            <div className="w-3.5 h-3.5 rounded-full bg-red-800 border border-red-300" />
                            <span>{skin.priceCytes} Cytes</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPORE_STYLES.map((spore) => {
                const isUnlocked = profile.unlockedSporeIds.includes(spore.id);
                const isEquipped = profile.selectedSporeId === spore.id;

                return (
                  <div
                    key={spore.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                      isEquipped
                        ? 'bg-rose-500/15 border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : isUnlocked
                        ? 'bg-white/[0.06] border-white/10'
                        : 'bg-black/40 border-white/5'
                    }`}
                  >
                    {/* Spore Orb */}
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
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        Estela: {spore.trailType}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        {isUnlocked ? (
                          <button
                            onClick={() => handleBuySpore(spore)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            {isEquipped ? 'En uso' : 'Equipar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuySpore(spore)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-neutral-950 text-[11px] font-black cursor-pointer shadow-md"
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-red-800 border border-red-300" />
                            <span>{spore.priceCytes} Cytes</span>
                          </button>
                        )}
                      </div>
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
            Cerrar Tienda
          </button>
        </div>
      </div>
    </div>
  );
};
