import { createSearchOptions, type SearchOptions } from "@/utils/search";

import { inputSize } from "@/utils/style";

import { SubButtonAnchor } from "../header-parts";

import Requirements from "../Requirements";

import { desktopButtonAnchor, Headline, Line, Options } from "./parts";



interface RequirementProps {

  options: SearchOptions;

  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;

}



const SecondLine = ({ options, setOptions }: RequirementProps) => {

  const clear = () => {

    setOptions(createSearchOptions());

  };



  return (

    <Line thin={false} style={{ marginBottom: "4px" }}>

      <Headline>隕∽ｻｶ</Headline>

      <div style={{ width: inputSize }}>

        <Requirements options={options} setOptions={setOptions} />

      </div>

      <SubButtonAnchor href="#" css={desktopButtonAnchor} onClick={clear}>

        <span>譚｡莉ｶ繧偵け繝ｪ繧｢</span>

      </SubButtonAnchor>

      <Options>

        {(

          [

            ["all", "蜈ｨ遘醍岼"],

            ["bookmark", "縺頑ｰ励↓蜈･繧・],

            ["except-bookmark", "縺頑ｰ励↓蜈･繧贋ｻ･螟・],

          ] as [SearchOptions["filter"], string][]

        ).map(([value, label]) => (

          <label key={value}>

            <input

              type="radio"

              name="bookmark"

              checked={options.filter === value}

              onChange={() => setOptions({ ...options, filter: value })}

            />

            {label}

          </label>

        ))}

      </Options>

    </Line>

  );

};



export default SecondLine;

