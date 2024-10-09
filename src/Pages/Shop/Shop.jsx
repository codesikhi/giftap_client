import { useState, useEffect } from "react";
import useProducts from "../../Components/Hooks/useProducts";
import { BsFillGrid3X2GapFill } from "react-icons/bs";
import { MdViewList, MdFavoriteBorder, MdAddShoppingCart } from "react-icons/md";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";  
import { FcViewDetails } from "react-icons/fc";
import axios from "axios";
import useUsers from "../../Components/Hooks/useUsers";
import useAuth from "../../Components/Hooks/useAuth";
import useAxiosPublic from "../../Components/Hooks/useAxiosPublic";
import RecentView from "./RecentView/RecentView";
import useRecentView from "../../Components/Hooks/useRecntView";

const Shop = () => {
  const [products, loading] = useProducts();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const productsPerPage = 9;
   const {user} = useAuth();
   const axiosPublic =useAxiosPublic()
  //  console.log(user)
  //  console.log(user?.email)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const categories = ["All", ...new Set(products.map((item) => item.category))];

  const handleRecentView = (id, image, price, category, name) => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const userEmail = user?.email;
    
    const info = { id, image, price, category, name, date, userEmail };
          console.log(info)
    axiosPublic.post("/recentviews", info)
      .then(response => {
        console.log("Recent view logged:", response.data);
      })
      .catch((error) => {
        console.error("Error logging recent view:", error);
      });
  };
  const handleAddToCart = (id, image, price, name) => {
    const date = new Date().toLocaleDateString();
    const userEmail = user?.email;
  
    const info = { id, image, price, name, date, userEmail };
    axiosPublic.post("/cart", info)
      .then(response => {
        console.log("Cart item added:", response.data);
      })
      .catch(error => {
        console.error("Error adding cart item:", error);
      });
  };
  const handleWishlist = (id, image, price, name) => {
    const date = new Date().toLocaleDateString();
    const userEmail = user?.email;

    const info = { id, image, price, name, date, userEmail };
    axiosPublic.post("/wishlist", info)
      .then(response => {
        console.log("Wishlist item added:", response.data);
      })
      .catch(error => {
        console.error("Error adding wishlist item:", error);
      });
  };

  useEffect(() => {
    let updatedProducts = [...products];

    // Filtering logic
    if (selectedCategory !== "All") {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }
    updatedProducts = updatedProducts.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (sortOption === "lowToHigh") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "highToLow") {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === "alphabeticalAZ") {
      updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "alphabeticalZA") {
      updatedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "dateOldToNew") {
      updatedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "dateNewToOld") {
      updatedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredProducts(updatedProducts);
    setCurrentPage(1);
  }, [selectedCategory, sortOption, priceRange, products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    if (name === "minPrice") {
      setPriceRange([Number(value), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Number(value)]); 
    }
  };

  return (
    <div className="container mx-auto my-10 grid grid-cols-1 md:grid-cols-[30%_70%] gap-8">
      {/* Sidebar */}
      <section className="space-y-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-5 rounded-lg text-white">
        {/* Category Section */}
        <section>
          <p className="text-2xl font-medium">Product Categories</p>
          <hr className="border-dashed mt-4" />
        </section>
        <section>
          <ul className="space-y-4">
            {categories.map((category, index) => (
              <li key={index} className="mb-4">
                <div
                  className={`cursor-pointer hover:bg-primary hover:text-white hover:btn hover:btn-primary ${
                    selectedCategory === category
                      ? "font-bold btn btn-primary text-white"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </div>
                {index !== categories.length - 1 && (
                  <hr className="border-dashed my-4" />
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Price Filter Section */}
        <section>
          <p className="text-2xl font-medium">Filter by Price</p>
          <hr className="border-dashed my-4" />
          <div className="space-y- w-full gap-2 flex">
            <div className="w-1/2">
              <label htmlFor="minPrice">Min Price:</label>
              <input
                type="number"
                name="minPrice"
                value={priceRange[0]}
                onChange={handlePriceRangeChange}
                className="border p-2 w-full"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="maxPrice">Max Price:</label>
              <input
                type="number"
                name="maxPrice"
                value={priceRange[1]}
                onChange={handlePriceRangeChange}
                className="border p-2 w-full"
              />
            </div>
          </div>
        </section>
        <hr className="border-dashed mt-4" />
        <h1 className="flex justify-center items-center font-bold text-white text-3xl">Most Recent View product</h1>
            {/* Most Recent View Product Section */}
        {mostRecentProduct && (
         <div className="card bg-base-100 w-96 shadow-xl">
         <figure className="px-10 pt-10">
           <img
             src={mostRecentProduct?.image}
             alt="Shoes"
             className="rounded-xl" />
         </figure>
         <div className="card-body items-center text-center">
           <h2 className="card-title font-bold text-2xl">{mostRecentProduct?.name}</h2>
           <p>{mostRecentProduct?.price}</p>
           <div className="card-actions">
           <Link to={`/productDetails/${mostRecentProduct?.id}`}>
               
                     
                      <button
    className="bg-primary text-white p-2 rounded-full border border-gray-300"
   
  >
   View Details
  </button></Link>
           </div>
         </div>
       </div>
        )}
      </section>
     
      {/* Products Section */}
      <section>
        <section className="flex justify-around flex-wrap">
          <p className="flex-1">
            Showing {currentProducts.length} of {filteredProducts.length}{" "}
            results
          </p>
          <section className="flex gap-2 ">
            <section className="flex gap-2">
              <button
                className={`${viewMode === "grid" ? "font-bold" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <BsFillGrid3X2GapFill />
              </button>
              <button
              className={`${viewMode === "grid" ? "font-bold" : ""}`}

                onClick={() => setViewMode("list")}
              >
                <MdViewList />
              </button>
            </section>

            {/* Sort By Section (moved) */}
            <section className="flex  items-center">
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border p-2 bg-white text-black"
              >
                <option value="default">Default Sort</option>
                <option value="alphabeticalAZ">Alphabetically, A-Z</option>
                <option value="alphabeticalZA">Alphabetically, Z-A</option>
                <option value="lowToHigh">Price, low to high</option>
                <option value="highToLow">Price, high to low</option>
                <option value="dateOldToNew">Date, old to new</option>
                <option value="dateNewToOld">Date, new to old</option>
              </select>
            </section>
          </section>
        </section>
        <hr className="border-dashed my-4" />

        {/* Products Grid/List */}
        <section
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {currentProducts.map((item) => (
            <motion.div
              key={item._id}
              className="relative group bg-white shadow-lg rounded-lg overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background image */}
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {/* Buttons on hover, overlaid on the image */}
                <div className="absolute top-30 left-0 -right-30 -bottom-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="grid grid-cols-1 ">
                    <Link to={`/productDetails/${item._id}`}>
                  
                    <motion.button
                        className="tooltip tooltip-right text-blue-500 p-2 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        data-tip="View Details"
                        style={{ zIndex: 1000 }}
                      >  <button onClick={()=>handleRecentView(item._id,item.image,item.price,item.category,item.name)}>
                        <FcViewDetails /></button>
                      </motion.button>
                    
                    </Link>
                    <motion.button
                      className="tooltip tooltip-right text-pink-600 p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      data-tip="Add to Wishlist"
                    >
                      <MdFavoriteBorder size={24} />
                    </motion.button>
                    <motion.button
                      className="tooltip tooltip-right text-green-600 p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      data-tip="Add to Cart"
                    >
                      <MdAddShoppingCart size={24} />
                    </motion.button>
                  </div>
                </div>
              </div>
              {/* Wishlist and Cart Icons */}
              <div class="absolute top-0 right-0 mt-2 mr-2 flex gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">

              <motion.button
                      className="tooltip tooltip-bottom text-pink-600 p-2 rounded full"
                      whileHover={{ scale: 1.1 }}
                      data-tip="Add To Wishlist"
                    > <button
                    className="bg-white text-black p-2 rounded-full border border-gray-300"
                    onClick={() => handleWishlist(item._id, item.image, item.price, item.name)}
                  >
                    <MdFavorite />
                  </button></motion.button>

                  <Link to={`/productDetails/${item._id}`}>
                  <motion.button
                      className="tooltip tooltip-bottom text-pink-600 p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      data-tip="View Details"
                    >
                      <button
    className="bg-white text-black p-2 rounded-full border border-gray-300"
    onClick={() => handleRecentView(item._id, item.image, item.price, item.category, item.name)}
  >
    <FcViewDetails />
  </button></motion.button></Link>

  <motion.button
                      className="tooltip tooltip-bottom text-pink-600 p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      data-tip="Add To Cart"
                    ><button
                    className="bg-white text-black p-2 rounded-full border border-gray-300"
                    onClick={() => handleAddToCart(item._id, item.image, item.price, item.name)}
                  >
                     <MdAddShoppingCart />
                  </button></motion.button>
</div>

            </motion.div>
          ))}
        </section>

        {/* Pagination */}
        <section className="mt-6">
          {totalPages > 1 && (
            <ul className="flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index}>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
      
    </div>
  );
};

export default Shop;