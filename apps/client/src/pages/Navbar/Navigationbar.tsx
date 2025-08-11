import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Ticket,
  MessageCircle,
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import ROUTES from "@/Routes/routes";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
  { label: "Blog", id: "blog" },
  { label: "Hikes & Treks", path: "https://hikeontreks.com/" },
];

const Navigationbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicks on nav items
  const onNavClick = (id: string) => {
    setMenuOpen(false);
    if (location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME, { state: { scrollTo: id } });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-shadow ${scrolled ? "shadow-lg" : ""}`}
    >
      {/* Top Bar */}
      {/* <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <a href="tel:+9779800000000" className="hover:underline">
              +977 9800000000
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <a href="mailto:support@busbooking.com" className="hover:underline">
              support@busbooking.com
            </a>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div> */}

      {/* Main Navbar */}
      <nav
        className={`bg-zinc-200 px-4 md:px-12 transition-all duration-300 ${scrolled ? "py-4" : "py-5"}`}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => onNavClick("home")}
            className="flex items-center cursor-pointer"
          >
            <div className="bg-teal-700 text-white p-1 rounded-md transform hover:rotate-12 transition-transform">
              🚌
            </div>
            <span className="ml-2 text-xl font-bold text-teal-700 hover:text-teal-600 transition-colors">
              BusBooking
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-6 items-center">
            {navLinks.map((link) =>
              link.path ? (
                <a
                  key={link.id ?? link.label}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.id ?? link.label}
                  onClick={() => onNavClick(link.id!)}
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {link.label}
                </button>
              )
            )}

            <Button
              variant="default"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                navigate(ROUTES.VIEW_TICKETS);
                setMenuOpen(false);
              }}
            >
              <Ticket className="w-4 h-4" /> View Tickets
            </Button>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={() => {
                navigate(ROUTES.LOGIN);
                setMenuOpen(false);
              }}
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => {
                navigate(ROUTES.REGISTER);
                setMenuOpen(false);
              }}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-teal-700 p-1 rounded-md hover:bg-teal-50 transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-all duration-300 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={`bg-white h-full w-4/5 max-w-sm p-6 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div
                onClick={() => onNavClick("home")}
                className="text-xl font-bold text-teal-700 flex items-center gap-2 cursor-pointer"
              >
                <div className="bg-teal-700 text-white p-1 rounded-md">🚌</div>{" "}
                BusBooking
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-500 hover:text-teal-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id ?? link.label}
                  onClick={() => onNavClick(link.id ?? "")}
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}

              <div className="h-px w-full bg-gray-200 my-2" />
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2"
                onClick={() => {
                  navigate(ROUTES.VIEW_TICKETS);
                  setMenuOpen(false);
                }}
              >
                <Ticket className="w-4 h-4" /> View Tickets
              </Button>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="outline"
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => {
                    navigate(ROUTES.LOGIN);
                    setMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => {
                    navigate(ROUTES.REGISTER);
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigationbar;
