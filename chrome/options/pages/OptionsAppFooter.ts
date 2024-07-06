import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("options-app-footer")
export class OptionsAppFooter extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
      background-color: var(--color-surface-card);
    }
  `;

  override render() {
    return html`<p>
      ${chrome.i18n.getMessage("allRightsReserved", [
        String(new Date().getFullYear()),
      ])}.
    </p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "options-app-footer": OptionsAppFooter;
  }
}
