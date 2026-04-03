import styled from "@emotion/styled";

import React from "react";



import type { SearchOptions } from "@/utils/search";

import {
  colorGreen,
  shallowShadow,
} from "@/utils/style";

import type { Subject } from "@/utils/subject";

import type { useBookmark } from "@/utils/useBookmark";

import { BottomRow, Star, Td, YearSelect, years } from "./parts";



const Link = styled.a`
  height: 24px;
  color: #fff;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  margin: 4px 0;
  padding: 0 10px;
  border-radius: 12px;
  box-shadow: ${shallowShadow};
  background: ${colorGreen};
  display: inline-flex;
  align-items: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    color: #fff;
  }

  span {
    text-box: trim-both cap alphabetic;
  }
`;

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



const ClassMethods = styled.div`

  line-height: 1.4;

`;



const Classrooms = styled.div`

  line-height: 1.2;

  color: #666;

  font-size: 12px;

  margin-top: 2px;

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
  padding: 1px 6px 3px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 500;
  border: 1px solid #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
  height: 20px;
  box-sizing: border-box;
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

    // TODO: 科目一覧で科目名をクリックすると「科目詳細」画面へ遷移
    return (
      <tr key={subject.code}>
        <Td style={{ borderLeft: `8px solid ${subject.facultyColor}` }}>
          <div style={{ marginBottom: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
            <CampusBadge>{subject.campus}</CampusBadge>
            <CodeBadge>{subject.code}</CodeBadge>
            {subject.isLottery && <Badge>抽選</Badge>}
          </div>
          <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "6px", color: "#111" }}>
            {subject.name}
          </div>
          <BottomRow>
            <Link onClick={() => setSyllabiSubjectCode(subject.code)}>
              <span>シラバス</span>
            </Link>

            <Star

              enabled={bookmarksHas(subject.code)}

              onClick={() => switchBookmark(subject.code)}

            >

              ★

            </Star>

            {bookmarkSubject && (

              <>

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

                <label>

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

              </>

            )}

          </BottomRow>

        </Td>

        <Td>

          {subject.credit.toFixed(1)} 単位

          <br />

          {subject.year} 年次

        </Td>

        <Td>

          {subject.termStr}

          <br />

          {subject.timeslotStr}

        </Td>

        <Td>

          {subject.person.split(",").map((person, i, array) => (

            <React.Fragment key={i}>

              <Anchor

                href="#"

                onClick={() =>

                  setSearchOptions((prev) => ({

                    ...prev,

                    keyword: person,

                    containsPerson: true,

                  }))

                }

              >

                {person}

              </Anchor>

              {i < array.length && <br />}

            </React.Fragment>

          ))}

        </Td>

        <Td>

          <ClassMethods>

            {subject.classMethods.map((method, i, array) => (

              <React.Fragment key={i}>

                {method}

                {i < array.length && <br />}

              </React.Fragment>

            ))}

          </ClassMethods>

          <Classrooms>

            {classrooms.map((classroom, i, array) => (

              <React.Fragment key={i}>

                {classroom}

                {i < array.length && <br />}

              </React.Fragment>

            ))}

          </Classrooms>

        </Td>

        <Td>{subject.abstract}</Td>

        <Td>{subject.note}</Td>

      </tr>

    );

  },

);



export default SubjectTr;

