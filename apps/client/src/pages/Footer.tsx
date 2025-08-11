import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ];

  const topRoutes = [
    {
      name: "Kathmandu to Pokhara Bus (2/1, Both Way)",
      href: "/route/ktm-to-pkr-2-1",
    },
    {
      name: "Kathmandu to Pokhara Bus (2/2 Sofa, Both Way)",
      href: "/route/ktm-to-pkr-2-2",
    },
    {
      name: "Kathmandu to Chitwan Bus (2/2 Sofa, Both Way)",
      href: "/route/ktm-to-chitwan",
    },
    {
      name: "Kathmandu to Lumbini Tourist Bus (2/2 Sofa, Day & Night)",
      href: "/route/ktm-to-lumbini",
    },
    { name: "Kathmandu to Delhi Bus (Both Way)", href: "/route/ktm-to-delhi" },
    {
      name: "Kathmandu to Bhairahawa Sunauli Bus (2/2 Sofa, Night)",
      href: "/route/ktm-to-bhairahawa",
    },
    { name: "Kathmandu to Ilam Bus (One Way)", href: "/route/ktm-to-ilam" },
    {
      name: "Kathmandu to Kakarvitta Tourist Bus (One Way)",
      href: "/route/ktm-to-kakarvitta",
    },
  ];

  const paymentPartners = [
    {
      name: "eSewa",
      logo: "https://img.favpng.com/14/10/20/esewa-zone-office-bayalbas-google-play-iphone-png-favpng-RvUiaAC2PmZrjnsmH1cgW60Fx.jpg",
      alt: "eSewa Logo",
    },
    {
      name: "Khalti",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Khalti_Digital_Wallet_Logo.png.jpg",
      alt: "Khalti Logo",
    },
    {
      name: "IME Pay",
      logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/cd/f9/1d/cdf91d55-d051-3409-95c4-053960a61fc4/AppIcon-0-0-1x_U007emarketing-0-8-0-sRGB-85-220.png/1200x600wa.png",
      alt: "IME Pay Logo",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-teal-600 p-1 rounded-md">🚌</div>
              <span className="text-2xl font-bold">eBusewa</span>
            </div>
            <p className="text-gray-400 mb-6">
              Nepal's premier online bus ticket booking platform, connecting
              travelers to destinations across the country with ease and
              reliability.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 hover:bg-teal-600 transition-colors p-2 rounded-full"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-teal-600 transition-colors p-2 rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-teal-600 transition-colors p-2 rounded-full"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-teal-600 transition-colors p-2 rounded-full"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative pl-4 border-l-4 border-teal-500">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-teal-400 transition-colors flex items-center"
                  >
                    <ChevronRight size={16} className="mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Routes */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 relative pl-4 border-l-4 border-teal-500">
              Top Routes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topRoutes.map((route, index) => (
                <Link
                  key={index}
                  to={route.href}
                  className="text-gray-400 hover:text-teal-400 transition-colors flex items-center"
                >
                  <ChevronRight size={16} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{route.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-gray-800">
          <div>
            <h3 className="text-lg font-semibold mb-6 relative pl-4 border-l-4 border-teal-500">
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Thamel, Kathmandu, Nepal
                  <br />
                  Opposite to Himalayan Java Coffee
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                <a
                  href="tel:+9779800000000"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  +977 9800000000
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                <a
                  href="mailto:support@ebusewa.com"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  support@ebusewa.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Partners */}
        <div className="py-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-6 text-center">
            Payment Partners
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {paymentPartners.map((partner, index) => (
              <div key={index} className="bg-white p-2 rounded-md">
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.alt}
                  className="h-10"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} eBusewa. All rights reserved. Developed with ❤️ in
            Nepal.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
