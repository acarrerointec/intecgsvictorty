import { useRef } from "react";
import "./NavBar.scss";
import { useOutsideClick } from "../hooks/useOutsideClick";
import closeIcon from "../images/icons/add-i.png";

const MenuOptions = ({ onClose,options, ...props }) => {
    const menuRef = useRef(null);

    useOutsideClick(menuRef, onClose);

    return (
        <div className="menu-container" ref={menuRef}>
            <h4 className="menu-header">
                Menú
                <img
                    alt="boton cerrar"
                    src={closeIcon}
                    width={24}
                    height={24}
                    onClick={() => onClose()}
                />
            </h4>
            {options.map((op, i)=>{
                return <div key={i} className={`menu-option${op.disabled ? " disabled" : ""}`} onClick={op.disabled ? ()=>{} : op.handler}>{op.label}</div>
            })}

        </div>
    );
};

export default MenuOptions;
