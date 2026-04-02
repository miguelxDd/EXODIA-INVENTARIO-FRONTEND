import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { UI_MESSAGES } from '@core/constants';
import { KardexService } from '@core/services';
import { OperacionResponse, PaginaResponse } from '@core/models';

type KardexTagSeverity = 'success' | 'danger' | 'info';

type KardexRow = OperacionResponse & {
  cantidadSeverity: KardexTagSeverity;
  cantidadLabel: string;
  precioUnitarioLabel: string | number;
  numeroLoteLabel: string;
  referenciaLabel: string;
};

@Component({
  selector: 'app-kardex-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ReactiveFormsModule, TableModule, TagModule, InputTextModule, MessageModule],
  template: `
    <div class="page-header">
      <h1>Kardex</h1>
      <p>Historial de operaciones de inventario</p>
    </div>

    <div class="filters">
      <input
        pInputText
        placeholder="Codigo de barras..."
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
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Codigo Barras</th>
            <th>Producto</th>
            <th>Bodega</th>
            <th style="text-align:right">Cantidad</th>
            <th style="text-align:right">Precio</th>
            <th>Lote</th>
            <th>Referencia</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-op>
          <tr>
            <td>{{ op.fechaOperacion | date:'short' }}</td>
            <td><p-tag [value]="op.tipoOperacionCodigo" [severity]="op.cantidadSeverity" /></td>
            <td><code>{{ op.codigoBarras }}</code></td>
            <td>{{ op.productoId }}</td>
            <td>{{ op.bodegaId }}</td>
            <td style="text-align:right;font-weight:600" [class.positive]="op.cantidad > 0" [class.negative]="op.cantidad < 0">
              {{ op.cantidadLabel }}
            </td>
            <td style="text-align:right">{{ op.precioUnitarioLabel }}</td>
            <td>{{ op.numeroLoteLabel }}</td>
            <td>{{ op.referenciaLabel }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="9" class="empty-msg">No hay operaciones registradas.</td></tr>
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
    .positive { color: var(--p-green-500); }
    .negative { color: var(--p-red-500); }
  `]
})
export class KardexPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly kardexService = inject(KardexService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly datos = signal<PaginaResponse<OperacionResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<KardexRow[]>(() =>
    this.datos().contenido.map(item => ({
      ...item,
      cantidadSeverity: item.cantidad > 0 ? 'success' : item.cantidad < 0 ? 'danger' : 'info',
      cantidadLabel: `${item.cantidad > 0 ? '+' : ''}${item.cantidad}`,
      precioUnitarioLabel: item.precioUnitario ?? this.emptyValue,
      numeroLoteLabel: item.numeroLote || this.emptyValue,
      referenciaLabel: item.tipoReferencia ? `${item.tipoReferencia} #${item.referenciaId}` : this.emptyValue,
    }))
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal<number | null>(null);
  readonly codigoBarrasControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.currentPage.set(pagina);
    this.kardexService.consultar({
      codigoBarras: this.codigoBarrasControl.value.trim() || undefined,
      pagina,
      tamanio: 20,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_KARDEX);
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
