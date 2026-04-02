import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { KardexService } from '@core/services';
import { OperacionResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-kardex-page',
  imports: [DatePipe, FormsModule, TableModule, TagModule, InputTextModule, DatePickerModule, MessageModule],
  template: `
    <div class="page-header">
      <h1>Kardex</h1>
      <p>Historial de operaciones de inventario</p>
    </div>

    <div class="filters">
      <input pInputText placeholder="Codigo de barras..." [(ngModel)]="codigoBarras" (keyup.enter)="cargar()" />
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
            <td><p-tag [value]="op.tipoOperacionCodigo" [severity]="tipoSeverity(op.cantidad)" /></td>
            <td><code>{{ op.codigoBarras }}</code></td>
            <td>{{ op.productoId }}</td>
            <td>{{ op.bodegaId }}</td>
            <td style="text-align:right;font-weight:600" [class.positive]="op.cantidad > 0" [class.negative]="op.cantidad < 0">
              {{ op.cantidad > 0 ? '+' : '' }}{{ op.cantidad }}
            </td>
            <td style="text-align:right">{{ op.precioUnitario || '-' }}</td>
            <td>{{ op.numeroLote || '-' }}</td>
            <td>{{ op.tipoReferencia ? op.tipoReferencia + ' #' + op.referenciaId : '-' }}</td>
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
export class KardexPageComponent {
  private readonly kardexService = inject(KardexService);

  datos = signal<PaginaResponse<OperacionResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);
  error = signal<string | null>(null);
  codigoBarras = '';

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.kardexService.consultar({
      codigoBarras: this.codigoBarras || undefined,
      pagina,
      tamanio: 20,
    }).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar kardex.'); this.cargando.set(false); },
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20));
    this.cargar(page);
  }

  tipoSeverity(cantidad: number): 'success' | 'danger' | 'info' {
    return cantidad > 0 ? 'success' : cantidad < 0 ? 'danger' : 'info';
  }
}
