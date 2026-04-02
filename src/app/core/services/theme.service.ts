import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { APP_CONSTANTS } from '@core/constants';

type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = APP_CONSTANTS.THEME_KEY;

  readonly mode = signal<ThemeMode>('light');
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.initialize();
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.apply(mode);
  }

  toggle(): void {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  private initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedMode = this.readStoredMode();
    const mode = storedMode ?? (this.prefersDarkMode() ? 'dark' : 'light');
    this.mode.set(mode);
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = this.document.documentElement;
    const isDarkMode = mode === 'dark';

    root.classList.toggle('app-dark', isDarkMode);
    root.dataset['theme'] = mode;
    root.style.colorScheme = mode;

    try {
      window.localStorage.setItem(this.storageKey, mode);
    } catch {
      // Ignore storage failures and keep the theme applied in memory.
    }
  }

  private readStoredMode(): ThemeMode | null {
    try {
      const storedMode = window.localStorage.getItem(this.storageKey);
      return storedMode === 'light' || storedMode === 'dark' ? storedMode : null;
    } catch {
      return null;
    }
  }

  private prefersDarkMode(): boolean {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
