/**
 * Spolehlivá česká řeč přes Web Speech API.
 *
 * - Hlasy se načítají asynchronně (Chrome: `voiceschanged`, Safari: až po chvíli) → čekáme na událost
 *   i dotazujeme se opakovaně, s časovým limitem.
 * - Vybereme nejlepší český hlas (přirozené/online > vylepšené > Google > ostatní), rodič může vybrat jiný.
 * - iOS/Safari pustí první promluvu jen z gesta → `unlock()` při prvním dotyku.
 * - `speak()` vrací Promise, která se splní po dořečení (nebo po časovém limitu, kdyby událost nepřišla).
 * - Když český hlas chybí nebo syntéza není, stav to řekne a UI ukáže titulek s textem (rodič ho přečte).
 */
import { useSyncExternalStore } from 'react';
import { forSpeech } from './text';

export type SpeechStatus = 'loading' | 'ready' | 'no-czech' | 'unsupported';

export interface VoiceInfo {
  uri: string;
  name: string;
  lang: string;
  local: boolean;
  score: number;
}

export interface SpeechState {
  status: SpeechStatus;
  /** České hlasy seřazené od nejlepšího. */
  voices: VoiceInfo[];
  /** Hlas, kterým se právě mluví (URI), nebo ''. */
  activeVoice: string;
  speaking: boolean;
  /** Poslední vyslovený text (pro titulky), s časem. */
  caption: { text: string; at: number } | null;
}

type Synth = SpeechSynthesis;

export function scoreVoice(v: { name: string; lang: string; localService: boolean; default?: boolean }): number {
  const lang = v.lang.toLowerCase().replace('_', '-');
  let s: number;
  if (lang === 'cs-cz') s = 100;
  else if (lang === 'cs' || lang.startsWith('cs-')) s = 90;
  else return -1;
  const n = v.name.toLowerCase();
  if (/natural|neural|online/.test(n)) s += 20;
  if (/premium|enhanced|vylepšen|siri/.test(n)) s += 15;
  if (/google/.test(n)) s += 10;
  if (/zuzana|vlasta|antonín|antonin|jakub|iveta|ondřej/.test(n)) s += 5;
  if (v.localService) s += 3;
  if (v.default) s += 1;
  return s;
}

class SpeechEngine {
  private synth: Synth | null = null;
  private allVoices: SpeechSynthesisVoice[] = [];
  private state: SpeechState = { status: 'loading', voices: [], activeVoice: '', speaking: false, caption: null };
  private listeners = new Set<() => void>();
  private preferredURI = '';
  private rate = 0.9;
  private unlocked = false;
  private brokenVoices = new Set<string>();
  /** Chrome občas zahodí utterance bez `end`, pokud na ni nic neodkazuje. */
  private live = new Set<SpeechSynthesisUtterance>();
  private seq = 0;
  private started = false;

