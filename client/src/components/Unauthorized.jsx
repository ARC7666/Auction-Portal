import React from 'react';
import { useNavigate } from 'react-router-dom';
import unauthorizedImg from '../assets/images/unauthorized.jpg';
import './unauthorized.css';
    import FuzzyText from './FuzzyText';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (

  
<div
  style={{
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    margin: 0,
    padding: 0,
  }}
>
  <FuzzyText 
    baseIntensity={0.2} 
    hoverIntensity={0.5} 
    enableHover={true}
  >
    403 - Unauthorized
  </FuzzyText>
</div>
  );
}