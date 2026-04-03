import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { colorGreenDark, shadow } from "@/utils/style";
import { kdb } from "@/utils/subject";

const Wrapper = styled.div`
  width: 400px;
  height: calc(100% - 16px);
  line-height: 1.5;
  font-size: 14px;
  border-radius: 8px 8px 0 0;
  box-shadow: ${shadow};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  overflow: hidden;

  position: fixed;
  bottom: 0;
  right: 16px;

  h2 {
    color: ${colorGreenDark};
    font-size: 14px;
    margin: 20px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: solid 1px rgba(0, 72, 49, 0.2);

    &:before {
      content: "";
      margin-left: -8px;
      padding-left: 8px;
    }
  }

  #summary-heading-summary-contents h2 {
    margin-top: 0;
  }

  p {
    margin: 0;
  }

  table {
    margin: 8px 0;
  }
`;

const Header = styled.div`
  padding: 16px 20px 12px 20px;
  border-top: solid 6px rgba(0, 72, 49, 0.7);
`;

const H1 = styled.h1`
  font-size: 20px;
  font-weight: normal;
  margin: 0 0 4px 0;
`;

const Description = styled.div`
  margin: 0;
`;

const SyllabusLink = styled.a`
  color: #666;
  text-decoration-color: #ccc;
  text-underline-offset: 4px;
  display: block;
  text-align: right;
`;

const Close = styled.a`
  color: #999;
  font-size: 20px;
  position: absolute;
  top: 12px;
  right: 16px;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  padding: 0 20px 16px 20px;
  flex-grow: 1;
  overflow-y: scroll;
`;

interface SyllabiProps {
  subjectCode: string | null;
  setSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const Syllabi = ({ subjectCode, setSubjectCode }: SyllabiProps) => {
  const [content, setContent] = useState("");

  const subject = kdb.subjectMap[subjectCode as string];

  useEffect(() => {
    (async () => {
      if (!subjectCode) {
        return;
      }

      // Shinshu University does not have a public JSON syllabus backend like Yokohama.dev for Tsukuba
      // We set a placeholder or fetch from a different source if it existed.
      setContent("<p>クイックビューは現在利用できません。詳細は以下の公式シラバスリンクから確認してください。</p>");
    })();
  }, [subjectCode]);

  if (!subjectCode || !subject) {
    return null;
  }

  return (
    <Wrapper>
      <Header style={{ borderTop: `6px solid ${colorGreenDark}` }}>
        <H1>{subject.name}</H1>
        <Description>
          {subject.code} / {subject.credit} 単位 / {subject.year} 年次 /
          {subject.termStr} {subject.timeslotStr}
          <br />
          {subject.person.split(",").join(" / ")}
        </Description>
        <SyllabusLink
          href={subject.syllabusHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          公式シラバス (SOAR) で詳細を表示
        </SyllabusLink>
        <Close onClick={() => setSubjectCode(null)}>×</Close>
      </Header>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: to display the syllabus HTML or placeholder */}
      <Content dangerouslySetInnerHTML={{ __html: content }}></Content>
    </Wrapper>
  );
};

export default Syllabi;
