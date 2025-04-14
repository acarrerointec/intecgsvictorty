import React, { useEffect, useState } from "react";
import { completarHorarioConCeros } from "../../../../utils/durationHelper";

const TimeInput = ({
  placeholder = "HH:MM:SS;FF",
  handleChange,
  className,
  initialValue
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
    const frames = digitsOnly.slice(6, 8);

    // Construir el formato de hora con frames separados por ";"
    let formattedTime = "";
    formattedTime = `${hours}${minutes ? ":" + minutes : ""}${
      seconds ? ":" + seconds : ""
    }${frames ? ";" + frames : ""}`;

    setTime(formattedTime);
  };

  const handleOnBlur = (event) => {
    event.stopPropagation();
    const { value } = event.target;
    setTime(completarHorarioConCeros(value));
  };

  return (
    <input
      className={className}
      type="text"
      value={time || initialValue}
      onBlur={handleOnBlur}
      onChange={handleChange2}
      placeholder={placeholder}
    />
  );
};

export default TimeInput;
