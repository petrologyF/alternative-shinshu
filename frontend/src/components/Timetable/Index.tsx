import styled from "@emotion/styled";

import React, { useState } from "react";

import { useMedia } from "react-use";



import {
  colorAccent,
  colorGreenDark,
  mobileMedia,
  mobileWidth,
  shadow,
} from "@/utils/style";

import { CURRENT_YEAR, type Subject } from "@/utils/subject";

import { daysofweek, maxPeriod } from "@/utils/timetable";

import type { useBookmark } from "@/utils/useBookmark";

import Header from "./Header";



const Wrapper = styled.div`
  width: 520px;
  position: fixed;
  bottom: 0;
  right: 16px;

  ${mobileMedia} {
    width: calc(100% - 16px * 2);
    max-width: 520px;
    right: 16px;
  }
`;

const TimetableWrapper = styled.div`
  border-radius: 8px;
  box-shadow: ${shadow};
  background: #fff;
  display: flex;
  overflow: hidden;
  transition: margin-bottom 0.5s ease;
  position: relative;
  z-index: 1;

  &[data-closed="true"] {
    margin-bottom: -421px;
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0;
  align-items: center;
`;

const PeriodColumn = styled(Column)`
  flex: 42px 0 0;
  font-size: 18px;
  text-align: center;
  box-shadow: ${shadow};
`;

const MainColumn = styled(Column)`
  flex: calc(100% / ${daysofweek.length}) 0 0;
  border-left: solid 1px #ddd;
`;

const Day = styled.div`
  height: 31px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    text-box: trim-both cap alphabetic;
  }
`;

const Item = styled.div`
  width: 100%;
  height: 65px;
  border-top: solid 1px #eee;
  position: relative;
`;

const PeriodItem = styled(Item)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SubjectTile = styled.div<{ background: string; top: number }>`
  width: calc(100% - 4px * 2);
  height: 57px;
  line-height: normal;
  font-size: 13px;
  word-break: break-all;
  padding: 5px 8px;
  border-radius: 4px;
  background: ${({ background }) => background};
  color: #fff;
  overflow: hidden;
  position: absolute;
  top: ${({ top }) => 4 + top}px;
  left: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  a {
    color: #fff;
    text-decoration: none;
    display: block;
    width: 100%;
  }

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
`;

const ContextMenu = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #eee;
  z-index: 1000;
  padding: 4px 0;
  min-width: 160px;
  overflow: hidden;
`;

const ContextMenuItem = styled.div<{ danger?: boolean }>`
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ danger }) => (danger ? "#c00" : "#333")};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ danger }) => (danger ? "#fee2e2" : "#f1f8f6")};
    color: ${({ danger }) => (danger ? "#dc2626" : colorGreenDark)};
  }
`;

const Footer = styled.footer`
  height: 42px;
  line-height: 42px;
  margin-top: 8px;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const Link = styled.a<{ caution?: boolean }>`
  height: 32px;
  padding: 0 16px;
  color: ${({ caution }) => (caution ? "#c00" : colorGreenDark)};
  text-decoration: none;
  font-size: 17px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ caution }) => (caution ? "#fee2e2" : "#f1f8f6")};
    color: ${({ caution }) => (caution ? "#dc2626" : colorAccent)};
    opacity: 1;
  }

  span {
    text-box: trim-both cap alphabetic;
  }
`;







interface TimetableProps {
  termCode: number;
  usedBookmark: ReturnType<typeof useBookmark>;
  setTermCode: React.Dispatch<React.SetStateAction<number>>;
  setSyllabiSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}



const TimetableElement = React.memo(
  ({ usedBookmark, termCode, setTermCode, setSyllabiSubjectCode }: TimetableProps) => {

    const {
      bookmarkSubjectTable,
      yearCredits,
      currentCredits,
      currentTimeslots,
      switchBookmark,
      clearBookmarks,
    } = usedBookmark;

    const isMobile = useMedia(`(width < ${mobileWidth})`);
    const [opened, setOpened] = useState(!isMobile);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number; subject: Subject } | null>(null);

    React.useEffect(() => {
      const handleGlobalClick = () => {
        if (menuPos) setMenuPos(null);
      };
      document.addEventListener("click", handleGlobalClick);
      document.addEventListener("scroll", handleGlobalClick, true);
      return () => {
        document.removeEventListener("click", handleGlobalClick);
        document.removeEventListener("scroll", handleGlobalClick, true);
      };
    }, [menuPos]);

    const handleContextMenu = (e: React.MouseEvent, subject: Subject) => {
      e.preventDefault();
      setMenuPos({ x: e.clientX, y: e.clientY, subject });
    };

    const getColor = (subject: Subject, _no: number) => {
      return subject.facultyColor;
    };



    return (

      <Wrapper>

        <Header

          opened={opened}

          termCode={termCode}

          currentCredits={currentCredits}

          currentTimeslots={currentTimeslots}

          yearCredits={yearCredits[CURRENT_YEAR] ?? 0}

          setOpened={setOpened}

          setTermCode={setTermCode}

        />

        <TimetableWrapper data-closed={!opened}>

          <PeriodColumn>

            <Day />

            {[...Array(maxPeriod)].map((_, i) => (

              <PeriodItem key={i}>

                {i + 1}

              </PeriodItem>

            ))}

          </PeriodColumn>

          <Main>

            {daysofweek.map((day, dayi) => (

              <MainColumn key={day}>

                <Day>

                  <span>{day}</span>

                </Day>

                {[...Array(maxPeriod)].map((_, period) => (

                  <Item key={period}>

                    {bookmarkSubjectTable[dayi][period].map(

                      (subject, subjecti) => (

                        <SubjectTile
                          background={getColor(subject, subjecti)}
                          top={subjecti * 2}
                          key={subject.code}
                          onContextMenu={(e) => handleContextMenu(e, subject)}
                        >
                          <a
                            href={subject.syllabusHref}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault();
                              setSyllabiSubjectCode(subject.code);
                            }}
                          >
                            {subject.name}
                          </a>
                        </SubjectTile>

                      ),

                    )}

                  </Item>

                ))}

              </MainColumn>

            ))}

          </Main>

        </TimetableWrapper>

        <Footer>
          <Link caution={true} onClick={clearBookmarks}>
            <span>全てリセット</span>
          </Link>
        </Footer>

        {menuPos && (
          <ContextMenu top={menuPos.y} left={menuPos.x}>
            <ContextMenuItem
              onClick={() => {
                setSyllabiSubjectCode(menuPos.subject.code);
                setMenuPos(null);
              }}
            >
              📖 詳細を表示
            </ContextMenuItem>
            <ContextMenuItem
              danger
              onClick={() => {
                switchBookmark(menuPos.subject.code);
                setMenuPos(null);
              }}
            >
              🗑️ 削除
            </ContextMenuItem>
          </ContextMenu>
        )}
      </Wrapper>

    );

  },

);



export default TimetableElement;

