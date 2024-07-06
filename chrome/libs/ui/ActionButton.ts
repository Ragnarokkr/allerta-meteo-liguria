import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { when } from "lit/directives/when.js";

import { openInNew } from "./icons.ts";

@customElement("ui-action-button")
export class ActionButton extends LitElement {
  static override styles = css`
    button {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: var(--padding-sm);
      margin: 0;
      padding: var(--padding-md);
      font-family: "Overpass", sans-serif;
      font-size: var(--font-size-base);
      font-weight: 700;
      border: none;
      color: var(--color-text);
      background-color: var(--color-surface-normal);
      cursor: pointer;
      user-select: none;
      transition: background-color 150ms linear;

      &:hover {
        background-color: var(--color-surface-hover);
      }
    }
  `;

  @property({ type: String })
  i18n?: string;

  @property({ type: String })
  link?: string;

  @property({ type: String })
  icon?: string;

  private _onClick(event: Event) {
    event.preventDefault();
    const button = event.target as HTMLButtonElement;
    if (button.dataset.link) {
      const url = button.dataset.link as string;
      chrome.tabs.create({ url });
    }
  }

  override render() {
    return html`
      <button @click=${this._onClick} data-link="${this.link}">
        ${when(
          this.i18n,
          () => chrome.i18n.getMessage(this.i18n!),
          () => html`<slot></slot>`
        )}
        ${when(
          this.icon,
          () =>
            choose(
              this.icon,
              [["open_in_new", () => html`${openInNew}`]],
              () => html`${nothing}`
            ),
          () => nothing
        )}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-action-button": ActionButton;
  }
}
