// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSuperHover } from "./index";

type PointerMoveInit = {
  x?: number;
  y?: number;
  pointerType?: string;
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
}: PointerMoveInit = {}) {
  const event = new Event("pointermove") as PointerEvent;

  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerType: { value: pointerType },
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
});
