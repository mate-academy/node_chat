import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div>
      <h1 className='title'>Page Not Found</h1>

      <Link to='/'>Go home</Link>
    </div>
  );
};
