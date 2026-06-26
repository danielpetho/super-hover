// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  candidatesNearPointer,
  elementsCrossedByPointerMotion,
  elementsCrossedBySegment,
  lineSegmentIntersectsRect,
  readRects,
} from "./swept-hit-test.js";

describe("lineSegmentIntersectsRect", () => {
  const rect = { left: 0, right: 100, top: 10, bottom: 20 };

  it("detects a segment that crosses the rectangle", () => {
    expect(lineSegmentIntersectsRect(50, 0, 50, 30, rect)).toBeCloseTo(1 / 3);
  });

  it("returns null when the segment misses", () => {
    expect(lineSegmentIntersectsRect(200, 0, 200, 30, rect)).toBeNull();
  });
});

describe("elementsCrossedBySegment", () => {
  it("returns crossed elements in path order", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const c = document.createElement("div");

    a.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 100,
        top: 0,
        bottom: 10,
        width: 100,
        height: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    b.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 100,
        top: 10,
        bottom: 20,
        width: 100,
        height: 10,
        x: 0,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect;

    c.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 100,
        top: 20,
        bottom: 30,
        width: 100,
        height: 10,
        x: 0,
        y: 20,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([a, b, c]);

    expect(
      elementsCrossedBySegment(50, 5, 50, 25, [a, b, c], currentRects).map(
        (el) => el,
      ),
    ).toEqual([a, b, c]);
  });

  it("reuses the current rect snapshot instead of reading layout again", () => {
    const element = document.createElement("div");
    let reads = 0;

    element.getBoundingClientRect = () => {
      reads += 1;
      return {
        left: 0,
        right: 100,
        top: 0,
        bottom: 10,
        width: 100,
        height: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };

    const currentRects = readRects([element]);
    expect(reads).toBe(1);

    elementsCrossedBySegment(50, -10, 50, 20, [element], currentRects);

    expect(reads).toBe(1);
  });
});

describe("elementsCrossedByPointerMotion", () => {
  it("detects rows that scroll through a fixed pointer", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const c = document.createElement("div");

    const rectFor = (top: number) => ({
      left: 0,
      right: 100,
      top,
      bottom: top + 10,
    });

    const previousRects = new Map([
      [a, rectFor(40)],
      [b, rectFor(50)],
      [c, rectFor(60)],
    ]);

    a.getBoundingClientRect = () =>
      ({
        ...rectFor(20),
        width: 100,
        height: 10,
        x: 0,
        y: 20,
        toJSON: () => ({}),
      }) as DOMRect;
    b.getBoundingClientRect = () =>
      ({
        ...rectFor(30),
        width: 100,
        height: 10,
        x: 0,
        y: 30,
        toJSON: () => ({}),
      }) as DOMRect;
    c.getBoundingClientRect = () =>
      ({
        ...rectFor(40),
        width: 100,
        height: 10,
        x: 0,
        y: 40,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([a, b, c]);

    expect(
      elementsCrossedByPointerMotion(
        50,
        45,
        [a, b, c],
        previousRects,
        currentRects,
      ),
    ).toEqual([a, b, c]);
  });

  it("detects rows that jump past the pointer in a single frame", () => {
    const row = document.createElement("div");
    const previousRects = new Map([
      [
        row,
        {
          left: 0,
          right: 100,
          top: 220,
          bottom: 230,
        },
      ],
    ]);

    row.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 100,
        top: 80,
        bottom: 90,
        width: 100,
        height: 10,
        x: 0,
        y: 80,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([row]);

    expect(
      elementsCrossedByPointerMotion(
        50,
        100,
        [row],
        previousRects,
        currentRects,
      ),
    ).toEqual([row]);
  });

  it("detects columns that scroll horizontally through a fixed pointer", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const c = document.createElement("div");

    const rectFor = (left: number) => ({
      left,
      right: left + 10,
      top: 0,
      bottom: 100,
    });

    const previousRects = new Map([
      [a, rectFor(40)],
      [b, rectFor(50)],
      [c, rectFor(60)],
    ]);

    a.getBoundingClientRect = () =>
      ({
        ...rectFor(20),
        width: 10,
        height: 100,
        x: 20,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    b.getBoundingClientRect = () =>
      ({
        ...rectFor(30),
        width: 10,
        height: 100,
        x: 30,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    c.getBoundingClientRect = () =>
      ({
        ...rectFor(40),
        width: 10,
        height: 100,
        x: 40,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([a, b, c]);

    expect(
      elementsCrossedByPointerMotion(
        45,
        50,
        [a, b, c],
        previousRects,
        currentRects,
      ),
    ).toEqual([a, b, c]);
  });

  it("detects columns that jump horizontally past the pointer in a single frame", () => {
    const column = document.createElement("div");
    const previousRects = new Map([
      [
        column,
        {
          left: 220,
          right: 230,
          top: 0,
          bottom: 100,
        },
      ],
    ]);

    column.getBoundingClientRect = () =>
      ({
        left: 80,
        right: 90,
        top: 0,
        bottom: 100,
        width: 10,
        height: 100,
        x: 80,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([column]);

    expect(
      elementsCrossedByPointerMotion(
        100,
        50,
        [column],
        previousRects,
        currentRects,
      ),
    ).toEqual([column]);
  });
});

describe("readRects", () => {
  it("captures bounding boxes for candidates", () => {
    const element = document.createElement("div");
    element.getBoundingClientRect = () =>
      ({
        left: 1,
        right: 9,
        top: 2,
        bottom: 8,
        width: 8,
        height: 6,
        x: 1,
        y: 2,
        toJSON: () => ({}),
      }) as DOMRect;

    expect(readRects([element]).get(element)).toEqual({
      left: 1,
      right: 9,
      top: 2,
      bottom: 8,
    });
  });
});

describe("candidatesNearPointer", () => {
  it("keeps elements near the pointer in both axes", () => {
    const near = document.createElement("div");
    const farX = document.createElement("div");
    const farY = document.createElement("div");

    near.getBoundingClientRect = () =>
      ({
        left: 90,
        right: 110,
        top: 90,
        bottom: 110,
        width: 20,
        height: 20,
        x: 90,
        y: 90,
        toJSON: () => ({}),
      }) as DOMRect;
    farX.getBoundingClientRect = () =>
      ({
        left: 500,
        right: 520,
        top: 90,
        bottom: 110,
        width: 20,
        height: 20,
        x: 500,
        y: 90,
        toJSON: () => ({}),
      }) as DOMRect;
    farY.getBoundingClientRect = () =>
      ({
        left: 90,
        right: 110,
        top: 500,
        bottom: 520,
        width: 20,
        height: 20,
        x: 90,
        y: 500,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([near, farX, farY]);

    expect(
      candidatesNearPointer(
        [near, farX, farY],
        100,
        100,
        new Map(),
        currentRects,
        50,
      ),
    ).toEqual([near]);
  });

  it("keeps elements whose previous rect was near the pointer", () => {
    const element = document.createElement("div");
    element.getBoundingClientRect = () =>
      ({
        left: 500,
        right: 520,
        top: 500,
        bottom: 520,
        width: 20,
        height: 20,
        x: 500,
        y: 500,
        toJSON: () => ({}),
      }) as DOMRect;

    const currentRects = readRects([element]);

    expect(
      candidatesNearPointer(
        [element],
        100,
        100,
        new Map([
          [
            element,
            {
              left: 90,
              right: 110,
              top: 90,
              bottom: 110,
            },
          ],
        ]),
        currentRects,
        50,
      ),
    ).toEqual([element]);
  });
});
