import { Component, inject, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { UnidadService } from '@core/services';
import { UnidadResponse } from '@core/models';

@Component({
  selector: 'app-unidades-page',
  imports: [TableModule, ButtonModule, ProgressSpinnerModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Unidades de Medida</h1>
        <p>Catalogo de unidades</p>
      </div>
    </div>

    @if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else {
      <p-table [value]="unidades()" [rowHover]="true" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Abreviatura</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td><code>{{ u.codigo }}</code></td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.abreviatura || '-' }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="3" class="empty-msg">No hay unidades registradas.</td></tr>
        </ng-template>
      </p-table>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; }
    .page-header p { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
    .loading-center { display: grid; place-items: center; padding: 3rem; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
  `]
})
export class UnidadesPageComponent implements OnInit {
  private readonly unidadService = inject(UnidadService);

  unidades = signal<UnidadResponse[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.unidadService.listar().subscribe({
      next: data => { this.unidades.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }
}
