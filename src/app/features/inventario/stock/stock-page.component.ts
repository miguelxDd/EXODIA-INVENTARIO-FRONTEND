import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { UI_MESSAGES } from '@core/constants';
import { StockService, BodegaService } from '@core/services';
import { ContenedorStockResponse, BodegaResponse, PaginaResponse } from '@core/models';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

type StockRow = ContenedorStockResponse & {
  estadoSeverity: TagSeverity;
  numeroLoteLabel: string;
  fechaVencimientoLabel: string;
  cantidadReservadaLabel: number;
  cantidadDisponibleLabel: number;
};

@Component({
  selector: 'app-stock-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, TagModule, InputTextModule, SelectModule, MessageModule],
  template: `
    <div class="page-header">
      <h1>Stock de Inventario</h1>
      <p>Consulta consolidada de stock por contenedor</p>
    </div>

    <div class="filters">
      <p-select
        [options]="bodegas()"
        [formControl]="bodegaControl"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Filtrar por bodega"
        [showClear]="true"
        ariaLabel="Filtrar por bodega"
        (onChange)="cargar()"
      />
      <input
        pInputText
        placeholder="Buscar por codigo de barras..."
        [formControl]="codigoBarrasControl"
        aria-label="Buscar por codigo de barras"
        (keyup.enter)="cargar()"
      />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    }

    <p-table
      [value]="rows()"
      [loading]="cargando()"
      [paginator]="true"
      [rows]="20"
      [totalRecords]="datos().totalElementos"
      [lazy]="true"
      (onLazyLoad)="onPageChange($event)"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="{first} - {last} de {totalRecords}"
      [rowHover]="true"
      styleClass="p-datatable-sm"
    >
        <ng-template pTemplate="header">
          <tr>
            <th>Codigo Barras</th>
            <th>Producto</th>
            <th>Bodega</th>
            <th>Ubicacion</th>
            <th>Lote</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th style="text-align:right">Stock</th>
            <th style="text-align:right">Reservado</th>
            <th style="text-align:right">Disponible</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td><code>{{ item.codigoBarras }}</code></td>
            <td>{{ item.productoId }}</td>
            <td>{{ item.bodegaId }}</td>
            <td>{{ item.ubicacionId }}</td>
            <td>{{ item.numeroLoteLabel }}</td>
            <td>{{ item.fechaVencimientoLabel }}</td>
            <td><p-tag [value]="item.estadoCodigo" [severity]="item.estadoSeverity" /></td>
            <td style="text-align:right;font-weight:600">{{ item.stockCantidad }}</td>
            <td style="text-align:right">{{ item.cantidadReservadaLabel }}</td>
            <td style="text-align:right">{{ item.cantidadDisponibleLabel }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="10" class="empty-msg">No hay contenedores con stock.</td></tr>
        </ng-template>
    </p-table>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; }
    .page-header p { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
    .filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
  `]
})
export class StockPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly stockService = inject(StockService);
  private readonly bodegaService = inject(BodegaService);
  private readonly estadoSeverityMap: Record<string, TagSeverity> = {
    DISPONIBLE: 'success',
    RESERVADO: 'info',
    EN_TRANSITO: 'warn',
    CUARENTENA: 'danger',
    BLOQUEADO: 'danger',
    AGOTADO: 'secondary',
  };

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly bodegas = signal<BodegaResponse[]>([]);
  readonly datos = signal<PaginaResponse<ContenedorStockResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<StockRow[]>(() =>
    this.datos().contenido.map(item => ({
      ...item,
      estadoSeverity: this.estadoSeverityMap[item.estadoCodigo] ?? 'secondary',
      numeroLoteLabel: item.numeroLote || this.emptyValue,
      fechaVencimientoLabel: item.fechaVencimiento || this.emptyValue,
      cantidadReservadaLabel: item.cantidadReservada ?? 0,
      cantidadDisponibleLabel: item.cantidadDisponible ?? 0,
    }))
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal<number | null>(null);

  readonly bodegaControl = new FormControl<number | null>(null);
  readonly codigoBarrasControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.bodegaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: bodegas => this.bodegas.set(bodegas),
      error: () => this.error.set(UI_MESSAGES.LOAD_BODEGAS),
    });

    this.cargar();
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.currentPage.set(pagina);
    this.stockService.stockConsolidado({
      bodegaId: this.bodegaControl.value ?? undefined,
      codigoBarras: this.codigoBarrasControl.value.trim() || undefined,
      pagina,
      tamanio: 20,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_STOCK);
        this.cargando.set(false);
      },
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20));
    if (this.currentPage() !== page) {
      this.cargar(page);
    }
  }
}
