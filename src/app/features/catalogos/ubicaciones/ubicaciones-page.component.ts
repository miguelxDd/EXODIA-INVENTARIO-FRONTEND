import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { UbicacionService, BodegaService } from '@core/services';
import { UI_MESSAGES } from '@core/constants';
import { UbicacionResponse, BodegaResponse, CrearUbicacionRequest, ActualizarUbicacionRequest } from '@core/models';

type UbicacionForm = FormGroup<{
  codigo: FormControl<string>;
  nombre: FormControl<string>;
  codigoBarras: FormControl<string>;
  tipoUbicacion: FormControl<string>;
  zona: FormControl<string>;
  subzona: FormControl<string>;
  pasillo: FormControl<string>;
  estante: FormControl<string>;
  nivel: FormControl<string>;
  posicion: FormControl<string>;
  tipoZona: FormControl<string>;
  ambiente: FormControl<string>;
  anchoCm: FormControl<number | null>;
  altoCm: FormControl<number | null>;
  profundidadCm: FormControl<number | null>;
  volumenMaximoM3: FormControl<number | null>;
  pesoMaximoKg: FormControl<number | null>;
  permitePicking: FormControl<boolean>;
  permiteReserva: FormControl<boolean>;
  permiteCuarentena: FormControl<boolean>;
}>;

const TIPO_ZONA_OPCIONES = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Picking', value: 'PICKING' },
  { label: 'Reserva', value: 'RESERVA' },
  { label: 'Cuarentena', value: 'CUARENTENA' },
  { label: 'Devoluciones', value: 'DEVOLUCIONES' },
  { label: 'Recibo', value: 'RECIBO' },
  { label: 'Despacho', value: 'DESPACHO' },
  { label: 'Merma', value: 'MERMA' },
  { label: 'Bulk / A granel', value: 'BULK' },
] as const;

type UbicacionRow = UbicacionResponse & {
  codigoBarrasLabel: string;
  tipoUbicacionLabel: string;
};

