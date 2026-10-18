import { Typography } from "../../ui/typography";
import styles from "./scales.module.scss";

export const Scales = () => {
  const colors = [
    {
      name: "red",
      chips: [
        "#FFF5F5",
        "#FFE3E3",
        "#FFC9C9",
        "#FFA8A8",
        "#FF8787",
        "#FF6B6B",
        "#FA5252",
        "#F03E3E",
        "#E03131",
        "#C92A2A",
        "#A61E1E",
        "#7A1414",
      ],
    },
    {
      name: "orange",
      chips: [
        "#FFF4E6",
        "#FFE8CC",
        "#FFD8A8",
        "#FFC078",
        "#FFA94D",
        "#FF922B",
        "#FD7E14",
        "#F76707",
        "#E8590C",
        "#D9480F",
        "#B23B0C",
        "#822B09",
      ],
    },
    {
      name: "yellow",
      chips: [
        "#FFF9DB",
        "#FFF3BF",
        "#FFEC99",
        "#FFE066",
        "#FFD43B",
        "#FCC419",
        "#FAB005",
        "#F59F00",
        "#F08C00",
        "#E67700",
        "#BD6200",
        "#8A4700",
      ],
    },
    {
      name: "green",
      chips: [
        "#EBFBEE",
        "#D3F9D8",
        "#B2F2BB",
        "#8CE99A",
        "#69DB7C",
        "#51CF66",
        "#40C057",
        "#37B24D",
        "#2F9E44",
        "#2B8A3E",
        "#237133",
        "#1A5325",
      ],
    },
    {
      name: "teal",
      chips: [
        "#E6FCF5",
        "#C3FAE8",
        "#96F2D7",
        "#63E6BE",
        "#38D9A9",
        "#20C997",
        "#12B886",
        "#0CA678",
        "#099268",
        "#087F5B",
        "#07684B",
        "#054C37",
      ],
    },
    {
      name: "blue",
      chips: [
        "#E7F5FF",
        "#D0EBFF",
        "#A5D8FF",
        "#74C0FC",
        "#4DABF7",
        "#339AF0",
        "#228BE6",
        "#1C7ED6",
        "#1971C2",
        "#1864AB",
        "#14528C",
        "#0E3C67",
      ],
    },
    {
      name: "violet",
      chips: [
        "#F3F0FF",
        "#E5DBFF",
        "#D0BFFF",
        "#B197FC",
        "#9775FA",
        "#845EF7",
        "#7950F2",
        "#7048E8",
        "#6741D9",
        "#5F3DC4",
        "#4E32A1",
        "#392576",
      ],
    },
    {
      name: "pink",
      chips: [
        "#FFF0F6",
        "#FFDEEB",
        "#FCC2D7",
        "#FAA2C1",
        "#F783AC",
        "#F06595",
        "#E64980",
        "#D6336C",
        "#C2255C",
        "#A61E4D",
        "#88193F",
        "#64122E",
      ],
    },
    {
      name: "gray",
      chips: [
        "#F8F9FA",
        "#F1F3F5",
        "#E9ECEF",
        "#DEE2E6",
        "#CED4DA",
        "#ADB5BD",
        "#868E96",
        "#495057",
        "#343A40",
        "#212529",
        "#1B1E22",
        "#141619",
      ],
    },
  ];

  return (
    <ScalesContainer>
      {colors.map((props) => (
        <Scale {...props} />
      ))}
    </ScalesContainer>
  );
};

const ScalesContainer = ({ children }) => {
  const columns = new Array(12).fill(null);
  return (
    <div className={styles.scalesContainer}>
      <header className={styles.scalesHeader}>
        <Typography gutter="none" variant="overline">
          Scale
        </Typography>
        {columns.map((_v, index) => (
          <Typography gutter="none" variant="overline">
            {index + 1}
          </Typography>
        ))}
      </header>
      <ul>{children}</ul>
    </div>
  );
};

type ScaleProps = {
  name: string;
  chips: string[];
};

const Scale = ({ name, chips }: ScaleProps) => {
  return (
    <li className={styles.scaleList}>
      <Typography
        className={styles.scaleLabel}
        variant="overline"
        gutter="none"
      >
        {name}
      </Typography>
      <span className={styles.scaleDisplayContainer}>
        {chips.map((hex) => (
          <div
            style={{ ["--scale-chip-bg"]: hex }}
            className={styles.chip}
          ></div>
        ))}
      </span>
    </li>
  );
};
