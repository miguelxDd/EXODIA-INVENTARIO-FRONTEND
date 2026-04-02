import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { RecepcionService } from '@core/services';
import { RecepcionResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-recepciones-page',
  imports: [DatePipe, TableModule, ButtonModule, TagModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Recepciones</h1>
        <p>Recepcion de inventario en bodegas</p>
      </div>
      <p-button label="Nueva Recepcion" icon="pi pi-plus" />
    </div>

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
            <th>Numero</th>
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Fecha</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td><code>{{ r.numeroRecepcion }}</code></td>
            <td>{{ r.tipoRecepcion }}</td>
            <td>{{ r.bodegaId }}</td>
            <td><p-tag [value]="r.estado" severity="info" /></td>
            <td>{{ r.lineas?.length || 0 }}</td>
            <td>{{ r.creadoEn | date:'short' }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="empty-msg">No hay recepciones registradas.</td></tr>
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
export class RecepcionesPageComponent {
  private readonly recepcionService = inject(RecepcionService);

  datos = signal<PaginaResponse<RecepcionResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.recepcionService.listar(pagina).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    this.cargar(Math.floor((event.first ?? 0) / (event.rows ?? 20)));
  }
}
