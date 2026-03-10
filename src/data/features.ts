/**
 * Single source of truth for all platform + feature data.
 * Used by Navbar, feature pages, platform hubs, and footer.
 *
 * Data is organized by platform in src/data/platforms/*.ts
 * This file re-exports everything for backward compatibility.
 */
export {
  platforms,
  getPlatform,
  getFeatureBySlug,
  getFeaturesByPlatform,
  getAllFeatures,
  getRelatedFeatures,
  icons,
  brandIcons,
} from './platforms/index';

export type {
  FAQ,
  Step,
  Benefit,
  Feature,
  Category,
  Platform,
} from './platforms/index';
