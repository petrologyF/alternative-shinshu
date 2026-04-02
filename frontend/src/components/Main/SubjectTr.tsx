import styled from "@emotion/styled";

import React from "react";



import type { SearchOptions } from "@/utils/search";

import {

  colorGreen,

  colorGreenDark,

  colorGreenGradient,

  shallowShadow,

} from "@/utils/style";

import type { Subject } from "@/utils/subject";

import type { useBookmark } from "@/utils/useBookmark";

import { BottomRow, Star, Td, YearSelect, years } from "./parts";



const Link = styled.a`

  height: 24px;

  color: ${colorGreenDark};

  text-align: center;

  text-decoration: none;

  font-size: 13px;

  margin: 4px 0;

  padding: 0 6px 0 6px;

  border-radius: 12px;

  box-shadow: ${shallowShadow};

  background: ${colorGreenGradient};

  display: inline-flex;

  align-items: center;



  &:hover {

    color: #fff;

    background: ${colorGreen};

  }



  span {

    text-box: trim-both cap alphabetic;

  }

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



    // TODO: 驕倬・蟯ｼ陋ｹ・ｺ陋ｻ繝ｻ・帝§驢榊ｲｼ騾｡・ｪ陷ｿ・ｷ邵ｺ・ｮ鬮ｫ・｣邵ｺ・ｫ髯ｦ・ｨ驕会ｽｺ繝ｻ蝓溘Η陜｣・ｱ陝・ｽｦ驗抵ｽ､ 邵ｺ・ｮ郢ｧ蛹ｻ竕ｧ邵ｺ・ｫ繝ｻ繝ｻ

    return (

      <tr key={subject.code}>

        <Td>

          {subject.code}

          <br />

          {subject.name}

          <BottomRow>

            <Link onClick={() => setSyllabiSubjectCode(subject.code)}>

              <span>郢ｧ・ｷ郢晢ｽｩ郢晁・縺・/span>

            </Link>

            <Star

              enabled={bookmarksHas(subject.code)}

              onClick={() => switchBookmark(subject.code)}

            >

              隨倥・            </Star>

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

          {subject.credit.toFixed(1)} 陷雁・ｽｽ繝ｻ          <br />

          {subject.year} 陝ｷ・ｴ隹ｺ・｡

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

