// @vitest-environment jsdom
import { render } from "lit";
import { afterEach, expect, it, vi } from "vitest";
import { projectChatSystemNotice } from "../chat-system-notice.ts";
import { renderChatComposerNotices } from "../chat-view-notices.ts";
import { renderChatNotice } from "./chat-divider.ts";

afterEach(() => document.body.replaceChildren());
it("replaces the canonical failed run row with one line-icon notice and explicit actions", () => {
  const summary = "⚠️ The AI service needs a short break. Please try again in a few minutes.";
  const message = {
    role: "custom",
    content: summary,
    timestamp: 1,
    openclawRunError: { runId: "run-a", summary },
  };
  const items = projectChatSystemNotice({ kind: "message", key: "failure", message });
  expect(items).toHaveLength(1);
  const item = items[0];
  if (item?.kind !== "notice") {
    throw new Error("Expected failure notice");
  }
  const container = document.body.appendChild(document.createElement("div"));
  const onRetry = vi.fn();
  const onChangeModel = vi.fn();
  render(
    renderChatNotice(item, undefined, {
      failureActionsRunId: "run-a",
      onRetryRun: onRetry,
      onChangeFailureModel: onChangeModel,
    }),
    container,
  );
  expect(container.querySelectorAll(".chat-run-failure")).toHaveLength(1);
  expect(container.textContent).toContain("Unable to finish this reply");
  expect(container.textContent).not.toContain("⚠");
  expect(container.querySelector(".chat-run-failure__icon svg")).not.toBeNull();
  expect(container.querySelector("details")?.open).toBe(false);
  const buttons = [...container.querySelectorAll("button")];
  buttons.find((b) => b.textContent?.includes("Try again"))?.click();
  buttons.find((b) => b.textContent?.includes("Change model"))?.click();
  expect(onRetry).toHaveBeenCalledOnce();
  expect(onChangeModel).toHaveBeenCalledOnce();
  render(
    renderChatComposerNotices({ messages: [message], runError: { runId: "run-a", summary } }),
    container,
  );
  expect(container.querySelector(".chat-error")).toBeNull();
  render(
    renderChatComposerNotices({ messages: [message], runError: { runId: "run-b", summary } }),
    container,
  );
  expect(container.querySelector(".chat-error")).not.toBeNull();
});
it("keeps ordinary assistant warning text as authored content", () => {
  const item = {
    kind: "message" as const,
    key: "text",
    message: { role: "assistant", content: "⚠️ A warning written by the assistant" },
  };
  expect(projectChatSystemNotice(item)).toEqual([item]);
});
