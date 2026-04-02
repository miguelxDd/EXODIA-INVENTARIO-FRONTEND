import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { UI_MESSAGES } from '@core/constants';
import { UbicacionService, BodegaService } from '@core/services';
import { UbicacionResponse, BodegaResponse } from '@core/models';

type UbicacionRow = UbicacionResponse & {
  codigoBarrasLabel: string;
  tipoUbicacionLabel: string;
};

@Component({
  selector: 'app-ubicaciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, SelectModule, ProgressSpinnerModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Ubicaciones</h1>
        <p>Ubicaciones dentro de cada bodega</p>
      </div>
    </div>

    <div class="filters">
      <p-select
        [options]="bodegas()"
        [formControl]="bodegaControl"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar bodega"
        ariaLabel="Seleccionar bodega"
      />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    } @else if (!bodegaControl.value) {
      <p-message severity="info" [text]="selectBodegaMessage" />
    } @else if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else {
      <p-table [value]="rows()" [rowHover]="true" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Codigo Barras</th>
            <th>Tipo</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td><code>{{ u.codigo }}</code></td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.codigoBarrasLabel }}</td>
            <td>{{ u.tipoUbicacionLabel }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="4" class="empty-msg">No hay ubicaciones en esta bodega.</td></tr>
        </ng-template>
      </p-table>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; }
    .page-header p { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
    .filters { margin-bottom: 1rem; }
    .loading-center { display: grid; place-items: center; padding: 3rem; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
  `]
})
export class UbicacionesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly bodegaService = inject(BodegaService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly selectBodegaMessage = UI_MESSAGES.SELECT_BODEGA;
  readonly bodegas = signal<BodegaResponse[]>([]);
  readonly ubicaciones = signal<UbicacionResponse[]>([]);
  readonly rows = computed<UbicacionRow[]>(() =>
    this.ubicaciones().map(item => ({
      ...item,
      codigoBarrasLabel: item.codigoBarras || this.emptyValue,
      tipoUbicacionLabel: item.tipoUbicacion || 'GENERAL',
    }))
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly bodegaControl = new FormControl<number | null>(null);

  ngOnInit(): void {
    this.bodegaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: bodegas => this.bodegas.set(bodegas),
      error: () => this.error.set(UI_MESSAGES.LOAD_BODEGAS),
    });

    this.bodegaControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(bodegaId => {
        this.ubicaciones.set([]);
        this.error.set(null);

        if (bodegaId) {
          this.cargar(bodegaId);
        }
      });
  }

  cargar(bodegaId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.ubicacionService.listarPorBodega(bodegaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.ubicaciones.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_UBICACIONES);
        this.cargando.set(false);
      },
    });
  }
}
