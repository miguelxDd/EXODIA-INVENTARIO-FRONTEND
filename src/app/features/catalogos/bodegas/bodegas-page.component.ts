import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BodegaService } from '@core/services';
import { COUNTRY_SUGGESTIONS, UI_MESSAGES } from '@core/constants';
import { ActualizarBodegaRequest, BodegaResponse, CrearBodegaRequest } from '@core/models';

type BodegaForm = FormGroup<{
  codigo: FormControl<string>;
  nombre: FormControl<string>;
  direccion: FormControl<string>;
  ciudad: FormControl<string>;
  pais: FormControl<string>;
  esProductoTerminado: FormControl<boolean>;
  esConsignacion: FormControl<boolean>;
  regimenTemperatura: FormControl<string>;
  tipoOperacion: FormControl<string>;
  capacidadAreaM2: FormControl<number | null>;
  capacidadVolumenM3: FormControl<number | null>;
  capacidadPesoKg: FormControl<number | null>;
  muellesCarga: FormControl<number | null>;
  telefono: FormControl<string>;
  email: FormControl<string>;
  contactoResponsable: FormControl<string>;
  horarioOperacion: FormControl<string>;
}>;

type BodegaRow = BodegaResponse & {
  direccionLabel: string;
  ciudadLabel: string;
  paisLabel: string;
  productoTerminadoLabel: string;
  consignacionLabel: string;
};

const BODEGA_LIMITS = {
  CODE: 30,
  NAME: 200,
  ADDRESS: 500,
  CITY: 100,
  COUNTRY: 100,
  PHONE: 30,
  EMAIL: 200,
  CONTACT: 200,
  SCHEDULE: 200,
} as const;

const REGIMEN_OPCIONES = [
  { label: 'Seco', value: 'SECO' },
  { label: 'Refrigerado', value: 'REFRIGERADO' },
  { label: 'Congelado', value: 'CONGELADO' },
  { label: 'Controlado', value: 'CONTROLADO' },
] as const;

const TIPO_OPERACION_OPCIONES = [
  { label: 'Almacenamiento', value: 'ALMACENAMIENTO' },
  { label: 'Distribución', value: 'DISTRIBUCION' },
  { label: 'Producción', value: 'PRODUCCION' },
  { label: 'Mixta', value: 'MIXTA' },
] as const;

