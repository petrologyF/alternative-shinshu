import { css } from "@emotion/react";

import styled from "@emotion/styled";



import { inputSize } from "@/utils/style";



export const Line = styled.div<{ thin: boolean }>`
  height: 1.5rem;
  line-height: 1.5rem;
  margin: 2px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
`;

export const Headline = styled.div`
  width: 5.5em;
  margin-right: 12px;
  font-weight: bold;
  color: #475569;
`;



export const Left = styled.div`

  width: calc(${inputSize} + 7rem + 24px);

  display: flex;

  align-items: center;

`;



export const Options = styled.div`

  display: flex;

  gap: 8px;

`;



export const desktopButtonAnchor = css`

  width: 7rem;

  margin-left: 8px;

  margin-right: 16px;

`;