  init(): void {
    if (this.started) return;
    this.started = true;
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      this.set({ status: 'unsupported' });
      return;
    }
    this.synth = window.speechSynthesis;
    const load = () => this.loadVoices();
    load();
    try {
      this.synth.addEventListener('voiceschanged', load);
    } catch {
      this.synth.onvoiceschanged = load;
    }
    // Safari/iOS někdy událost nepošle – zkoušíme opakovaně, pak rozhodneme.
    let tries = 0;
    const poll = window.setInterval(() => {
      tries++;
      load();
      if (this.state.voices.length || tries > 24) {
        window.clearInterval(poll);
        if (!this.state.voices.length) this.set({ status: 'no-czech' });
      }
    }, 250);
    const unlock = () => this.unlock();
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    // Při skrytí stránky ztlumit (ať to nemluví z pozadí).
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.cancel();
    });
  }

  private loadVoices(): void {
    if (!this.synth) return;
    let list: SpeechSynthesisVoice[] = [];
    try {
      list = this.synth.getVoices() ?? [];
    } catch {
      list = [];
    }
    if (!list.length) return;
    this.allVoices = list;
    const cz = list
      .map((v) => ({ v, score: scoreVoice(v) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map<VoiceInfo>(({ v, score }) => ({ uri: v.voiceURI, name: v.name, lang: v.lang, local: v.localService, score }));
    this.set({ voices: cz, status: cz.length ? 'ready' : this.state.status === 'loading' ? 'loading' : 'no-czech' });
    if (cz.length) this.set({ activeVoice: this.pickVoice()?.voiceURI ?? '' });
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    const byUri = (uri: string) => this.allVoices.find((v) => v.voiceURI === uri);
    if (this.preferredURI && !this.brokenVoices.has(this.preferredURI)) {
      const v = byUri(this.preferredURI);
      if (v) return v;
    }
    for (const info of this.state.voices) {
      if (this.brokenVoices.has(info.uri)) continue;
      const v = byUri(info.uri);
      if (v) return v;
    }
    return null;
  }

  configure(opts: { voiceURI?: string; rate?: number }): void {
    if (opts.voiceURI !== undefined) this.preferredURI = opts.voiceURI;
    if (opts.rate !== undefined) this.rate = Math.min(1.3, Math.max(0.5, opts.rate));
    if (this.state.voices.length) this.set({ activeVoice: this.pickVoice()?.voiceURI ?? '' });
  }

  /** iOS: první promluva musí přijít z gesta – řekneme „nic“ potichu. */
  unlock(): void {
    if (this.unlocked || !this.synth) return;
    this.unlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.lang = 'cs-CZ';
      this.synth.speak(u);
    } catch {
      /* ignore */
    }
  }

  get status(): SpeechStatus {
    return this.state.status;
  }

  cancel(): void {
    this.seq++;
    try {
      this.synth?.cancel();
    } catch {
      /* ignore */
    }
    this.live.clear();
    if (this.state.speaking) this.set({ speaking: false });
  }

  /**
   * Řekne text česky. `rate` je násobek rychlosti z nastavení.
   * Vrací Promise – splní se po dořečení, chybě nebo časovém limitu (nikdy nevisí).
   */
  speak(text: string, opts: { rate?: number; caption?: string } = {}): Promise<void> {
    const clean = forSpeech(text).trim();
    this.set({ caption: { text: opts.caption ?? text, at: Date.now() } });
    if (!clean) return Promise.resolve();
    if (!this.synth || this.state.status === 'unsupported') return wait(Math.min(2500, 400 + clean.length * 60));
    const synth = this.synth;
    const my = ++this.seq;
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    const rate = Math.min(1.4, Math.max(0.4, this.rate * (opts.rate ?? 1)));
    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        this.live.delete(u);
        if (my === this.seq) this.set({ speaking: false });
        resolve();
      };
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'cs-CZ';
      u.rate = rate;
      u.pitch = 1.05;
      const voice = this.pickVoice();
      try {
        if (voice) u.voice = voice;
      } catch {
        /* některé prohlížeče odmítnou hlas z jiného okna / podvržený objekt */
      }
      u.onend = finish;
      u.onerror = (e) => {
        // Síťový hlas offline → označit za rozbitý a zkusit příště jiný.
        const err = (e as SpeechSynthesisErrorEvent).error;
        if (voice && err && err !== 'interrupted' && err !== 'canceled') this.brokenVoices.add(voice.voiceURI);
        finish();
      };
      this.live.add(u);
      // Pojistka: odhad délky řeči ×2 + rezerva.
      const timer = window.setTimeout(finish, 2500 + (clean.length * 160) / rate);
      // Chrome: speak hned po cancel někdy spolkne promluvu – krátká pauza pomáhá.
      window.setTimeout(() => {
        if (my !== this.seq) return finish();
        try {
          if (synth.paused) synth.resume();
          synth.speak(u);
          this.set({ speaking: true });
        } catch {
          finish();
        }
      }, 40);
    });
  }

  getState = (): SpeechState => this.state;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private set(patch: Partial<SpeechState>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of [...this.listeners]) fn();
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

export const speech = new SpeechEngine();

export function useSpeech(): SpeechState {
  return useSyncExternalStore(speech.subscribe, speech.getState, speech.getState);
}

export function say(text: string, opts?: { rate?: number; caption?: string }): Promise<void> {
  return speech.speak(text, opts);
}
