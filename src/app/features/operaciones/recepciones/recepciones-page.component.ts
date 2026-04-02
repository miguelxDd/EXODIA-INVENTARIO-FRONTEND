import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { UI_MESSAGES } from '@core/constants';
import { RecepcionService } from '@core/services';
import { RecepcionResponse, PaginaResponse } from '@core/models';

type RecepcionRow = RecepcionResponse & {
  lineCount: number;
};

@Component({
  selector: 'app-recepciones-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TableModule, ButtonModule, TagModule, MessageModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Recepciones</h1>
        <p>Recepcion de inventario en bodegas</p>
      </div>
      <p-button label="Nueva Recepcion" icon="pi pi-plus" />
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
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{first} - {last} de {totalRecords}"
        [rowHover]="true"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Numero</th>
            <th>Tipo</th>
            <th>Bodega</th>
            <th>Estado</th>
            <th>Lineas</th>
            <th>Fecha</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td><code>{{ r.numeroRecepcion }}</code></td>
            <td>{{ r.tipoRecepcion }}</td>
            <td>{{ r.bodegaId }}</td>
            <td><p-tag [value]="r.estado" severity="info" /></td>
            <td>{{ r.lineCount }}</td>
            <td>{{ r.creadoEn | date:'short' }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="empty-msg">No hay recepciones registradas.</td></tr>
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
export class RecepcionesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recepcionService = inject(RecepcionService);

  readonly datos = signal<PaginaResponse<RecepcionResponse>>({
    contenido: [], pagina: 0, tamanio: 20, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true
  });
  readonly rows = computed<RecepcionRow[]>(() =>
    this.datos().contenido.map(item => ({
      ...item,
      lineCount: item.lineas?.length ?? 0,
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
    this.recepcionService.listar(pagina).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.datos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(UI_MESSAGES.LOAD_RECEPCIONES);
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
