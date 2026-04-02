import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import {
  APP_CONSTANTS,
  APP_NAVIGATION_ITEMS,
  APP_NAVIGATION_SECTIONS,
  SHELL_UI,
  type AppNavigationItem,
  type AppNavigationSection,
} from '@core/constants';
import { ThemeService } from '@core/services';

// ── View models ──

type NavigationItemViewModel = AppNavigationItem & { readonly active: boolean };
type NavigationSectionViewModel = AppNavigationSection & { readonly items: readonly NavigationItemViewModel[] };

// ── Mock data types ──

interface MockNotification {
  readonly id: number;
  readonly icon: string;
  readonly severity: 'info' | 'warn' | 'success' | 'error';
  readonly title: string;
  readonly message: string;
  readonly time: string;
  readonly read: boolean;
}

interface SearchableRecord {
  readonly id: string;
  readonly type: 'producto' | 'bodega' | 'operacion' | 'pantalla';
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly path: string;
  readonly keywords: string;
}

// ── Mock notifications ──

const MOCK_NOTIFICATIONS: readonly MockNotification[] = [
  { id: 1, icon: 'pi pi-download', severity: 'success', title: 'Recepción completada', message: 'La recepción #REC-0042 fue procesada con 150 unidades ingresadas a Bodega Central.', time: 'Hace 5 min', read: false },
  { id: 2, icon: 'pi pi-exclamation-triangle', severity: 'warn', title: 'Stock bajo', message: 'El producto SKU-1023 tiene 3 unidades disponibles en Bodega Norte. Mínimo configurado: 10.', time: 'Hace 20 min', read: false },
  { id: 3, icon: 'pi pi-arrows-h', severity: 'info', title: 'Transferencia en tránsito', message: 'La transferencia #TRF-0189 de Bodega Sur a Bodega Central está en camino.', time: 'Hace 1 hora', read: false },
  { id: 4, icon: 'pi pi-check-circle', severity: 'success', title: 'Conteo finalizado', message: 'El conteo físico #CNT-0015 de Bodega Central fue completado sin diferencias.', time: 'Hace 3 horas', read: true },
  { id: 5, icon: 'pi pi-shopping-cart', severity: 'info', title: 'Picking asignado', message: 'Se te asignó la orden de picking #PCK-0078 con 12 líneas.', time: 'Ayer', read: true },
] as const;

// ── Mock searchable content ──

