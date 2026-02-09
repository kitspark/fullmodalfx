/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createFullModalFX } from "../src/index";

const setupDom = () => {
  document.body.innerHTML = `
    <a id="trigger-a" href="#modal-a" data-modal-trigger>Open A</a>
    <a id="trigger-b" href="#modal-b" data-modal-trigger>Open B</a>
    <div id="modal-a">
      <div class="fmfx-modal__content">
        <button data-modal-close>Close</button>
        <button id="focus-a">Focusable A</button>
      </div>
    </div>
    <div id="modal-b">
      <div class="fmfx-modal__content">
        <button data-modal-close>Close</button>
        <button id="focus-b">Focusable B</button>
      </div>
    </div>
  `;
};

beforeEach(() => {
  setupDom();
});

const dispatchAnimationEnd = (element: HTMLElement) => {
  element.dispatchEvent(new Event("animationend"));
};

describe("FullModalFX", () => {
  it("opens and closes a modal", () => {
    const instance = createFullModalFX({ trigger: "#trigger-a" });
    const modal = document.querySelector<HTMLElement>("#modal-a")!;

    instance.open();
    expect(modal.classList.contains("fmfx-modal--on")).toBe(true);

    dispatchAnimationEnd(modal);

    instance.close();
    expect(modal.classList.contains("fmfx-modal--off")).toBe(true);
    dispatchAnimationEnd(modal);
    expect(modal.style.opacity).toBe("0");
  });

  it("closes the previous modal when opening another", () => {
    const first = createFullModalFX({ trigger: "#trigger-a" });
    const second = createFullModalFX({ trigger: "#trigger-b" });
    const modalA = document.querySelector<HTMLElement>("#modal-a")!;
    const modalB = document.querySelector<HTMLElement>("#modal-b")!;

    first.open();
    dispatchAnimationEnd(modalA);

    second.open();

    expect(modalA.classList.contains("fmfx-modal--off")).toBe(true);
    expect(modalB.classList.contains("fmfx-modal--on")).toBe(true);
  });

  it("fires lifecycle callbacks", () => {
    const beforeOpen = vi.fn();
    const afterOpen = vi.fn();
    const beforeClose = vi.fn();
    const afterClose = vi.fn();
    const instance = createFullModalFX({
      trigger: "#trigger-a",
      beforeOpen,
      afterOpen,
      beforeClose,
      afterClose
    });
    const modal = document.querySelector<HTMLElement>("#modal-a")!;

    instance.open();
    expect(beforeOpen).toHaveBeenCalledOnce();
    dispatchAnimationEnd(modal);
    expect(afterOpen).toHaveBeenCalledOnce();

    instance.close();
    expect(beforeClose).toHaveBeenCalledOnce();
    dispatchAnimationEnd(modal);
    expect(afterClose).toHaveBeenCalledOnce();
  });
});
