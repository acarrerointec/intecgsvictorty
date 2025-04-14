import React from 'react'

import { useGlobalState, actionTypes } from '../contexts/GlobalConstext';
import './Footer.scss';
import userImg from '../../images/user_24.png';

export default function Footer() {
    const [state, dispatch] = useGlobalState();
    return (
        <div className="footer__wrapper">
            <div className="image">
                <img alt="" src={userImg} className="user-image" />
            </div>
            <div className="text">
                {`${state.globalUser.fullname} (${state.globalUser.name})`}
            </div>
        </div>
    )
}
