import type { Ref } from "vue";

const panelDefaultOffset = 24;
const panelPadding = 16;

export function getEventPoint(event: MouseEvent | TouchEvent) {
  if ("touches" in event) {
    return event.touches[0] ?? null;
  }

  return event;
}

export function clampPosition(
  panelRef: Ref<HTMLElement | null>,
  x: number,
  y: number,
) {
  if (!panelRef.value || typeof window === "undefined") {
    return { x, y };
  }

  const rect = panelRef.value.getBoundingClientRect();
  const maxX = Math.max(
    panelPadding,
    window.innerWidth - rect.width - panelPadding,
  );
  const maxY = Math.max(
    panelPadding,
    window.innerHeight - rect.height - panelPadding,
  );

  return {
    x: Math.min(Math.max(panelPadding, x), maxX),
    y: Math.min(Math.max(panelPadding, y), maxY),
  };
}

export function getDefaultPanelPosition(panelRef: Ref<HTMLElement | null>) {
  if (!panelRef.value || typeof window === "undefined") {
    return null;
  }

  const rect = panelRef.value.getBoundingClientRect();

  return clampPosition(
    panelRef,
    window.innerWidth - rect.width - panelDefaultOffset,
    window.innerHeight - rect.height - panelDefaultOffset,
  );
}
