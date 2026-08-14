import { useCallback, useState, type PointerEvent as ReactPointerEvent } from "react";

const MIN_PANEL = 180;

export function useResizablePanels() {
  const [leftWidth, setLeftWidth] = useState(280);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startWidth = leftWidth;

      const onMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        setLeftWidth(Math.max(MIN_PANEL, startWidth + delta));
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [leftWidth],
  );

  return { leftWidth, startResize };
}
