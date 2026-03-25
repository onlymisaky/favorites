import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";
import {
  clampPosition,
  getDefaultPanelPosition,
  getEventPoint,
} from "../utils/panelPosition";

const panelStorageKey = "favorites-doc-manager-position";

export function useDraggablePanel(
  panelRef: Ref<HTMLElement | null>,
  isVisible: Ref<boolean>,
  isMoveDialogOpen: Ref<boolean>,
  isSummaryDialogOpen: Ref<boolean>,
) {
  const panelPosition = ref<{ x: number; y: number } | null>(null);
  const isDragging = ref(false);
  const dragOffset = ref({ x: 0, y: 0 });

  const panelStyle = computed(() => {
    if (!panelPosition.value) {
      return {};
    }

    return {
      left: `${panelPosition.value.x}px`,
      top: `${panelPosition.value.y}px`,
      right: "auto",
      bottom: "auto",
    };
  });

  watch(
    isVisible,
    (visible) => {
      if (visible) {
        restorePanelPosition();
        requestAnimationFrame(() => {
          clampPanelToViewport();
        });
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    window.addEventListener("resize", handleWindowResize);
    restorePanelPosition();
    requestAnimationFrame(() => {
      clampPanelToViewport();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleWindowResize);
    stopDragging();
  });

  function handleDragStart(event: MouseEvent | TouchEvent) {
    if (
      !panelRef.value ||
      isMoveDialogOpen.value ||
      isSummaryDialogOpen.value
    ) {
      return;
    }

    const point = getEventPoint(event);

    if (!point) {
      return;
    }

    const rect = panelRef.value.getBoundingClientRect();
    panelPosition.value = {
      x: rect.left,
      y: rect.top,
    };
    dragOffset.value = {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
    isDragging.value = true;

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", stopDragging);
  }

  function handleDragMove(event: MouseEvent | TouchEvent) {
    if (!isDragging.value || !panelRef.value) {
      return;
    }

    const point = getEventPoint(event);

    if (!point) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    panelPosition.value = clampPosition(
      panelRef,
      point.clientX - dragOffset.value.x,
      point.clientY - dragOffset.value.y,
    );
  }

  function stopDragging() {
    if (isDragging.value) {
      isDragging.value = false;
      persistPanelPosition();
    }

    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", stopDragging);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", stopDragging);
  }

  function handleWindowResize() {
    clampPanelToViewport();
  }

  function restorePanelPosition() {
    if (typeof window === "undefined") {
      return;
    }

    const savedValue = window.localStorage.getItem(panelStorageKey);

    if (savedValue) {
      try {
        const parsedValue = JSON.parse(savedValue) as {
          x?: number;
          y?: number;
        };

        if (
          typeof parsedValue.x === "number" &&
          typeof parsedValue.y === "number"
        ) {
          panelPosition.value = clampPosition(
            panelRef,
            parsedValue.x,
            parsedValue.y,
          );
          return;
        }
      } catch {
        window.localStorage.removeItem(panelStorageKey);
      }
    }

    requestAnimationFrame(() => {
      const defaultPosition = getDefaultPanelPosition(panelRef);

      if (defaultPosition) {
        panelPosition.value = defaultPosition;
      }
    });
  }

  function persistPanelPosition() {
    if (!panelPosition.value || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      panelStorageKey,
      JSON.stringify(panelPosition.value),
    );
  }

  function clampPanelToViewport() {
    if (!panelPosition.value) {
      const defaultPosition = getDefaultPanelPosition(panelRef);

      if (defaultPosition) {
        panelPosition.value = defaultPosition;
      }

      return;
    }

    panelPosition.value = clampPosition(
      panelRef,
      panelPosition.value.x,
      panelPosition.value.y,
    );
    persistPanelPosition();
  }

  return {
    panelStyle,
    isDragging,
    handleDragStart,
  };
}
