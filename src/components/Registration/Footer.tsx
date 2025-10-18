import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-[#D4AF37]">Who We Are</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">Metal Account</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">Products</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Info</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-[#D4AF37]">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">Corporate Governance</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#D4AF37]">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="font-semibold">Dubai:</p>
              <p>MAC & RO CAPITAL FZC</p>
              <p>Tel: +971 56 102 8585</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe to the Newsletter</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg"
              />
              <button className="px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded-r-lg">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 Mac & Ro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
