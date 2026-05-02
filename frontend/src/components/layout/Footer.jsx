import { Link } from 'react-router-dom';
import { Calendar, Instagram, Twitter, Github, Mail, Phone, MapPin } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-card border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-6 col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <Calendar className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-syne">Eventify.</span>
          </Link>
          <p className="text-white/40 text-sm leading-relaxed">
            The world's leading platform for discovering and booking unforgettable events. Experience more.
          </p>
          <div className="flex gap-4">
            <Instagram size={20} className="text-white/40 hover:text-white cursor-pointer" />
            <Twitter size={20} className="text-white/40 hover:text-white cursor-pointer" />
            <Github size={20} className="text-white/40 hover:text-white cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-bold font-syne text-sm uppercase tracking-widest">Navigation</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/40">
            <li className="hover:text-accent cursor-pointer transition-colors"><Link to="/">Home</Link></li>
            <li className="hover:text-accent cursor-pointer transition-colors"><Link to="/events">Explore Events</Link></li>
            <li className="hover:text-accent cursor-pointer transition-colors">Pricing</li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-bold font-syne text-sm uppercase tracking-widest text-accent">Contact Us</h4>
          <ul className="flex flex-col gap-5 text-sm text-white/60">
            <li className="flex items-start gap-3">
              <Mail size={16} className="text-accent shrink-0 mt-1" />
              <span className="break-all">eventify26@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="text-accent shrink-0 mt-1" />
              <span>0767227154</span>
            </li>
            <li className="flex items-start gap-3 leading-relaxed">
              <MapPin size={16} className="text-accent shrink-0 mt-1" />
              <span>NO 75, Kandy Road, Pittugala, Malabe</span>
            </li>
          </ul>
        </div>


        <div className="flex flex-col gap-6">
          <h4 className="font-bold font-syne text-sm uppercase tracking-widest">Legal</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/40">
            <li className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-accent cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-accent cursor-pointer transition-colors">Cookie Policy</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-xs text-white/20">
        © 2024 Eventify. All rights reserved. Built with ❤️ for the community.
      </div>

    </footer>
  );
};

export default Footer;
