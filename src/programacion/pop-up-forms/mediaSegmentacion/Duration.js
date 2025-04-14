import React, { useState, useEffect } from "react";

const Duration = ({
  value,
  CBF,
  id = null,
  onKeyPress = null,
  hasPermission = true,
}) => {
  const [text, setText] = useState("");
  const [val, setVal] = useState({ h: 0, m: 0, s: 0 }); // 9999:59:59

  useEffect(() => {
    if (value) {
      if (!Number.isNaN(value) && value != "" && value > 0) {
        setText(() => global.util.intToFormattedTime(value));
        setVal(() => global.util.intToTime(value));
      } else if (
        value.hasOwnProperty("h") &&
        value.hasOwnProperty("m") &&
        value.hasOwnProperty("s")
      ) {
        setText(() => global.util.timeToText(value));
        setVal(() => value);
      } else {
        setText(() => "");
        setVal(() => {
          return { h: 0, m: 0, s: 0 };
        });
      }
    } else {
      setText(() => "");
    }
  }, [value]);

  useEffect(() => {
    if (val) CBF(val);
  }, [val]);

  const handleChangeValue = (e) => {
    e.persist();
    let t = e.target.value;
    if (validate(t)) {
      let a = t.split(":");
      setVal(() => {
        return { h: Number(a[0]), m: Number(a[1]), s: Number(a[2]) };
      });
    } else
      setVal(() => {
        return { h: 0, m: 0, s: 0 };
      });
  };

  const handleChangeText = (e) => {
    e.persist();
    let t = e.target.value.replace(".", ":").replace(",", ":");
    setText(() => t);
  };

  const validate = (t) => {
    if (t.match(/^\d{1,}:(?:[0-5]\d|\d):(?:[0-5]\d|\d)$/)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="duration">
      <div>
        <input
          disabled={!hasPermission}
          id={id}
          onKeyPress={onKeyPress}
          onChange={handleChangeText}
          onBlur={handleChangeValue}
          type="text"
          value={text}
          placeholder="hh:mm:ss"
        />
      </div>
    </div>
  );
};

export default Duration;

export const DurationWithFrames = ({
  CBF,
  id = null,
  hasPermission = true,
  className,
  CBFError
}) => {
  const [text, setText] = useState("");
  const [val, setVal] = useState(null);

  useEffect(() => {
    CBF(val ? val : "");
  }, [val]);

  const handleChangeValue = (e) => {
    e.persist();
    const t = e.target.value;
    if (validate(t)) {
      setVal(t);
      CBFError(null)
    } else {
      CBFError("Ingrese un valor con el siguiente formato: HH:MM:SS;FF")
      setVal(null)
    };
  };

  const handleChangeText = (e) => {
    e.persist();
    setText(e.target.value);
  };

  const validate = (t) => {
    if (t.match(/^\d{1,}:(?:[0-5]\d|\d):(?:[0-5]\d|\d);(?:[0-9]\d|\d)$/)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <input
      className={className}
      disabled={!hasPermission}
      id={id}
      onChange={handleChangeText}
      onBlur={handleChangeValue}
      type="text"
      value={text}
      placeholder="hh:mm:ss;ff"
    />
  );
};
