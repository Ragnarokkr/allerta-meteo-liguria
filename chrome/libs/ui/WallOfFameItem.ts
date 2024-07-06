import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-wall-of-fame-item")
export class WallOfFameItem extends LitElement {
  static override styles = css`
    :host {
      margin: 0;
      padding: 0;
      border-radius: var(--border-radius-md);
      border: var(--border-width-sm) solid var(--color-info);

      color: currentColor;

      margin: 0;
      padding: 0;
      background-color: var(--color-info);
      transition: background-color 150ms linear;

      a {
        display: block;
        margin: 0;
        padding: var(--padding-md);
        border-radius: var(--border-radius-md);
        text-decoration: none;
        text-wrap: pretty;
        color: currentColor;

        span:first-child {
          font-weight: 700;
        }
      }
    }

    :host(:hover) {
      background-color: var(--color-info-secondary);
    }
  `;

  @property({ type: String })
  name = "";

  @property({ type: String })
  href?: string;

  override render() {
    return this.href
      ? html`
          <a href="${this.href}">
            <span>${this.name}</span>
            <span><slot></slot></span>
          </a>
        `
      : html`
          <span>${this.name}</span>
          <span><slot></slot></span>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-wall-of-fame-item": WallOfFameItem;
  }
}
