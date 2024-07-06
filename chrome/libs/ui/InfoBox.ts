import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";

import { choose } from "lit/directives/choose.js";
import { error, info, checkCircle as success, warning } from "./icons.ts";

type InfoBoxSeverityLevel = "info" | "success" | "warning" | "error";

@customElement("ui-info-box")
export class InfoBox extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin: 0;
      padding: 0;

      margin: 0;
      padding: 0;
      border-radius: var(--border-radius-md);

      color: currentColor;

      .info-box__title {
        margin: 0;
        padding: var(--padding-md);
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
        font-weight: 700;

        h4 {
          margin: 0;
        }
      }
      .info-box__content {
        margin: 0;
        padding: var(--padding-md);
        border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      }
    }

    ::slotted(p:first-child) {
      margin-block-start: 0;
    }
    ::slotted(p:last-child) {
      margin-block-end: 0;
    }

    :host(:not(:first-child)) {
      margin-block-start: var(--gap);
    }
  `;

  @property({ type: String })
  header?: string;

  @property({ type: String })
  severity?: InfoBoxSeverityLevel = "info";

  @property({ type: Boolean })
  showIcon?: boolean = true;

  override render() {
    const severtyCSS = html`<style>
      :host {
        border: 1px solid var(--color-${this.severity});

        .info-box__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: var(--padding-sm);
          background-color: var(--color-${this.severity});
        }

        .info-box__content {
          background-color: var(--color-${this.severity}-secondary);
        }
      }
    </style>`;

    return html`
      ${severtyCSS}
      <header class="info-box__title">
        ${when(
          this.showIcon,
          () =>
            html`<span class="icon"
              >${choose(
                this.severity,
                [
                  ["info", () => info],
                  ["success", () => success],
                  ["warning", () => warning],
                  ["error", () => error],
                ],
                () => html`${nothing}`
              )}</span
            >`,
          () => nothing
        )}
        <h4>${this.header}</h4>
      </header>
      <main class="info-box__content"><slot></slot></main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-info-box": InfoBox;
  }
}
