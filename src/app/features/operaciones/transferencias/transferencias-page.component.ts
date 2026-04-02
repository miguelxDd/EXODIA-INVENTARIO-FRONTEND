import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { UI_MESSAGES } from '@core/constants';
import { TransferenciaService } from '@core/services';
import { TransferenciaResponse, PaginaResponse } from '@core/models';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
type ActionFeedback = { severity: 'success' | 'error'; text: string };
type TransferAction = 'confirm' | 'dispatch';

type TransferenciaRow = TransferenciaResponse & {
  estadoSeverity: TagSeverity;
  lineCount: number;
  canConfirm: boolean;
  canDispatch: boolean;
  confirmLoading: boolean;
  dispatchLoading: boolean;
  actionsDisabled: boolean;
};

@Component({
  selector: 'app-transferencias-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, MessageModule, TooltipModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Transferencias</h1>
        <p>Transferencias de inventario entre bodegas</p>
      </div>
      <p-button label="Nueva Transferencia" icon="pi pi-plus" />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    }

    @if (feedback()) {
      <p-message [severity]="feedback()!.severity" [text]="feedback()!.text" />
    }

    <p-table
        [value]="rows()"
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
            <td><p-tag [value]="t.estadoCodigo" [severity]="t.estadoSeverity" /></td>
            <td>{{ t.lineCount }}</td>
            <td>{{ t.creadoEn | date:'short' }}</td>
            <td>
              @if (t.canConfirm) {
                <p-button
                  icon="pi pi-check"
                  [text]="true"
                  [rounded]="true"
                  severity="success"
                  pTooltip="Confirmar"
                  ariaLabel="Confirmar transferencia"
                  [loading]="t.confirmLoading"
                  [disabled]="t.actionsDisabled"
                  (onClick)="confirmTransfer(t.id)"
                />
              }
              @if (t.canDispatch) {
                <p-button
                  icon="pi pi-send"
                  [text]="true"
                  [rounded]="true"
                  severity="info"
                  pTooltip="Despachar"
                  ariaLabel="Despachar transferencia"
                  [loading]="t.dispatchLoading"
                  [disabled]="t.actionsDisabled"
                  (onClick)="dispatchTransfer(t.id)"
                />
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
export class TransferenciasPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly estadoSeverityMap: Record<string, TagSeverity> = {
    BORRADOR: 'secondary',
    CONFIRMADO: 'info',
    DESPACHADO: 'info',
    EN_TRANSITO: 'warn',
    RECIBIDO_PARCIAL: 'warn',
    RECIBIDO_COMPLETO: 'success',
    CANCELADO: 'danger',
    CIERRE_FORZADO: 'danger',
  };

  readonly datos = signal<PaginaResponse<TransferenciaResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<TransferenciaRow[]>(() =>
    this.datos().contenido.map(item => {
      const activeAction = this.activeAction();
      const isConfirming = activeAction?.id === item.id && activeAction.type === 'confirm';
      const isDispatching = activeAction?.id === item.id && activeAction.type === 'dispatch';
      const actionsDisabled = this.cargando() || this.activeAction() !== null;

      return {
        ...item,
        estadoSeverity: this.estadoSeverityMap[item.estadoCodigo] ?? 'secondary',
        lineCount: item.lineas?.length ?? 0,
        canConfirm: item.estadoCodigo === 'BORRADOR',
        canDispatch: item.estadoCodigo === 'CONFIRMADO',
        confirmLoading: isConfirming,
        dispatchLoading: isDispatching,
        actionsDisabled,
      };
    })
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal<number | null>(null);
  readonly feedback = signal<ActionFeedback | null>(null);
  readonly activeAction = signal<{ id: number; type: TransferAction } | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.currentPage.set(pagina);
    this.transferenciaService.listar(pagina).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_TRANSFERENCIAS);
        this.cargando.set(false);
      },
    });
  }

  confirmTransfer(id: number): void {
    if (this.activeAction()) {
      return;
    }

    this.feedback.set(null);
    this.activeAction.set({ id, type: 'confirm' });

    this.transferenciaService.confirmar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: transferencia => {
        this.updateTransferencia(transferencia);
        this.feedback.set({ severity: 'success', text: UI_MESSAGES.CONFIRM_TRANSFERENCIA_SUCCESS });
        this.activeAction.set(null);
      },
      error: () => {
        this.feedback.set({ severity: 'error', text: UI_MESSAGES.CONFIRM_TRANSFERENCIA_ERROR });
        this.activeAction.set(null);
      },
    });
  }

  dispatchTransfer(id: number): void {
    if (this.activeAction()) {
      return;
    }

    this.feedback.set(null);
    this.activeAction.set({ id, type: 'dispatch' });

    this.transferenciaService.despachar(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: transferencia => {
        this.updateTransferencia(transferencia);
        this.feedback.set({ severity: 'success', text: UI_MESSAGES.DISPATCH_TRANSFERENCIA_SUCCESS });
        this.activeAction.set(null);
      },
      error: () => {
        this.feedback.set({ severity: 'error', text: UI_MESSAGES.DISPATCH_TRANSFERENCIA_ERROR });
        this.activeAction.set(null);
      },
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20));
    if (this.currentPage() !== page) {
      this.cargar(page);
    }
  }

  private updateTransferencia(updatedTransferencia: TransferenciaResponse): void {
    this.datos.update(data => ({
      ...data,
      contenido: data.contenido.map(item =>
        item.id === updatedTransferencia.id ? updatedTransferencia : item
      ),
    }));
  }
}
