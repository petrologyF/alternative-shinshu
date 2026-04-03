import type { SearchOptions } from "@/utils/search";

import type { NormalSeason } from "@/utils/subject";

import { Headline, Left, Line } from "./parts";



interface ThirdLineProps {
  options: SearchOptions;
  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const ThirdLine = ({ options, setOptions }: ThirdLineProps) => {
  return (
    <Line thin={true}>
      <Headline>学期・期間</Headline>
      <Left>
        <label>
          <input
            type="radio"
            name="season"
            checked={options.season === null}
            onChange={() => setOptions({ ...options, season: null })}
          />
          全
        </label>
        {(["前期", "後期", "通年"] as NormalSeason[]).map((season) => (
          <label key={season}>
            <input
              type="radio"
              name="season"
              checked={options.season === season}
              onChange={() => setOptions({ ...options, season })}
            />
            {season}
          </label>
        ))}
      </Left>
    </Line>
  );
};



export default ThirdLine;

