import { css, Global } from "@emotion/react";
import { useEffect, useState } from "react";

import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import Syllabi from "./components/Syllabi";
import Timetable from "./components/Timetable/Index";
import {
  createSearchOptions,
  type SearchOptions,
  searchSubjects,
} from "./utils/search";
import { kdb, type Subject } from "./utils/subject";
import { useBookmark } from "./utils/useBookmark";
import { useClassroom } from "./utils/useClassroom";

const globalStyle = css`
  html,
  body {
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%;
    background: #f8fafc; /* Slightly off-white for a premium feel */
    color: #1e293b;
  }

  a {
    cursor: pointer;
    color: #006633; /* DIC389 */
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.7;
    }
  }

  * {
    font-family: "Noto Sans JP", sans-serif;
    box-sizing: border-box;
  }

  @font-face {
    font-family: "Noto Sans JP";
    font-weight: 400;
    font-display: swap;
    src: url("./NotoSansJP-Regular.ttf");
  }

  @font-face {
    font-family: "Noto Sans JP";
    font-weight: 700;
    font-display: swap;
    src: url("./NotoSansJP-Bold.ttf");
  }

  /* Custom Scrollbar for a premium look */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #006633;
  }
`;

const App = () => {
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(
    createSearchOptions(),
  );
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [timetableTermCode, setTimetableTermCode] = useState(0);
  const [displaysPlan, setDisplaysPlan] = useState(false);
  const [syllabiSubjectCode, setSyllabiSubjectCode] = useState<string | null>(
    null,
  );

  const usedBookmark = useBookmark(timetableTermCode, setTimetableTermCode);
  const { bookmarkTimeslotTable, bookmarksHas } = usedBookmark;

  const usedClassroom = useClassroom();

  // debounce 譎る俣
  const DEBOUNCE_TIME = 100;

  useEffect(() => {
    // 螻･菫ｮ險育判縺ｮ逕ｻ髱｢縺ｧ縺ｯ繝悶ャ繧ｯ繝槭・繧ｯ縺ｫ逋ｻ骭ｲ縺輔ｌ縺溷・遘醍岼繧定｡ｨ遉ｺ
    const planSearchOptions = createSearchOptions();
    planSearchOptions.filter = "bookmark";
    const options = displaysPlan ? planSearchOptions : searchOptions;

    const timer = setTimeout(() => {
      // 讀懃ｴ｢邨先棡繧呈峩譁ｰ
      const subjects = searchSubjects(
        kdb.subjectMap,
        kdb.subjectCodeList,
        options,
        bookmarkTimeslotTable,
        bookmarksHas,
      );
      setFilteredSubjects(subjects);
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [searchOptions, bookmarkTimeslotTable, displaysPlan, bookmarksHas]);

  return (
    <>
      <Global styles={globalStyle} />
      <Header
        searchOptions={searchOptions}
        bookmarkTimeslotTable={usedBookmark.bookmarkTimeslotTable}
        displaysPlan={displaysPlan}
        setSearchOptions={setSearchOptions}
        setDisplaysPlan={setDisplaysPlan}
      />
      <Main
        filteredSubjects={filteredSubjects}
        displaysPlan={displaysPlan}
        usedBookmark={usedBookmark}
        usedClassroom={usedClassroom}
        setSearchOptions={setSearchOptions}
        setSyllabiSubjectCode={setSyllabiSubjectCode}
      />
      <Footer filteredSubjects={filteredSubjects} />
      <Timetable
        termCode={timetableTermCode}
        usedBookmark={usedBookmark}
        setTermCode={setTimetableTermCode}
      />
      <Syllabi
        subjectCode={syllabiSubjectCode}
        setSubjectCode={setSyllabiSubjectCode}
      />
    </>
  );
};

export default App;
