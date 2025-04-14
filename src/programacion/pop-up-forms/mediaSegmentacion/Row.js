import React from "react";
import "./MediaSegmentacion.scss";

const Row = ({tag, data, className = ""}) => {
    return (
      <div className={`media-segmentacion__row ${className}`}>
        <div className="media-segmentacion__tag">{tag}</div>
        <div className="media-segmentacion__data">{data}</div>
      </div>
    );
  }

export default Row;