const MOCK_SEARCHABLE_CONTENT: readonly SearchableRecord[] = [
  // Productos
  { id: 'p1', type: 'producto', icon: 'pi pi-box', title: 'Cemento Portland 50kg', subtitle: 'SKU-1001 · 1,240 uds · Bodega Central', path: '/inventario/stock', keywords: 'cemento portland saco construccion sku-1001' },
  { id: 'p2', type: 'producto', icon: 'pi pi-box', title: 'Varilla corrugada 3/8"', subtitle: 'SKU-1002 · 850 uds · Bodega Norte', path: '/inventario/stock', keywords: 'varilla corrugada acero hierro sku-1002' },
  { id: 'p3', type: 'producto', icon: 'pi pi-box', title: 'Pintura látex blanca 1gal', subtitle: 'SKU-1003 · 320 uds · Bodega Central', path: '/inventario/stock', keywords: 'pintura latex blanca galon sku-1003' },
  { id: 'p4', type: 'producto', icon: 'pi pi-box', title: 'Tubo PVC 4" x 3m', subtitle: 'SKU-1004 · 95 uds · Bodega Sur', path: '/inventario/stock', keywords: 'tubo pvc plomeria sku-1004' },
  { id: 'p5', type: 'producto', icon: 'pi pi-box', title: 'Clavo 2½" (caja 50lbs)', subtitle: 'SKU-1005 · 180 uds · Bodega Central', path: '/inventario/stock', keywords: 'clavo caja libras sku-1005' },
  { id: 'p6', type: 'producto', icon: 'pi pi-box', title: 'Alambre galvanizado Cal. 16', subtitle: 'SKU-1006 · 60 uds · Bodega Norte', path: '/inventario/stock', keywords: 'alambre galvanizado calibre rollo sku-1006' },
  // Bodegas
  { id: 'b1', type: 'bodega', icon: 'pi pi-warehouse', title: 'Bodega Central', subtitle: '3 zonas · 48 ubicaciones · Activa', path: '/catalogos/bodegas', keywords: 'bodega central principal almacen' },
  { id: 'b2', type: 'bodega', icon: 'pi pi-warehouse', title: 'Bodega Norte', subtitle: '2 zonas · 24 ubicaciones · Activa', path: '/catalogos/bodegas', keywords: 'bodega norte sucursal almacen' },
  { id: 'b3', type: 'bodega', icon: 'pi pi-warehouse', title: 'Bodega Sur', subtitle: '1 zona · 12 ubicaciones · Activa', path: '/catalogos/bodegas', keywords: 'bodega sur sucursal almacen' },
  // Operaciones recientes
  { id: 'o1', type: 'operacion', icon: 'pi pi-download', title: 'Recepción #REC-0042', subtitle: '150 uds · Bodega Central · Completada', path: '/operaciones/recepciones', keywords: 'recepcion rec-0042 ingreso entrada' },
  { id: 'o2', type: 'operacion', icon: 'pi pi-arrows-h', title: 'Transferencia #TRF-0189', subtitle: 'Bodega Sur → Bodega Central · En tránsito', path: '/operaciones/transferencias', keywords: 'transferencia trf-0189 traslado transito' },
  { id: 'o3', type: 'operacion', icon: 'pi pi-sliders-h', title: 'Ajuste #AJU-0033', subtitle: '+25 uds SKU-1001 · Bodega Central', path: '/operaciones/ajustes', keywords: 'ajuste aju-0033 correccion' },
  { id: 'o4', type: 'operacion', icon: 'pi pi-shopping-cart', title: 'Picking #PCK-0078', subtitle: '12 líneas · Pendiente', path: '/operaciones/picking', keywords: 'picking pck-0078 despacho salida orden' },
  { id: 'o5', type: 'operacion', icon: 'pi pi-calculator', title: 'Conteo #CNT-0015', subtitle: 'Bodega Central · Sin diferencias', path: '/operaciones/conteos', keywords: 'conteo cnt-0015 fisico auditoria' },
  // Pantallas (generadas desde navegación)
  ...APP_NAVIGATION_ITEMS.map(item => ({
    id: `nav-${item.id}`,
    type: 'pantalla' as const,
    icon: item.icon,
    title: item.label,
    subtitle: item.description,
    path: item.path,
    keywords: [item.label, item.description, item.featureKey, ...item.keywords].join(' '),
  })),
] as const;

const SEARCH_TYPE_LABELS: Record<SearchableRecord['type'], string> = {
  producto: 'Producto',
  bodega: 'Bodega',
  operacion: 'Operación',
  pantalla: 'Pantalla',
};

