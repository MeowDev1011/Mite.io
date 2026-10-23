import React, { useState } from 'react';
import { Palette, Sparkles, Check, Lock, X, Award } from 'lucide-react';
import { profileStorage, PlayerProfile } from '../storage/profileStorage';
import { MICROBE_SKINS, SPORE_STYLES, MicrobeSkin, SporeStyle } from '../game/skins';
import { TranslationStrings } from '../i18n/languages';
import { CyteCoinSvg } from './BioSvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface SkinsModalProps {
  onClose: () => void;
  onSkinChanged: () => void;
  t: TranslationStrings;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({ onClose, onSkinChanged, t }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => profileStorage.getProfile());
  const [activeTab, setActiveTab] = useState<'microbes' | 'spores'>('spores');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (text: string, isError: boolean = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 2800);
  };

  const handleSelectOrBuySkin = (skin: MicrobeSkin) => {
    const isUnlocked = profile.unlockedSkinIds.includes(skin.id) || (skin.priceCytes === 0 && !skin.requiredAchievementId);
    if (isUnlocked) {
      profileStorage.selectSkin(skin.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      soundEngine.playCollect();
      return;
    }

    if (skin.priceCytes > 0) {
      if (profileStorage.spendCytes(skin.priceCytes)) {
        profileStorage.unlockSkin(skin.id);
        profileStorage.selectSkin(skin.id);
        setProfile(profileStorage.getProfile());
        onSkinChanged();
        soundEngine.playLevelUp();
        showToast(`${skin.name} — ${t.equipped}!`, false);
      } else {
        showToast(`${t.insufficientCytes} (${skin.priceCytes} ${t.cytes})`, true);
      }
    } else {
      showToast(`${t.lockedLabel} · ${skin.unlockRequirement}`, true);
    }
  };

  const handleSelectOrBuySpore = (spore: SporeStyle) => {
    // ONLY spore_plasma (priceCytes === 0 && !requiredAchievementId) is free by default!
    const isFreeStarter = spore.id === 'spore_plasma';
    const isUnlocked = isFreeStarter || profile.unlockedSporeIds.includes(spore.id);

    if (isUnlocked) {
      profileStorage.selectSpore(spore.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      soundEngine.playCollect();
      return;
    }

    if (spore.priceCytes > 0) {
      if (profileStorage.spendCytes(spore.priceCytes)) {
        profileStorage.unlockSpore(spore.id);
        profileStorage.selectSpore(spore.id);
        setProfile(profileStorage.getProfile());
        onSkinChanged();
        soundEngine.playLevelUp();
        showToast(`${spore.name} — ${t.equipped}!`, false);
      } else {
        showToast(`${t.insufficientCytes} (${spore.priceCytes} ${t.cytes})`, true);
      }
    } else {
      showToast(`${t.achievementRequiredLabel}: ${spore.unlockRequirement}`, true);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-3xl max-h-[88vh] p-4 sm:p-7 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white">{t.skinsModalTitle}</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">{t.skinsModalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Cytes Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-500/40 text-rose-200">
              <CyteCoinSvg size={16} />
              <span className="text-xs sm:text-sm font-black text-white font-mono tabular-nums">{profile.cytes}</span>
              <span className="text-[10px] uppercase font-bold text-rose-300">{t.cytes}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackMsg && (
          <div
            className={`mt-2.5 px-3 py-2 rounded-xl text-xs font-bold text-center border animate-fade-in ${
              feedbackMsg.isError
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-3 pb-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('spores')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'spores'
                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.sporeStylesTab} ({SPORE_STYLES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('microbes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'microbes'
                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.microbeMembraneTab} ({MICROBE_SKINS.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-2 flex-1 pr-1">
          {activeTab === 'microbes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MICROBE_SKINS.map((skin) => {
                const isUnlocked = profile.unlockedSkinIds.includes(skin.id) || (skin.priceCytes === 0 && !skin.requiredAchievementId);
                const isEquipped = profile.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => handleSelectOrBuySkin(skin)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : isUnlocked
                        ? 'bg-white/[0.06] border-white/10 hover:border-white/30'
                        : 'bg-black/40 border-white/10 hover:border-amber-400/40'
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
                        <div className="absolute inset-0 bg-black/65 rounded-2xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {skin.name}
                        </span>
                        {isEquipped ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> {t.equipped}
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/15 text-emerald-300 shrink-0">
                            {t.equip}
                          </span>
                        ) : skin.priceCytes > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-1 shrink-0">
                            <CyteCoinSvg size={11} />
                            <span>{skin.priceCytes} {t.cytes}</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 flex items-center gap-0.5 shrink-0">
                            <Award className="w-2.5 h-2.5" /> {t.achievementsBtn}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {skin.description}
                      </p>
                      {!isUnlocked && (
                        <span className="text-[9px] text-amber-400 font-medium mt-1">
                          {skin.priceCytes > 0
                            ? `${t.unlockForCytes} ${skin.priceCytes} ${t.cytes}`
                            : `${t.lockedLabel} · ${skin.unlockRequirement}`}
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
                // ONLY spore_plasma is free by default! All other spores require Cytes or Achievements
                const isFreeStarter = spore.id === 'spore_plasma';
                const isUnlocked = isFreeStarter || profile.unlockedSporeIds.includes(spore.id);
                const isEquipped = profile.selectedSporeId === spore.id;

                return (
                  <div
                    key={spore.id}
                    onClick={() => handleSelectOrBuySpore(spore)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : isUnlocked
                        ? 'bg-white/[0.06] border-white/10 hover:border-white/30'
                        : 'bg-black/45 border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    {/* Spore Preview Orb */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 relative"
                      style={{
                        backgroundColor: spore.color,
                        borderColor: spore.glowColor,
                        boxShadow: `0 0 15px ${spore.glowColor}`,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-neutral-950" />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/65 rounded-full flex items-center justify-center">
                          <Lock className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {spore.name}
                        </span>
                        {isEquipped ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-neutral-950 flex items-center gap-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5" /> {t.equipped}
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/15 text-emerald-300 shrink-0">
                            {t.equip}
                          </span>
                        ) : spore.priceCytes > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-1 shrink-0">
                            <CyteCoinSvg size={11} />
                            <span>{spore.priceCytes} {t.cytes}</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center gap-0.5 shrink-0">
                            <Award className="w-2.5 h-2.5" /> {t.achievementsBtn}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {t.trailLabel} <strong className="text-neutral-200">{spore.trailType}</strong>
                      </p>
                      <span
                        className={`text-[9px] font-mono mt-0.5 ${
                          isFreeStarter
                            ? 'text-emerald-400 font-bold'
                            : isUnlocked
                            ? 'text-cyan-300'
                            : 'text-amber-400'
                        }`}
                      >
                        {isFreeStarter
                          ? `${t.freeLabel} · ${t.freeSporeBadge}`
                          : spore.priceCytes > 0 && !isUnlocked
                          ? `${t.buyBtn}: ${spore.priceCytes} ${t.cytes}`
                          : spore.unlockRequirement}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
