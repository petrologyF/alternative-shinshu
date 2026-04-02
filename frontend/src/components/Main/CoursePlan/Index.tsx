import styled from "@emotion/styled";
import React, { useMemo } from "react";

import { colorGreen, colorGreenDark, mobileMedia } from "@/utils/style";
import type { Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomTd } from "../parts";
import SubjectTr from "./SubjectTr";

const Wrapper = styled.div`
  width: 100%;
  overflow-x: scroll;
`;

const Table = styled.table`
  max-width: 200%;
  vertical-align: middle;
  font-size: 14px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
  overflow-x: scroll;

  ${mobileMedia} {
    display: none;
  }

  th {
    font-weight: bold;

    input {
      width: 100%;
      color: #fff;
      border: none;
      border-bottom: solid 1px rgba(255, 255, 255, 0.2);
      background: transparent;
    }
  }

  th,
  td {
    text-align: left;
  }
`;

const YearTd = styled.td`
  font-weight: bold;
  padding: 16px 0 4px 0;
  border-bottom: 3px solid ${colorGreen};
`;

const Th = styled.th`
  height: 16px;
  color: #fff;
  padding: 4px 0 6px 0;
  background: ${colorGreenDark};

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

const Description = styled.div`
  line-height: 1.5;
  font-size: 14px;
  margin-top: 16px;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 8px;
  }
`;

interface CoursePlanProps {
  subjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
}

const CoursePlan = ({ subjects, usedBookmark }: CoursePlanProps) => {
  const {
    yearCredits,
    totalCredits,
    memoHeaders,
    memoLength,
    memoTotals,
    memoSlashLineCredits,
    getBookmarkSubject,
    updateMemoHeaders,
  } = usedBookmark;

  const yearSubjects = useMemo(() => {
    // 蟷ｴ蠎ｦ豈弱↓髮・ｨ・    const record: Record<number, Subject[]> = {};
    for (const subject of subjects) {
      const bookmark = getBookmarkSubject(subject.code);
      if (bookmark) {
        if (!record[bookmark.year]) {
          record[bookmark.year] = [];
        }
        record[bookmark.year].push(subject);
      }
    }

    // 蟷ｴ蠎ｦ豈弱↓繧ｽ繝ｼ繝・    for (const year in record) {
      record[year].sort((a, b) =>
        a.termStr.includes("騾壼ｹｴ")
          ? -1
          : a.termStr.includes("譏･") && !b.termStr.includes("譏･")
            ? -1
            : a.termStr < b.termStr
              ? -1
              : 1,
      );
    }
    return record;
  }, [subjects, getBookmarkSubject]);

  return (
    <Wrapper>
      <Table>
        <colgroup>
          <col css={{ width: "4em", minWidth: "4em" }} />
          <col css={{ width: "20em", minWidth: "20em" }} />
          <col css={{ width: "12em", minWidth: "12em" }} />
          <col css={{ width: "12em", minWidth: "12em" }} />
          {[...Array(memoLength)].map((_, i) => (
            <col
              css={{
                width: `calc((1100px - 4em - 20em - 12em - 12em) / ${memoLength})`,
                minWidth: `calc((1100px - 4em - 20em - 12em - 12em) / ${memoLength})`,
              }}
              key={i}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            <Th />
            <Th>遘醍岼逡ｪ蜿ｷ・冗ｧ醍岼蜷搾ｼ丞腰菴・/Th>
            <Th />
            <Th>螳滓命蠖｢諷・/Th>
            {[...Array(memoLength)].map((_, i) => (
              <Th key={i}>
                <input
                  type="text"
                  value={memoHeaders[i] ?? ""}
                  onChange={(e) => {
                    const newHeaders = [...memoHeaders];
                    newHeaders[i] = e.target.value;
                    updateMemoHeaders(newHeaders);
                  }}
                />
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(yearSubjects).map(([key, subjects]) => (
            <React.Fragment key={key}>
              <tr>
                <YearTd colSpan={2}>
                  {key} 蟷ｴ蠎ｦ・・yearCredits[Number.parseInt(key, 10)] ?? 0}{" "}
                  蜊倅ｽ搾ｼ・                </YearTd>
              </tr>
              {subjects.map((subject) => (
                <SubjectTr
                  subject={subject}
                  usedBookmark={usedBookmark}
                  key={subject.code}
                />
              ))}
            </React.Fragment>
          ))}
          <tr>
            <BottomTd colSpan={4}>
              險・{totalCredits} 蜊倅ｽ・              <br />
              {Object.entries(memoSlashLineCredits).map(
                ([key, credits], i, array) => (
                  <React.Fragment key={key}>
                    {key}・嘴credits} 蜊倅ｽ・                    {i < array.length - 1 && <br />}
                  </React.Fragment>
                ),
              )}
            </BottomTd>
            {[...Array(memoLength)].map((_, i) => (
              <BottomTd key={i}>{memoTotals[i]}</BottomTd>
            ))}
          </tr>
        </tbody>
      </Table>
      <Description>
        <p>
          縲卦A縲阪↓繝√ぉ繝・け繧貞・繧後ｋ縺ｨ縲∵凾髢灘牡縺ｫ縺ｯ蜿肴丐縺輔ｌ縺ｾ縺吶′縲∝腰菴肴焚縺九ｉ縺ｯ髯､螟悶＆繧後∪縺吶・        </p>
        <p>
          蜿ｳ蛛ｴ縺ｮ繝・く繧ｹ繝医・繝・け繧ｹ縺ｯ繝｡繝｢逕ｨ縺ｫ縺贋ｽｿ縺・￥縺縺輔＞縲・          <br />
          謨ｰ蛟､繧貞・蜉帙＠縺溷ｴ蜷医√ヵ繝・ち縺ｫ蛻励・蜷郁ｨ亥､縺瑚｡ｨ遉ｺ縺輔ｌ縺ｾ縺吶・          <br />
          縺ｾ縺溘√・蠢・ｿｮ縲阪・繧医≧縺ｫ陦後′繧ｹ繝ｩ繝・す繝･縺九ｉ蟋九∪繧句ｴ蜷医√◎縺ｮ陦後ｒ蜷ｫ繧遘醍岼縺ｮ蜊倅ｽ肴焚縺ｮ蜷郁ｨ亥､縺瑚｡ｨ遉ｺ縺輔ｌ縺ｾ縺吶・        </p>
      </Description>
    </Wrapper>
  );
};

export default CoursePlan;
