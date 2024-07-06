import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../../libs/ui/WallOfFameItem.ts";
import { lists } from "./icons.ts";

@customElement("ui-wall-of-fame")
export class WallOfFame extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin: 0;
      padding: 0;

      margin: 0;
      padding: 0;
      border-radius: var(--border-radius-md);
      border: var(--border-width-sm) solid var(--color-info);

      color: currentColor;

      .wall-of-fame__title {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--padding-sm);
        margin: 0;
        padding: var(--padding-md);
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
        font-weight: 700;
        background-color: var(--color-info);

        h4 {
          margin: 0;
        }
      }

      .wall-of-fame__content {
        margin: 0;
        padding: var(--padding-md);
        border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
        background-color: var(--color-info-secondary);

        ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
      }
    }

    :host(:not(:first-child)) {
      margin-block-start: var(--gap);
    }
  `;

  @property({ type: String })
  header?: string;

  @property({ type: Number })
  columns?: number;

  override render() {
    const columnsCSS = this.columns
      ? html`<style>
          .wall-of-fame__content {
            display: grid;
            grid-template-columns: repeat(${this.columns}, 1fr);
            grid-gap: var(--gap);
            overflow: auto;
          }
        </style>`
      : nothing;
    return html`
      ${columnsCSS}
      <header class="wall-of-fame__title">
        <span class="icon">${lists}</span>
        <h4>${this.header}</h4>
      </header>
      <main class="wall-of-fame__content"><slot></slot></main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-wall-of-fame": WallOfFame;
  }
}