const SEARCH_TYPE_SEVERITY: Record<SearchableRecord['type'], 'info' | 'success' | 'warn' | 'secondary'> = {
  producto: 'info',
  bodega: 'success',
  operacion: 'warn',
  pantalla: 'secondary',
};

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    BadgeModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    DrawerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    PopoverModule,
    TagModule,
    ToggleSwitchModule,
    ToolbarModule,
    TooltipModule,
  ],
  template: `
    <div class="app-shell">
      <!-- ═══ NAVBAR ═══ -->
      <p-toolbar styleClass="shell-navbar">
        <ng-template #start>
          <div class="navbar-start">
            <p-button
              icon="pi pi-bars"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              (onClick)="openNavigation()"
              [attr.aria-controls]="navigationDrawerId"
              [attr.aria-expanded]="drawerVisible()"
              [attr.aria-label]="shellUi.MENU_BUTTON_ARIA"
            />

            <a routerLink="/" class="navbar-brand">
              <p-avatar
                icon="pi pi-warehouse"
                [style]="{ 'background-color': 'var(--brand-primary)', color: '#fff' }"
                shape="circle"
                size="normal"
              />
              <span class="navbar-brand-text">{{ appName }}</span>
            </a>

            <span class="navbar-divider navbar-divider--nav"></span>

            <nav class="navbar-nav" aria-label="Navegación principal">
              @for (section of menubarSections(); track section.id) {
                <div class="navbar-nav-group">
                  <span class="navbar-nav-label">{{ section.label }}</span>
                  <div class="navbar-nav-items">
                    @for (item of section.items; track item.path) {
                      <a
                        class="navbar-nav-link"
                        [class.active]="isActiveRoute(item.path, currentUrl())"
                        [routerLink]="item.path"
                        routerLinkActive="active"
                      >
                        <i [class]="item.icon" class="navbar-nav-icon"></i>
                        {{ item.label }}
                      </a>
                    }
                  </div>
                </div>
              }
            </nav>
          </div>
        </ng-template>

        <ng-template #end>
          <div class="navbar-end">
            <button
              type="button"
              class="navbar-search-trigger"
              (click)="openSearch()"
              aria-label="Buscar en todo el sistema"
            >
              <i class="pi pi-search navbar-search-trigger-icon"></i>
              <span class="navbar-search-trigger-text">Buscar productos, bodegas, operaciones...</span>
              <kbd class="navbar-search-trigger-kbd">Ctrl+K</kbd>
            </button>

            <p-button
              icon="pi pi-search"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              (onClick)="openSearch()"
              aria-label="Buscar"
              styleClass="navbar-search-mobile"
            />

            <span class="navbar-divider navbar-divider--end"></span>

            <p-button
              [icon]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              (onClick)="theme.toggle()"
              [pTooltip]="shellUi.THEME_ARIA_LABEL"
              tooltipPosition="bottom"
              [attr.aria-label]="shellUi.THEME_ARIA_LABEL"
            />

            <p-button
              icon="pi pi-bell"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              pTooltip="Notificaciones"
              tooltipPosition="bottom"
              aria-label="Notificaciones"
              [badge]="unreadCount().toString()"
              badgeSeverity="danger"
              (onClick)="notificationsPopover.toggle($event)"
            />

            <p-avatar
              label="MA"
              shape="circle"
              size="normal"
              [style]="{ 'background-color': 'var(--brand-primary)', color: '#fff', cursor: 'pointer', 'font-size': '0.75rem', 'font-weight': '700' }"
              (click)="userPopover.toggle($event)"
              pTooltip="Mi cuenta"
              tooltipPosition="bottom"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <!-- ═══ SEARCH DIALOG ═══ -->
      <p-dialog
        [visible]="searchVisible()"
        (visibleChange)="searchVisible.set($event)"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [showHeader]="false"
        [dismissableMask]="true"
        position="top"
        [style]="{ width: 'min(40rem, 94vw)', 'margin-top': '6rem' }"
        styleClass="search-dialog"
        (onShow)="onSearchDialogShow()"
        (onHide)="onSearchDialogHide()"
      >
        <div class="search-overlay">
          <div class="search-overlay-input">
            <i class="pi pi-search search-overlay-input-icon"></i>
            <input
              #globalSearchInput
              type="text"
              class="search-overlay-field"
              [formControl]="globalSearchControl"
              placeholder="Buscar productos, bodegas, operaciones, pantallas..."
              autocomplete="off"
              (keydown.escape)="closeSearch()"
            />
            @if (globalSearchValue().length) {
              <p-button
                icon="pi pi-times"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                size="small"
                (onClick)="globalSearchControl.reset()"
                aria-label="Limpiar búsqueda"
              />
            }
          </div>

          @if (globalSearchValue().length) {
            <div class="search-overlay-results">
              @if (globalSearchResults().length) {
                <small class="search-overlay-count">
                  {{ globalSearchResults().length }} resultado{{ globalSearchResults().length === 1 ? '' : 's' }}
                </small>

                @for (group of groupedSearchResults(); track group.type) {
                  <div class="search-results-group">
                    <span class="search-results-group-label">{{ group.label }}</span>
                    @for (result of group.items; track result.id) {
                      <a
                        class="search-result-item"
                        [routerLink]="result.path"
                        (click)="closeSearch()"
                      >
                        <span class="search-result-item-icon">
                          <i [class]="result.icon"></i>
                        </span>
                        <div class="search-result-item-text">
                          <span class="search-result-item-title">{{ result.title }}</span>
                          <small class="search-result-item-subtitle">{{ result.subtitle }}</small>
                        </div>
                        <p-tag [value]="getTypeLabel(result.type)" [severity]="getTypeSeverity(result.type)" [rounded]="true" />
                      </a>
                    }
                  </div>
                }
              } @else {
                <div class="search-overlay-empty">
                  <i class="pi pi-search search-overlay-empty-icon"></i>
                  <p>No se encontraron resultados para "<strong>{{ globalSearchValue() }}</strong>"</p>
                  <small>Intenta con otro término de búsqueda.</small>
                </div>
              }
            </div>
          } @else {
            <div class="search-overlay-hints">
              <small class="search-overlay-hints-title">Búsqueda rápida</small>
              <div class="search-overlay-hint-chips">
                <button class="search-hint-chip" (click)="globalSearchControl.setValue('cemento')">Cemento</button>
                <button class="search-hint-chip" (click)="globalSearchControl.setValue('bodega')">Bodega</button>
                <button class="search-hint-chip" (click)="globalSearchControl.setValue('recepción')">Recepción</button>
                <button class="search-hint-chip" (click)="globalSearchControl.setValue('stock')">Stock</button>
                <button class="search-hint-chip" (click)="globalSearchControl.setValue('picking')">Picking</button>
              </div>
              <div class="search-overlay-shortcut-hints">
                <small><kbd>↑↓</kbd> Navegar</small>
                <small><kbd>Enter</kbd> Abrir</small>
                <small><kbd>Esc</kbd> Cerrar</small>
              </div>
            </div>
          }
        </div>
      </p-dialog>

      <!-- ═══ NOTIFICATIONS POPOVER ═══ -->
      <p-popover #notificationsPopover [style]="{ width: 'min(24rem, 92vw)' }">
        <div class="notif-panel">
          <div class="notif-panel-header">
            <strong>Notificaciones</strong>
            <p-button
              label="Marcar todas como leídas"
              [text]="true"
              [plain]="true"
              size="small"
              (onClick)="markAllRead()"
              [disabled]="unreadCount() === 0"
            />
          </div>

          <div class="notif-panel-list">
            @for (notif of notifications(); track notif.id) {
              <div class="notif-item" [class.notif-item--unread]="!notif.read">
                <span class="notif-item-dot" [class.notif-item-dot--visible]="!notif.read"></span>
                <span
                  class="notif-item-icon"
                  [class.notif-item-icon--success]="notif.severity === 'success'"
                  [class.notif-item-icon--warn]="notif.severity === 'warn'"
                  [class.notif-item-icon--error]="notif.severity === 'error'"
                  [class.notif-item-icon--info]="notif.severity === 'info'"
                >
                  <i [class]="notif.icon"></i>
                </span>
                <div class="notif-item-body">
                  <strong class="notif-item-title">{{ notif.title }}</strong>
                  <p class="notif-item-message">{{ notif.message }}</p>
                  <small class="notif-item-time">{{ notif.time }}</small>
                </div>
              </div>
            }
          </div>

          <div class="notif-panel-footer">
            <p-button
              label="Ver todas las notificaciones"
              [text]="true"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="small"
            />
          </div>
        </div>
      </p-popover>

      <!-- ═══ USER MENU POPOVER ═══ -->
      <p-popover #userPopover [style]="{ width: 'min(18rem, 88vw)' }">
        <div class="user-panel">
          <div class="user-panel-header">
            <p-avatar
              label="MA"
              shape="circle"
              size="large"
              [style]="{ 'background-color': 'var(--brand-primary)', color: '#fff', 'font-size': '0.9rem', 'font-weight': '700' }"
            />
            <div class="user-panel-info">
              <strong>Miguel Amaya</strong>
              <small>miguel.amaya&#64;exodia.com</small>
              <span class="user-panel-role">Administrador</span>
            </div>
          </div>

          <p-divider />

          <div class="user-panel-menu">
            <a class="user-panel-item" href="javascript:void(0)">
              <i class="pi pi-user"></i>
              <span>Mi perfil</span>
            </a>
            <a class="user-panel-item" href="javascript:void(0)">
              <i class="pi pi-cog"></i>
              <span>Configuración</span>
            </a>
            <a class="user-panel-item" href="javascript:void(0)">
              <i class="pi pi-question-circle"></i>
              <span>Ayuda y soporte</span>
            </a>
          </div>

          <p-divider />

          <div class="user-panel-menu">
            <a class="user-panel-item user-panel-item--danger" href="javascript:void(0)">
              <i class="pi pi-sign-out"></i>
              <span>Cerrar sesión</span>
            </a>
          </div>
        </div>
      </p-popover>

      <!-- ═══ BREADCRUMB BAR ═══ -->
      <div class="shell-breadcrumb">
        <div class="breadcrumb-inner">
          <i class="pi pi-home breadcrumb-icon"></i>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-section">{{ activeSectionLabel() }}</span>
          <span class="breadcrumb-separator">/</span>
          <strong class="breadcrumb-current">{{ currentPageLabel() }}</strong>
        </div>
      </div>

      <!-- ═══ DRAWER / SIDEBAR ═══ -->
      <p-drawer
        [id]="navigationDrawerId"
        position="left"
        [visible]="drawerVisible()"
        (visibleChange)="drawerVisible.set($event)"
        [style]="{ width: 'min(26rem, 92vw)' }"
        [showCloseIcon]="false"
      >
        <ng-template #header>
          <div class="drawer-header">
            <div class="drawer-header-brand">
              <p-avatar
                icon="pi pi-warehouse"
                [style]="{ 'background-color': 'var(--brand-primary)', color: '#fff' }"
                shape="circle"
                size="large"
              />
              <div class="drawer-header-info">
                <span class="drawer-header-title">{{ appName }}</span>
                <small class="drawer-header-subtitle">{{ shellUi.MENU_HELPER }}</small>
              </div>
            </div>
            <p-button
              icon="pi pi-times"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              (onClick)="closeNavigation()"
              aria-label="Cerrar menú"
            />
          </div>
        </ng-template>

        <div class="drawer-body">
          <div class="drawer-search">
            <p-iconfield iconPosition="left" class="search-field">
              <p-inputicon class="pi pi-search" />
              <input
                pInputText
                [formControl]="drawerSearchControl"
                [placeholder]="shellUi.SEARCH_PLACEHOLDER"
                [attr.aria-label]="shellUi.SEARCH_ARIA_LABEL"
              />
            </p-iconfield>
            <small class="drawer-search-status">{{ drawerSearchStatusLabel() }}</small>
          </div>

          @if (filteredSections().length) {
            <nav class="drawer-nav" [attr.aria-label]="shellUi.MENU_TITLE">
              @for (section of filteredSections(); track section.id) {
                <div class="drawer-section" [attr.aria-label]="section.label">
                  <span class="drawer-section-title">{{ section.label }}</span>

                  @for (item of section.items; track item.path) {
                    <a
                      class="drawer-nav-item"
                      [class.active]="item.active"
                      [routerLink]="item.path"
                      routerLinkActive="active"
                      [attr.aria-current]="item.active ? 'page' : null"
                      (click)="closeNavigation()"
                    >
                      <span class="drawer-nav-item-icon">
                        <i [class]="item.icon"></i>
                      </span>
                      <div class="drawer-nav-item-text">
                        <span class="drawer-nav-item-label">{{ item.label }}</span>
                        <small class="drawer-nav-item-desc">{{ item.description }}</small>
                      </div>
                      @if (item.active) {
                        <i class="pi pi-chevron-right drawer-nav-item-arrow"></i>
                      }
                    </a>
                  }
                </div>
              }
            </nav>
          } @else {
            <p-message severity="info" [text]="shellUi.SEARCH_EMPTY" />
          }
        </div>

        <ng-template #footer>
          <div class="drawer-footer">
            <label class="drawer-theme-toggle" for="drawer-theme-mode">
              <i [class]="isDark() ? 'pi pi-moon' : 'pi pi-sun'" class="drawer-theme-icon"></i>
              <span>{{ themeLabel() }}</span>
              <p-toggleswitch
                inputId="drawer-theme-mode"
                [formControl]="themeControl"
                [attr.aria-label]="shellUi.THEME_ARIA_LABEL"
              ></p-toggleswitch>
            </label>
          </div>
        </ng-template>
      </p-drawer>

      <!-- ═══ MAIN CONTENT ═══ -->
      <main class="shell-main">
        <router-outlet />
      </main>

      <!-- ═══ FOOTER ═══ -->
      <footer class="shell-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <i class="pi pi-warehouse footer-brand-icon"></i>
            <strong>EXODIA</strong>
          </div>
          <span class="footer-service">{{ activeSectionLabel() }} &mdash; {{ currentPageLabel() }}</span>
          <small class="footer-copy">&copy; {{ currentYear }} Exodia. Todos los derechos reservados.</small>
        </div>
      </footer>
    </div>
  `,
})
export class LayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly documentTitle = inject(Title);
  readonly theme = inject(ThemeService);

  private readonly globalSearchInput = viewChild<ElementRef<HTMLInputElement>>('globalSearchInput');

  readonly appName = APP_CONSTANTS.APP_NAME;
  readonly navigationDrawerId = 'app-navigation-drawer';
  readonly shellUi = SHELL_UI;
  readonly totalModuleCount = APP_NAVIGATION_ITEMS.length;
  readonly currentYear = new Date().getFullYear();

  // ── Drawer state ──
  readonly drawerVisible = signal(false);
  readonly drawerSearchControl = new FormControl('', { nonNullable: true });

  // ── Search dialog state ──
  readonly searchVisible = signal(false);
  readonly globalSearchControl = new FormControl('', { nonNullable: true });

  // ── Theme ──
  readonly isDark = this.theme.isDark;
  readonly themeLabel = computed(() => (this.isDark() ? 'Modo oscuro' : 'Modo claro'));
  readonly themeControl = new FormControl(this.theme.isDark(), { nonNullable: true });

  // ── Notifications ──
  readonly notifications = signal<MockNotification[]>([...MOCK_NOTIFICATIONS]);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  // ── Current URL ──
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  // ── Drawer search (navigation only) ──
  private readonly drawerSearchValue = toSignal(
    this.drawerSearchControl.valueChanges.pipe(
      startWith(this.drawerSearchControl.value),
      map(v => v.trim()),
    ),
    { initialValue: '' },
  );
  private readonly drawerSearchQuery = computed(() => this.drawerSearchValue().toLowerCase());

  // ── Global search (content) ──
  readonly globalSearchValue = toSignal(
    this.globalSearchControl.valueChanges.pipe(
      startWith(this.globalSearchControl.value),
      map(v => v.trim()),
    ),
    { initialValue: '' },
  );
  private readonly globalQuery = computed(() => this.globalSearchValue().toLowerCase());

  readonly globalSearchResults = computed<readonly SearchableRecord[]>(() => {
    const query = this.globalQuery();
    if (!query) return [];
    return MOCK_SEARCHABLE_CONTENT.filter(record => {
      const haystack = [record.title, record.subtitle, record.keywords].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  });

  readonly groupedSearchResults = computed(() => {
    const results = this.globalSearchResults();
    const types: SearchableRecord['type'][] = ['producto', 'bodega', 'operacion', 'pantalla'];
    return types
      .map(type => ({
        type,
        label: SEARCH_TYPE_LABELS[type] + 's',
        items: results.filter(r => r.type === type),
      }))
      .filter(group => group.items.length > 0);
  });

  // ── Active navigation ──
  readonly activeItem = computed(
    () => APP_NAVIGATION_ITEMS.find(item => this.isActiveRoute(item.path, this.currentUrl())) ?? APP_NAVIGATION_ITEMS[0],
  );
  readonly currentPageLabel = computed(() => this.activeItem().label);
  readonly activeSectionLabel = computed(() => {
    const activeId = this.activeItem().id;
    return APP_NAVIGATION_SECTIONS.find(s => s.items.some(i => i.id === activeId))?.label ?? '';
  });

  readonly menubarSections = computed(() =>
    APP_NAVIGATION_SECTIONS.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        active: this.isActiveRoute(item.path, this.currentUrl()),
      })),
    })),
  );

  readonly filteredSections = computed<readonly NavigationSectionViewModel[]>(() => {
    const currentUrl = this.currentUrl();
    const query = this.drawerSearchQuery();

    return APP_NAVIGATION_SECTIONS.map(section => ({
      ...section,
      items: section.items
        .filter(item => !query || this.matchesSearch(item, query))
        .map(item => ({
          ...item,
          active: this.isActiveRoute(item.path, currentUrl),
        })),
    })).filter(section => section.items.length > 0);
  });

  private readonly drawerFilteredCount = computed(() =>
    this.filteredSections().reduce((total, section) => total + section.items.length, 0),
  );
  readonly drawerSearchStatusLabel = computed(() =>
    this.drawerSearchValue().length > 0
      ? this.shellUi.SEARCH_RESULT_LABEL(this.drawerFilteredCount(), this.drawerSearchValue())
      : this.shellUi.MODULE_COUNT_LABEL(this.totalModuleCount),
  );

  constructor() {
    effect(() => {
      this.themeControl.setValue(this.theme.isDark(), { emitEvent: false });
    });

    effect(() => {
      this.currentUrl();
      this.drawerVisible.set(false);
      this.searchVisible.set(false);
    });

    effect(() => {
      this.documentTitle.setTitle(`EXODIA | ${this.currentPageLabel()}`);
    });

    this.themeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => this.theme.setMode(dark ? 'dark' : 'light'));
  }

  @HostListener('document:keydown.control.k', ['$event'])
  onSearchShortcut(event: Event): void {
    event.preventDefault();
    this.openSearch();
  }

  openNavigation(): void {
    this.drawerVisible.set(true);
  }

  closeNavigation(): void {
    this.drawerVisible.set(false);
  }

  openSearch(): void {
    this.searchVisible.set(true);
  }

  closeSearch(): void {
    this.searchVisible.set(false);
  }

  onSearchDialogShow(): void {
    this.globalSearchControl.reset();
    setTimeout(() => this.globalSearchInput()?.nativeElement.focus(), 100);
  }

  onSearchDialogHide(): void {
    this.globalSearchControl.reset();
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  getTypeLabel(type: SearchableRecord['type']): string {
    return SEARCH_TYPE_LABELS[type];
  }

  getTypeSeverity(type: SearchableRecord['type']): 'info' | 'success' | 'warn' | 'secondary' {
    return SEARCH_TYPE_SEVERITY[type];
  }

  isActiveRoute(path: string, currentUrl: string): boolean {
    const normalizedUrl = currentUrl.split('?')[0];
    return normalizedUrl === path || normalizedUrl.startsWith(`${path}/`);
  }

  private matchesSearch(item: AppNavigationItem, query: string): boolean {
    const searchableContent = [item.label, item.description, item.featureKey, ...item.keywords].join(' ').toLowerCase();
    return searchableContent.includes(query);
  }
}
