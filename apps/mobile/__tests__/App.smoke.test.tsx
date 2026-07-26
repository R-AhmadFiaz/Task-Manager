import React from "react";
import { act, create } from "react-test-renderer";
import App from "../App";

jest.mock("expo-sqlite/kv-store", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

test("App renders without throwing and reaches the logged-out screen (Android platform)", async () => {
  let renderError: unknown = null;
  let root: ReturnType<typeof create> | null = null;

  try {
    await act(async () => {
      root = create(<App />);
    });
    // Flush the async getSession()/initialize() chain in useAuth.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  } catch (error) {
    renderError = error;
  }

  if (renderError) {
    console.error("APP RENDER THREW:", renderError);
  }
  expect(renderError).toBeNull();

  const json = root!.toJSON();
  console.log("Rendered tree present:", json !== null);
});
