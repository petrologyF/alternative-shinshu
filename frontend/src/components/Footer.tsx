import styled from "@emotion/styled";
import React, { useRef } from "react";

import { mobileMedia } from "@/utils/style";
import { outputSubjectsToCSV, type Subject } from "@/utils/subject";

const Wrapper = styled.footer`
  line-height: 1.8;
  text-align: center;
  margin: 16px 0 80px 0;

  ${mobileMedia} {
    line-height: 1.5;
    text-align: left;
    font-size: 14px;
    margin: 8px 20px 90px 20px;
  }

  a {
    color: #666;
    text-decoration: underline;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Slash = styled.span`
  color: #ccc;
  margin: 0 8px;
`;

interface FooterProps {
  filteredSubjects: Subject[];
}

const Footer = React.memo(({ filteredSubjects }: FooterProps) => {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  return (
    <Wrapper>
      <List>
        <li style={{ color: "#d32f2f", fontWeight: "bold", marginBottom: "8px" }}>
          本サイトは非公式サイトです。履修登録は必ず ACSU (信州大学学務情報システム) で行ってください。
        </li>
        <li>
          信大シラバス (SOAR代替)
        </li>
        <li>
          Original system by{" "}
          <a href="https://github.com/inaniwaudon" target="_blank" rel="noreferrer">
            いなにわうどん
          </a>, et al.
          <Slash>/</Slash>
          Shinshu Edition by{" "}
          <a href="https://github.com/petrologyF" target="_blank" rel="noreferrer">
            petrologyF
          </a>
        </li>
        <li>
          <a
            href="javascript:void(0)"
            ref={anchorRef}
            onClick={() =>
              outputSubjectsToCSV(filteredSubjects, anchorRef.current)
            }
          >
            CSV ダウンロード
          </a>
        </li>
      </List>
    </Wrapper>
  );
});

export default Footer;
