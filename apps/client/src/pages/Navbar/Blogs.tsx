import { useState } from "react";
import { Calendar, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

// Sample blog data
const blogPosts = [
  {
    id: 1,
    title: "10 Most Scenic Bus Routes in Nepal You Must Experience",
    excerpt:
      "Discover breathtaking mountain views, lush valleys, and cultural landmarks along Nepal's most beautiful bus journeys.",
    category: "Travel",
    image:
      "https://lp-cms-production.imgix.net/2024-05/shutterstock1495188476-cropped.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop",
    author: "Aarav Sharma",
    date: "June 10, 2023",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Essential Tips for Comfortable Long-Distance Bus Travel",
    excerpt:
      "Make your journey enjoyable with these practical tips for long bus rides, from packing essentials to seat selection.",
    category: "Tips",
    image:
      "https://i0.wp.com/travellingmandala.com/wp-content/uploads/2024/01/usual-bu-inside-scaled.jpg?w=1232&ssl=1",
    author: "Priya Patel",
    date: "May 22, 2023",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Understanding Different Bus Classes: Which One is Right for You?",
    excerpt:
      "From standard to deluxe to super deluxe - learn the differences and benefits of each bus class to choose the perfect option.",
    category: "Guide",
    image:
      "https://i0.wp.com/travellingmandala.com/wp-content/uploads/2023/11/baba-adventure-scaled.jpg?w=1232&ssl=1",
    author: "Rajesh Thapa",
    date: "April 15, 2023",
    readTime: "5 min read",
  },
  {
    id: 4,
    title: "Traveling with Children: Family-Friendly Bus Journey Tips",
    excerpt:
      "Make bus travel with kids stress-free with these practical suggestions for entertainment, comfort, and safety.",
    category: "Family",
    image:
      "https://travelynnfamily.com/wp-content/uploads/2018/02/DSC06031-900x531.jpg",
    author: "Sita Gurung",
    date: "March 30, 2023",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Monsoon Travel: Navigating Bus Journeys During Rainy Season",
    excerpt:
      "Stay safe and prepared when traveling by bus during Nepal's monsoon season with these essential tips and precautions.",
    category: "Safety",
    image:
      "https://gallery.thelongestwayhome.com/img/s12/v178/p2399167492-3.jpg",
    author: "Bikash KC",
    date: "July 5, 2023",
    readTime: "6 min read",
  },
  {
    id: 6,
    title: "The History of Bus Transportation in Nepal",
    excerpt:
      "Explore the fascinating evolution of bus services in Nepal, from the first routes to modern luxury coaches.",
    category: "History",
    image: "https://en.setopati.com/uploads/posts/Trolley-Bus1700826433.jpg",
    author: "Dr. Nirmala Shrestha",
    date: "February 12, 2023",
    readTime: "10 min read",
  },
];

const categories = [
  "All",
  "Travel",
  "Tips",
  "Guide",
  "Safety",
  "Family",
  "History",
  "Environment",
];

const Blogs = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visiblePosts, setVisiblePosts] = useState(6);

  const featuredPost = blogPosts.find((post) => post.featured);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    return matchesCategory && !post.featured;
  });

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
              eBusewa Blog
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and stories about bus travel in Nepal and beyond
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-teal-100 w-1 h-8 inline-block mr-3 rounded-full"></span>
              Featured Article
            </h2>
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-full overflow-hidden">
                  <img
                    src={featuredPost.image || "/placeholder.svg"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-teal-100 text-teal-700 border-0 mb-4">
                      {featuredPost.category}
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 line-clamp-2">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar size={16} className="mr-2" />
                      <span>{featuredPost.date}</span>
                      <Clock size={16} className="ml-4 mr-2" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                      Read Article <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setVisiblePosts(6); // Reset to 6 when changing category
                }}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-teal-600 text-white shadow-md transform scale-105"
                    : "bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-600 border border-gray-200 hover:border-teal-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPosts.slice(0, visiblePosts).map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader className="pt-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-teal-100 text-teal-700 border-0">
                    {post.category}
                  </Badge>
                  <div className="text-xs text-gray-500">{post.date}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-gray-500">{post.readTime}</div>
                  <Button
                    variant="ghost"
                    className="text-teal-600 hover:text-teal-700 p-0 hover:bg-transparent"
                  >
                    Read more <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        {filteredPosts.length > visiblePosts && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => setVisiblePosts((prev) => prev + 6)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
            >
              View More Articles <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
