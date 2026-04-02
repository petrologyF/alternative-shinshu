import styled from "@emotion/styled";
import React from "react";

import type { SearchOptions } from "@/utils/search";
import { colorGreen, inputSize } from "@/utils/style";
import { classMethods, kdb } from "@/utils/subject";
import {
  daysofweek,
  getTimeslotsLength,
  type TimeslotTable,
} from "@/utils/timetable";
import {
  Form,
  MainButtonAnchor,
  rounded,
  roundedHeightExceptInput,
  SubButtonAnchor,
} from "../header-parts";
import TimeslotsSelection from "../TimeslotsSelection";
import { KeywordOptions } from "./KeywordOptions";
import { desktopButtonAnchor, Headline, Left, Line, Options } from "./parts";
import SecondLine from "./SecondLine";
import ThirdLine from "./ThirdLine";

const Wrapper = styled(Form)`
  gap: 6px;
`;

const Input = styled.input`
  ${rounded}
  ${roundedHeightExceptInput}
  width: ${inputSize};
  background: #fff;
`;

const Period = styled.div`
  width: ${inputSize};
  font-size: 15px;
  display: flex;
  gap: 10px;
`;

const Day = styled.span`
  color: ${colorGreen};
  margin-right: 2px;
`;

const Update = styled.div`
  color: #666;
  font-size: 14px;

  a {
    color: #666;
    text-decoration-color: #ccc;
    text-underline-offset: 4px;
    margin: 0 4px;
  }
`;

interface DesktopFormProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  displaysTimeslotSelection: boolean;
  displaysPlan: boolean;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplaysTimeslotSelection: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplaysPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

const DesktopForm = ({
  searchOptions,
  bookmarkTimeslotTable,
  displaysTimeslotSelection,
  displaysPlan,
  setSearchOptions,
  setDisplaysTimeslotSelection,
  setDisplaysPlan,
}: DesktopFormProps) => {
  return (
    <Wrapper>
      <Line thin={false}>
        <Headline>繧ｭ繝ｼ繝ｯ繝ｼ繝・/Headline>
        <Input
          value={searchOptions.keyword}
          type="text"
          placeholder="遘醍岼逡ｪ蜿ｷ縺ｯ蜑肴婿荳閾ｴ縲√◎縺ｮ莉悶・豁｣隕剰｡ｨ迴ｾ縺ｫ蟇ｾ蠢・
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, keyword: e.target.value })
          }
        />
        <MainButtonAnchor href="#" css={desktopButtonAnchor}>
          <span>讀懃ｴ｢</span>
        </MainButtonAnchor>
        <KeywordOptions options={searchOptions} setOptions={setSearchOptions} />
      </Line>
      <SecondLine options={searchOptions} setOptions={setSearchOptions} />
      <ThirdLine options={searchOptions} setOptions={setSearchOptions} />
      <Line thin={true}>
        <Headline>譖懈律繝ｻ譎る剞</Headline>
        <Left>
          <Period>
            {displaysTimeslotSelection
              ? "繧ｫ繝ｬ繝ｳ繝繝ｼ繧偵け繝ｪ繝・け縺励※譖懈律繝ｻ譎る剞繧帝∈謚・
              : getTimeslotsLength(searchOptions.timeslotTable) > 0
                ? searchOptions.timeslotTable.map(
                    (day, dayi) =>
                      day.reduce((prev, value) => prev + (value ? 1 : 0), 0) >
                        0 && (
                        <div key={dayi}>
                          <Day>{daysofweek[dayi]}</Day>
                          {day.map(
                            (slot, period) =>
                              slot && (
                                <React.Fragment key={period}>
                                  {period + 1}
                                </React.Fragment>
                              ),
                          )}
                        </div>
                      ),
                  )
                : "謖・ｮ壹↑縺・}
          </Period>
          <SubButtonAnchor
            css={desktopButtonAnchor}
            onClick={() => setDisplaysTimeslotSelection(true)}
          >
            <span>驕ｸ謚・/span>
          </SubButtonAnchor>
        </Left>
        <label>
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
          蜷悟錐縺ｮ遘醍岼繧帝勁螟・        </label>
        <TimeslotsSelection
          options={searchOptions}
          displays={displaysTimeslotSelection}
          bookmarkTimeslotTable={bookmarkTimeslotTable}
          setOptions={setSearchOptions}
          setDisplays={setDisplaysTimeslotSelection}
        />
      </Line>
      <Line thin={true}>
        <Headline>螳滓命蠖｢諷・/Headline>
        <label>
          <input
            type="radio"
            name="online"
            value="null"
            checked={searchOptions.classMethod === null}
            onChange={() =>
              setSearchOptions({ ...searchOptions, classMethod: null })
            }
          />
          窶・        </label>
        {classMethods.map((method) => (
          <label key={method}>
            <input
              type="radio"
              name="online"
              checked={searchOptions.classMethod === method}
              onChange={() =>
                setSearchOptions({
                  ...searchOptions,
                  classMethod: method,
                })
              }
            />
            {method}
          </label>
        ))}
      </Line>
      <Line thin={true}>
        <Headline>讓呎ｺ門ｱ･菫ｮ蟷ｴ谺｡</Headline>
        <Left>
          <Options css={{ width: inputSize }}>
            {[...Array(6)].map((_, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={searchOptions.years.has(i + 1)}
                  onChange={(e) => {
                    const newYears = new Set(searchOptions.years);
                    if (e.currentTarget.checked) {
                      newYears.add(i + 1);
                    } else {
                      newYears.delete(i + 1);
                    }
                    setSearchOptions({
                      ...searchOptions,
                      years: newYears,
                    });
                  }}
                />{" "}
                {i + 1}
              </label>
            ))}
          </Options>
          <SubButtonAnchor
            css={desktopButtonAnchor}
            onClick={() => setDisplaysPlan((prev) => !prev)}
          >
            <span>{displaysPlan ? "ﾃ・螻･菫ｮ險育判" : "螻･菫ｮ險育判"}</span>
          </SubButtonAnchor>
        </Left>
        <Update>
          <span>{kdb.updated}</span> 譎らせ縺ｧ縺ｮ
          <a href="https://kdb.tsukuba.ac.jp/" target="_blank" rel="noreferrer">
            遲第ｳ｢螟ｧ蟄ｦ KdB
          </a>
          縺ｮ繝・・繧ｿ縺ｫ蝓ｺ縺･縺阪∪縺・        </Update>
      </Line>
    </Wrapper>
  );
};

export default DesktopForm;
