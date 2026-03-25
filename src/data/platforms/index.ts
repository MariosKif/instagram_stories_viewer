/**
 * Re-exports all platform data and types from a single entry point.
 */
export type { FAQ, Step, Benefit, Feature, Category, Platform } from './types';
export { icons, brandIcons } from './types';

export { instagram } from './instagram';

import { instagram } from './instagram';
import type { Platform, Category, Feature } from './types';

export const platforms: Platform[] = [instagram];

// ─── Helpers ─────────────────────────────────────────────

export function getPlatform(platformId: string): Platform | undefined {
  return platforms.find(p => p.id === platformId);
}

export function getFeatureBySlug(platformId: string, slug: string): { platform: Platform; category: Category; feature: Feature } | undefined {
  const platform = getPlatform(platformId);
  if (!platform) return undefined;
  for (const category of platform.categories) {
    const feature = category.features.find(f => f.slug === slug);
    if (feature) return { platform, category, feature };
  }
  return undefined;
}

export function getFeaturesByPlatform(platformId: string): { category: Category; feature: Feature }[] {
  const platform = getPlatform(platformId);
  if (!platform) return [];
  const results: { category: Category; feature: Feature }[] = [];
  for (const category of platform.categories) {
    for (const feature of category.features) {
      results.push({ category, feature });
    }
  }
  return results;
}

export function getAllFeatures(): { platform: Platform; category: Category; feature: Feature }[] {
  const results: { platform: Platform; category: Category; feature: Feature }[] = [];
  for (const platform of platforms) {
    for (const category of platform.categories) {
      for (const feature of category.features) {
        results.push({ platform, category, feature });
      }
    }
  }
  return results;
}

export function getRelatedFeatures(platformId: string, currentSlug: string, limit = 4): Feature[] {
  const platform = getPlatform(platformId);
  if (!platform) return [];
  const all: Feature[] = [];
  for (const cat of platform.categories) {
    for (const f of cat.features) {
      if (f.slug !== currentSlug) all.push(f);
    }
  }
  return all.slice(0, limit);
}
