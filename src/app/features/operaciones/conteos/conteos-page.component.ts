import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConteoFisicoService } from '@core/services';
import { ConteoFisicoResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-conteos-page',
  imports: [DatePipe, TableModule, ButtonModule, TagModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Conteos Fisicos</h1>
        <p>Conteo fisico de inventario con generacion de ajustes</p>
      </div>
      <p-button label="Nuevo Conteo" icon="pi pi-plus" />
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
            <th>Bodega</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Ajuste Generado</th>
            <th>Fecha Conteo</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-c>
          <tr>
            <td><code>{{ c.numeroConteo }}</code></td>
            <td>{{ c.bodegaId }}</td>
            <td><p-tag [value]="c.estado" [severity]="c.estado === 'APLICADO' ? 'success' : c.estado === 'CANCELADO' ? 'danger' : 'info'" /></td>
            <td>{{ c.lineas?.length || 0 }}</td>
            <td>{{ c.ajusteGeneradoId ? '#' + c.ajusteGeneradoId : '-' }}</td>
            <td>{{ c.fechaConteo | date:'short' }}</td>
            <td>
              @if (c.estado === 'EN_PROGRESO') {
                <p-button icon="pi pi-check" [text]="true" [rounded]="true" severity="success" pTooltip="Aplicar" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-msg">No hay conteos fisicos.</td></tr>
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
export class ConteosPageComponent {
  private readonly conteoService = inject(ConteoFisicoService);

  datos = signal<PaginaResponse<ConteoFisicoResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.conteoService.listar(pagina).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    this.cargar(Math.floor((event.first ?? 0) / (event.rows ?? 20)));
  }
}
