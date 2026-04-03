import styled from "@emotion/styled";
import React from "react";

import type { SearchOptions } from "@/utils/search";
import { colorGreen, colorGreenDark, mobileMedia } from "@/utils/style";
import { kdb, type Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomTd } from "./parts";
import SubjectTr from "./SubjectTr";

const Table = styled.table`
  width: 100%;
  font-size: 14px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
  overflow-x: scroll;

  ${mobileMedia} {
    display: none;
  }

  th,
  td {
    text-align: left;
    font-weight: normal;

    &:first-of-type {
      width: 2.5rem; /* Star */
    }

    &:nth-of-type(2) {
      width: 6rem; /* Code */
    }

    &:nth-of-type(3) {
      width: 18rem; /* Name */
    }

    &:nth-of-type(4) {
      width: 6rem; /* Credit/Year */
    }

    &:nth-of-type(5) {
      width: 8rem; /* Term/Slot */
    }

    &:nth-of-type(6) {
      width: 10rem; /* Room */
    }

    /* Column 7 (Instructor) takes remaining space */
  }
`;

const Th = styled.th`
  height: 16px;
  color: #fff;
  padding: 6px 4px 8px 4px;
  background: ${colorGreenDark};
  font-size: 13px;
  font-weight: 600;

  &:first-of-type {
    padding-left: 8px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-of-type {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const Classrooms = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const Plus = styled.span`
  width: 16px;
  height: 16px;
  color: ${colorGreen};
  font-size: 12px;
  font-weight: bold;
  margin-top: 2px;
  border-radius: 50%;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  span {
    text-box: trim-both cap alphabetic;
  }
`;

interface MainTableDesktopProps {
  subjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  setSyllabiSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
  getClassroom: (subjectCode: string) => string | null;
}

const MainTableDesktop = React.memo(
  ({
    subjects,
    hasMore,
    loadingRef,
    usedBookmark,
    setSearchOptions,
    setIsImporting,
    setSyllabiSubjectCode,
    getClassroom,
  }: MainTableDesktopProps) => {
    return (
      <Table>
        <thead>
          <tr>
            <Th>★</Th>
            <Th>登録コード</Th>
            <Th>授業名</Th>
            <Th>単位/年次</Th>
            <Th>講義期間/曜限</Th>
            <Th onClick={() => setIsImporting(true)}>
              <Classrooms>
                講義室
                <Plus>
                  <span>+</span>
                </Plus>
              </Classrooms>
            </Th>
            <Th>担当教員</Th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <SubjectTr
              subject={subject}
              usedBookmark={usedBookmark}
              setSearchOptions={setSearchOptions}
              setSyllabiSubjectCode={setSyllabiSubjectCode}
              getClassroom={getClassroom}
              key={subject.code}
            />
          ))}
          <tr ref={loadingRef}>
            <BottomTd>
              {hasMore
                ? "Loading..."
                : `全 ${kdb?.subjectCodeList.length} 件中 ${subjects.length} 件を表示しました`}
            </BottomTd>
          </tr>
        </tbody>
      </Table>
    );
  },
);

export default MainTableDesktop;
