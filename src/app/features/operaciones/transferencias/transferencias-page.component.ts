import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TransferenciaService } from '@core/services';
import { TransferenciaResponse, PaginaResponse } from '@core/models';

@Component({
  selector: 'app-transferencias-page',
  imports: [DatePipe, TableModule, ButtonModule, TagModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Transferencias</h1>
        <p>Transferencias de inventario entre bodegas</p>
      </div>
      <p-button label="Nueva Transferencia" icon="pi pi-plus" />
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
            <th>Origen</th>
            <th>Destino</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr>
            <td><code>{{ t.numeroTransferencia }}</code></td>
            <td>{{ t.tipoTransferencia }}</td>
            <td>{{ t.bodegaOrigenCodigo }}</td>
            <td>{{ t.bodegaDestinoCodigo }}</td>
            <td><p-tag [value]="t.estadoCodigo" [severity]="estadoSeverity(t.estadoCodigo)" /></td>
            <td>{{ t.lineas?.length || 0 }}</td>
            <td>{{ t.creadoEn | date:'short' }}</td>
            <td>
              @if (t.estadoCodigo === 'BORRADOR') {
                <p-button icon="pi pi-check" [text]="true" [rounded]="true" severity="success" pTooltip="Confirmar" />
              }
              @if (t.estadoCodigo === 'CONFIRMADO') {
                <p-button icon="pi pi-send" [text]="true" [rounded]="true" severity="info" pTooltip="Despachar" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="empty-msg">No hay transferencias registradas.</td></tr>
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
export class TransferenciasPageComponent {
  private readonly transferenciaService = inject(TransferenciaService);

  datos = signal<PaginaResponse<TransferenciaResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  cargando = signal(false);

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.transferenciaService.listar(pagina).subscribe({
      next: data => { this.datos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    this.cargar(Math.floor((event.first ?? 0) / (event.rows ?? 20)));
  }

  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      BORRADOR: 'secondary', CONFIRMADO: 'info', DESPACHADO: 'info',
      EN_TRANSITO: 'warn', RECIBIDO_PARCIAL: 'warn',
      RECIBIDO_COMPLETO: 'success', CANCELADO: 'danger', CIERRE_FORZADO: 'danger',
    };
    return map[estado] ?? 'secondary';
  }
}
