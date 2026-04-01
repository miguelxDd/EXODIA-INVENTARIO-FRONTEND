import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from './core/services/theme.service';

type TagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MessageModule,
    SkeletonModule,
    TagModule,
    ToggleSwitchModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly theme = inject(ThemeService);

  protected readonly stack: { value: string; severity: TagSeverity }[] = [
    { value: 'Angular 21', severity: 'contrast' },
    { value: 'PrimeNG 21', severity: 'success' },
    { value: 'SSR Ready', severity: 'info' },
    { value: 'Responsive', severity: 'warn' }
  ];

  protected readonly checkpoints: string[] = [
    'Reutilizar componentes, servicios y estilos antes de crear piezas nuevas.',
    'Conservar la paleta actual con tokens centralizados y sin colores sueltos.',
    'Mostrar loading, empty state, fallback y errores claros en cada flujo.',
    'Mantener layouts fluidos para mobile, tablet y desktop desde el inicio.'
  ];

  protected readonly suggestedAreas: string[] = [
    'Layout principal',
    'Inventario',
    'Productos',
    'Reportes'
  ];

  protected readonly nextModules: string[] = [];

  get darkModeEnabled(): boolean {
    return this.theme.isDark();
  }

  set darkModeEnabled(value: boolean) {
    this.theme.setMode(value ? 'dark' : 'light');
  }
}
