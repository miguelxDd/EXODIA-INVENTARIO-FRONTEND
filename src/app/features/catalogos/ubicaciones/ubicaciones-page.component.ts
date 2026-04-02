import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { UbicacionService, BodegaService } from '@core/services';
import { UbicacionResponse, BodegaResponse } from '@core/models';

@Component({
  selector: 'app-ubicaciones-page',
  imports: [FormsModule, TableModule, ButtonModule, SelectModule, ProgressSpinnerModule, MessageModule],
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
        [(ngModel)]="bodegaSeleccionada"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar bodega"
        (onChange)="cargar()"
      />
    </div>

    @if (!bodegaSeleccionada) {
      <p-message severity="info" text="Selecciona una bodega para ver sus ubicaciones." />
    } @else if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else {
      <p-table [value]="ubicaciones()" [rowHover]="true" styleClass="p-datatable-sm">
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
            <td>{{ u.codigoBarras || '-' }}</td>
            <td>{{ u.tipoUbicacion || 'GENERAL' }}</td>
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
  private readonly ubicacionService = inject(UbicacionService);
  private readonly bodegaService = inject(BodegaService);

  bodegas = signal<BodegaResponse[]>([]);
  ubicaciones = signal<UbicacionResponse[]>([]);
  cargando = signal(false);
  bodegaSeleccionada: number | undefined;

  ngOnInit(): void {
    this.bodegaService.listar().subscribe(b => this.bodegas.set(b));
  }

  cargar(): void {
    if (!this.bodegaSeleccionada) return;
    this.cargando.set(true);
    this.ubicacionService.listarPorBodega(this.bodegaSeleccionada).subscribe({
      next: data => { this.ubicaciones.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }
}
