import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { AssistantProvider } from "../src/assistant/AssistantProvider";
import AssistantChat from "../src/assistant/AssistantChat";

function Page({ label, to }: { label: string; to: string }) {
  return (
    <div>
      <p>{label}</p>
      <Link to={to}>Go to {to}</Link>
    </div>
  );
}

function renderAssistant(initialPath = "/a") {
  return render(
    <AssistantProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/a" element={<Page label="Page A" to="/b" />} />
          <Route path="/b" element={<Page label="Page B" to="/a" />} />
        </Routes>
        <AssistantChat />
      </MemoryRouter>
    </AssistantProvider>,
  );
}

test("opens and closes the panel", async () => {
  const screen = await renderAssistant();

  await expect
    .element(screen.getByLabelText("Open AI assistant"))
    .toBeInTheDocument();
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

  await screen.getByLabelText("Open AI assistant").click();
  await expect
    .element(screen.getByText("How can I help you today?"))
    .toBeInTheDocument();
  await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

  await screen.getByLabelText("Close AI assistant").click();
  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
  await expect
    .element(screen.getByLabelText("Open AI assistant"))
    .toHaveFocus();
});

test("sending a message produces a mock reply", async () => {
  const screen = await renderAssistant();

  await screen.getByLabelText("Open AI assistant").click();
  await screen.getByLabelText("Message input").fill("Summarize my conversations");
  await userEvent.keyboard("{Enter}");

  await expect
    .element(screen.getByText("Summarize my conversations"))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText(/summary of your recent conversations/i))
    .toBeInTheDocument();
});

test("suggestion chip sends a prompt", async () => {
  const screen = await renderAssistant();

  await screen.getByLabelText("Open AI assistant").click();
  await screen.getByText("What's coming up next week?").click();

  await expect
    .element(screen.getByText("How can I help you today?"))
    .not.toBeInTheDocument();
  await expect
    .element(screen.getByText(/upcoming deadlines and bookings/i))
    .toBeInTheDocument();
});

test("Escape closes the panel", async () => {
  const screen = await renderAssistant();

  await screen.getByLabelText("Open AI assistant").click();
  await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

  await userEvent.keyboard("{Escape}");

  await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
  await expect
    .element(screen.getByLabelText("Open AI assistant"))
    .toHaveFocus();
});

test("chat persists across route navigation", async () => {
  const screen = await renderAssistant();

  await screen.getByLabelText("Open AI assistant").click();
  await screen
    .getByLabelText("Message input")
    .fill("What's coming up next week?");
  await userEvent.keyboard("{Enter}");
  await expect
    .element(screen.getByText(/upcoming deadlines and bookings/i))
    .toBeInTheDocument();

  await screen.getByText("Go to /b").click();
  await expect.element(screen.getByText("Page B")).toBeInTheDocument();

  await expect
    .element(screen.getByText(/upcoming deadlines and bookings/i))
    .toBeInTheDocument();
  await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});
