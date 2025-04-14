const borderStyles = {
    border: {
        top: {
            style: "thin",
            color: "000000",
        },
        bottom: {
            style: "thin",
            color: "000000",
        },
        right: {
            style: "thin",
            color: "000000",
        },
        left: {
            style: "thin",
            color: "000000",
        },
    },
};

const headerStyles = (horizontal) => {
  return {
    fill: { patternType: "solid", fgColor: { rgb: "d1d1d1" } },
    font: { sz: "12", bold: true },
    alignment: { horizontal: horizontal ? horizontal:"bottom" },
    ...borderStyles,
  };
};

const rowStyles =(horizontal)=>{ 
    return {
      alignment: {
        wrapText: true,
        vertical: "top",
        horizontal: horizontal ? horizontal : "bottom",
      },
      ...borderStyles,
    };}

export { borderStyles, headerStyles, rowStyles };
