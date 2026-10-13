import { html, nothing } from "lit";
import { renderCopyButton } from "../../../components/copy-button.ts";
import { formatWebUiIconErrorText } from "../../../components/error-presentation.ts";
import { icons } from "../../../components/icons.ts";
import { t } from "../../../i18n/index.ts";

type ChatRunFailureActions = {
  onRetry?: () => void;
  onChangeModel?: () => void;
};

/** One terminal notice, separate from assistant prose and preserved partial output. */
export function renderChatRunFailureNotice(summary: string, actions: ChatRunFailureActions = {}) {
  const detail = formatWebUiIconErrorText(summary).trim();
  const firstLine = detail.split(/\r?\n/u)[0] ?? "";
  const concise = firstLine.length <= 240 ? firstLine : t("chat.recovery.failedHelp");
  return html`<div class="chat-run-failure" role="status">
    <span class="chat-run-failure__icon" aria-hidden="true">${icons.circleX}</span>
    <div class="chat-run-failure__content">
      <strong class="chat-run-failure__title">${t("chat.recovery.failedTitle")}</strong>
      <p class="chat-run-failure__summary">${concise}</p>
      <div class="chat-run-failure__actions">
        ${actions.onRetry ? html`<button type="button" class="btn primary btn--sm chat-run-failure__retry" @click=${actions.onRetry}>${icons.refresh}${t("chat.recovery.tryAgain")}</button>` : nothing}
        ${actions.onChangeModel ? html`<button type="button" class="btn btn--sm btn--ghost" @click=${actions.onChangeModel}>${t("chat.recovery.changeModel")}</button>` : nothing}
      </div>
      <details class="chat-run-failure__details">
        <summary>${t("chat.details")}</summary>
        <p>${t("chat.recovery.failedHelp")}</p>
        <pre tabindex="0" aria-label=${t("chat.errorDetails")}>${detail}</pre>
        ${renderCopyButton(summary, t("chat.copyError"))}
      </details>
    </div>
  </div>`;
}
