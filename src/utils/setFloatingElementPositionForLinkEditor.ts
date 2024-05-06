// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/setFloatingElemPositionForLinkEditor.ts
const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export default function setFloatingElementPositionForLinkEditor(
  targetRect: DOMRect | null,
  floatingElement: HTMLElement,
  anchorElement: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET
): void {
  const scrollerElement = anchorElement.parentElement;

  if (targetRect === null || !scrollerElement) {
    floatingElement.style.opacity = '0';
    floatingElement.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const floatingElementRect = floatingElement.getBoundingClientRect();
  const anchorElementRect = anchorElement.getBoundingClientRect();
  const editorScrollerRect = scrollerElement.getBoundingClientRect();

  let top = targetRect.top - verticalGap;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.top) {
    top += floatingElementRect.height + targetRect.height + verticalGap * 2;
  }

  if (left + floatingElementRect.width > editorScrollerRect.right) {
    left =
      editorScrollerRect.right - floatingElementRect.width - horizontalOffset;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElement.style.opacity = '1';
  floatingElement.style.transform = `translate(${left}px, ${top}px)`;
}
