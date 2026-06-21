// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSuperHover } from "./index";

type PointerMoveInit = {
  x?: number;
  y?: number;
  pointerType?: string;
  buttons?: number;
};

const activeAttribute = "data-super-hover-active";

let hitTarget: Element | null;
let frameId: number;
let frames: Array<{ id: number; callback: FrameRequestCallback }>;

beforeEach(() => {
  document.body.innerHTML = "";
  hitTarget = null;
  frameId = 0;
  frames = [];

  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: vi.fn(() => hitTarget),
  });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frameId += 1;
    frames.push({ id: frameId, callback });
    return frameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames = frames.filter((frame) => frame.id !== id);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createPointerMove({
  x = 10,
  y = 20,
  pointerType = "mouse",
  buttons = 0,
}: PointerMoveInit = {}) {
  const event = new Event("pointermove") as PointerEvent;

  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerType: { value: pointerType },
    buttons: { value: buttons },
  });

  return event;
}

function createPointerEvent(
  type: "pointerdown" | "pointerup",
  {
    x = 10,
    y = 20,
    pointerType = "mouse",
    buttons = type === "pointerdown" ? 1 : 0,
  }: PointerMoveInit = {},
) {
  const event = new Event(type) as PointerEvent;

  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerType: { value: pointerType },
    buttons: { value: buttons },
  });

  return event;
}

function flushFrame() {
  const [frame] = frames.splice(0, 1);

  frame?.callback(16);
}

function createTarget(label: string) {
  const target = document.createElement("button");

  target.dataset.superHover = "";
  target.textContent = label;
  document.body.append(target);

  return target;
}

