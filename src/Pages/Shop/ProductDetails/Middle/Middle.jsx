import "@smastrom/react-rating/style.css";
import { FiPlus, FiMinus } from "react-icons/fi";
import {
  FaFacebookF,
  FaHeart,
  FaLinkedin,
  FaRegHeart,
  FaWhatsapp,
} from "react-icons/fa";
import { LuArrowDownUp } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import useAxiosPublic from "../../../../Components/Hooks/useAxiosPublic";
import useAuth from "../../../../Components/Hooks/useAuth";
import useUsers from "../../../../Components/Hooks/useUsers";
import useCart from "../../../../Components/Hooks/useCart";
import toast from "react-hot-toast";
import useWishs from "../../../../Components/Hooks/useWishs";

const Middle = ({ product }) => {
  const { user } = useAuth();
  const [users] = useUsers();
  const [carts, refetch] = useCart();
  const [wishlists, refetchWish] = useWishs();
  const axiosPublic = useAxiosPublic();

  const usersDetails = users.find((u) => u?.email === user?.email);

  const {
    _id,
    name,
    price,
    quantity,
    description,
    category,
    priceGroup,
    discount,
    image,
  } = product ?? {};

  const [selectedTier, setSelectedTier] = useState(null);
  const [quantitySelected, setQuantitySelected] = useState(1);
  const [message, setMessage] = useState("");

  const usersWishs = wishlists.filter((wish) => wish.email === user?.email);
  const wishProduct = usersWishs.find((item) => item.productId === _id);

  const modalRef = useRef(null);

  useEffect(() => {
    if (priceGroup?.length > 0) {
      const basicTier =
        priceGroup.find((pkg) => pkg?.tier === "Basic") || priceGroup[0];
      setSelectedTier(basicTier);
    }
  }, [priceGroup]);

  const calculateDiscountedPrice = (amount) => {
    if (discount) {
      return amount * (1 - discount / 100);
    }
    return amount;
  };

  const handleIncrease = () => {
    setQuantitySelected((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantitySelected((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = async () => {
    try {
      const discountedPrice =
        category === "digital gift"
          ? calculateDiscountedPrice(selectedTier?.price.amount).toFixed(2)
          : calculateDiscountedPrice(price).toFixed(2);

      const purchase = {
        userID: usersDetails?._id,
        email: user.email,
        productId: _id,
        price: discountedPrice,
        quantity: quantitySelected,
        tier: selectedTier?.tier,
        name: name,
        image: image.itemImg,
        message: message,
      };

      const res = await axiosPublic.post("/carts", purchase);

      if (res.status === 200) {
        setMessage("");
        modalRef.current.close();
        toast.success("Product added to cart");
        refetch();
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
    }
  };

  const handleAddTowish = async () => {
    if (wishProduct) {
      toast.error("Product is already in your wishlist");
      return;
    }

    const Wishlist = {
      userID: usersDetails?._id,
      email: user?.email,
      productId: _id,
    };

    try {
      const res = await axiosPublic.post("/wishlists", Wishlist);
      if (res.status === 200) {
        refetchWish();
        toast.success("Product added to wishlist");
      } else {
        toast.error("Failed to add to wishlist");
      }
    } catch (error) {
      toast.error("Error adding to wishlist");
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      const res = await axiosPublic.delete(`/wishlists/${wishlistId}`);
      if (res.data.acknowledged && res.data.deletedCount > 0) {
        refetchWish();
        toast.success("Product removed from wishlist");
      } else {
        toast.error("Failed to remove product from wishlist");
      }
    } catch (error) {
      toast.error("Error removing product from wishlist");
    }
  };

  return (
    <div className="space-y-4 lg:w-[35%]">
      <div className="flex justify-start gap-4">
        {priceGroup?.map((pkg) => (
          <button
            className={`${
              selectedTier?.tier === pkg?.tier
                ? "bg-primary text-white"
                : "bg-gray-200 text-black"
            } px-4 rounded-full`}
            key={pkg?.tier}
            onClick={() => setSelectedTier(pkg)}
          >
            {pkg?.tier}
          </button>
        ))}
      </div>

      {category === "digital gift" ? (
        <p className="flex gap-2 text-xl text-primary items-center">
          {discount ? (
            <>
              <span className="text-gray-400 line-through ml-2">
                ${selectedTier?.price.amount}
              </span>
              ${calculateDiscountedPrice(selectedTier?.price.amount).toFixed(2)}
            </>
          ) : (
            <>${selectedTier?.price.amount}</>
          )}
        </p>
      ) : (
        <p className="flex gap-2 text-xl text-primary items-center">
          {discount ? (
            <>
              <span className="text-gray-400 line-through ml-2">${price}</span>$
              {calculateDiscountedPrice(price).toFixed(2)}
            </>
          ) : (
            <>${price}</>
          )}
        </p>
      )}

      <section className="flex">
        {category === "digital gift" ? (
          selectedTier?.quantity > 0 ? (
            <p className="uppercase bg-green-100 text-sm text-green-700 rounded-full font-medium px-4">
              In Stock
            </p>
          ) : (
            <p className="uppercase bg-red-100 text-sm text-red-700 rounded-full font-medium px-4">
              Out of Stock
            </p>
          )
        ) : quantity > 0 ? (
          <p className="uppercase bg-green-100 text-sm text-green-700 rounded-full font-medium px-4">
            In Stock
          </p>
        ) : (
          <p className="uppercase bg-red-100 text-sm text-red-700 rounded-full font-medium px-4">
            Out of Stock
          </p>
        )}
      </section>

      <p>{description}</p>

      <section className="flex justify-start gap-4 items-center">
        <section className="flex gap-4 items-center justify-between">
          <button
            className="bg-gray-200 p-2 rounded-full text-xl"
            onClick={handleDecrease}
          >
            <FiMinus />
          </button>
          <p>{quantitySelected}</p> {/* Display selected quantity */}
          <button
            className="bg-gray-200 p-2 rounded-full text-xl"
            onClick={handleIncrease}
          >
            <FiPlus />
          </button>
        </section>
        {category === "digital gift" ? (
          selectedTier?.quantity > 0 ? (
            <button
              onClick={() => modalRef.current.showModal()}
              className="bg-primary px-6 py-2 rounded-full text-white"
            >
              Add to cart
            </button>
          ) : (
            <button
              disabled
              className="bg-primary px-6 py-2 rounded-full text-white"
            >
              Add to cart
            </button>
          )
        ) : quantity > 0 ? (
          <button
            onClick={handleAddToCart}
            className="bg-primary px-6 py-2 rounded-full text-white"
          >
            Add to cart
          </button>
        ) : (
          <button
            disabled
            className="bg-primary px-6 py-2 rounded-full text-white"
          >
            Add to cart
          </button>
        )}
      </section>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box relative p-6 bg-white rounded-lg shadow-lg">
          <form method="dialog" className="absolute right-4 top-4">
            <button className="btn btn-sm btn-circle btn-ghost hover:bg-gray-200">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl text-center mb-4">
            Add Your Message
          </h3>
          <textarea
            className="textarea textarea-bordered w-full h-24 p-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary text-white px-6 py-2 rounded-lg hover:bg-primary-focus transition-all duration-300"
            >
              Submit
            </button>
          </div>
        </div>
      </dialog>

      <section className="flex justify-start gap-4 items-center">
        {wishProduct ? (
          <button
            onClick={() => handleRemove(wishProduct._id)}
            className="flex uppercase items-center gap-2 text-xs border py-2 px-4 rounded-full"
          >
            <span>
              <FaHeart className="text-primary" />
            </span>
            added wishlist
          </button>
        ) : (
          <button
            onClick={handleAddTowish}
            className="flex uppercase items-center gap-2 text-xs border py-2 px-4 rounded-full"
          >
            <span>
              <FaRegHeart className="text-primary" />
            </span>
            add to wishlist
          </button>
        )}

        <p className="flex uppercase items-center gap-2 text-xs border py-2 px-4 rounded-full">
          <span>
            <LuArrowDownUp />
          </span>
          compare
        </p>
      </section>

      <div className="divider"></div>

      <p className="text-sm text-gray-400">
        Category: <span className="text-black">{category}</span>
      </p>

      <section className="space-x-2">
        <button className="bg-blue-600 p-2 text-white rounded-full">
          <FaFacebookF />
        </button>
        <button className="bg-green-500 p-2 text-white rounded-full">
          <FaWhatsapp />
        </button>
        <button className="bg-blue-700 p-2 text-white rounded-full">
          <FaLinkedin />
        </button>
      </section>
    </div>
  );
};

export default Middle;
