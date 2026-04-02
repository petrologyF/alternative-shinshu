import styled from "@emotion/styled";
import React, { useEffect, useMemo, useRef, useState } from "react";

import type { SearchOptions } from "@/utils/search";
import { mobileMedia } from "@/utils/style";
import { initialSubjects, ONCE_COUNT, type Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import type { useClassroom } from "@/utils/useClassroom";
import ClassroomImport from "./ClassroomImport";
import CoursePlan from "./CoursePlan/Index";
import MainTableDesktop from "./MainTableDesktop";
import Mobile from "./Mobile";

const Wrapper = styled.main`
  width: 1100px;
  margin: 8px auto 0 auto;
  padding: 0 16px;

  ${mobileMedia} {
    width: calc(100% - 20px * 2);
  }
`;

interface MainProps {
  filteredSubjects: Subject[];
  displaysPlan: boolean;
  usedBookmark: ReturnType<typeof useBookmark>;
  usedClassroom: ReturnType<typeof useClassroom>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setSyllabiSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const Main = React.memo(
  ({
    filteredSubjects,
    displaysPlan,
    usedBookmark,
    usedClassroom,
    setSearchOptions,
    setSyllabiSubjectCode,
  }: MainProps) => {
    const { bookmarksHas, switchBookmark } = usedBookmark;
    const { getClassroom } = usedClassroom;

    const [displayedCount, setDisplayedCount] = useState(0);
    const [initial, setInitial] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const loadingDesktopRef = useRef<HTMLTableRowElement>(null);
    const loadingMobileRef = useRef<HTMLDivElement>(null);

    const displayedSubjects = useMemo(
      () => filteredSubjects.slice(0, displayedCount),
      [filteredSubjects, displayedCount],
    );

    const hasMore = useMemo(
      () => displayedCount < filteredSubjects.length,
      [displayedCount, filteredSubjects],
    );

    const subjects = useMemo(
      () => (initial ? initialSubjects : displayedSubjects),
      [initial, displayedSubjects],
    );

    useEffect(() => {
      // 繝悶ャ繧ｯ繝槭・繧ｯ縺ｮ蛻・崛譎ゅ・繧ｬ繧ｿ縺､縺阪ｒ髦ｲ豁｢縺吶ｋ縺溘ａ縺ｫ縲∽ｻ･蜑崎｡ｨ遉ｺ縺励※縺・◆莉ｶ謨ｰ縺ｯ蠢・★陦ｨ遉ｺ
      setDisplayedCount((prev) => Math.max(ONCE_COUNT, prev));
      setInitial(false);
    }, []);

    useEffect(() => {
      // 辟｡髯舌せ繧ｯ繝ｭ繝ｼ繝ｫ縺ｧ荳螳壻ｻｶ謨ｰ縺壹▽陦ｨ遉ｺ
      const observer = new IntersectionObserver(
        (entries) => {
          if (!hasMore) {
            return;
          }
          if (entries[0].isIntersecting) {
            setDisplayedCount((prev) => prev + ONCE_COUNT);
          }
        },
        { threshold: 0.1 },
      );
      if (loadingDesktopRef.current) {
        observer.observe(loadingDesktopRef.current);
      }
      if (loadingMobileRef.current) {
        observer.observe(loadingMobileRef.current);
      }
      return () => observer.disconnect();
    }, [hasMore]);

    return (
      <>
        <Wrapper>
          {displaysPlan ? (
            <CoursePlan
              subjects={subjects}
              hasMore={hasMore}
              loadingRef={loadingDesktopRef}
              usedBookmark={usedBookmark}
            />
          ) : (
            <MainTableDesktop
              subjects={subjects}
              hasMore={hasMore}
              loadingRef={loadingDesktopRef}
              usedBookmark={usedBookmark}
              setSearchOptions={setSearchOptions}
              setIsImporting={setIsImporting}
              setSyllabiSubjectCode={setSyllabiSubjectCode}
              getClassroom={getClassroom}
            />
          )}
          <Mobile
            subjects={subjects}
            hasMore={hasMore}
            loadingRef={loadingMobileRef}
            bookmarksHas={bookmarksHas}
            switchBookmark={switchBookmark}
          />
        </Wrapper>
        <ClassroomImport
          isImporting={isImporting}
          usedClassroom={usedClassroom}
          setIsImporting={setIsImporting}
        />
      </>
    );
  },
);

export default Main;
