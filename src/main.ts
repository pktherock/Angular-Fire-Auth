import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const loading = document.getElementById('loading');
if (loading) {
  loading.style.display = 'block';
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    if (loading) {
      loading.style.display = 'none';
    }
  });
