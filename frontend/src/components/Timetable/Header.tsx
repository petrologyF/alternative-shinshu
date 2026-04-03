import styled from "@emotion/styled";

import { shadow } from "@/utils/style";
import { normalSeasons } from "@/utils/subject";

const Wrapper = styled.header`
  height: 38px;
  line-height: 38px;
  color: #fff;
  margin-bottom: 0;
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: ${shadow};
  background: #004831; /* Official Shinshu Green */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 5;
  transform: translateY(-4px);
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const TermName = styled.div`
  width: 72px;
  text-align: center;
  font-size: 26px;
`;

const Details = styled.div`
  line-height: 24px;
  font-size: 18px;
  margin-left: 16px;
`;

const Move = styled.a`
  line-height: 28px;
  font-size: 24px;

  &[data-prev] {
    margin-left: -8px;
  }

  &[data-next] {
    margin-right: -10px;
  }

  &[data-disabled="true"] {
    cursor: auto;
    opacity: 0.2;
  }

  &:hover {
    opacity: 0.6;
  }
`;

const Close = styled.a<{ opened: boolean }>`
  line-height: ${({ opened }) => (opened ? 14 : 38)}px;
  color: #fff;
  font-size: 26px;

  &:hover {
    opacity: 0.6;
  }
`;

interface HeaderProps {
  opened: boolean;
  termCode: number;
  currentCredits: number;
  currentTimeslots: number;
  yearCredits: number;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setTermCode: React.Dispatch<React.SetStateAction<number>>;
}

const Header = ({
  opened,
  termCode,
  currentCredits,
  currentTimeslots,
  yearCredits,
  setOpened,
  setTermCode,
}: HeaderProps) => {
  const moveBefore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTermCode((prev) => {
      if (prev - 1 >= 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  const moveAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTermCode((prev) => {
      if (prev + 1 < normalSeasons.length) {
        return prev + 1;
      }
      return prev;
    });
  };

  return (
    <Wrapper onClick={() => setOpened((prev) => !prev)}>
      <Left>
        <Move
          data-prev="true"
          onClick={moveBefore}
          data-disabled={termCode - 1 < 0}
        >
          ＜
        </Move>
        <TermName>
          {normalSeasons[termCode]}
        </TermName>
        <Move
          data-next="true"
          data-disabled={termCode + 1 >= normalSeasons.length}
          onClick={moveAfter}
        >
          ＞
        </Move>
        <Details>
          {currentCredits.toFixed(1)} 単位 / {currentTimeslots} コマ（通年{" "}
          {yearCredits.toFixed(1)} 単位）
        </Details>
      </Left>
      <Close opened={opened}>{opened ? "▼" : "▲"}</Close>
    </Wrapper>
  );
};

export default Header;
