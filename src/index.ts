export type FullModalFXCallback = (instance: FullModalFX) => void;

export interface FullModalFXOptions {
  modal?: string | HTMLElement;
  trigger?: string | HTMLElement;
  closeSelector?: string;
  closePreviousOnOpen?: boolean;
  zIndexIn?: number;
  zIndexOut?: number;
  opacityIn?: number;
  opacityOut?: number;
  animatedInClass?: string;
  animatedOutClass?: string;
  animationDurationMs?: number;
  beforeOpen?: FullModalFXCallback;
  afterOpen?: FullModalFXCallback;
  beforeClose?: FullModalFXCallback;
  afterClose?: FullModalFXCallback;
}

export interface OpenOptions {
  skipAnimation?: boolean;
}

const DEFAULT_OPTIONS: Required<
  Omit<
    FullModalFXOptions,
    "modal" | "trigger" | "beforeOpen" | "afterOpen" | "beforeClose" | "afterClose"
  >
> = {
  closeSelector: "[data-modal-close]",
  closePreviousOnOpen: true,
  zIndexIn: 9999,
  zIndexOut: -9999,
  opacityIn: 1,
  opacityOut: 0,
  animatedInClass: "fmfx-fade-in",
  animatedOutClass: "fmfx-fade-out",
  animationDurationMs: 200
};

const activeStack: FullModalFX[] = [];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const getScrollbarWidth = (): number => {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  outer.style.overflow = "scroll";
  outer.style.position = "absolute";
  outer.style.top = "-9999px";
  document.body.append(outer);
  const inner = document.createElement("div");
  inner.style.width = "100%";
  outer.append(inner);
  const width = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  return width;
};

const onAnimationEnd = (element: HTMLElement, callback: () => void): void => {
  const handler = () => {
    element.removeEventListener("animationend", handler);
    callback();
  };
  element.addEventListener("animationend", handler, { once: true });
};

const lockScroll = (scrollbarWidth: number): void => {
  document.documentElement.style.overflowY = "hidden";
  document.documentElement.style.marginRight = `${scrollbarWidth}px`;
};

const unlockScroll = (): void => {
  document.documentElement.style.overflowY = "";
  document.documentElement.style.marginRight = "";
};

const resolveElement = (value?: string | HTMLElement): HTMLElement | null => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return document.querySelector<HTMLElement>(value);
  }
  return value;
};

export class FullModalFX {
  private modal: HTMLElement;
  private trigger: HTMLElement | null;
  private closeSelector: string;
  private options: FullModalFXOptions;
  private previouslyFocused: HTMLElement | null = null;

  constructor(options: FullModalFXOptions) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    this.options = merged;
    this.modal = this.resolveModal(options);
    this.trigger = resolveElement(options.trigger);
    this.closeSelector = merged.closeSelector;

    this.initialize();
  }

  private resolveModal(options: FullModalFXOptions): HTMLElement {
    const direct = resolveElement(options.modal);
    if (direct) {
      return direct;
    }
    const trigger = resolveElement(options.trigger);
    if (trigger && trigger instanceof HTMLAnchorElement) {
      const target = trigger.getAttribute("href");
      if (target?.startsWith("#")) {
        const found = document.querySelector<HTMLElement>(target);
        if (found) {
          return found;
        }
      }
    }
    throw new Error("FullModalFX: modal element not found.");
  }

  private initialize(): void {
    this.modal.classList.add("fmfx-modal", "fmfx-modal--off");
    this.applyInitialStyles();
    this.bindEvents();
  }

  private applyInitialStyles(): void {
    this.modal.style.opacity = `${this.options.opacityOut}`;
    this.modal.style.zIndex = `${this.options.zIndexOut}`;
    this.modal.style.setProperty(
      "--fmfx-animation-duration",
      `${this.options.animationDurationMs}ms`
    );
  }

  private bindEvents(): void {
    if (this.trigger) {
      this.trigger.addEventListener("click", (event) => {
        event.preventDefault();
        this.open();
      });
    }

    const closeButtons = this.modal.querySelectorAll<HTMLElement>(this.closeSelector);
    closeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.close();
      });
    });
  }

  open(options: OpenOptions = {}): void {
    if (this.options.closePreviousOnOpen) {
      const current = activeStack[activeStack.length - 1];
      if (current && current !== this) {
        current.close({ skipAnimation: true });
      }
    }

    if (!activeStack.includes(this)) {
      activeStack.push(this);
    }

    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.options.beforeOpen?.(this);

    lockScroll(getScrollbarWidth());
    this.modal.classList.remove("fmfx-modal--off", this.options.animatedOutClass ?? "");
    this.modal.classList.add("fmfx-modal--on");
    this.modal.style.opacity = `${this.options.opacityIn}`;
    this.modal.style.zIndex = `${this.options.zIndexIn}`;

    if (options.skipAnimation) {
      this.options.afterOpen?.(this);
      this.focusFirstElement();
      return;
    }

    if (this.options.animatedInClass) {
      this.modal.classList.add(this.options.animatedInClass);
    }
    onAnimationEnd(this.modal, () => {
      this.options.afterOpen?.(this);
      this.focusFirstElement();
    });
  }

  close(options: OpenOptions = {}): void {
    if (!this.modal.classList.contains("fmfx-modal--on")) {
      return;
    }

    this.options.beforeClose?.(this);

    this.modal.classList.remove("fmfx-modal--on", this.options.animatedInClass ?? "");
    this.modal.classList.add("fmfx-modal--off");

    const finishClose = () => {
      this.modal.style.opacity = `${this.options.opacityOut}`;
      this.modal.style.zIndex = `${this.options.zIndexOut}`;
      this.options.afterClose?.(this);
      this.restoreFocus();
      const index = activeStack.indexOf(this);
      if (index >= 0) {
        activeStack.splice(index, 1);
      }
      if (activeStack.length === 0) {
        unlockScroll();
      }
    };

    if (options.skipAnimation) {
      finishClose();
      return;
    }

    if (this.options.animatedOutClass) {
      this.modal.classList.add(this.options.animatedOutClass);
    }
    onAnimationEnd(this.modal, finishClose);
  }

  destroy(): void {
    this.trigger?.replaceWith(this.trigger.cloneNode(true));
    const closeButtons = this.modal.querySelectorAll<HTMLElement>(this.closeSelector);
    closeButtons.forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });
    this.modal.classList.remove("fmfx-modal", "fmfx-modal--on", "fmfx-modal--off");
  }

  private focusFirstElement(): void {
    const focusable = this.modal.querySelector<HTMLElement>(focusableSelector);
    focusable?.focus();
  }

  private restoreFocus(): void {
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }
}

export const createFullModalFX = (options: FullModalFXOptions): FullModalFX =>
  new FullModalFX(options);

export const initFullModalFX = (selector = "[data-modal-trigger]"):
  | FullModalFX[]
  | [] => {
  const triggers = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return triggers.map((trigger) => new FullModalFX({ trigger }));
};
