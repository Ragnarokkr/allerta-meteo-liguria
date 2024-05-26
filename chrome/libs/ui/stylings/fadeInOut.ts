import { css } from "lit";

export default css`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .fade-in {
    animation-name: fadeIn;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }

  .fade-out {
    animation-name: fadeOut;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
`;
