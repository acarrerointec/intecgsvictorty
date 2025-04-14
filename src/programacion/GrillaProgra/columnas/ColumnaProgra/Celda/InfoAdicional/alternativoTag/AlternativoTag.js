import "./AlternativoTag.scss";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const AlternativoTag = ({ tieneAlternativo }) => {

  const getAlternativo = ()=>{
    if(tieneAlternativo){
      return (
        <div className="alternativo__wrapper">
          <Tippy content={"Alternativo"}>
            <div
              className="alternativo__giggle"
            >
              U
            </div>
          </Tippy>
        </div>
      );
    }else{
     return <></>;
    }
  }

return (getAlternativo())
}


export default AlternativoTag;




