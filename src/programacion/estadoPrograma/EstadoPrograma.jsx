import React, { useState, useEffect } from 'react';
import './EstadoPrograma.scss';

const images = require.context('../../../images/masInfo');

const EstadoPrograma = React.forwardRef(({ estadoProgra, colorFondo }, ref) => {
  const handleRotate = (e) => {
    let transitionTime = estadoProgra * 300
    let needleRot = estadoProgra * 45
    e.target.style.transition=`all ${transitionTime}ms ease`
    e.target.style.transform=`rotateZ(${needleRot}deg)`
  }

  return (
    <div
      ref={ref}
      className="estado-programa__wrapper"
      style={{
        backgroundColor: colorFondo,
        backgroundImage: `url(${images("./gauge-transp-bg2.png")})`,
      }}
    >
      <img
        className="estado-programa__icon"
        src={images("./gauge-transp-needle.png")}
        alt=""
        onLoad={handleRotate}
      />
    </div>
  )
})

export default EstadoPrograma;
