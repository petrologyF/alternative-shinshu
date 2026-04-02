import type { SearchOptions } from "@/utils/search";

import type { Module, NormalSeason } from "@/utils/subject";

import { Headline, Left, Line, Options } from "./parts";



const specialOptions = [

  ["鬮ｮ繝ｻ・ｸ・ｭ", "concentration"],

  ["陟｢諛・ｽｫ繝ｻ, "negotiable"],

  ["鬮ｫ荵怜・", "asneeded"],

  ["NT", "nt"],

] as const;



interface ThirdLineProps {

  options: SearchOptions;

  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;

}



const ThirdLine = ({ options, setOptions }: ThirdLineProps) => {

  return (

    <Line thin={true}>

      <Headline>陝・ｽｦ隴帙・/Headline>

      <Left>

        <label>

          <input

            type="radio"

            name="season"

            checked={options.season === null}

            onChange={() => setOptions({ ...options, season: null })}

          />

          遯ｶ繝ｻ        </label>

        {(["隴擾ｽ･", "驕倥・] as NormalSeason[]).map((season) => (

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

        繝ｻ繝ｻ        <label>

          <input

            type="radio"

            name="module"

            value="null"

            checked={options.module === null}

            onChange={() => setOptions({ ...options, module: null })}

          />

          遯ｶ繝ｻ        </label>

        {(["A", "B", "C"] as Module[]).map((module) => (

          <label key={module}>

            <input

              type="radio"

              name="module"

              checked={options.module === module}

              onChange={() => setOptions({ ...options, module })}

            />

            {module}

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

