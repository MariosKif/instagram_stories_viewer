/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    lang: import('./i18n/utils').Language;
    t: Record<string, any>;
  }
}
