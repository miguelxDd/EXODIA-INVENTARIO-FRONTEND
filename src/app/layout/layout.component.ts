import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from '@core/services';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule, ToggleSwitchModule],
  template: `
    <div class="app-layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <span class="brand">Exodia</span>
          <span class="brand-sub">Inventario</span>
        </div>

        <ul class="nav-list">
          <li>
            <a routerLink="/inventario/stock" routerLinkActive="active">
              <i class="pi pi-box"></i> Stock
            </a>
          </li>
          <li>
            <a routerLink="/inventario/kardex" routerLinkActive="active">
              <i class="pi pi-list"></i> Kardex
            </a>
          </li>
          <li class="nav-section">Operaciones</li>
          <li>
            <a routerLink="/operaciones/recepciones" routerLinkActive="active">
              <i class="pi pi-download"></i> Recepciones
            </a>
          </li>
          <li>
            <a routerLink="/operaciones/transferencias" routerLinkActive="active">
              <i class="pi pi-arrows-h"></i> Transferencias
            </a>
          </li>
          <li>
            <a routerLink="/operaciones/ajustes" routerLinkActive="active">
              <i class="pi pi-sliders-h"></i> Ajustes
            </a>
          </li>
          <li>
            <a routerLink="/operaciones/picking" routerLinkActive="active">
              <i class="pi pi-shopping-cart"></i> Picking
            </a>
          </li>
          <li>
            <a routerLink="/operaciones/conteos" routerLinkActive="active">
              <i class="pi pi-calculator"></i> Conteos
            </a>
          </li>
          <li class="nav-section">Catalogos</li>
          <li>
            <a routerLink="/catalogos/bodegas" routerLinkActive="active">
              <i class="pi pi-warehouse"></i> Bodegas
            </a>
          </li>
          <li>
            <a routerLink="/catalogos/ubicaciones" routerLinkActive="active">
              <i class="pi pi-map-marker"></i> Ubicaciones
            </a>
          </li>
          <li>
            <a routerLink="/catalogos/unidades" routerLinkActive="active">
              <i class="pi pi-hashtag"></i> Unidades
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <label class="theme-toggle">
            <span>{{ themeLabel() }}</span>
            <p-toggleswitch
              inputId="theme-mode"
              [formControl]="themeControl"
              ariaLabel="Cambiar entre tema claro y oscuro"
            ></p-toggleswitch>
          </label>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: var(--p-surface-0);
      border-right: 1px solid var(--p-surface-200);
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
    }

    :host-context(.app-dark) .sidebar {
      background: var(--p-surface-900);
      border-right-color: var(--p-surface-700);
    }

    .sidebar-header {
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid var(--p-surface-200);
      margin-bottom: 0.75rem;
    }

    :host-context(.app-dark) .sidebar-header {
      border-bottom-color: var(--p-surface-700);
    }

    .brand {
      display: block;
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--brand-primary);
    }

    .brand-sub {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      overflow-y: auto;
    }

    .nav-list li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      color: var(--p-text-color);
      text-decoration: none;
      font-size: 0.9rem;
      transition: background 0.15s, color 0.15s;
    }

    .nav-list li a:hover {
      background: var(--p-surface-100);
    }

    :host-context(.app-dark) .nav-list li a:hover {
      background: var(--p-surface-800);
    }

    .nav-list li a.active {
      background: rgba(79, 70, 229, 0.08);
      color: var(--brand-primary);
      font-weight: 600;
    }

    :host-context(.app-dark) .nav-list li a.active {
      background: rgba(129, 140, 248, 0.12);
      color: var(--brand-primary-light);
    }

    .nav-section {
      padding: 1rem 1.25rem 0.4rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--p-text-muted-color);
    }

    .sidebar-footer {
      padding: 0.75rem 1.25rem 0;
      border-top: 1px solid var(--p-surface-200);
    }

    :host-context(.app-dark) .sidebar-footer {
      border-top-color: var(--p-surface-700);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
    }

    .main-content {
      padding: 1.5rem;
      overflow-y: auto;
      background: var(--p-surface-50);
    }

    :host-context(.app-dark) .main-content {
      background: var(--p-surface-950);
    }

    @media (max-width: 768px) {
      .app-layout {
        grid-template-columns: 1fr;
      }
      .sidebar {
        display: none;
      }
    }
  `]
})
export class LayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly theme = inject(ThemeService);

  readonly isDark = this.theme.isDark;
  readonly themeLabel = computed(() => this.isDark() ? 'Oscuro' : 'Claro');
  readonly themeControl = new FormControl(this.theme.isDark(), { nonNullable: true });

  constructor() {
    effect(() => {
      this.themeControl.setValue(this.theme.isDark(), { emitEvent: false });
    });

    this.themeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => this.theme.setMode(dark ? 'dark' : 'light'));
  }
}
