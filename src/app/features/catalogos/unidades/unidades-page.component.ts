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
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { UnidadService } from '@core/services';
import { UI_MESSAGES } from '@core/constants';
import { UnidadResponse, CrearUnidadRequest, ActualizarUnidadRequest } from '@core/models';

type UnidadForm = FormGroup<{
  codigo: FormControl<string>;
  nombre: FormControl<string>;
  abreviatura: FormControl<string>;
}>;

type UnidadRow = UnidadResponse & {
  abreviaturaLabel: string;
};

@Component({
  selector: 'app-unidades-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
  imports: [
    ReactiveFormsModule, TableModule, ButtonModule, ConfirmDialogModule,
    DialogModule, InputTextModule, ProgressSpinnerModule, MessageModule, ToastModule, TooltipModule,
  ],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1>Unidades de Medida</h1>
        <p>Catálogo de unidades</p>
      </div>
      <p-button label="Nueva Unidad" icon="pi pi-plus" (onClick)="abrirDialogo()" />
    </div>

    @if (cargando()) {
      <div class="loading-center"><p-progressSpinner strokeWidth="3" /></div>
    } @else if (error()) {
      <p-message severity="error" [text]="error()!" />
    } @else {
      <p-table [value]="rows()" [rowHover]="true" styleClass="p-datatable-sm" >
        <ng-template pTemplate="header">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Abreviatura</th>
            <th style="width: 6rem"></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td><code>{{ u.codigo }}</code></td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.abreviaturaLabel }}</td>
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
          <tr><td colspan="4" class="empty-msg">No hay unidades registradas.</td></tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      [header]="editingId() ? 'Editar Unidad' : 'Nueva Unidad'"
      [(visible)]="dialogoVisible"
      [modal]="true"
      [style]="{ width: 'min(420px, 92vw)' }"
      (onHide)="resetDialog()"
    >
      <form class="form-grid" [formGroup]="form" (ngSubmit)="guardar()">
        @if (saveError()) {
          <p-message severity="error" [text]="saveError()!" />
        }

        <div class="field">
          <label for="unidad-codigo">Código</label>
          <input
            id="unidad-codigo"
            pInputText
            formControlName="codigo"
            [readonly]="!!editingId()"
            aria-describedby="unidad-codigo-error"
          />
          @if (form.controls.codigo.invalid && (form.controls.codigo.touched || submitted())) {
            <small id="unidad-codigo-error" class="field-error">{{ requiredFieldMessage }}</small>
          }
        </div>
        <div class="field">
          <label for="unidad-nombre">Nombre</label>
          <input id="unidad-nombre" pInputText formControlName="nombre" aria-describedby="unidad-nombre-error" />
          @if (form.controls.nombre.invalid && (form.controls.nombre.touched || submitted())) {
            <small id="unidad-nombre-error" class="field-error">{{ requiredFieldMessage }}</small>
          }
        </div>
        <div class="field">
          <label for="unidad-abreviatura">Abreviatura</label>
          <input id="unidad-abreviatura" pInputText formControlName="abreviatura" placeholder="ej. kg, m, pz" />
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
    .field { display: grid; gap: 0.35rem; }
    .field label { font-size: 0.85rem; font-weight: 600; }
    .field input { width: 100%; }
    .field-error { color: var(--p-red-500); font-size: 0.8rem; }
    .action-buttons { display: flex; gap: 0.25rem; justify-content: flex-end; }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 1rem; }
    }
  `],
})
export class UnidadesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly unidadService = inject(UnidadService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly requiredFieldMessage = UI_MESSAGES.REQUIRED_FIELD;
  readonly unidades = signal<UnidadResponse[]>([]);
  readonly rows = computed<UnidadRow[]>(() =>
    this.unidades().map(item => ({
      ...item,
      abreviaturaLabel: item.abreviatura || this.emptyValue,
    })),
  );
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly submitted = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  dialogoVisible = false;

  readonly form: UnidadForm = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    abreviatura: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.unidadService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.unidades.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.userMessage ?? UI_MESSAGES.LOAD_UNIDADES);
        this.cargando.set(false);
      },
    });
  }

  abrirDialogo(): void {
    this.resetDialog();
    this.editingId.set(null);
    this.dialogoVisible = true;
  }

  abrirEdicion(unidad: UnidadResponse): void {
    this.resetDialog();
    this.editingId.set(unidad.id);
    this.form.patchValue({
      codigo: unidad.codigo,
      nombre: unidad.nombre,
      abreviatura: unidad.abreviatura ?? '',
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
      this.unidadService.actualizar(id, this.buildUpdateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Unidad actualizada', detail: UI_MESSAGES.UPDATE_UNIDAD_SUCCESS });
          this.resetDialog();
          this.cargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.UPDATE_UNIDAD);
          this.guardando.set(false);
        },
      });
    } else {
      this.unidadService.crear(this.buildCreateRequest()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.dialogoVisible = false;
          this.guardando.set(false);
          this.messageService.add({ severity: 'success', summary: 'Unidad creada', detail: UI_MESSAGES.CREATE_UNIDAD_SUCCESS });
          this.resetDialog();
          this.cargar();
        },
        error: (err: any) => {
          this.saveError.set(err?.userMessage ?? UI_MESSAGES.CREATE_UNIDAD);
          this.guardando.set(false);
        },
      });
    }
  }

  confirmarDesactivar(unidad: UnidadResponse): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas desactivar esta unidad? Esta acción no se puede deshacer.',
      header: `Desactivar ${unidad.nombre}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.desactivar(unidad.id),
    });
  }

  resetDialog(): void {
    this.form.reset({ codigo: '', nombre: '', abreviatura: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.submitted.set(false);
    this.saveError.set(null);
    this.editingId.set(null);
  }

  private desactivar(id: number): void {
    this.unidadService.desactivar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Unidad desactivada', detail: 'La unidad fue desactivada correctamente.' });
        this.cargar();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.userMessage ?? 'No se pudo desactivar la unidad. Intenta de nuevo.' });
      },
    });
  }

  private buildCreateRequest(): CrearUnidadRequest {
    const v = this.form.getRawValue();
    return {
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      abreviatura: this.opt(v.abreviatura),
    };
  }

  private buildUpdateRequest(): ActualizarUnidadRequest {
    const v = this.form.getRawValue();
    return {
      nombre: v.nombre.trim(),
      abreviatura: this.opt(v.abreviatura),
    };
  }

  private opt(value: string): string | undefined {
    const t = value.trim();
    return t || undefined;
  }
}
