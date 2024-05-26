import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import { hostCSS } from "./stylings.ts";

@customElement("support-page")
export class SupportPage extends LitElement {
  static override styles = hostCSS;

  @state()
  private _pageContent = fetch(
    `pages/${chrome.i18n.getUILanguage().substring(0, 2)}/support.html`
  )
    .then((res) => res.text())
    .then((html) =>
      unsafeHTML(html.replaceAll("$extensionId$", chrome.runtime.id))
    );

  override render() {
    return html`${until(
      this._pageContent,
      html`<span>${chrome.i18n.getMessage("loading")}</span>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "support-page": SupportPage;
  }
}
