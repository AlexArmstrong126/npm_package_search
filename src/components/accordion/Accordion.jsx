import React, { useState } from 'react';
import './styles.css';
const Accordion = ({ title, content }) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <React.Fragment>
      <div className='accordion'>
        <div className='accordion-item'>
          <div className='accordion-title'>
            <div className='accordion__title'>{title}</div>
            <div
              className='accordion__btn'
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? '-' : '+'}
            </div>
          </div>
          {isActive && <div className='accordion-content'>{content}</div>}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Accordion;
