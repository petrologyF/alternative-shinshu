import styled from "@emotion/styled";
import React from "react";
import { createSearchOptions, type SearchOptions } from "@/utils/search";
import { colorGreen } from "@/utils/style";
import { kdb } from "@/utils/subject";
import {
  daysofweek,
  getTimeslotsLength,
  type TimeslotTable,
} from "@/utils/timetable";
import {
  Form,
  MainButtonAnchor,
  rounded,
  SubButtonAnchor,
} from "../header-parts";
import Requirements from "../Requirements";
import TimeslotsSelection from "../TimeslotsSelection";
import { KeywordOptions } from "./KeywordOptions";
import { desktopButtonAnchor, Headline, Line, Options } from "./parts";

const Wrapper = styled(Form)`
  gap: 4px;
`;

const Input = styled.input`
  ${rounded}
  height: 1.5rem;
  width: 280px;
  background: #fff;
  border: 1px solid #cbd5e1;
`;

const PeriodDisplay = styled.div`
  flex-grow: 1;
  font-size: 13px;
  display: flex;
  gap: 8px;
  color: #64748b;
  margin-left: 8px;
`;

const Day = styled.span`
  color: ${colorGreen};
  font-weight: bold;
`;

const SectionLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-right: 8px;
  font-weight: 600;
  white-space: nowrap;
`;

const Update = styled.div`
  color: #94a3b8;
  font-size: 11px;
  margin-left: auto;

  a {
    color: #64748b;
    text-decoration: underline;
  }
`;

interface DesktopFormProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  displaysTimeslotSelection: boolean;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplaysTimeslotSelection: React.Dispatch<React.SetStateAction<boolean>>;
}

const DesktopForm = ({
  searchOptions,
  bookmarkTimeslotTable,
  displaysTimeslotSelection,
  setSearchOptions,
  setDisplaysTimeslotSelection,
}: DesktopFormProps) => {
  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchOptions(createSearchOptions());
  };

  return (
    <Wrapper>
      {/* Row 1: Keyword Search & Targets */}
      <Line thin={false}>
        <Headline>検索</Headline>
        <Input
          value={searchOptions.keyword}
          type="text"
          placeholder="科目名、担当教員、登録コードなど..."
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, keyword: e.target.value })
          }
        />
        <MainButtonAnchor href="#" css={desktopButtonAnchor} style={{ height: "1.5rem", fontSize: "14px", width: "5rem" }}>
          <span>検索</span>
        </MainButtonAnchor>
        <SubButtonAnchor href="#" css={desktopButtonAnchor} onClick={clearAll} style={{ height: "1.5rem", fontSize: "14px", width: "7rem" }}>
          <span>条件をクリア</span>
        </SubButtonAnchor>
        <div style={{ marginLeft: "12px" }}>
          <KeywordOptions options={searchOptions} setOptions={setSearchOptions} />
        </div>
      </Line>

      {/* Row 2: Department & Bookmark Filters */}
      <Line thin={true}>
        <Headline>フィルタ</Headline>
        <div style={{ width: "280px" }}>
          <Requirements options={searchOptions} setOptions={setSearchOptions} />
        </div>
        
        <div style={{ marginLeft: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <SectionLabel>表示対象:</SectionLabel>
          {(
            [
              ["all", "全科目"],
              ["bookmark", "お気に入り"],
              ["except-bookmark", "非お気に入り"],
            ] as [SearchOptions["filter"], string][]
          ).map(([value, label]) => (
            <label key={value} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="radio"
                name="bookmark-filter"
                checked={searchOptions.filter === value}
                onChange={() => setSearchOptions({ ...searchOptions, filter: value })}
              />
              {label}
            </label>
          ))}
        </div>

        <label style={{ marginLeft: "20px", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#475569", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={searchOptions.exceptSameName}
            onChange={(e) =>
              setSearchOptions({
                ...searchOptions,
                exceptSameName: e.target.checked,
              })
            }
          />
          同名の科目を除外
        </label>
      </Line>

      {/* Row 3: Lecture Details & Day/Period */}
      <Line thin={true}>
        <Headline>講義期間</Headline>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
            <input
              type="radio"
              name="season-filter"
              checked={searchOptions.season === null}
              onChange={() => setSearchOptions({ ...searchOptions, season: null })}
            />
            全
          </label>
          {["前期", "後期", "通年"].map((season) => (
            <label key={season} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="radio"
                name="season-filter"
                checked={searchOptions.season === season}
                onChange={() => setSearchOptions({ ...searchOptions, season: season as any })}
              />
              {season}
            </label>
          ))}
        </div>

        <div style={{ marginLeft: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <SectionLabel>学年:</SectionLabel>
          <Options style={{ gap: "10px" }}>
            {[1, 2, 3, 4, 5, 6].map((year) => (
              <label key={year} style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={searchOptions.years.has(year)}
                  onChange={(e) => {
                    const newYears = new Set(searchOptions.years);
                    if (e.currentTarget.checked) newYears.add(year);
                    else newYears.delete(year);
                    setSearchOptions({ ...searchOptions, years: newYears });
                  }}
                />
                {year}
              </label>
            ))}
          </Options>
        </div>

        <div style={{ marginLeft: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <SectionLabel>曜日・時限:</SectionLabel>
          <SubButtonAnchor
            css={desktopButtonAnchor}
            style={{ height: "1.4rem", width: "3.5rem", fontSize: "12px", marginLeft: "0" }}
            onClick={() => setDisplaysTimeslotSelection(true)}
          >
            <span>選択</span>
          </SubButtonAnchor>
          <PeriodDisplay>
            {getTimeslotsLength(searchOptions.timeslotTable) > 0
              ? searchOptions.timeslotTable.map(
                  (day, dayi) =>
                    day.some(Boolean) && (
                      <div key={dayi} style={{ display: "inline-flex", gap: "2px", marginRight: "8px" }}>
                        <Day>{daysofweek[dayi]}</Day>
                        {day.map((slot, p) => slot && <span key={p}>{p + 1}</span>)}
                      </div>
                    ),
                )
              : "指定なし"}
          </PeriodDisplay>
        </div>

        <Update>
          {kdb.updated} 更新 <a href="https://campus-3.shinshu-u.ac.jp/syllabusj/" target="_blank" rel="noreferrer">SOAR</a>
        </Update>
      </Line>

      <TimeslotsSelection
        options={searchOptions}
        displays={displaysTimeslotSelection}
        bookmarkTimeslotTable={bookmarkTimeslotTable}
        setOptions={setSearchOptions}
        setDisplays={setDisplaysTimeslotSelection}
      />
    </Wrapper>
  );
};

export default DesktopForm;
