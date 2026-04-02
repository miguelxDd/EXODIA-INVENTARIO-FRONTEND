import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { UI_MESSAGES } from '@core/constants';
import { ConteoFisicoService } from '@core/services';
import { ConteoFisicoResponse, PaginaResponse } from '@core/models';

type ConteoSeverity = 'success' | 'danger' | 'info';

type ConteoRow = ConteoFisicoResponse & {
  estadoSeverity: ConteoSeverity;
  lineCount: number;
  ajusteGeneradoLabel: string;
  canApply: boolean;
};

@Component({
  selector: 'app-conteos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, MessageModule, TooltipModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Conteos Fisicos</h1>
        <p>Conteo fisico de inventario con generacion de ajustes</p>
      </div>
      <p-button label="Nuevo Conteo" icon="pi pi-plus" />
    </div>

    @if (error()) {
      <p-message severity="error" [text]="error()!" />
    }

    <p-table
        [value]="rows()"
        [loading]="cargando()"
        [paginator]="true"
        [rows]="20"
        [totalRecords]="datos().totalElementos"
        [lazy]="true"
        (onLazyLoad)="onPageChange($event)"
        [rowHover]="true"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Numero</th>
            <th>Bodega</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Ajuste Generado</th>
            <th>Fecha Conteo</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-c>
          <tr>
            <td><code>{{ c.numeroConteo }}</code></td>
            <td>{{ c.bodegaId }}</td>
            <td><p-tag [value]="c.estado" [severity]="c.estadoSeverity" /></td>
            <td>{{ c.lineCount }}</td>
            <td>{{ c.ajusteGeneradoLabel }}</td>
            <td>{{ c.fechaConteo | date:'short' }}</td>
            <td>
              @if (c.canApply) {
                <p-button icon="pi pi-check" [text]="true" [rounded]="true" severity="success" pTooltip="Aplicar" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-msg">No hay conteos fisicos.</td></tr>
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
export class ConteosPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly conteoService = inject(ConteoFisicoService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly datos = signal<PaginaResponse<ConteoFisicoResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<ConteoRow[]>(() =>
    this.datos().contenido.map(item => ({
      ...item,
      estadoSeverity: item.estado === 'APLICADO' ? 'success' : item.estado === 'CANCELADO' ? 'danger' : 'info',
      lineCount: item.lineas?.length ?? 0,
      ajusteGeneradoLabel: item.ajusteGeneradoId ? `#${item.ajusteGeneradoId}` : this.emptyValue,
      canApply: item.estado === 'EN_PROGRESO',
    }))
  );
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set(null);
    this.currentPage.set(pagina);
    this.conteoService.listar(pagina).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_CONTEOS);
        this.cargando.set(false);
      },
    });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20));
    if (this.currentPage() !== page) {
      this.cargar(page);
    }
  }
}
