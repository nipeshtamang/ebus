import Homepage from "@/pages/Navbar/Homepage";
import ROUTES from "./routes";
import Login from "@/pages/Authentication/Login";
import Register from "@/pages/Authentication/Register";
import Faq from "@/pages/Navbar/Faq";
import Contactus from "@/pages/Navbar/Contactus";
import Blogs from "@/pages/Navbar/Blogs";
import Hikeandtrek from "@/pages/Navbar/Hikeandtrek";
import Viewtickets from "@/pages/Navbar/Viewtickets";
import About from "@/pages/Navbar/About";
import ForgetPassword from "@/pages/Authentication/ForgetPassword";

const routeconfig = [
  { path: ROUTES.HOME, Component: Homepage },
  { path: ROUTES.LOGIN, Component: Login },
  { path: ROUTES.REGISTER, Component: Register },
  { path: ROUTES.FAQ, Component: Faq },
  { path: ROUTES.CONTACT, Component: Contactus },
  { path: ROUTES.BLOG, Component: Blogs },
  { path: ROUTES.HIKESANDTREKS, Component: Hikeandtrek },
  { path: ROUTES.VIEW_TICKETS, Component: Viewtickets },
  { path: ROUTES.ABOUT, Component: About },
  { path: ROUTES.FORGET_PASSWORD, Component: ForgetPassword },
];
export default routeconfig;
