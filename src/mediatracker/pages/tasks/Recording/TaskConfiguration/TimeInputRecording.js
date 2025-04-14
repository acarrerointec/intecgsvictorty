import React, { useEffect, useState } from "react";
import {completarHorarioConCerosSinFrames } from "../../../../../../utils/durationHelper";
import { InputStyled } from "../../../../../commons/Input";

const TimeInputRecording = ({
  placeholder = "HH:MM:SS",
  handleChange,
  className,
  initialValue,
  onBlur=()=>{},
  disabled
}) => {
  // agregar una key para reinicializar en caso de ser necesario
  const [time, setTime] = useState("");

  useEffect(() => {
    if (time) {
      handleChange(time);
    }
  }, [time]);

  const handleChange2 = (event) => {
    event.stopPropagation();
    const { value } = event.target;

    // Eliminar cualquier carácter no numérico
    let digitsOnly = value.replace(/\D/g, "");
    // Obtener los dígitos necesarios para formar la hora
    const hours = digitsOnly.slice(0, 2);
    const minutes = digitsOnly.slice(2, 4);
    const seconds = digitsOnly.slice(4, 6);

    let formattedTime = "";
    formattedTime = `${hours}${minutes ? ":" + minutes : ""}${
      seconds ? ":" + seconds : ""
    }`;

    setTime(formattedTime);
  };

  const handleOnBlur = (event) => {
    event.stopPropagation();
    const { value } = event.target;
    setTime(completarHorarioConCerosSinFrames(value));
    onBlur()
  };

  return (
    <InputStyled
      className={className}
      type="text"
      value={time || initialValue}
      onBlur={handleOnBlur}
      onChange={handleChange2}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default TimeInputRecording;
