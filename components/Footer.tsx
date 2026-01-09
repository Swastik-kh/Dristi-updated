import React from 'react';
import { FOOTER_TEXT } from '../constants.ts';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm md:text-base">
          {FOOTER_TEXT}
        </p>
      </div>
    </footer>
  );
};

export default Footer;