import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("ui-note-box")
export class NoteBox extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      margin: 0;
      padding: 0;

      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-info);

      color: currentColor;

      .note-box__title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--padding-md);
        font-weight: 700;
        border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
        background-color: var(--color-info);
      }
      .note-box__content {
        width: 100%;
        margin: 0;
        padding: var(--padding-md) var(--padding-sm);
        border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
        background-color: var(--color-info-secondary);
      }
    }

    :host(:not(:first-child)) {
      margin-block-start: var(--gap);
    }
  `;

  override render() {
    return html`
      <header class="note-box__title">
        <h4>${chrome.i18n.getMessage("notes")}</h4>
      </header>
      <main class="note-box__content"><slot></slot></main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-note-box": NoteBox;
  }
}
