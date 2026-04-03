import styled from "@emotion/styled";
import React from "react";

import type { SearchOptions } from "@/utils/search";
import { colorGreenDark, mobileMedia } from "@/utils/style";
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
      width: 2.2rem; /* Star */
    }

    &:nth-of-type(2) {
      width: 5.8rem; /* Code */
    }

    &:nth-of-type(3) {
      width: 14rem; /* Name */
    }

    &:nth-of-type(4) {
      width: 3rem; /* Credit */
    }

    &:nth-of-type(5) {
      width: 3.5rem; /* Year */
    }

    &:nth-of-type(6) {
      width: 5.5rem; /* Term */
    }

    &:nth-of-type(7) {
      width: 8rem; /* Timeslot */
    }

    &:nth-of-type(8) {
      width: 8.5rem; /* Department */
    }

    /* Column 9 (Instructor) takes remaining space */
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

interface MainTableDesktopProps {
  subjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setSyllabiSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const MainTableDesktop = React.memo(
  ({
    subjects,
    hasMore,
    loadingRef,
    usedBookmark,
    setSearchOptions,
    setSyllabiSubjectCode,
  }: MainTableDesktopProps) => {
    return (
      <Table>
        <thead>
          <tr>
            <Th>★</Th>
            <Th>登録コード</Th>
            <Th>授業名</Th>
            <Th>単位</Th>
            <Th>年次</Th>
            <Th>講義期間</Th>
            <Th>曜日・時限</Th>
            <Th>開講部局</Th>
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
