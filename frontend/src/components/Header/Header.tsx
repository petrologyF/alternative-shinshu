import styled from "@emotion/styled";

import React, { useState } from "react";

import { useMedia } from "react-use";

import type { SearchOptions } from "@/utils/search";

import { mobileMedia, mobileWidth } from "@/utils/style";

import type { TimeslotTable } from "@/utils/timetable";

import DesktopForm from "./desktop/DesktopForm";

import MobileForm from "./mobile/MobileForm";



const Wrapper = styled.header`
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(242, 255, 249, 0.95),
    rgba(255, 255, 255, 0.95) 250px
  );
`;



const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  background: #004831;
  color: #fff;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #004831;
`;

const Content = styled.div`
  width: 1100px;
  margin: auto;
  padding: 10px 1rem 12px 1rem;
  position: relative;

  ${mobileMedia} {
    width: calc(100% - 2rem);
  }
`;



interface HeaderProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const Header = React.memo(
  ({
    searchOptions,
    bookmarkTimeslotTable,
    setSearchOptions,
  }: HeaderProps) => {
    const [displaysTimeslotSelection, setDisplaysTimeslotSelection] =
      useState(false);

    const isMobile = useMedia(`(width < ${mobileWidth})`);

    return (
      <Wrapper>
        <Content>
          {!isMobile && (
            <Brand>
              <Logo>S</Logo>
              <Title>信大シラバス (非公式)</Title>
            </Brand>
          )}
          {isMobile ? (
            <MobileForm
              searchOptions={searchOptions}
              bookmarkTimeslotTable={bookmarkTimeslotTable}
              displaysTimeslotSelection={displaysTimeslotSelection}
              setSearchOptions={setSearchOptions}
              setDisplaysTimeslotSelection={setDisplaysTimeslotSelection}
            />
          ) : (
            <DesktopForm
              searchOptions={searchOptions}
              bookmarkTimeslotTable={bookmarkTimeslotTable}
              displaysTimeslotSelection={displaysTimeslotSelection}
              setSearchOptions={setSearchOptions}
              setDisplaysTimeslotSelection={setDisplaysTimeslotSelection}
            />
          )}
        </Content>
      </Wrapper>
    );
  },
);



export default Header;