@Component({
  selector: 'app-ubicaciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
  imports: [
    ReactiveFormsModule, TableModule, SelectModule, ButtonModule, ConfirmDialogModule,
    DialogModule, InputTextModule, ProgressSpinnerModule, MessageModule, ToastModule, TooltipModule,
    InputNumberModule, CheckboxModule,
  ],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1>Ubicaciones</h1>
        <p>Ubicaciones dentro de cada bodega</p>
      </div>
      <p-button
        label="Nueva Ubicación"
        icon="pi pi-plus"
        (onClick)="abrirDialogo()"
        [disabled]="!bodegaControl.value"
      />
    </div>

    <div class="filters">
      <p-select
        [options]="bodegas()"
        [formControl]="bodegaControl"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar bodega"
        ariaLabel="Seleccionar bodega"
      />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    } @else if (!bodegaControl.value) {
      <p-message severity="info" [text]="selectBodegaMessage" />
    } @else if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else {
      <p-table [value]="rows()" [rowHover]="true" styleClass="p-datatable-sm" >
        <ng-template pTemplate="header">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Código Barras</th>
            <th>Tipo</th>
            <th style="width: 6rem"></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td><code>{{ u.codigo }}</code></td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.codigoBarrasLabel }}</td>
            <td>{{ u.tipoUbicacionLabel }}</td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  severity="secondary"
                  pTooltip="Editar"
                  tooltipPosition="top"
                  (onClick)="abrirEdicion(u)"
                />
                <p-button
                  icon="pi pi-trash"
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  pTooltip="Desactivar"
                  tooltipPosition="top"
                  (onClick)="confirmarDesactivar(u)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="empty-msg">No hay ubicaciones en esta bodega.</td></tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      [header]="editingId() ? 'Editar Ubicación' : 'Nueva Ubicación'"
      [(visible)]="dialogoVisible"
      [modal]="true"
      [style]="{ width: 'min(700px, 95vw)' }"
      (onHide)="resetDialog()"
    >
      <form class="form-grid" [formGroup]="form" (ngSubmit)="guardar()">
        @if (saveError()) {
          <p-message severity="error" [text]="saveError()!" />
        }

        <div class="field-row">
          <div class="field">
            <label for="ubicacion-codigo">Código <span class="required">*</span></label>
            <input
              id="ubicacion-codigo"
              pInputText
              formControlName="codigo"
              [readonly]="!!editingId()"
              aria-describedby="ubicacion-codigo-error"
            />
            @if (form.controls.codigo.invalid && (form.controls.codigo.touched || submitted())) {
              <small id="ubicacion-codigo-error" class="field-error">{{ requiredFieldMessage }}</small>
            }
          </div>
          <div class="field">
            <label for="ubicacion-nombre">Nombre <span class="required">*</span></label>
            <input id="ubicacion-nombre" pInputText formControlName="nombre" aria-describedby="ubicacion-nombre-error" />
            @if (form.controls.nombre.invalid && (form.controls.nombre.touched || submitted())) {
              <small id="ubicacion-nombre-error" class="field-error">{{ requiredFieldMessage }}</small>
            }
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-codigo-barras">Código de Barras</label>
            <input id="ubicacion-codigo-barras" pInputText formControlName="codigoBarras" />
          </div>
          <div class="field">
            <label for="ubicacion-tipo">Tipo de Ubicación</label>
            <input id="ubicacion-tipo" pInputText formControlName="tipoUbicacion" placeholder="Ej. GENERAL" />
          </div>
        </div>

        <div class="field-section">
          <strong class="field-section-title">Coordenadas internas</strong>
          <small class="field-section-copy">Estos campos identifican la posición física dentro de la bodega. Todos son opcionales.</small>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-zona">Zona</label>
            <input id="ubicacion-zona" pInputText formControlName="zona" maxlength="30" placeholder="Ej. A" />
          </div>
          <div class="field">
            <label for="ubicacion-subzona">Subzona</label>
            <input id="ubicacion-subzona" pInputText formControlName="subzona" maxlength="30" placeholder="Ej. A1" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-pasillo">Pasillo</label>
            <input id="ubicacion-pasillo" pInputText formControlName="pasillo" maxlength="20" placeholder="Ej. P01" />
          </div>
          <div class="field">
            <label for="ubicacion-estante">Estante</label>
            <input id="ubicacion-estante" pInputText formControlName="estante" maxlength="20" placeholder="Ej. E03" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-nivel">Nivel</label>
            <input id="ubicacion-nivel" pInputText formControlName="nivel" maxlength="20" placeholder="Ej. N2" />
          </div>
          <div class="field">
            <label for="ubicacion-posicion">Posición</label>
            <input id="ubicacion-posicion" pInputText formControlName="posicion" maxlength="20" placeholder="Ej. 001" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-tipo-zona">Tipo de zona</label>
            <p-select
              inputId="ubicacion-tipo-zona"
              formControlName="tipoZona"
              [options]="tipoZonaOpciones"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un tipo"
              [showClear]="true"
              appendTo="body"
            />
          </div>
          <div class="field">
            <label for="ubicacion-ambiente">Ambiente</label>
            <input id="ubicacion-ambiente" pInputText formControlName="ambiente" maxlength="20" placeholder="Ej. Refrigerado" />
          </div>
        </div>

        <div class="field-section">
          <strong class="field-section-title">Dimensiones</strong>
          <small class="field-section-copy">Capacidad física de la ubicación. Todos los campos son opcionales.</small>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-ancho">Ancho (cm)</label>
            <p-inputnumber inputId="ubicacion-ancho" formControlName="anchoCm" [min]="0" [maxFractionDigits]="2" placeholder="Ej. 120" />
          </div>
          <div class="field">
            <label for="ubicacion-alto">Alto (cm)</label>
            <p-inputnumber inputId="ubicacion-alto" formControlName="altoCm" [min]="0" [maxFractionDigits]="2" placeholder="Ej. 200" />
          </div>
          <div class="field">
            <label for="ubicacion-prof">Profundidad (cm)</label>
            <p-inputnumber inputId="ubicacion-prof" formControlName="profundidadCm" [min]="0" [maxFractionDigits]="2" placeholder="Ej. 80" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ubicacion-volumen">Volumen máx. (m³)</label>
            <p-inputnumber inputId="ubicacion-volumen" formControlName="volumenMaximoM3" [min]="0" [maxFractionDigits]="2" placeholder="Ej. 2.5" />
          </div>
          <div class="field">
            <label for="ubicacion-peso">Peso máx. (kg)</label>
            <p-inputnumber inputId="ubicacion-peso" formControlName="pesoMaximoKg" [min]="0" [maxFractionDigits]="2" placeholder="Ej. 500" />
          </div>
        </div>

        <div class="field-section">
          <strong class="field-section-title">Permisos operativos</strong>
        </div>
        <div class="field field-surface">
          <div class="checkbox-field">
            <p-checkbox inputId="ubicacion-permite-picking" formControlName="permitePicking" [binary]="true" />
            <label for="ubicacion-permite-picking">Permite picking</label>
          </div>
          <div class="checkbox-field">
            <p-checkbox inputId="ubicacion-permite-reserva" formControlName="permiteReserva" [binary]="true" />
            <label for="ubicacion-permite-reserva">Permite reserva</label>
          </div>
          <div class="checkbox-field">
            <p-checkbox inputId="ubicacion-permite-cuarentena" formControlName="permiteCuarentena" [binary]="true" />
            <label for="ubicacion-permite-cuarentena">Permite cuarentena</label>
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
    .filters { margin-bottom: 1rem; }
    .loading-center { display: grid; place-items: center; padding: 3rem; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
    .form-grid { display: grid; gap: 1rem; }
    .field { display: grid; gap: 0.35rem; }
    .field label { font-size: 0.85rem; font-weight: 600; }
    .field input, .field p-select, .field p-inputnumber { width: 100%; }
    .field-error { color: var(--p-red-500); font-size: 0.8rem; }
    .required { color: var(--p-red-500); }
    .field-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
    .field-section { border-top: 1px solid var(--p-surface-200); padding-top: 0.75rem; margin-top: 0.25rem; }
    .field-section-title { font-size: 0.875rem; }
    .field-section-copy { color: var(--p-text-muted-color); font-size: 0.8rem; display: block; margin-top: 0.15rem; }
    .field-surface { background: var(--p-surface-50); border-radius: 8px; padding: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .checkbox-field { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
    .action-buttons { display: flex; gap: 0.25rem; justify-content: flex-end; }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 1rem; }
      .field-row { grid-template-columns: 1fr; }
    }
  `],
})
export class UbicacionesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly bodegaService = inject(BodegaService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly selectBodegaMessage = UI_MESSAGES.SELECT_BODEGA;
  readonly requiredFieldMessage = UI_MESSAGES.REQUIRED_FIELD;
  readonly bodegas = signal<BodegaResponse[]>([]);
  readonly ubicaciones = signal<UbicacionResponse[]>([]);
  readonly rows = computed<UbicacionRow[]>(() =>
    this.ubicaciones().map(item => ({
      ...item,
      codigoBarrasLabel: item.codigoBarras || this.emptyValue,
      tipoUbicacionLabel: item.tipoUbicacion || 'GENERAL',
    })),
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly submitted = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly bodegaControl = new FormControl<number | null>(null);

  dialogoVisible = false;

  readonly tipoZonaOpciones = [...TIPO_ZONA_OPCIONES];

  readonly form: UbicacionForm = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    codigoBarras: new FormControl('', { nonNullable: true }),
    tipoUbicacion: new FormControl('', { nonNullable: true }),
    zona: new FormControl('', { nonNullable: true }),
    subzona: new FormControl('', { nonNullable: true }),
    pasillo: new FormControl('', { nonNullable: true }),
    estante: new FormControl('', { nonNullable: true }),
    nivel: new FormControl('', { nonNullable: true }),
    posicion: new FormControl('', { nonNullable: true }),
    tipoZona: new FormControl('', { nonNullable: true }),
    ambiente: new FormControl('', { nonNullable: true }),
    anchoCm: new FormControl<number | null>(null),
    altoCm: new FormControl<number | null>(null),
    profundidadCm: new FormControl<number | null>(null),
    volumenMaximoM3: new FormControl<number | null>(null),
    pesoMaximoKg: new FormControl<number | null>(null),
    permitePicking: new FormControl(true, { nonNullable: true }),
    permiteReserva: new FormControl(true, { nonNullable: true }),
    permiteCuarentena: new FormControl(false, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.bodegaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: bodegas => this.bodegas.set(bodegas),
      error: (err: any) => this.error.set(err?.userMessage ?? UI_MESSAGES.LOAD_BODEGAS),
    });

    this.bodegaControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(bodegaId => {
        this.ubicaciones.set([]);
        this.error.set(null);

        if (bodegaId) {
          this.cargar(bodegaId);
        }
      });
  }

  cargar(bodegaId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.ubicacionService.listarPorBodega(bodegaId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.ubicaciones.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.userMessage ?? UI_MESSAGES.LOAD_UBICACIONES);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    this.resetDialog();
    this.editingId.set(null);
    this.dialogoVisible = true;
  }

  abrirEdicion(ubicacion: UbicacionResponse): void {
    this.resetDialog();
    this.editingId.set(ubicacion.id);
    this.form.patchValue({
      codigo: ubicacion.codigo,
      nombre: ubicacion.nombre,
      codigoBarras: ubicacion.codigoBarras ?? '',
      tipoUbicacion: ubicacion.tipoUbicacion ?? '',
      zona: ubicacion.zona ?? '',
      subzona: ubicacion.subzona ?? '',
      pasillo: ubicacion.pasillo ?? '',
      estante: ubicacion.estante ?? '',
      nivel: ubicacion.nivel ?? '',
      posicion: ubicacion.posicion ?? '',
      tipoZona: ubicacion.tipoZona ?? '',
      ambiente: ubicacion.ambiente ?? '',
      anchoCm: ubicacion.anchoCm ?? null,
      altoCm: ubicacion.altoCm ?? null,
      profundidadCm: ubicacion.profundidadCm ?? null,
      volumenMaximoM3: ubicacion.volumenMaximoM3 ?? null,
      pesoMaximoKg: ubicacion.pesoMaximoKg ?? null,
      permitePicking: ubicacion.permitePicking ?? true,
      permiteReserva: ubicacion.permiteReserva ?? true,
      permiteCuarentena: ubicacion.permiteCuarentena ?? false,
    });
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
      this.ubicacionService.actualizar(id, this.buildUpdateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Ubicación actualizada', detail: UI_MESSAGES.UPDATE_UBICACION_SUCCESS });
          this.resetDialog();
          this.recargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.UPDATE_UBICACION);
          this.guardando.set(false);
        },
      });
    } else {
      this.ubicacionService.crear(this.buildCreateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Ubicación creada', detail: UI_MESSAGES.CREATE_UBICACION_SUCCESS });
          this.resetDialog();
          this.recargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.CREATE_UBICACION);
          this.guardando.set(false);
        },
      });
    }
  }

  confirmarDesactivar(ubicacion: UbicacionResponse): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas desactivar esta ubicación? Esta acción no se puede deshacer.',
      header: `Desactivar ${ubicacion.nombre}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.desactivar(ubicacion.id),
    });
  }

  resetDialog(): void {
    this.form.reset({
      codigo: '', nombre: '', codigoBarras: '', tipoUbicacion: '',
      zona: '', subzona: '', pasillo: '', estante: '', nivel: '', posicion: '', tipoZona: '', ambiente: '',
      anchoCm: null, altoCm: null, profundidadCm: null, volumenMaximoM3: null, pesoMaximoKg: null,
      permitePicking: true, permiteReserva: true, permiteCuarentena: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitted.set(false);
    this.saveError.set(null);
    this.editingId.set(null);
  }

  private recargar(): void {
    const bodegaId = this.bodegaControl.value;
    if (bodegaId) {
      this.cargar(bodegaId);
    }
  }

  private desactivar(id: number): void {
    this.ubicacionService.desactivar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Ubicación desactivada', detail: 'La ubicación fue desactivada correctamente.' });
        this.recargar();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.userMessage ?? 'No se pudo desactivar la ubicación. Intenta de nuevo.' });
      },
    });
  }

  private buildCreateRequest(): CrearUbicacionRequest {
    const v = this.form.getRawValue();
    return {
      bodegaId: this.bodegaControl.value!,
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      codigoBarras: this.opt(v.codigoBarras),
      tipoUbicacion: this.opt(v.tipoUbicacion),
      zona: this.opt(v.zona),
      subzona: this.opt(v.subzona),
      pasillo: this.opt(v.pasillo),
      estante: this.opt(v.estante),
      nivel: this.opt(v.nivel),
      posicion: this.opt(v.posicion),
      tipoZona: this.opt(v.tipoZona),
      ambiente: this.opt(v.ambiente),
      anchoCm: v.anchoCm ?? undefined,
      altoCm: v.altoCm ?? undefined,
      profundidadCm: v.profundidadCm ?? undefined,
      volumenMaximoM3: v.volumenMaximoM3 ?? undefined,
      pesoMaximoKg: v.pesoMaximoKg ?? undefined,
      permitePicking: v.permitePicking,
      permiteReserva: v.permiteReserva,
      permiteCuarentena: v.permiteCuarentena,
    };
  }

  private buildUpdateRequest(): ActualizarUbicacionRequest {
    const v = this.form.getRawValue();
    return {
      nombre: v.nombre.trim(),
      codigoBarras: this.opt(v.codigoBarras),
      tipoUbicacion: this.opt(v.tipoUbicacion),
      zona: this.opt(v.zona),
      subzona: this.opt(v.subzona),
      pasillo: this.opt(v.pasillo),
      estante: this.opt(v.estante),
      nivel: this.opt(v.nivel),
      posicion: this.opt(v.posicion),
      tipoZona: this.opt(v.tipoZona),
      ambiente: this.opt(v.ambiente),
      anchoCm: v.anchoCm ?? undefined,
      altoCm: v.altoCm ?? undefined,
      profundidadCm: v.profundidadCm ?? undefined,
      volumenMaximoM3: v.volumenMaximoM3 ?? undefined,
      pesoMaximoKg: v.pesoMaximoKg ?? undefined,
      permitePicking: v.permitePicking,
      permiteReserva: v.permiteReserva,
      permiteCuarentena: v.permiteCuarentena,
    };
  }

  private opt(value: string): string | undefined {
    const t = value.trim();
    return t || undefined;
  }
}
