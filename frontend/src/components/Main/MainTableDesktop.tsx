import styled from "@emotion/styled";
import React from "react";
import type { SearchOptions } from "@/utils/search";
import { kdb, type Subject } from "@/utils/subject";
import { mobileMedia } from "@/utils/style";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomTd } from "./parts";
import SubjectTr from "./SubjectTr";

const Table = styled.table`
  width: 100%;
  font-size: 13px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;

  ${mobileMedia} {
    display: none;
  }
`;

const Header = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;

  th {
    padding: 10px 4px;
    background: #004831; /* Official Shinshu Green */
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    white-space: nowrap;

    &:first-of-type {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      padding-left: 12px;
    }

    &:last-of-type {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      padding-right: 12px;
    }
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
        <Header>
          <tr>
            <th style={{ width: "2.5rem", textAlign: "center" }}>★</th>
            <th style={{ width: "5.5rem" }}>登録コード</th>
            <th style={{ width: "16rem" }}>授業名</th>
            <th style={{ width: "12rem" }}>担当教員</th>
            <th style={{ width: "3rem", textAlign: "center" }}>単位</th>
            <th style={{ width: "3.5rem", textAlign: "center" }}>年次</th>
            <th style={{ width: "6rem" }}>講義期間</th>
            <th style={{ width: "9rem" }}>曜日・時限</th>
            <th style={{ width: "14rem" }}>開講部局</th>
          </tr>
        </Header>
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
            <BottomTd colSpan={9}>
              {hasMore
                ? "読み込み中..."
                : `全 ${kdb.subjectCodeList.length} 件中 ${subjects.length} 件を表示中`}
            </BottomTd>
          </tr>
        </tbody>
      </Table>
    );
  },
);

export default MainTableDesktop;