@Component({
  selector: 'app-bodegas-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
  imports: [
    ReactiveFormsModule, TableModule, ButtonModule, ConfirmDialogModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule, CheckboxModule,
    ProgressSpinnerModule, MessageModule, ToastModule, TooltipModule,
    AutoCompleteModule, TextareaModule,
  ],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1>Bodegas</h1>
        <p>Administración de bodegas de la empresa</p>
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
            <th>Código</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>
              Prod. Terminado
              <i class="pi pi-info-circle info-icon" pTooltip="Indica si la bodega almacena productos terminados listos para venta o distribución" tooltipPosition="top"></i>
            </th>
            <th>
              Consignación
              <i class="pi pi-info-circle info-icon" pTooltip="Indica si la bodega es de consignación, donde el inventario pertenece a un tercero hasta su venta" tooltipPosition="top"></i>
            </th>
            <th style="width: 6rem"></th>
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
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  pTooltip="Editar"
                  tooltipPosition="top"
                  (onClick)="abrirEdicion(b)"
                />
                <p-button
                  icon="pi pi-trash"
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  pTooltip="Desactivar"
                  tooltipPosition="top"
                  (onClick)="confirmarDesactivar(b)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="empty-msg">No hay bodegas registradas.</td></tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      [header]="editingId() ? 'Editar Bodega' : 'Nueva Bodega'"
      [(visible)]="dialogoVisible"
      [modal]="true"
      [style]="{ width: 'min(44rem, 96vw)' }"
      (onHide)="resetDialog()"
    >
      <form class="form-grid" [formGroup]="form" (ngSubmit)="guardar()">
        @if (saveError()) {
          <p-message severity="error" [text]="saveError()!" />
        }

        <div class="field-section">
          <strong class="field-section-title">Datos generales</strong>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="bodega-codigo">Código</label>
            <input
              id="bodega-codigo"
              pInputText
              formControlName="codigo"
              [readonly]="!!editingId()"
              maxlength="30"
              placeholder="Ej. BOD-CENTRAL"
              autocomplete="off"
              aria-describedby="bodega-codigo-help bodega-codigo-error"
              (input)="normalizeCode()"
            />
            <small id="bodega-codigo-help" class="field-help">{{ codeHelp }}</small>
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
              maxlength="200"
              placeholder="Ej. Bodega Central"
              aria-describedby="bodega-nombre-error"
            />
            @if (form.controls.nombre.invalid && (form.controls.nombre.touched || submitted())) {
              <small id="bodega-nombre-error" class="field-error">{{ requiredFieldMessage }}</small>
            }
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bodega-ciudad">Ciudad</label>
            <input
              id="bodega-ciudad"
              pInputText
              formControlName="ciudad"
              maxlength="100"
              placeholder="Ej. San Salvador"
              autocomplete="address-level2"
            />
          </div>
          <div class="field">
            <label for="bodega-pais">País</label>
            <p-autocomplete
              inputId="bodega-pais"
              formControlName="pais"
              [suggestions]="filteredCountrySuggestions()"
              (completeMethod)="filterCountrySuggestions($event)"
              [dropdown]="true"
              dropdownIcon="pi pi-chevron-down"
              placeholder="Escribe o selecciona un país"
              aria-describedby="bodega-pais-help"
              appendTo="body"
            ></p-autocomplete>
            <small id="bodega-pais-help" class="field-help">{{ countryHelp }}</small>
          </div>
        </div>
        <div class="field">
          <label for="bodega-direccion">Dirección</label>
          <textarea
            id="bodega-direccion"
            pTextarea
            formControlName="direccion"
            rows="3"
            maxlength="500"
            placeholder="Ej. Final avenida Las Palmas, #245, zona industrial"
            autocomplete="street-address"
          ></textarea>
          <small class="field-help">La geolocalización exacta (latitud/longitud) se podrá agregar en una próxima fase.</small>
        </div>
        <div class="field-section">
          <strong class="field-section-title">Clasificación operativa</strong>
        </div>
        <div class="field-row">
          <div class="field field-surface">
            <span class="field-group-title">Tipo de inventario</span>
            <div class="checkbox-field">
              <p-checkbox inputId="bodega-producto-terminado" formControlName="esProductoTerminado" [binary]="true" />
              <label for="bodega-producto-terminado">Producto terminado</label>
              <i class="pi pi-info-circle info-icon" pTooltip="Almacena productos terminados listos para venta" tooltipPosition="top"></i>
            </div>
            <div class="checkbox-field">
              <p-checkbox inputId="bodega-consignacion" formControlName="esConsignacion" [binary]="true" />
              <label for="bodega-consignacion">Consignación</label>
              <i class="pi pi-info-circle info-icon" pTooltip="Inventario de terceros hasta su venta" tooltipPosition="top"></i>
            </div>
          </div>
          <div class="field field-surface">
            <span class="field-group-title">Operación y temperatura</span>
            <div class="field">
              <label for="bodega-tipo-operacion">Tipo de operación</label>
              <p-select
                inputId="bodega-tipo-operacion"
                formControlName="tipoOperacion"
                [options]="tipoOperacionOpciones"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un tipo"
                [showClear]="true"
                appendTo="body"
              />
            </div>
            <div class="field">
              <label for="bodega-regimen">Régimen de temperatura</label>
              <p-select
                inputId="bodega-regimen"
                formControlName="regimenTemperatura"
                [options]="regimenOpciones"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un régimen"
                [showClear]="true"
                appendTo="body"
              />
            </div>
          </div>
        </div>
        <div class="field-section">
          <strong class="field-section-title">Capacidad operativa</strong>
          <small class="field-section-copy">Todos los campos son opcionales. Ayudan a controlar la capacidad máxima de la bodega.</small>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bodega-area">Área (m²)</label>
            <p-inputnumber
              inputId="bodega-area"
              formControlName="capacidadAreaM2"
              [minFractionDigits]="0"
              [maxFractionDigits]="2"
              [min]="0"
              placeholder="Ej. 2500"
            />
          </div>
          <div class="field">
            <label for="bodega-volumen">Volumen (m³)</label>
            <p-inputnumber
              inputId="bodega-volumen"
              formControlName="capacidadVolumenM3"
              [minFractionDigits]="0"
              [maxFractionDigits]="2"
              [min]="0"
              placeholder="Ej. 9800"
            />
          </div>
          <div class="field">
            <label for="bodega-peso">Peso máx. (kg)</label>
            <p-inputnumber
              inputId="bodega-peso"
              formControlName="capacidadPesoKg"
              [minFractionDigits]="0"
              [maxFractionDigits]="2"
              [min]="0"
              placeholder="Ej. 300000"
            />
          </div>
          <div class="field">
            <label for="bodega-muelles">Muelles de carga</label>
            <p-inputnumber
              inputId="bodega-muelles"
              formControlName="muellesCarga"
              [min]="0"
              [maxFractionDigits]="0"
              placeholder="Ej. 4"
            />
          </div>
        </div>
        <div class="field-section">
          <strong class="field-section-title">Contacto</strong>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bodega-telefono">Teléfono</label>
            <input
              id="bodega-telefono"
              pInputText
              formControlName="telefono"
              maxlength="30"
              placeholder="Ej. +503 2222 3333"
              autocomplete="tel"
            />
          </div>
          <div class="field">
            <label for="bodega-email">Correo electrónico</label>
            <input
              id="bodega-email"
              pInputText
              type="email"
              formControlName="email"
              maxlength="200"
              placeholder="Ej. bodega@empresa.com"
              autocomplete="email"
            />
            @if (form.controls.email.invalid && (form.controls.email.touched || submitted())) {
              <small class="field-error">Ingresa un correo válido.</small>
            }
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bodega-responsable">Responsable</label>
            <input
              id="bodega-responsable"
              pInputText
              formControlName="contactoResponsable"
              maxlength="200"
              placeholder="Ej. Encargado de bodega"
            />
          </div>
          <div class="field">
            <label for="bodega-horario">Horario de operación</label>
            <input
              id="bodega-horario"
              pInputText
              formControlName="horarioOperacion"
              maxlength="200"
              placeholder="Ej. Lun-Vie 08:00-17:00"
            />
          </div>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="dialogoVisible = false" />
        <p-button
          [label]="editingId() ? 'Guardar' : 'Crear'"
          icon="pi pi-check"
          (onClick)="guardar()"
          [loading]="guardando()"
        />
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
    .field-section { display: grid; gap: 0.2rem; }
    .field-section-title { font-size: 0.92rem; font-weight: 700; }
    .field-section-copy { color: var(--p-text-muted-color); line-height: 1.45; }
    .field { display: grid; gap: 0.35rem; }
    .field label { font-size: 0.85rem; font-weight: 600; }
    .field input { width: 100%; }
    .field textarea { width: 100%; resize: vertical; }
    .field p-autocomplete { width: 100%; }
    .field-help { color: var(--p-text-muted-color); font-size: 0.78rem; }
    .field-row { display: flex; gap: 1rem; }
    .field-row .field { flex: 1; }
    .checkbox-field { display: flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; }
    .field-surface {
      padding: 0.9rem 1rem;
      border: 1px solid var(--p-surface-200);
      border-radius: 0.85rem;
      background: var(--p-surface-0);
    }
    .field-group-title { font-size: 0.85rem; font-weight: 700; }
    .future-scope-copy { color: var(--p-text-muted-color); line-height: 1.5; }
    .field-error { color: var(--p-red-500); font-size: 0.8rem; }
    .info-icon { font-size: 0.8rem; color: var(--p-text-muted-color); cursor: help; margin-left: 0.3rem; }
    .action-buttons { display: flex; gap: 0.25rem; justify-content: flex-end; }
    @media (max-width: 768px) {
      .page-header, .field-row { flex-direction: column; }
    }
  `],
})
export class BodegasPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bodegaService = inject(BodegaService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly requiredFieldMessage = UI_MESSAGES.REQUIRED_FIELD;
  readonly backendScopeNote = UI_MESSAGES.BODEGA_FORM_SCOPE_NOTE;
  readonly codeHelp = UI_MESSAGES.BODEGA_CODE_HELP;
  readonly countryHelp = UI_MESSAGES.BODEGA_COUNTRY_HELP;
  readonly countrySuggestions = [...COUNTRY_SUGGESTIONS];
  readonly filteredCountrySuggestions = signal<string[]>([...COUNTRY_SUGGESTIONS]);
  readonly bodegas = signal<BodegaResponse[]>([]);
  readonly rows = computed<BodegaRow[]>(() =>
    this.bodegas().map(item => ({
      ...item,
      direccionLabel: item.direccion || this.emptyValue,
      ciudadLabel: item.ciudad || this.emptyValue,
      paisLabel: item.pais || this.emptyValue,
      productoTerminadoLabel: item.esProductoTerminado ? 'Sí' : 'No',
      consignacionLabel: item.esConsignacion ? 'Sí' : 'No',
    })),
  );
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly submitted = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  dialogoVisible = false;

  readonly form: BodegaForm = new FormGroup({
    codigo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(BODEGA_LIMITS.CODE)],
    }),
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(BODEGA_LIMITS.NAME)],
    }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.ADDRESS)] }),
    ciudad: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.CITY)] }),
    pais: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.COUNTRY)] }),
    esProductoTerminado: new FormControl(false, { nonNullable: true }),
    esConsignacion: new FormControl(false, { nonNullable: true }),
    regimenTemperatura: new FormControl('', { nonNullable: true }),
    tipoOperacion: new FormControl('', { nonNullable: true }),
    capacidadAreaM2: new FormControl<number | null>(null),
    capacidadVolumenM3: new FormControl<number | null>(null),
    capacidadPesoKg: new FormControl<number | null>(null),
    muellesCarga: new FormControl<number | null>(null),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.PHONE)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.EMAIL), Validators.email] }),
    contactoResponsable: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.CONTACT)] }),
    horarioOperacion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(BODEGA_LIMITS.SCHEDULE)] }),
  });

  readonly regimenOpciones = [...REGIMEN_OPCIONES];
  readonly tipoOperacionOpciones = [...TIPO_OPERACION_OPCIONES];

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
      error: (err: any) => {
        this.error.set(err?.userMessage ?? UI_MESSAGES.LOAD_BODEGAS);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    this.resetDialog();
    this.editingId.set(null);
    this.filteredCountrySuggestions.set(this.countrySuggestions);
    this.dialogoVisible = true;
  }

  abrirEdicion(bodega: BodegaResponse): void {
    this.resetDialog();
    this.editingId.set(bodega.id);
    this.form.patchValue({
      codigo: bodega.codigo,
      nombre: bodega.nombre,
      direccion: bodega.direccion ?? '',
      ciudad: bodega.ciudad ?? '',
      pais: bodega.pais ?? '',
      esProductoTerminado: bodega.esProductoTerminado ?? false,
      esConsignacion: bodega.esConsignacion ?? false,
      regimenTemperatura: bodega.regimenTemperatura ?? '',
      tipoOperacion: bodega.tipoOperacion ?? '',
      capacidadAreaM2: bodega.capacidadAreaM2 ?? null,
      capacidadVolumenM3: bodega.capacidadVolumenM3 ?? null,
      capacidadPesoKg: bodega.capacidadPesoKg ?? null,
      muellesCarga: bodega.muellesCarga ?? null,
      telefono: bodega.telefono ?? '',
      email: bodega.email ?? '',
      contactoResponsable: bodega.contactoResponsable ?? '',
      horarioOperacion: bodega.horarioOperacion ?? '',
    });
    this.filteredCountrySuggestions.set(this.countrySuggestions);
    this.dialogoVisible = true;
  }

  guardar(): void {
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const id = this.editingId();

    if (id) {
      this.bodegaService.actualizar(id, this.buildUpdateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Bodega actualizada', detail: UI_MESSAGES.UPDATE_BODEGA_SUCCESS });
          this.resetDialog();
          this.cargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.UPDATE_BODEGA);
          this.guardando.set(false);
        },
      });
    } else {
      this.bodegaService.crear(this.buildCreateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Bodega creada', detail: UI_MESSAGES.CREATE_BODEGA_SUCCESS });
          this.resetDialog();
          this.cargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.CREATE_BODEGA);
          this.guardando.set(false);
        },
      });
    }
  }

  confirmarDesactivar(bodega: BodegaResponse): void {
    this.confirmationService.confirm({
      message: UI_MESSAGES.DEACTIVATE_BODEGA_CONFIRM,
      header: `Desactivar ${bodega.nombre}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.desactivar(bodega.id),
    });
  }

  resetDialog(): void {
    this.form.reset({
      codigo: '', nombre: '', direccion: '', ciudad: '', pais: '',
      esProductoTerminado: false, esConsignacion: false,
      regimenTemperatura: '', tipoOperacion: '',
      capacidadAreaM2: null, capacidadVolumenM3: null, capacidadPesoKg: null, muellesCarga: null,
      telefono: '', email: '', contactoResponsable: '', horarioOperacion: '',
    });
    this.filteredCountrySuggestions.set(this.countrySuggestions);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitted.set(false);
    this.saveError.set(null);
    this.editingId.set(null);
  }

  normalizeCode(): void {
    const control = this.form.controls.codigo;
    const normalizedValue = control.value.toUpperCase().replace(/\s+/g, '-');

    if (normalizedValue !== control.value) {
      control.setValue(normalizedValue, { emitEvent: false });
    }
  }

  filterCountrySuggestions(event: { query?: string }): void {
    const query = (event.query ?? '').trim().toLocaleLowerCase();

    if (!query) {
      this.filteredCountrySuggestions.set(this.countrySuggestions);
      return;
    }

    this.filteredCountrySuggestions.set(
      this.countrySuggestions.filter(country => country.toLocaleLowerCase().includes(query)),
    );
  }

  private desactivar(id: number): void {
    this.bodegaService.desactivar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Bodega desactivada', detail: UI_MESSAGES.DEACTIVATE_BODEGA_SUCCESS });
        this.cargar();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.userMessage ?? UI_MESSAGES.DEACTIVATE_BODEGA });
      },
    });
  }

  private buildCreateRequest(): CrearBodegaRequest {
    const v = this.form.getRawValue();
    return {
      codigo: v.codigo.trim().toUpperCase(),
      nombre: v.nombre.trim(),
      direccion: this.opt(v.direccion), ciudad: this.opt(v.ciudad), pais: this.opt(v.pais),
      esProductoTerminado: v.esProductoTerminado, esConsignacion: v.esConsignacion,
      regimenTemperatura: this.opt(v.regimenTemperatura),
      tipoOperacion: this.opt(v.tipoOperacion),
      capacidadAreaM2: v.capacidadAreaM2 ?? undefined,
      capacidadVolumenM3: v.capacidadVolumenM3 ?? undefined,
      capacidadPesoKg: v.capacidadPesoKg ?? undefined,
      muellesCarga: v.muellesCarga ?? undefined,
      telefono: this.opt(v.telefono),
      email: this.opt(v.email),
      contactoResponsable: this.opt(v.contactoResponsable),
      horarioOperacion: this.opt(v.horarioOperacion),
    };
  }

  private buildUpdateRequest(): ActualizarBodegaRequest {
    const v = this.form.getRawValue();
    return {
      nombre: v.nombre.trim(),
      direccion: this.opt(v.direccion), ciudad: this.opt(v.ciudad), pais: this.opt(v.pais),
      esProductoTerminado: v.esProductoTerminado, esConsignacion: v.esConsignacion,
      regimenTemperatura: this.opt(v.regimenTemperatura),
      tipoOperacion: this.opt(v.tipoOperacion),
      capacidadAreaM2: v.capacidadAreaM2 ?? undefined,
      capacidadVolumenM3: v.capacidadVolumenM3 ?? undefined,
      capacidadPesoKg: v.capacidadPesoKg ?? undefined,
      muellesCarga: v.muellesCarga ?? undefined,
      telefono: this.opt(v.telefono),
      email: this.opt(v.email),
      contactoResponsable: this.opt(v.contactoResponsable),
      horarioOperacion: this.opt(v.horarioOperacion),
    };
  }

  private opt(value: string): string | undefined {
    const t = value.trim();
    return t || undefined;
  }
}
