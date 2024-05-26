import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type AlertBoxSeverityLevel = "info" | "success" | "warning" | "error";

@customElement("ui-alert-box")
export class AlertBox extends LitElement {
  static override styles = css`
    :host {
      padding: var(--padding-md);
    }
  `;

  @property({ type: String })
  severity: AlertBoxSeverityLevel = "info";

  @property({ type: String })
  ["border-radius"]: string = "var(--border-radius-md)";

  override render() {
    const calculatedCSS = html`<style>
      :host {
        border-radius: ${this["border-radius"]};
        background-color: var(--color-${this.severity});
      }
    </style>`;
    return html`${calculatedCSS}<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-alert-box": AlertBox;
  }
}
