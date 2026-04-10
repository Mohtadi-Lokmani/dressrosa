import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'All Products', path: '/shop' },
      { label: 'Categories', path: '/categories' },
      { label: 'New Arrivals', path: '/shop?sort=createdAt,desc' },
      { label: 'Best Sellers', path: '/shop?sort=sales,desc' },
    ],
    account: [
      { label: 'My Profile', path: '/profile' },
      { label: 'My Orders', path: '/orders' },
      { label: 'Wishlist', path: '/wishlist' },
      { label: 'Messages', path: '/messages' },
    ],
    seller: [
      { label: 'Become a Seller', path: '/register?role=seller' },
      { label: 'Seller Dashboard', path: '/seller/dashboard' },
      { label: 'My Products', path: '/seller/products' },
      { label: 'Analytics', path: '/seller/analytics' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Shipping Info', path: '/shipping' },
      { label: 'Returns', path: '/returns' },
      { label: 'Contact Us', path: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Dressrosa</span>
            </Link>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              Your premium social marketplace for fashion and style. Connect, shop, and share with a community of fashion lovers.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@dressrosa.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+216 12 345 678</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Tunis, Tunisia</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-burgundy transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-2.5">
              {footerLinks.account.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-burgundy transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Sellers</h3>
            <ul className="space-y-2.5">
              {footerLinks.seller.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-burgundy transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-burgundy transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {currentYear} Dressrosa. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
  {socialLinks.map((social) => (
    <a
      key={social.label}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-burgundy hover:text-white transition-colors"
      aria-label={social.label}
    >
      <social.icon className="w-4 h-4" />
    </a>
  ))}
</div>
            {/* Legal Links */}
            <div className="flex items-center gap-4">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-600 hover:text-burgundy transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/terms" 
                className="text-sm text-gray-600 hover:text-burgundy transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;