describe("createSuperHover", () => {
  it("activates the hit data-super-hover element and dispatches enter and move events", () => {
    const target = createTarget("Target");
    const enter = vi.fn();
    const move = vi.fn();

    target.addEventListener("superhoverenter", enter);
    target.addEventListener("superhovermove", move);
    hitTarget = target;

    const controller = createSuperHover();
    window.dispatchEvent(createPointerMove({ x: 12, y: 34 }));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(move).toHaveBeenCalledTimes(1);
    expect(enter.mock.calls[0]?.[0]).toMatchObject({
      detail: {
        x: 12,
        y: 34,
        previous: null,
        current: target,
      },
    });

    controller.destroy();
  });

  it("moves active state from the previous target to the next target", () => {
    const previous = createTarget("Previous");
    const next = createTarget("Next");
    const previousLeave = vi.fn();
    const nextEnter = vi.fn();

    previous.addEventListener("superhoverleave", previousLeave);
    next.addEventListener("superhoverenter", nextEnter);

    hitTarget = previous;
    const controller = createSuperHover();
    window.dispatchEvent(createPointerMove());
    flushFrame();

    hitTarget = next;
    controller.refresh();
    flushFrame();

    expect(previous.hasAttribute(activeAttribute)).toBe(false);
    expect(next.hasAttribute(activeAttribute)).toBe(true);
    expect(previousLeave).toHaveBeenCalledTimes(1);
    expect(nextEnter).toHaveBeenCalledTimes(1);
    expect(previousLeave.mock.calls[0]?.[0]).toMatchObject({
      detail: { previous, current: next },
    });
    expect(nextEnter.mock.calls[0]?.[0]).toMatchObject({
      detail: { previous, current: next },
    });

    controller.destroy();
  });

  it("ignores touch pointer moves by default", () => {
    const target = createTarget("Touch target");
    const enter = vi.fn();

    target.addEventListener("superhoverenter", enter);
    hitTarget = target;

    const controller = createSuperHover();
    window.dispatchEvent(createPointerMove({ pointerType: "touch" }));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(false);
    expect(enter).not.toHaveBeenCalled();

    controller.destroy();
  });

  it("accepts touch when pointerTypes opts into it", () => {
    const target = createTarget("Touch target");

    hitTarget = target;

    const controller = createSuperHover({ pointerTypes: ["touch"] });
    window.dispatchEvent(createPointerMove({ pointerType: "touch" }));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);

    controller.destroy();
  });

  it("keeps hover active while a pointer button is down by default", () => {
    const target = createTarget("Pressed target");

    hitTarget = target;

    const controller = createSuperHover();
    window.dispatchEvent(createPointerMove({ buttons: 1 }));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);

    controller.destroy();
  });

  it("clears hover while an allowed pointer is down when opted in", () => {
    const target = createTarget("Selectable target");
    const leave = vi.fn();
    const enter = vi.fn();

    target.addEventListener("superhoverleave", leave);
    target.addEventListener("superhoverenter", enter);
    hitTarget = target;

    const controller = createSuperHover({ disableWhilePointerDown: true });
    window.dispatchEvent(createPointerMove());
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);
    expect(enter).toHaveBeenCalledTimes(1);

    window.dispatchEvent(createPointerEvent("pointerdown"));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(false);
    expect(leave).toHaveBeenCalledTimes(1);

    window.dispatchEvent(createPointerMove({ buttons: 1 }));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(false);
    expect(enter).toHaveBeenCalledTimes(1);

    window.dispatchEvent(createPointerEvent("pointerup"));
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);
    expect(enter).toHaveBeenCalledTimes(2);

    controller.destroy();
  });

  it("pauses, resumes, and destroys without leaving the active attribute behind", () => {
    const target = createTarget("Lifecycle target");
    const leave = vi.fn();

    target.addEventListener("superhoverleave", leave);
    hitTarget = target;

    const controller = createSuperHover();
    window.dispatchEvent(createPointerMove());
    flushFrame();

    controller.pause();

    expect(target.hasAttribute(activeAttribute)).toBe(false);
    expect(leave).toHaveBeenCalledTimes(1);

    controller.resume();
    flushFrame();

    expect(target.hasAttribute(activeAttribute)).toBe(true);

    controller.destroy();

    expect(target.hasAttribute(activeAttribute)).toBe(false);
  });

  it("briefly activates crossed elements when sweptHitTest is enabled", () => {
    const a = createTarget("A");
    const b = createTarget("B");
    const c = createTarget("C");

    const rectFor = (top: number) =>
      ({
        left: 0,
        right: 100,
        top,
        bottom: top + 10,
        width: 100,
        height: 10,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;

    a.getBoundingClientRect = () => rectFor(0);
    b.getBoundingClientRect = () => rectFor(10);
    c.getBoundingClientRect = () => rectFor(20);

    const enters: string[] = [];
    for (const target of [a, b, c]) {
      target.addEventListener("superhoverenter", () => {
        enters.push(target.textContent ?? "");
      });
    }

    hitTarget = a;
    const controller = createSuperHover({
      root: document.body,
      sweptHitTest: true,
    });

    window.dispatchEvent(createPointerMove({ x: 50, y: 5 }));
    flushFrame();

    hitTarget = c;
    window.dispatchEvent(createPointerMove({ x: 50, y: 25 }));
    flushFrame();

    expect(enters).toEqual(expect.arrayContaining(["A", "B", "C"]));
    expect(c.hasAttribute(activeAttribute)).toBe(true);

    controller.destroy();
  });

  it("briefly activates rows that scroll through a fixed pointer when sweptHitTest is enabled", () => {
    const a = createTarget("A");
    const b = createTarget("B");
    const c = createTarget("C");

    const rectFor = (top: number) =>
      ({
        left: 0,
        right: 100,
        top,
        bottom: top + 10,
        width: 100,
        height: 10,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;

    let aTop = 40;
    let bTop = 50;
    let cTop = 60;

    a.getBoundingClientRect = () => rectFor(aTop);
    b.getBoundingClientRect = () => rectFor(bTop);
    c.getBoundingClientRect = () => rectFor(cTop);

    const enters: string[] = [];
    for (const target of [a, b, c]) {
      target.addEventListener("superhoverenter", () => {
        enters.push(target.textContent ?? "");
      });
    }

    hitTarget = b;
    const controller = createSuperHover({
      root: document.body,
      sweptHitTest: true,
    });

    window.dispatchEvent(createPointerMove({ x: 50, y: 45 }));
    flushFrame();

    aTop = 20;
    bTop = 30;
    cTop = 40;
    hitTarget = c;
    controller.refresh();
    flushFrame();

    expect(enters).toEqual(expect.arrayContaining(["A", "B", "C"]));

    controller.destroy();
  });
});
