import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import App from "./App";

test("loads and displays greeting", async () => {
  const screen = await render(<App />);

  await expect(screen.getByText("Join the Vite community")).toBeInTheDocument();
});
