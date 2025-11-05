import { Link } from "react-router-dom";
import AlertBanner from "./AlertBanner";

function Home() {
  // Emergency contacts data
  const emergencyContacts = [
    {
      id: 1,
      organization: "Nepal Police (Emergency)",
      number: "100",
      description: "24/7 Police Emergency Hotline",
      category: "Emergency"
    },
    {
      id: 2,
      organization: "Fire Brigade",
      number: "101",
      description: "Fire Emergency Services",
      category: "Emergency"
    },
    {
      id: 3,
      organization: "Department of Forests",
      number: "01-5520045",
      description: "Ministry of Forests & Environment",
      category: "Forest"
    },
    {
      id: 4,
      organization: "Disaster Management",
      number: "1130",
      description: "National Emergency Operations Center",
      category: "Disaster"
    },
    {
      id: 5,
      organization: "Nepal Red Cross",
      number: "01-4270650",
      description: "Disaster Response & Relief",
      category: "Disaster"
    },
    {
      id: 6,
      organization: "Ambulance Service",
      number: "102",
      description: "Medical Emergency Ambulance",
      category: "Emergency"
    },
    {
      id: 7,
      organization: "Armed Police Force",
      number: "01-4411210",
      description: "Forest Security & Protection",
      category: "Forest"
    },
    {
      id: 8,
      organization: "Tourist Police",
      number: "01-4247041",
      description: "Tourist Safety & Assistance",
      category: "Emergency"
    }
  ];

  return (
    <div className="min-h-screen">
      <AlertBanner />

      {/* Hero Section - Clean Image */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/forest_fire.jpg')` }}
          />
        </div>
      </section>

      {/* Forest Loss Article Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="border-t border-gray-300 pt-8">
            <h2 className="text-3xl font-bold text-black mb-8">
              Fires Are Emerging as a Top Driver of Forest Loss
            </h2>

            <p className="text-base text-black leading-relaxed mb-6">
              As fires worsen — including in historically low-risk areas, like the tropics — they are becoming an increasingly prevalent driver of global forest loss.
            </p>

            <p className="text-base text-black leading-relaxed mb-6">
              Fires accounted for almost half (44%) of all tree cover loss per year between 2023 and 2024. This marks a sharp rise from 2001-2022, when fires accounted for about one-quarter of annual tree cover loss on average.
            </p>

            <p className="text-base text-black leading-relaxed">
              Nepal Wildfire Watch is the small step developed for predicting and monitoring the fire,fire risks that are happening in Nepal. </p>
          </div>
        </div>
      </section>


      {/* Emergency Contacts Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Emergency Contacts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Keep these important numbers handy. In case of fire emergency, every second counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${contact.category === 'Emergency' ? 'bg-red-100 text-red-800' :
                      contact.category === 'Forest' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                      {contact.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contact.organization}
                    </h3>
                  </div>
                </div>
                <div className="mb-3">
                  <a href={`tel:${contact.number.replace(/[^0-9]/g, '')}`} className="text-3xl font-bold text-green-600 hover:text-green-700">
                    {contact.number}
                  </a>
                </div>
                <p className="text-gray-600 text-sm">
                  {contact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
          
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users who trust our platform for forest fire monitoring and prediction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/live-map"
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Live Map
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}

export default Home;
