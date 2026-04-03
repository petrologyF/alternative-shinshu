import styled from "@emotion/styled";

import React from "react";



import type { SearchOptions } from "@/utils/search";

import {
  colorGreen,
} from "@/utils/style";

import type { Subject } from "@/utils/subject";

import type { useBookmark } from "@/utils/useBookmark";

import { Star, Td, YearSelect, years } from "./parts";



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

const CampusBadge = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-right: 6px;
  border: 1px solid #e2e8f0;
`;



const Anchor = styled.a`

  color: #666;

  text-decoration-color: #ddd;

  text-underline-offset: 4px;



  &:hover {

    opacity: 0.8;

  }

`;



const Classrooms = styled.div`

  line-height: 1.2;

  color: #666;

  font-size: 12px;

  margin-top: 2px;

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
  getClassroom: (subjectCode: string) => string | null;
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
    getClassroom,
  }: SubjectTrProps) => {
    const { bookmarksHas, getBookmarkSubject, switchBookmark, updateBookmark } =
      usedBookmark;

    const bookmarkSubject = getBookmarkSubject(subject.code);
    const classrooms = getClassroom(subject.code)?.split(",") ?? [];

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
            <CampusBadge>{subject.campus}</CampusBadge>
            <SubjectName onClick={() => setSyllabiSubjectCode(subject.code)}>
              {subject.name}
            </SubjectName>
            {subject.isLottery && <Badge>抽選</Badge>}
          </div>
          {bookmarkSubject && (
            <div style={{ marginTop: "4px", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px" }}>
              <YearSelect
                value={bookmarkSubject.year}
                onChange={(e) =>
                  updateBookmark(subject.code, {
                    year: Number.parseInt(e.currentTarget.value, 10),
                  })
                }
              >
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </YearSelect>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={bookmarkSubject.ta}
                  onChange={(e) =>
                    updateBookmark(subject.code, {
                      ta: e.currentTarget.checked,
                    })
                  }
                />{" "}
                TA
              </label>
            </div>
          )}
        </Td>

        <Td style={tdStyle}>
          {subject.credit.toFixed(1)} {subject.year}次
        </Td>

        <Td style={tdStyle}>
          {subject.termStr} {subject.timeslotStr}
        </Td>

        <Td style={tdStyle}>
          <Classrooms>
            {classrooms.map((classroom, i, array) => (
              <React.Fragment key={i}>
                {classroom}
                {i < array.length - 1 && <br />}
              </React.Fragment>
            ))}
            {classrooms.length === 0 && subject.room && <span>{subject.room}</span>}
          </Classrooms>
        </Td>

        <Td style={tdStyle}>
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
                {person}
              </Anchor>
              {i < array.length - 1 && " / "}
            </React.Fragment>
          ))}
        </Td>
      </tr>
    );
  },
);



export default SubjectTr;

