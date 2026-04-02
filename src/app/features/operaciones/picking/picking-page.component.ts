import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PickingService } from '@core/services';
import { OrdenPickingResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-picking-page',
  imports: [DatePipe, TableModule, ButtonModule, TagModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Picking</h1>
        <p>Ordenes de picking de inventario</p>
      </div>
      <p-button label="Nueva Orden" icon="pi pi-plus" />
    </div>

      <p-table
        [value]="datos().contenido"
        [loading]="cargando()"
        [paginator]="true"
        [rows]="20"
        [totalRecords]="datos().totalElementos"
        [lazy]="true"
        (onLazyLoad)="onPageChange($event)"
        [rowHover]="true"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Numero</th>
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td><code>{{ p.numeroOrden }}</code></td>
            <td>{{ p.tipoPicking }}</td>
            <td>{{ p.bodegaId }}</td>
            <td><p-tag [value]="p.estado" [severity]="p.estado === 'COMPLETADO' ? 'success' : p.estado === 'CANCELADO' ? 'danger' : 'info'" /></td>
            <td>{{ p.lineas?.length || 0 }}</td>
            <td>{{ p.creadoEn | date:'short' }}</td>
            <td>
              @if (p.estado === 'PENDIENTE') {
                <p-button icon="pi pi-play" [text]="true" [rounded]="true" severity="success" pTooltip="Ejecutar" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-msg">No hay ordenes de picking.</td></tr>
        </ng-template>
      </p-table>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; }
    .page-header p { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
  `]
})
export class PickingPageComponent {
  private readonly pickingService = inject(PickingService);

  datos = signal<PaginaResponse<OrdenPickingResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.pickingService.listar(pagina).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    this.cargar(Math.floor((event.first ?? 0) / (event.rows ?? 20)));
  }
}
