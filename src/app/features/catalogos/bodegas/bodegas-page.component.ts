import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { BodegaService } from '@core/services';
import { UI_MESSAGES } from '@core/constants';
import { BodegaResponse, CrearBodegaRequest } from '@core/models';

type BodegaForm = FormGroup<{
  codigo: FormControl<string>;
  nombre: FormControl<string>;
  direccion: FormControl<string>;
  ciudad: FormControl<string>;
  pais: FormControl<string>;
  esProductoTerminado: FormControl<boolean>;
  esConsignacion: FormControl<boolean>;
}>;

type BodegaRow = BodegaResponse & {
  direccionLabel: string;
  ciudadLabel: string;
  paisLabel: string;
  productoTerminadoLabel: string;
  consignacionLabel: string;
};

@Component({
  selector: 'app-bodegas-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, CheckboxModule, ProgressSpinnerModule, MessageModule],
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
      <p-table [value]="rows()" [rowHover]="true" styleClass="p-datatable-sm">
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
            <td>{{ b.direccionLabel }}</td>
            <td>{{ b.ciudadLabel }}</td>
            <td>{{ b.paisLabel }}</td>
            <td>{{ b.productoTerminadoLabel }}</td>
            <td>{{ b.consignacionLabel }}</td>
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

    <p-dialog
      header="Nueva Bodega"
      [(visible)]="dialogoVisible"
      [modal]="true"
      [style]="{ width: 'min(480px, 92vw)' }"
      (onHide)="resetDialog()"
    >
      <form class="form-grid" [formGroup]="form" (ngSubmit)="crearBodega()">
        @if (saveError()) {
          <p-message severity="error" [text]="saveError()!" />
        }

        <div class="field">
          <label for="bodega-codigo">Codigo</label>
          <input
            id="bodega-codigo"
            pInputText
            formControlName="codigo"
            aria-describedby="bodega-codigo-error"
          />
          @if (form.controls.codigo.invalid && (form.controls.codigo.touched || submitted())) {
            <small id="bodega-codigo-error" class="field-error">{{ requiredFieldMessage }}</small>
          }
        </div>
        <div class="field">
          <label for="bodega-nombre">Nombre</label>
          <input
            id="bodega-nombre"
            pInputText
            formControlName="nombre"
            aria-describedby="bodega-nombre-error"
          />
          @if (form.controls.nombre.invalid && (form.controls.nombre.touched || submitted())) {
            <small id="bodega-nombre-error" class="field-error">{{ requiredFieldMessage }}</small>
          }
        </div>
        <div class="field">
          <label for="bodega-direccion">Direccion</label>
          <input id="bodega-direccion" pInputText formControlName="direccion" />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bodega-ciudad">Ciudad</label>
            <input id="bodega-ciudad" pInputText formControlName="ciudad" />
          </div>
          <div class="field">
            <label for="bodega-pais">Pais</label>
            <input id="bodega-pais" pInputText formControlName="pais" />
          </div>
        </div>
        <div class="field-row">
          <div class="checkbox-field">
            <p-checkbox inputId="bodega-producto-terminado" formControlName="esProductoTerminado" [binary]="true" />
            <label for="bodega-producto-terminado">Producto terminado</label>
          </div>
          <div class="checkbox-field">
            <p-checkbox inputId="bodega-consignacion" formControlName="esConsignacion" [binary]="true" />
            <label for="bodega-consignacion">Consignacion</label>
          </div>
        </div>
      </form>
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
    .checkbox-field { display: flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; }
    .field-error { color: var(--p-red-500); font-size: 0.8rem; }
    @media (max-width: 768px) {
      .page-header,
      .field-row {
        flex-direction: column;
      }
    }
  `]
})
export class BodegasPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bodegaService = inject(BodegaService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly requiredFieldMessage = UI_MESSAGES.REQUIRED_FIELD;
  readonly bodegas = signal<BodegaResponse[]>([]);
  readonly rows = computed<BodegaRow[]>(() =>
    this.bodegas().map(item => ({
      ...item,
      direccionLabel: item.direccion || this.emptyValue,
      ciudadLabel: item.ciudad || this.emptyValue,
      paisLabel: item.pais || this.emptyValue,
      productoTerminadoLabel: item.esProductoTerminado ? 'Si' : 'No',
      consignacionLabel: item.esConsignacion ? 'Si' : 'No',
    }))
  );
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly submitted = signal(false);
  readonly saveError = signal<string | null>(null);

  dialogoVisible = false;

  readonly form: BodegaForm = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    direccion: new FormControl('', { nonNullable: true }),
    ciudad: new FormControl('', { nonNullable: true }),
    pais: new FormControl('', { nonNullable: true }),
    esProductoTerminado: new FormControl(false, { nonNullable: true }),
    esConsignacion: new FormControl(false, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.bodegaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.bodegas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_BODEGAS);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    this.resetDialog();
    this.dialogoVisible = true;
  }

  crearBodega(): void {
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.bodegaService.crear(this.buildRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.dialogoVisible = false;
        this.guardando.set(false);
        this.resetDialog();
        this.cargar();
      },
      error: () => {
        this.saveError.set(UI_MESSAGES.CREATE_BODEGA);
        this.guardando.set(false);
      },
    });
  }

  resetDialog(): void {
    this.form.reset({
      codigo: '',
      nombre: '',
      direccion: '',
      ciudad: '',
      pais: '',
      esProductoTerminado: false,
      esConsignacion: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitted.set(false);
    this.saveError.set(null);
  }

  private buildRequest(): CrearBodegaRequest {
    const value = this.form.getRawValue();

    return {
      codigo: value.codigo.trim(),
      nombre: value.nombre.trim(),
      direccion: this.normalizeOptionalText(value.direccion),
      ciudad: this.normalizeOptionalText(value.ciudad),
      pais: this.normalizeOptionalText(value.pais),
      esProductoTerminado: value.esProductoTerminado,
      esConsignacion: value.esConsignacion,
    };
  }

  private normalizeOptionalText(value: string): string | undefined {
    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : undefined;
  }
}
