import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";

import { colorGreenDark, shadow } from "@/utils/style";
import type { useClassroom } from "@/utils/useClassroom";

const H2 = styled.h2`
  color: ${colorGreenDark};
  font-size: 20px;
  margin: 0 0 8px 0;
`;

const Ul = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;

  li + li {
    margin-top: 4px;
  }
`;

const Dropbox = styled.div`
  width: 100%;
  height: 100px;
  margin-top: 12px;
  border-top: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Anchor = styled.a`
  color: #666;
  text-decoration: underline;
  text-decoration-color: #ccc;
  text-underline-offset: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const customStyles: Modal.Styles = {
  content: {
    width: "500px",
    height: "fit-content",
    fontSize: "15px",
    margin: "auto",
    border: "none",
    borderRadius: "16px",
    boxSizing: "border-box",
    boxShadow: shadow,
    padding: "24px 32px",
    background: "#fff",
  },
};

interface ClassroomImportProps {
  isImporting: boolean;
  usedClassroom: ReturnType<typeof useClassroom>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ClassroomImport = ({
  isImporting,
  usedClassroom,
  setIsImporting,
}: ClassroomImportProps) => {
  const { classroomsUpdatedAt, importFile, clearClassrooms } = usedClassroom;

  const formattedUpdatedAt = useMemo(() => {
    if (!classroomsUpdatedAt) {
      return null;
    }
    const date = new Date(classroomsUpdatedAt);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [classroomsUpdatedAt]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      (async () => {
        const result = await importFile(acceptedFiles[0]);
        if (result.error) {
          alert(`繧､繝ｳ繝昴・繝医↓螟ｱ謨励＠縺ｾ縺励◆・・{result.error.message}`);
          return;
        }
        alert("遘醍岼諠・ｱ繧偵う繝ｳ繝昴・繝医＠縺ｾ縺励◆");
      })();
    },
    [importFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Modal
      isOpen={isImporting}
      onRequestClose={() => setIsImporting(false)}
      style={customStyles}
    >
      <H2>謨吝ｮ､諠・ｱ繧偵う繝ｳ繝昴・繝・/H2>
      <p>
        <Anchor href="https://www.tsukuba.ac.jp/education/pdf/how-to-check-the-classrooms-to-be-used-for-courses.pdf">
          螟ｧ蟄ｦ縺梧署萓帙＠縺ｦ縺・ｋ遘醍岼荳隕ｧ繝・・繧ｿ
        </Anchor>{" "}
        縺九ｉ縲・        <br />
        謨吝ｮ､諠・ｱ繧偵う繝ｳ繝昴・繝医☆繧九％縺ｨ縺後〒縺阪∪縺・      </p>
      <Ul>
        <li>kdb_YYYY-ja.xlsx 繧偵う繝ｳ繝昴・繝医＠縺ｦ縺上□縺輔＞縲・/li>
        <li>繧､繝ｳ繝昴・繝医＠縺滓ュ蝣ｱ縺ｯ繝ｭ繝ｼ繧ｫ繝ｫ縺ｫ縺ｮ縺ｿ菫晏ｭ倥＆繧後∪縺吶・/li>
        <li>
          蟄ｦ螟冶・ｄ繧､繝ｳ繧ｿ繝ｼ繝阪ャ繝井ｸ翫↓諠・ｱ繧貞・譛峨☆繧句ｴ蜷医・縲・          <br />
          蟄ｦ螟悶↓髱槫・髢九・諠・ｱ・域蕗螳､諠・ｱ遲会ｼ峨′蜀吶ｊ霎ｼ縺ｾ縺ｪ縺・ｈ縺・          <br />
          蜊∝・縺ｫ豕ｨ諢上＠縺ｦ縺上□縺輔＞縲・        </li>
      </Ul>
      <p>
        {formattedUpdatedAt ? (
          <>
            譛邨よ峩譁ｰ・嘴formattedUpdatedAt}・・            <Anchor onClick={clearClassrooms}>蜑企勁</Anchor>・・          </>
        ) : (
          "迴ｾ蝨ｨ縺ｾ縺ｧ縺ｫ繧､繝ｳ繝昴・繝医＆繧後◆遘醍岼諠・ｱ縺ｯ縺ゅｊ縺ｾ縺帙ｓ"
        )}
      </p>
      <Dropbox {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>繝輔ぃ繧､繝ｫ繧偵ラ繝ｩ繝・げ</p>
        ) : (
          <p>繝峨Λ繝・げ・・ラ繝ｭ繝・・縺ｾ縺溘・繧ｯ繝ｪ繝・け縺励※繝輔ぃ繧､繝ｫ繧帝∈謚・/p>
        )}
      </Dropbox>
    </Modal>
  );
};

export default ClassroomImport;
