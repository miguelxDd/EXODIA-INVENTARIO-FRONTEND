import { Injectable, signal } from '@angular/core';
import { APP_CONSTANTS } from '@core/constants';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  readonly currentCompanyId = signal<number | null>(this.readCompanyId());

  setCompanyId(companyId: number): void {
    this.persist(companyId);
  }

  resetToDefault(): void {
    this.persist(this.defaultCompanyId());
  }

  clear(): void {
    this.persist(null);
  }

  private defaultCompanyId(): number | null {
    return environment.defaultEmpresaId || null;
  }

  private readCompanyId(): number | null {
    if (typeof window === 'undefined') {
      return this.defaultCompanyId();
    }

    const storedValue = window.localStorage.getItem(APP_CONSTANTS.EMPRESA_ID_KEY);
    const parsedStoredValue = storedValue ? Number(storedValue) : NaN;

    if (Number.isInteger(parsedStoredValue) && parsedStoredValue > 0) {
      return parsedStoredValue;
    }

    return this.defaultCompanyId();
  }

  private persist(companyId: number | null): void {
    if (typeof window !== 'undefined') {
      if (companyId && companyId > 0) {
        window.localStorage.setItem(APP_CONSTANTS.EMPRESA_ID_KEY, String(companyId));
      } else {
        window.localStorage.removeItem(APP_CONSTANTS.EMPRESA_ID_KEY);
      }
    }

    this.currentCompanyId.set(companyId);
  }
}
