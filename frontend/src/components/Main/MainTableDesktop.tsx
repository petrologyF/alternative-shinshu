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
  searchOptions: SearchOptions;
}

const MainTableDesktop = React.memo(
  ({
    subjects,
    hasMore,
    loadingRef,
    usedBookmark,
    setSearchOptions,
    setSyllabiSubjectCode,
    searchOptions,
  }: MainTableDesktopProps) => {
    const handleSort = (key: string) => {
      setSearchOptions((prev) => ({
        ...prev,
        sortBy: key,
        sortOrder: prev.sortBy === key && prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    };

    const SortIndicator = ({ columnKey }: { columnKey: string }) => {
      if (searchOptions.sortBy !== columnKey) return <span style={{ opacity: 0.3, marginLeft: "4px" }}>↕</span>;
      return <span style={{ marginLeft: "4px" }}>{searchOptions.sortOrder === "asc" ? "▲" : "▼"}</span>;
    };

    const ThInner = ({ name, columnKey, width }: { name: string; columnKey: string; width: string }) => (
      <th
        style={{ width, cursor: "pointer", userSelect: "none" }}
        onClick={() => handleSort(columnKey)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {name}
          <SortIndicator columnKey={columnKey} />
        </div>
      </th>
    );

    return (
      <Table>
        <Header>
          <tr>
            <th style={{ width: "2.5rem", textAlign: "center" }}>★</th>
            <ThInner name="登録コード" columnKey="code" width="5.5rem" />
            <ThInner name="授業名" columnKey="name" width="16rem" />
            <ThInner name="担当教員" columnKey="person" width="12rem" />
            <th
              style={{ width: "3rem", textAlign: "center", cursor: "pointer" }}
              onClick={() => handleSort("credit")}
            >
              単位<SortIndicator columnKey="credit" />
            </th>
            <th
              style={{ width: "3.5rem", textAlign: "center", cursor: "pointer" }}
              onClick={() => handleSort("year")}
            >
              年次<SortIndicator columnKey="year" />
            </th>
            <ThInner name="講義期間" columnKey="termStr" width="6rem" />
            <ThInner name="曜日・時限" columnKey="timeslotStr" width="9rem" />
            <ThInner name="開講部局" columnKey="openingDepartment" width="14rem" />
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
