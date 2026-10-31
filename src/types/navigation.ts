import type { ComponentType } from "react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}
