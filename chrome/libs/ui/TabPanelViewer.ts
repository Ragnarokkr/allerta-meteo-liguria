import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("ui-tab-panel-viewer")
export class TabPanelViewer extends LitElement {
  static override styles = css`
    :host {
      flex-grow: 1;
      overflow: auto;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-tab-panel-viewer": TabPanelViewer;
  }
}
