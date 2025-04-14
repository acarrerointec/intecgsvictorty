import React, { useState, useEffect } from "react";
import "./controls.scss";
import imageEraser from "../../../../images/icons/eraser-solid.svg";

const TimeControl = ({ value, onChange, hasPermission, validate }) => {
  const [time, setTime] = useState(value);

  const handleChange = (e) => {
    if (!validate(e.target.value)) return;
    e.persist();
    if (time.toString() !== e.target.value.toString()) {
      setTime(e.target.value);
    }
  };

  const handleBlur = (e) => {
    if (!validate(e.target.value)) return;
    e.persist();
    if (value?.toString() !== e.target.value.toString()) {
      setTime(e.target.value);
      if (typeof onChange === "function")
        onChange({ hora: e.target.value, emitido: 1 });
    }
  };

  const handleKeyPress = (e) => {
    e.persist();
    if (e.which === 13) {
      handleBlur(e);
      const inputs = Array.from(
        // Get table or tbody whatever that contains all inputs. The number of parentElements depends on the structure of your html
        e.target.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "input"
        ) ?? []
      ).filter((e) => !e.disabled);

      if (e.target != "undefined") {
        const index = inputs.indexOf(e.target);

        if (index != -1 && index < inputs.length - 1) inputs[index + 1].focus();
        e.preventDefault();
      }
    }
  };

  const handleNo = (e) => {
    setTime("");
    onChange({ hora: null, emitido: 0 });
  };

  const handleClear = (e) => {
    setTime("");
    onChange({ hora: null, emitido: null });
  };
  
  return (
    <div className="form-controls__row">
      <div className="form-controls__input">
        <input
          type="time"
          value={time}
          onChange={hasPermission ? handleChange : () => {}}
          onBlur={hasPermission ? handleBlur : () => {}}
          disabled={!hasPermission}
          onKeyPress={hasPermission ? handleKeyPress : () => {}}
          step="2"
        />
      </div>
      <div className="form-controls__undo">
        <button
          className={`form-controls__button ${hasPermission ? "" : "disabled"}`}
          onClick={hasPermission ? handleNo : () => {}}
        >
          No
        </button>
      </div>
      <div
        className="form-controls__eraser"
        onClick={hasPermission ? handleClear : () => {}}
      >
        <button
          className={`form-controls__button ${hasPermission ? "" : "disabled"}`}
        >
          <img src={imageEraser} alt="" title="Borrar" />
        </button>
      </div>
    </div>
  );
};

export default TimeControl;
