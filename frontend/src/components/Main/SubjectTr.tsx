import styled from "@emotion/styled";

import React from "react";



import type { SearchOptions } from "@/utils/search";

import {
  colorGreen,
} from "@/utils/style";

import type { Subject } from "@/utils/subject";

import type { useBookmark } from "@/utils/useBookmark";

import { Star, Td } from "./parts";



const Badge = styled.span`
  background: #d32f2f;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 6px;
  vertical-align: middle;
`;





const Anchor = styled.a`

  color: #666;

  text-decoration-color: #ddd;

  text-underline-offset: 4px;



  &:hover {

    opacity: 0.8;

  }

`;







const SubjectName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1a202c;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${colorGreen};
    text-decoration: underline;
  }
`;

interface SubjectTrProps {
  subject: Subject;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setSyllabiSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const CodeBadge = styled.span`
  background: #f1f5f9;
  color: #1e293b;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 500;
  border: 1px solid #cbd5e1;
`;

const SubjectTr = React.memo(
  ({
    subject,
    usedBookmark,
    setSearchOptions,
    setSyllabiSubjectCode,
  }: SubjectTrProps) => {
    const { bookmarksHas, switchBookmark } =
      usedBookmark;

    const tdStyle: React.CSSProperties = {
      padding: "8px 4px",
      verticalAlign: "middle",
      borderBottom: "1px solid #e2e8f0"
    };

    return (
      <tr key={subject.code}>
        <Td style={{ ...tdStyle, textAlign: "center" }}>
          <Star
            enabled={bookmarksHas(subject.code)}
            onClick={() => switchBookmark(subject.code)}
          >
            ★
          </Star>
        </Td>

        <Td style={tdStyle}>
          <CodeBadge>{subject.code}</CodeBadge>
        </Td>

        <Td style={tdStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <SubjectName onClick={() => setSyllabiSubjectCode(subject.code)}>
              {subject.displayName}
            </SubjectName>
            {subject.isLottery && <Badge>抽選</Badge>}
          </div>
        </Td>

        <Td style={{ ...tdStyle, fontSize: "12px", color: "#475569" }}>
          {subject.person.split(",").map((person, i, array) => (
            <React.Fragment key={i}>
              <Anchor
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchOptions((prev) => ({
                    ...prev,
                    keyword: person,
                    containsPerson: true,
                  }));
                }}
              >
                {person.trim()}
              </Anchor>
              {i < array.length - 1 && " / "}
            </React.Fragment>
          ))}
        </Td>

        <Td style={{ ...tdStyle, textAlign: "center" }}>
          {subject.credit.toFixed(1)}
        </Td>

        <Td style={{ ...tdStyle, textAlign: "center" }}>
          {subject.year}
        </Td>

        <Td style={tdStyle}>
          {subject.termStr}
        </Td>

        <Td style={tdStyle}>
          {subject.timeslotStr}
        </Td>

        <Td style={{ ...tdStyle, fontSize: "12px", color: "#64748b" }}>
          {subject.facultyName}
        </Td>
      </tr>
    );
  },
);



export default SubjectTr;

