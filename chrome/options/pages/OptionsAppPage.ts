import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./OptionsAppHeader.ts";
import "./OptionsAppMain.ts";
import "./OptionsAppFooter.ts";

@customElement("options-app-page")
export class OptionsAppPage extends LitElement {
  static override styles = css`
    :host {
      display: grid;
      grid-template-rows: max-content auto max-content;
      max-width: var(--max-width);
      height: 100vh;
      margin: 0 auto;
    }
  `;

  override render() {
    return html`
      <options-app-header></options-app-header>
      <options-app-main></options-app-main>
      <options-app-footer></options-app-footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "options-app-page": OptionsAppPage;
  }
}
