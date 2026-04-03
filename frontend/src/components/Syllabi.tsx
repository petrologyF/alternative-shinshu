import styled from "@emotion/styled";
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

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: ${colorGreenDark};
  margin-bottom: 12px;
  border-bottom: 2px solid ${colorGreenDark};
  padding-bottom: 4px;
`;

const SectionContent = styled.div`
  white-space: pre-wrap;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
`;

const PlanList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlanItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  border-left: 3px solid ${colorGreenDark};
`;

const SessionNo = styled.div`
  min-width: 40px;
  font-weight: bold;
  color: ${colorGreenDark};
  font-size: 13px;
`;

const SessionContent = styled.div`
  flex-grow: 1;
  font-size: 14px;
`;

interface SyllabiProps {
  subjectCode: string | null;
  setSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const Syllabi = ({ subjectCode, setSubjectCode }: SyllabiProps) => {
  const subject = kdb.subjectMap[subjectCode as string];

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

      <Content>
        {subject.abstract && (
          <Section>
            <SectionTitle>授業の概要</SectionTitle>
            <SectionContent>{subject.abstract}</SectionContent>
          </Section>
        )}

        {subject.evaluation && (
          <Section>
            <SectionTitle>成績評価の方法</SectionTitle>
            <SectionContent>{subject.evaluation}</SectionContent>
          </Section>
        )}

        {subject.textbook && (
          <Section>
            <SectionTitle>教科書</SectionTitle>
            <SectionContent>{subject.textbook}</SectionContent>
          </Section>
        )}

        {subject.lessonPlan.length > 0 && (
          <Section>
            <SectionTitle>授業計画</SectionTitle>
            <PlanList>
              {subject.lessonPlan.map((p, i) => (
                <PlanItem key={i}>
                  <SessionNo>{p.session}</SessionNo>
                  <SessionContent>{p.content}</SessionContent>
                </PlanItem>
              ))}
            </PlanList>
          </Section>
        )}

        {(!subject.abstract && !subject.evaluation && !subject.lessonPlan.length) && (
          <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", marginTop: "40px" }}>
            この科目のクイックビュー用データは現在収集元に含まれていません。<br/>
            詳細は公式シラバスをご確認ください。
          </p>
        )}
      </Content>
    </Wrapper>
  );
};

export default Syllabi;
