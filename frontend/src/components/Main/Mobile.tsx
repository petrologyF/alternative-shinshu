import styled from "@emotion/styled";

import React, { useEffect, useState } from "react";



import {

  colorGreen,

  colorGreenDark,

  colorGreenGradient,

  mobileMedia,

  shallowShadow,

} from "@/utils/style";

import { kdb, type Subject } from "@/utils/subject";



const Wrapper = styled.div`

  display: none;



  ${mobileMedia} {

    display: block;

  }

`;



const SubjectWrapper = styled.div`

  font-size: 13px;

  padding: 4px 0 6px 0;

  border-bottom: solid 1px #ddd;



  .first-notation {

    color: #666;

    text-align: center;

    margin: 0;

  }

`;



const Abstract = styled.div`

  line-height: 1.4;

  display: flex;

  justify-content: space-between;

`;



const Left = styled.div`

  flex: calc(100% - 100px - 8px) 0 0;

  overflow: hidden;



  .first {

    width: 100%;

    text-overflow: ellipsis;

    white-space: nowrap;

    overflow: hidden;

  }



  .class-method {

    color: #666;

    margin-left: 16px;

  }

`;



const Title = styled.strong`

  font-size: 16px;

  display: block;

`;



const Right = styled.div`

  flex: 100px 0 0;

`;



const Details = styled.div<{ displays: boolean }>`

  line-height: 1.4;

  margin-top: 0.2rem;

  display: ${({ displays }) => (displays ? "block" : "none")};



  p {

    margin: 0;

  }

`;



const AnchorWrapper = styled.div`

  margin-top: 6px;

  gap: 6px;

  display: flex;

`;



const Anchor = styled.a`

  flex: 50% 1 1;

  height: 28px;

  color: ${colorGreenDark};

  text-align: center;

  text-decoration: none;

  font-size: 14px;

  border-radius: 4px;

  box-shadow: ${shallowShadow};

  background: ${colorGreenGradient};

  display: flex;

  justify-content: center;

  align-items: center;



  &[data-bookmark="true"] {

    color: #fff;

    background: ${colorGreen};

  }



  &:hover {

    opacity: 0.8;

  }



  span {

    text-box: trim-both cap alphabetic;

  }

`;



const Loading = styled.div`

  font-size: 14px;

  margin-top: 4px;

`;



interface MobileProps {

  subjects: Subject[];

  hasMore: boolean;

  loadingRef: React.RefObject<HTMLDivElement | null>;

  bookmarksHas: (subjectCode: string) => boolean;

  switchBookmark: (subjectCode: string) => void;

}



const Mobile = React.memo(

  ({

    subjects,

    hasMore,

    loadingRef,

    bookmarksHas,

    switchBookmark,

  }: MobileProps) => {

    const [displayed, setDisplayed] = useState(new Set<string>());



    // biome-ignore lint/correctness/useExhaustiveDependencies: reset displayed when subjects changes

    useEffect(() => {

      setDisplayed(new Set<string>());

    }, [subjects]);



    return (

      <Wrapper>

        {subjects.map((subject) => (

          <SubjectWrapper

            key={subject.code}

            onClick={() =>

              setDisplayed((prev) => new Set([...prev, subject.code]))

            }

          >

            <Abstract>

              <Left>

                <div className="first">

                  {subject.code}

                  <span className="class-method">

                    {subject.classMethods.join("縲・)}

                  </span>

                </div>

                <Title>{subject.name}</Title>

                {subject.person.split(",").join("縲・)}

              </Left>

              <Right>

                {subject.termStr} {subject.timeslotStr} <br />

                {subject.credit.toFixed(1)}

                <span className="sub">蜊倅ｽ・/span>

                <br />

                {subject.year}

                <span className="sub">蟷ｴ谺｡</span>

              </Right>

            </Abstract>

            <Details displays={displayed.has(subject.code)}>

              <p>{subject.abstract}</p>

              <AnchorWrapper>

                <Anchor

                  data-bookmark={bookmarksHas(subject.code)}

                  onClick={() => switchBookmark(subject.code)}

                >

                  <span>

                    {bookmarksHas(subject.code)

                      ? "笘・縺頑ｰ励↓蜈･繧・

                      : "笘・縺頑ｰ励↓蜈･繧翫↓霑ｽ蜉"}

                  </span>

                </Anchor>

                <Anchor

                  href={subject.syllabusHref}

                  target="_blank"

                  rel="noreferrer"

                >

                  <span>繧ｷ繝ｩ繝舌せ</span>

                </Anchor>

              </AnchorWrapper>

            </Details>

          </SubjectWrapper>

        ))}

        <Loading ref={loadingRef}>

          {hasMore

            ? "Loading..."

            : `蜈ｨ ${kdb?.subjectCodeList.length} 莉ｶ荳ｭ ${subjects.length} 莉ｶ繧定｡ｨ遉ｺ縺励∪縺励◆`}

        </Loading>

      </Wrapper>

    );

  },

);



export default Mobile;

