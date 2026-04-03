import styled from "@emotion/styled";

import { facultyNameMap } from "@/utils/subject";

import type { SearchOptions } from "@/utils/search";

import { rounded, roundedHeightExceptInput } from "./header-parts";

const Select = styled.select`
  ${rounded}
  ${roundedHeightExceptInput}
  width: 100%;
  color: #000;
  background: #fff;
`;

interface RequirementsProps {
  options: SearchOptions;
  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const Requirements = ({ options, setOptions }: RequirementsProps) => {
  // Use a Set to get unique faculty names (人文学部, 理学部, etc.)
  const departments = Array.from(new Set(Object.values(facultyNameMap)));

  return (
    <Select
      value={[...options.departments][0] || "null"}
      onChange={(e) => {
        const val = e.target.value;
        const newDepts = new Set<string>();
        if (val !== "null") {
          newDepts.add(val);
        }
        setOptions({
          ...options,
          departments: newDepts,
        });
      }}
    >
      <option value="null">部局を指定</option>
      {departments.map((dept) => (
        <option value={dept} key={dept}>
          {dept}
        </option>
      ))}
    </Select>
  );
};

export default Requirements;

