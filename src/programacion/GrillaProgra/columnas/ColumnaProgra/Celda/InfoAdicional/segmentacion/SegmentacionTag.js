import React from "react";
import "./SegmentacionTag.scss";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const SegmentacionTag = ({ segmentId }) => {
  const getLetter = (segmentId) => (segmentId == 1 ? "M" : "A");
  const getTooltipLabel = (segmentId) =>
    segmentId == 1 ? "Manual" : "Automático";
  if (segmentId == 0) return <></>;
  return (
    <div className="segmentacion__tipo-emi__wrapper ">
      <Tippy content={getTooltipLabel(segmentId)}>
        <div
          className="segmentacion__tipo-emi__giggle"
          style={colorTipoEmi(segmentId)}
        >
          {getLetter(segmentId)}
        </div>
      </Tippy>
    </div>
  );
};

const colorTipoEmi = (segmentId) => {
  const style = {
    color: '#eee',
    backgroundColor: '#000'
  }
  switch (segmentId) {
    case 1:
      style.backgroundColor = '#fdf337'
      style.color = '#000'
      break;
    case 2:
      style.backgroundColor = '#fb7ad8'
      style.color = '#000'
  }
  return style;
}

export default SegmentacionTag;
export {colorTipoEmi};
