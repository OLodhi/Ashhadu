'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import Logo from '@/components/ui/Logo';
import SearchModal from '@/components/modals/SearchModal';
import CartSidebar from '@/components/cart/CartSidebar';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { 
    name: 'Collections', 
    href: '/collections',
    submenu: [
      { name: 'Islamic Calligraphy', href: '/collections/calligraphy' },
      { name: 'Mosque Models', href: '/collections/mosque-models' },
      { name: 'Decorative Art', href: '/collections/decorative-art' },
      { name: 'Arabic Text Art', href: '/collections/arabic-text' },
      { name: 'Custom Commissions', href: '/collections/custom' },
    ]
  },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  
  const pathname = usePathname();
  const { items, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-luxury border-b border-luxury-gray-100' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <Logo className="h-8 lg:h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setHoveredMenu(item.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      isActiveLink(item.href)
                        ? 'text-luxury-gold border-b-2 border-luxury-gold'
                        : 'text-luxury-black hover:text-luxury-gold'
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.submenu && (
                    <AnimatePresence>
                      {hoveredMenu === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white border border-luxury-gray-100 shadow-luxury-hover rounded-lg overflow-hidden"
                        >
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-6 py-3 text-sm text-luxury-black hover:bg-luxury-gray-50 hover:text-luxury-gold transition-colors duration-200"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label="Search products"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label="View wishlist"
              >
                <Heart size={20} />
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 text-xs font-medium text-luxury-black bg-luxury-gold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-4">
              {/* Mobile Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 text-xs font-medium text-luxury-black bg-luxury-gold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={handleMenuToggle}
                className="p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-luxury-gray-100"
            >
              <div className="container-luxury py-4">
                <div className="flex flex-col space-y-4">
                  {/* Mobile Actions */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-luxury-gray-100">
                    <button
                      onClick={() => {
                        setIsSearchOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                    >
                      <Search size={20} />
                      <span className="text-sm font-medium">Search</span>
                    </button>
                    
                    <Link
                      href="/account"
                      className="flex items-center space-x-2 p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                    >
                      <User size={20} />
                      <span className="text-sm font-medium">Account</span>
                    </Link>
                    
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2 p-2 text-luxury-black hover:text-luxury-gold transition-colors duration-200"
                    >
                      <Heart size={20} />
                      <span className="text-sm font-medium">Wishlist</span>
                    </Link>
                  </div>

                  {/* Mobile Navigation Links */}
                  {navigation.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <Link
                        href={item.href}
                        className={`block py-2 text-base font-medium transition-colors duration-200 ${
                          isActiveLink(item.href)
                            ? 'text-luxury-gold'
                            : 'text-luxury-black hover:text-luxury-gold'
                        }`}
                      >
                        {item.name}
                      </Link>
                      
                      {/* Mobile Submenu */}
                      {item.submenu && (
                        <div className="pl-4 space-y-2">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block py-1 text-sm text-luxury-gray-600 hover:text-luxury-gold transition-colors duration-200"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;