import { Routes } from "@lit-labs/router";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";

import "../../libs/ui/InfoBox.ts";
import "../../libs/ui/NoteBox.ts";
import "../../libs/ui/TabPanel.ts";
import "../../libs/ui/TabPanelViewer.ts";

import "./SettingsPage.ts";
import "./AboutPage.ts";
import "./PrivacyPage.ts";
import "./TermsPage.ts";
import "./SupportPage.ts";
import "./CreditsPage.ts";
import "./LicensePage.ts";

@customElement("options-app-main")
export class OptionsAppMain extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      margin-block-end: var(--gap);
      overflow: hidden;
    }
  `;

  private _routes = new Routes(this, [
    {
      path: `#settings`,
      render: () => html`<settings-page></settings-page>`,
      enter: () => {
        this._currentPage = "#settings";
        return true;
      },
    },
    {
      path: `#about`,
      render: () => html`<about-page></about-page>`,
      enter: () => {
        this._currentPage = "#about";
        return true;
      },
    },
    {
      path: `#privacy`,
      render: () => html`<privacy-page></privacy-page>`,
      enter: () => {
        this._currentPage = "#privacy";
        return true;
      },
    },
    {
      path: `#terms`,
      render: () => html`<terms-page></terms-page>`,
      enter: () => {
        this._currentPage = "#terms";
        return true;
      },
    },
    {
      path: `#support`,
      render: () => html`<support-page></support-page>`,
      enter: () => {
        this._currentPage = "#support";
        return true;
      },
    },
    {
      path: `#credits`,
      render: () => html`<credits-page></credits-page>`,
      enter: () => {
        this._currentPage = "#credits";
        return true;
      },
    },
    {
      path: `#license`,
      render: () => html`<license-page></license-page>`,
      enter: () => {
        this._currentPage = "#license";
        return true;
      },
    },
  ]);

  private _links = [
    [chrome.i18n.getMessage("settings"), "#settings"],
    [chrome.i18n.getMessage("about"), `#about`],
    [chrome.i18n.getMessage("privacy"), `#privacy`],
    [chrome.i18n.getMessage("terms"), `#terms`],
    [chrome.i18n.getMessage("support"), `#support`],
    [chrome.i18n.getMessage("credits"), `#credits`],
    [chrome.i18n.getMessage("license"), `#license`],
  ];

  @state()
  private _currentPage = `#settings`;

  override firstUpdated() {
    this._routes.goto(`#settings`);
  }

  override render() {
    return html`
      <ui-tab-panel>
        ${map(
          this._links,
          ([name, path]) =>
            html`<a
              class="${classMap({ selected: path === this._currentPage })}"
              @click="${() => this._routes.goto(path)}"
              >${name}</a
            >`
        )}
      </ui-tab-panel>
      <ui-tab-panel-viewer>${this._routes.outlet()}</ui-tab-panel-viewer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "options-app-main": OptionsAppMain;
  }
}
