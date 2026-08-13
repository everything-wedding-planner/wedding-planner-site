import { render } from "vitest-browser-react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import MessageCompose from "../src/components/MessageCompose";

test("send button disabled when input is empty", async () => {
  const screen = await render(<MessageCompose onSend={async () => {}} />);
  await expect.element(screen.getByLabelText("Send message")).toBeDisabled();
});

test("typing enables send and Enter triggers onSend", async () => {
  const onSend = vi.fn(async () => {});
  const screen = await render(<MessageCompose onSend={onSend} />);

  await screen.getByLabelText("Message input").fill("Hello there");
  await expect.element(screen.getByLabelText("Send message")).toBeEnabled();

  await userEvent.keyboard("{Enter}");
  await vi.waitFor(() => {
    expect(onSend).toHaveBeenCalledWith("Hello there");
  });
});

test("failed send shows inline error and keeps input", async () => {
  const onSend = vi.fn(async () => {
    throw new Error("nope");
  });
  const screen = await render(<MessageCompose onSend={onSend} />);

  await screen.getByLabelText("Message input").fill("Hi");
  await screen.getByLabelText("Send message").click();

  await expect.element(screen.getByText("Failed to send")).toBeInTheDocument();
  // Input is not cleared on failure.
  const input = screen.getByLabelText("Message input");
  await expect.element(input).toHaveValue("Hi");
});
