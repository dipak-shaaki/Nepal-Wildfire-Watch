import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Nepal Forest Fire Watch</h3>
            <p className="text-green-100 mb-4 leading-relaxed">
              Advancing forest fire monitoring and prediction system for Nepal.
              Protecting our forests through technology and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/live-map" className="text-green-100 hover:text-white transition-colors">
                  Live Fire Map
                </Link>
              </li>
              <li>
                <Link to="/predict" className="text-green-100 hover:text-white transition-colors">
                  Fire Prediction
                </Link>
              </li>
              <li>
                <Link to="/stats" className="text-green-100 hover:text-white transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-green-100 hover:text-white transition-colors">
                  Fire Alerts
                </Link>
              </li>
              <li>
                <Link to="/report-fire" className="text-green-100 hover:text-white transition-colors">
                  Report Fire
                </Link>
              </li>
            </ul>
          </div>



          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-green-100">Kathmandu, Nepal</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-green-100">support@forestfirewatch.com.np</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-green-100">+0419567XX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-green-100 text-sm">
              © 2025 Nepal Forest Fire Watch. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
