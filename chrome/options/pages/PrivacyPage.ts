import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import { hostCSS } from "./stylings.ts";

@customElement("privacy-page")
export class PrivacyPage extends LitElement {
  static override styles = hostCSS;

  @state()
  private _pageContent = fetch(
    `pages/${chrome.i18n.getUILanguage().substring(0, 2)}/privacy.html`
  )
    .then((res) => res.text())
    .then((html) => unsafeHTML(html));

  override render() {
    return html`${until(
      this._pageContent,
      html`<span>${chrome.i18n.getMessage("loading")}</span>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "privacy-page": PrivacyPage;
  }
}
