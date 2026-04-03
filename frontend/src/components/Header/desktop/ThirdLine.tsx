import type { SearchOptions } from "@/utils/search";

import type { NormalSeason } from "@/utils/subject";

import { Headline, Left, Line, Options } from "./parts";



const specialOptions = [

  ["集中", "concentration"],

  ["相談可", "negotiable"],

  ["随時", "asneeded"],

  ["NT", "nt"],

] as const;



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

          全        </label>

        {(["前期", "後期"] as NormalSeason[]).map((season) => (
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

      <Options>

        {specialOptions.map(([label, value]) => (

          <label key={value}>

            <input

              type="checkbox"

              checked={options[value]}

              onChange={(e) =>

                setOptions({

                  ...options,

                  [value]: e.target.checked,

                })

              }

            />

            {label}

          </label>

        ))}

      </Options>

    </Line>

  );

};



export default ThirdLine;

