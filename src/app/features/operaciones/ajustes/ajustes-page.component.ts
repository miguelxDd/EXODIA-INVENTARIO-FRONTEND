import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { UI_MESSAGES } from '@core/constants';
import { AjusteService } from '@core/services';
import { AjusteResponse, PaginaResponse } from '@core/models';

type AjusteRow = AjusteResponse & {
  lineCount: number;
  motivoLabel: string;
};

@Component({
  selector: 'app-ajustes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Ajustes</h1>
        <p>Ajustes de inventario (cantidad y precio)</p>
      </div>
      <p-button label="Nuevo Ajuste" icon="pi pi-plus" />
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
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Fecha</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-a>
          <tr>
            <td><code>{{ a.numeroAjuste }}</code></td>
            <td>{{ a.tipoAjusteNombre }}</td>
            <td>{{ a.bodegaId }}</td>
            <td>{{ a.motivoLabel }}</td>
            <td><p-tag [value]="a.estado" severity="info" /></td>
            <td>{{ a.lineCount }}</td>
            <td>{{ a.creadoEn | date:'short' }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="empty-msg">No hay ajustes registrados.</td></tr>
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
export class AjustesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ajusteService = inject(AjusteService);

  readonly emptyValue = UI_MESSAGES.EMPTY_VALUE;
  readonly datos = signal<PaginaResponse<AjusteResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<AjusteRow[]>(() =>
    this.datos().contenido.map(item => ({
      ...item,
      lineCount: item.lineas?.length ?? 0,
      motivoLabel: item.motivo || this.emptyValue,
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
    this.ajusteService.listar(pagina).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_AJUSTES);
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
