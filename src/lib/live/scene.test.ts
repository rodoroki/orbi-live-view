import { describe, expect, test } from "bun:test";

import type { WindyWebcam } from "@/lib/windy.functions";
import { webcamMedia, webcamToScene } from "./scene";

const webcam: WindyWebcam = {
  id: "42",
  title: "Test camera",
  imageUrl: "https://images.example/current.jpg",
  lat: 1,
  lng: 2,
};

describe("ORBI LIVE media normalization", () => {
  test("prioritizes live, then daily timelapse, then image", () => {
    const media = webcamMedia({
      ...webcam,
      player: {
        live: "https://webcams.windy.com/player?playerType=live",
        day: "https://webcams.windy.com/player?playerType=day",
      },
    });

    expect(media.map(({ type }) => type)).toEqual(["live", "timelapse", "image"]);
  });

  test("uses timelapse when live is unavailable", () => {
    expect(
      webcamMedia({
        ...webcam,
        player: { day: "https://webcams.windy.com/player?playerType=day" },
      }).map(({ type }) => type),
    ).toEqual(["timelapse", "image"]);
  });

  test("preserves image-only webcams", () => {
    expect(webcamMedia(webcam).map(({ type }) => type)).toEqual(["image"]);
  });

  test("rejects unsafe media URLs instead of inventing a fallback", () => {
    expect(
      webcamMedia({
        ...webcam,
        imageUrl: "javascript:alert(1)",
        player: { live: "http://insecure.example/live" },
      }),
    ).toEqual([]);
  });

  test("uses the official detail URL when provided", () => {
    expect(webcamToScene({ ...webcam, sourceUrl: "https://windy.com/webcams/42" }).sourceUrl).toBe(
      "https://windy.com/webcams/42",
    );
  });
});
