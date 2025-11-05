import { Link } from "react-router-dom";
import AlertBanner from "./AlertBanner";

function Home() {
  // Sample news data - in a real app, this would come from an API
  const newsArticles = [
    {
      id: 1,
      title: "Nepal Records Highest Forest Fire Incidents in March 2024",
      excerpt: "The Department of Forests and Soil Conservation reports a 40% increase in forest fire incidents compared to last year, with dry weather conditions being the primary factor.",
      date: "March 15, 2024",
      source: "The Kathmandu Post",
      category: "Breaking News",
      image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "New AI System Helps Predict Forest Fires in Nepal",
      excerpt: "Researchers at Tribhuvan University have developed an advanced AI system that can predict forest fire risks with 85% accuracy using satellite data and weather patterns.",
      date: "March 12, 2024",
      source: "Nepal News",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Community Forest Groups Receive Fire Prevention Training",
      excerpt: "Over 500 community forest user groups across Nepal have received specialized training in fire prevention and early warning systems to protect their local forests.",
      date: "March 10, 2024",
      source: "Himalayan Times",
      category: "Community",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Government Announces New Forest Fire Prevention Policy",
      excerpt: "The Ministry of Forests and Environment has announced a comprehensive new policy aimed at reducing forest fire incidents by 50% over the next five years.",
      date: "March 8, 2024",
      source: "Republica",
      category: "Policy",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop"
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
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
     

      {/* News Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              News Bulletin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Articles about forest fire incidents, prevention efforts, and environmental news from across Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsArticles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${article.category === 'Breaking News' ? 'bg-red-100 text-red-800' :
                      article.category === 'Technology' ? 'bg-blue-100 text-blue-800' :
                        article.category === 'Community' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>{article.date}</span>
                  </div>
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Read More
                  </button>
                </div>
              </article>
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
