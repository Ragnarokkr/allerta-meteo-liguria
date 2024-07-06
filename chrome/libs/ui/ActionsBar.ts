import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

export type ActionsBarAlignment = "start" | "end";

@customElement("ui-actions-bar")
export class ActionsBar extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin: 0;
      padding: 0;
    }

    ::slotted(*) {
      flex: 1;
    }
  `;

  override render() {
    return html`<slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-actions-bar": ActionsBar;
  }
}
