import { css } from "lit";

export const hostCSS = css`
  :host {
    display: block;
    margin-inline: var(--margin-sm);
    padding: var(--padding-md) var(--padding-lg);
    border-radius: var(--border-radius-md);
    background-color: var(--color-surface-card);

    & > p:first-child {
      margin-block-start: 0;
    }
  }
`;
