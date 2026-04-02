import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { BodegaService } from '@core/services';
import { BodegaResponse, CrearBodegaRequest } from '@core/models';

@Component({
  selector: 'app-bodegas-page',
  imports: [FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, CheckboxModule, ProgressSpinnerModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Bodegas</h1>
        <p>Administracion de bodegas de la empresa</p>
      </div>
      <p-button label="Nueva Bodega" icon="pi pi-plus" (onClick)="abrirDialogo()" />
    </div>

    @if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else if (error()) {
      <p-message severity="error" [text]="error()!" />
    } @else {
      <p-table [value]="bodegas()" [rowHover]="true" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Direccion</th>
            <th>Ciudad</th>
            <th>Pais</th>
            <th>Prod. Terminado</th>
            <th>Consignacion</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-b>
          <tr>
            <td><code>{{ b.codigo }}</code></td>
            <td>{{ b.nombre }}</td>
            <td>{{ b.direccion || '-' }}</td>
            <td>{{ b.ciudad || '-' }}</td>
            <td>{{ b.pais || '-' }}</td>
            <td>{{ b.esProductoTerminado ? 'Si' : 'No' }}</td>
            <td>{{ b.esConsignacion ? 'Si' : 'No' }}</td>
            <td>
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" severity="secondary" />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="empty-msg">No hay bodegas registradas.</td></tr>
        </ng-template>
      </p-table>
    }

    <p-dialog header="Nueva Bodega" [(visible)]="dialogoVisible" [modal]="true" [style]="{width:'480px'}">
      <div class="form-grid">
        <div class="field">
          <label>Codigo</label>
          <input pInputText [(ngModel)]="form.codigo" />
        </div>
        <div class="field">
          <label>Nombre</label>
          <input pInputText [(ngModel)]="form.nombre" />
        </div>
        <div class="field">
          <label>Direccion</label>
          <input pInputText [(ngModel)]="form.direccion" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Ciudad</label>
            <input pInputText [(ngModel)]="form.ciudad" />
          </div>
          <div class="field">
            <label>Pais</label>
            <input pInputText [(ngModel)]="form.pais" />
          </div>
        </div>
        <div class="field-row">
          <p-checkbox [(ngModel)]="form.esProductoTerminado" [binary]="true" label="Producto terminado" />
          <p-checkbox [(ngModel)]="form.esConsignacion" [binary]="true" label="Consignacion" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="dialogoVisible = false" />
        <p-button label="Crear" icon="pi pi-check" (onClick)="crearBodega()" [loading]="guardando()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.6rem; }
    .page-header p { margin: 0.25rem 0 0; color: var(--p-text-muted-color); }
    .loading-center { display: grid; place-items: center; padding: 3rem; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
    .form-grid { display: grid; gap: 1rem; }
    .field { display: grid; gap: 0.35rem; }
    .field label { font-size: 0.85rem; font-weight: 600; }
    .field input { width: 100%; }
    .field-row { display: flex; gap: 1rem; }
    .field-row .field { flex: 1; }
  `]
})
export class BodegasPageComponent implements OnInit {
  private readonly bodegaService = inject(BodegaService);

  bodegas = signal<BodegaResponse[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);
  dialogoVisible = false;

  form: CrearBodegaRequest = { codigo: '', nombre: '' };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.bodegaService.listar().subscribe({
      next: data => { this.bodegas.set(data); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar bodegas.'); this.cargando.set(false); },
    });
  }

  abrirDialogo(): void {
    this.form = { codigo: '', nombre: '' };
    this.dialogoVisible = true;
  }

  crearBodega(): void {
    this.guardando.set(true);
    this.bodegaService.crear(this.form).subscribe({
      next: () => { this.dialogoVisible = false; this.guardando.set(false); this.cargar(); },
      error: () => this.guardando.set(false),
    });
  }
}
