import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("ui-tab-panel")
export class TabPanel extends LitElement {
  static override styles = css`
    :host {
      padding-block-end: var(--padding-md);
      border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      background-color: var(--color-surface-card);
    }

    nav {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }

    ::slotted(a) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding-sm) var(--padding-md);
      font-weight: 700;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      user-select: none;
      transition: background-color 150ms linear;
    }

    ::slotted(a:hover) {
      background-color: var(--color-surface-hover);
    }

    ::slotted(a.selected) {
      background-color: var(--color-surface-active);
    }
  `;

  override render() {
    return html`<nav><slot></slot></nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-tab-panel": TabPanel;
  }
}
