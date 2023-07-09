import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus } from '@fortawesome/free-solid-svg-icons';

function Nav() {
    return (
        <div className='navbar bg-success' style={{ height: "4rem" }}>
            <div className='container'>
                <span className='fs-3 text-white fw-bold'>
                    <FontAwesomeIcon icon={faBus} className='pe-2' />
                    Ônibus POA
                </span>
            </div>
        </div>
    );
}

export default Nav;
