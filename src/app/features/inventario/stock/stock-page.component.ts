import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { StockService, BodegaService } from '@core/services';
import { ContenedorStockResponse, BodegaResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-stock-page',
  imports: [FormsModule, TableModule, TagModule, InputTextModule, SelectModule, MessageModule],
  template: `
    <div class="page-header">
      <h1>Stock de Inventario</h1>
      <p>Consulta consolidada de stock por contenedor</p>
    </div>

    <div class="filters">
      <p-select
        [options]="bodegas()"
        [(ngModel)]="bodegaFiltro"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Filtrar por bodega"
        [showClear]="true"
        (onChange)="cargar()"
      />
      <input
        pInputText
        placeholder="Buscar por codigo de barras..."
        [(ngModel)]="codigoBarrasFiltro"
        (keyup.enter)="cargar()"
      />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    }

    <p-table
      [value]="datos().contenido"
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
            <td>{{ item.numeroLote || '-' }}</td>
            <td>{{ item.fechaVencimiento || '-' }}</td>
            <td><p-tag [value]="item.estadoCodigo" [severity]="estadoSeverity(item.estadoCodigo)" /></td>
            <td style="text-align:right;font-weight:600">{{ item.stockCantidad }}</td>
            <td style="text-align:right">{{ item.cantidadReservada || 0 }}</td>
            <td style="text-align:right">{{ item.cantidadDisponible || 0 }}</td>
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
  private readonly stockService = inject(StockService);
  private readonly bodegaService = inject(BodegaService);

  bodegas = signal<BodegaResponse[]>([]);
  datos = signal<PaginaResponse<ContenedorStockResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);
  error = signal<string | null>(null);

  bodegaFiltro: number | undefined;
  codigoBarrasFiltro = '';

  ngOnInit(): void {
    this.bodegaService.listar().subscribe(b => this.bodegas.set(b));
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.stockService.stockConsolidado({
      bodegaId: this.bodegaFiltro,
      codigoBarras: this.codigoBarrasFiltro || undefined,
      pagina,
      tamanio: 20,
    }).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar stock.'); this.cargando.set(false); },
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20));
    this.cargar(page);
  }

  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      DISPONIBLE: 'success', RESERVADO: 'info', EN_TRANSITO: 'warn',
      CUARENTENA: 'danger', BLOQUEADO: 'danger', AGOTADO: 'secondary',
    };
    return map[estado] ?? 'secondary';
  }
}
