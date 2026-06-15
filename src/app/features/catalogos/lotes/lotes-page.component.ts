import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { LoteService } from '@core/services';
import { UI_MESSAGES } from '@core/constants';
import { LoteResponse, ActualizarLoteRequest } from '@core/models';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

type LoteRow = LoteResponse & {
  estadoSeverity: TagSeverity;
  fechaVencimientoLabel: string;
  proximoAVencer: boolean;
};

type EditForm = FormGroup<{
  estado: FormControl<string>;
  notas: FormControl<string>;
}>;

const ESTADO_OPCIONES = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Cuarentena', value: 'CUARENTENA' },
  { label: 'Bloqueado', value: 'BLOQUEADO' },
] as const;

const SEVERITY_MAP: Record<string, TagSeverity> = {
  ACTIVO: 'success',
  CUARENTENA: 'warn',
  BLOQUEADO: 'danger',
  VENCIDO: 'secondary',
  CONSUMIDO: 'secondary',
};

const DIAS_ALERTA = 30;

@Component({
  selector: 'app-lotes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService],
  imports: [
    ReactiveFormsModule,
    TableModule, TagModule, ButtonModule, SelectModule, DialogModule,
    ConfirmDialogModule, InputTextModule, TextareaModule,
    MessageModule, ToastModule, TooltipModule,
  ],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1>Lotes</h1>
        <p>Lotes de inventario creados durante las recepciones</p>
      </div>
      <div class="header-actions">
        <p-button
          [label]="soloVencer() ? 'Ver todos' : 'Por vencer ({{ DIAS_ALERTA }} días)'"
          [icon]="soloVencer() ? 'pi pi-list' : 'pi pi-clock'"
          [severity]="soloVencer() ? 'secondary' : 'warn'"
          [outlined]="true"
          (onClick)="toggleFiltroVencer()"
          pTooltip="Filtrar lotes próximos a vencer en los siguientes {{ DIAS_ALERTA }} días"
          tooltipPosition="left"
        />
        <p-button
          icon="pi pi-refresh"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          pTooltip="Recargar"
          tooltipPosition="left"
          (onClick)="cargar()"
        />
      </div>
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    }

    @if (cargando()) {
      <div class="loading-center">
        <span class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--p-primary-color)"></span>
      </div>
    } @else if (rows().length === 0 && !error()) {
      <p-message
        severity="info"
        [text]="soloVencer() ? 'No hay lotes próximos a vencer en los próximos ' + DIAS_ALERTA + ' días.' : 'No hay lotes registrados para esta empresa.'"
      />
    } @else {
      <p-table
        [value]="rows()"
        [rowHover]="true"
        styleClass="p-datatable-sm"
        sortField="fechaVencimiento"
        [sortOrder]="1"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="numeroLote">N.° Lote <p-sortIcon field="numeroLote" /></th>
            <th>Producto ID</th>
            <th pSortableColumn="fechaVencimiento">Vence <p-sortIcon field="fechaVencimiento" /></th>
            <th>Estado</th>
            <th>Notas</th>
            <th style="width: 5rem"></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-l>
          <tr [class.row-alert]="l.proximoAVencer">
            <td><code>{{ l.numeroLote }}</code></td>
            <td>{{ l.productoId }}</td>
            <td>
              <span [class.text-warn]="l.proximoAVencer">
                {{ l.fechaVencimientoLabel }}
                @if (l.proximoAVencer) {
                  <i class="pi pi-exclamation-triangle" style="margin-left: 0.3rem; color: var(--p-orange-500)"></i>
                }
              </span>
            </td>
            <td>
              <p-tag [value]="l.estado" [severity]="l.estadoSeverity" />
            </td>
            <td class="notes-cell">{{ l.notas || '—' }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                pTooltip="Editar estado / notas"
                tooltipPosition="top"
                (onClick)="abrirEdicion(l)"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="empty-msg">No hay lotes para mostrar.</td></tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      header="Editar lote"
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
          <label>N.° de lote</label>
          <span class="field-value">{{ editingLote()?.numeroLote }}</span>
        </div>
        <div class="field">
          <label for="lote-estado">Estado</label>
          <p-select
            inputId="lote-estado"
            formControlName="estado"
            [options]="estadoOpciones"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
          />
        </div>
        <div class="field">
          <label for="lote-notas">Notas</label>
          <textarea
            id="lote-notas"
            pTextarea
            formControlName="notas"
            rows="3"
            maxlength="500"
            placeholder="Observaciones sobre este lote"
          ></textarea>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="dialogoVisible = false" />
        <p-button
          label="Guardar"
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
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    .loading-center { display: grid; place-items: center; padding: 3rem; }
    .empty-msg { text-align: center; padding: 2rem; color: var(--p-text-muted-color); }
    code { font-size: 0.85em; background: var(--p-surface-100); padding: 0.15em 0.4em; border-radius: 4px; }
    .notes-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; color: var(--p-text-muted-color); }
    .text-warn { color: var(--p-orange-500); font-weight: 600; }
    :host ::ng-deep .row-alert td { background: var(--p-orange-50) !important; }
    .form-grid { display: grid; gap: 1rem; }
    .field { display: grid; gap: 0.35rem; }
    .field label { font-size: 0.85rem; font-weight: 600; }
    .field input, .field p-select, .field textarea { width: 100%; }
    .field-value { font-size: 0.95rem; font-weight: 500; }
    .field-error { color: var(--p-red-500); font-size: 0.8rem; }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 1rem; }
      .header-actions { width: 100%; justify-content: flex-end; }
    }
  `],
})
export class LotesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly loteService = inject(LoteService);
  private readonly messageService = inject(MessageService);

  readonly DIAS_ALERTA = DIAS_ALERTA;
  readonly estadoOpciones = [...ESTADO_OPCIONES];

  readonly lotes = signal<LoteResponse[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly editingLote = signal<LoteRow | null>(null);
  readonly soloVencer = signal(false);

  readonly rows = computed<LoteRow[]>(() =>
    this.lotes().map(l => {
      const hoy = new Date();
      const limiteAlerta = new Date(hoy.getTime() + DIAS_ALERTA * 86_400_000);
      const fechaVenc = l.fechaVencimiento ? new Date(l.fechaVencimiento) : null;
      const proximoAVencer = !!fechaVenc && fechaVenc <= limiteAlerta && l.estado !== 'VENCIDO' && l.estado !== 'CONSUMIDO';

      return {
        ...l,
        estadoSeverity: SEVERITY_MAP[l.estado] ?? 'secondary',
        fechaVencimientoLabel: l.fechaVencimiento ?? '—',
        proximoAVencer,
      };
    }),
  );

  dialogoVisible = false;

  readonly form: EditForm = new FormGroup({
    estado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    notas: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const request$ = this.soloVencer()
      ? this.loteService.listarPorVencer(DIAS_ALERTA)
      : this.loteService.listarPorEmpresa();

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.lotes.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.userMessage ?? UI_MESSAGES.LOAD_LOTES);
        this.cargando.set(false);
      },
    });
  }

  toggleFiltroVencer(): void {
    this.soloVencer.update(v => !v);
    this.cargar();
  }

  abrirEdicion(lote: LoteRow): void {
    this.resetDialog();
    this.editingLote.set(lote);
    this.form.patchValue({
      estado: lote.estado,
      notas: lote.notas ?? '',
    });
    this.dialogoVisible = true;
  }

  guardar(): void {
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editingLote()?.id;
    if (!id) { return; }

    this.guardando.set(true);
    const v = this.form.getRawValue();
    const request: ActualizarLoteRequest = {
      estado: v.estado || undefined,
      notas: v.notas || undefined,
    };

    this.loteService.actualizarEstado(id, request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.dialogoVisible = false;
        this.guardando.set(false);
        this.messageService.add({ severity: 'success', summary: 'Lote actualizado', detail: 'El estado del lote fue actualizado correctamente.' });
        this.resetDialog();
        this.cargar();
      },
      error: (err: any) => {
        this.saveError.set(err?.userMessage ?? 'No se pudo actualizar el lote. Intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  resetDialog(): void {
    this.form.reset({ estado: '', notas: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.saveError.set(null);
    this.editingLote.set(null);
  }
}
