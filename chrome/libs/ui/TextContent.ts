import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { until } from "lit/directives/until.js";

@customElement("ui-text-content")
export class TextContent extends LitElement {
  static override styles = css`
    :host {
      display: block;

      pre {
        max-height: 50vh;
        overflow-y: auto;
        padding: var(--padding-md);
        font-family: "Overpass Mono", monospace;
        border-radius: var(--border-radius-md);
        background-color: var(--color-info-secondary);
      }
    }
  `;

  @property({ type: String })
  src?: string;

  override render() {
    if (!this.src) {
      return html`<pre><slot></slot></pre>`;
    } else {
      const content = fetch(this.src)
        .then((res) => res.text())
        .then((text) => html`<pre>${text}</pre>`)
        .catch(
          () =>
            html`<ui-info-box
              severity="error"
              header="${chrome.i18n.getMessage("error")}"
              >${chrome.i18n.getMessage("loadError")}</ui-info-box
            >`
        );
      return html` ${until(
        content,
        html`<pre><span>${chrome.i18n.getMessage("loading")}</span></pre>`
      )}`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-text-content": TextContent;
  }
}
