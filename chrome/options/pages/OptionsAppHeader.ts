import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("options-app-header")
export class OptionsAppHeader extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: var(--color-surface-card);
    }
  `;

  override render() {
    return html`<h1>${chrome.runtime.getManifest().name}</h1>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "options-app-header": OptionsAppHeader;
  }
}
