import { Link, useLoaderData } from "react-router-dom";
import useBlogs from "../../Components/Hooks/useBlogs";
import useAuth from "../../Components/Hooks/useAuth";
import toast from "react-hot-toast";
import { FaCopy } from "react-icons/fa";
import { useState } from "react";
import useAxiosPublic from "../../Components/Hooks/useAxiosPublic";
import { useForm } from "react-hook-form";

const BlogDetails = () => {
  const { user } = useAuth();
  const blogDetails = useLoaderData();
  const axiosPublic = useAxiosPublic();
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs] = useBlogs(searchTerm);
  const [comments, setComments] = useState(blogDetails.blogComments);

  // console.log(comments)

  const { blogTitle, publishDate, blogDescription, blogImage, blogTags, blogCategories } = blogDetails;

  const recentBlogs = [...blogs].sort(
    (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
  );

  // Copy blog url
  const handleCopyLink = () => {
    const blogUrl = `${window.location.origin}/BlogDetails/${blogDetails._id}`;
    navigator.clipboard
      .writeText(blogUrl)
      .then(() => {
        toast.success('Link Copied');
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };


  // Comment submit
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const newComment = {
      commentName: user?.displayName,
      comment: data.comment,
      commentsUrl: user?.photoURL,
      commentEmail: user?.email,
    };

    try {
      const response = await axiosPublic.post(`/blogs/${blogDetails._id}/comments`, newComment);
      if (response.status === 200) {
        toast.success("Comment added successfully!");
        reset();
        setComments((prevComments) => [newComment, ...prevComments]);
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("There was an issue adding your comment.");
    }
  };


  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* BlogDetails Left Side */}
        <div className="w-full lg:w-3/4 lg:p-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-bold text-black my-4 mb-8">
              {blogTitle}
            </h1>

            <img src={blogImage} alt="GifTap has No Photo" className="w-full h-[700px] object-cover rounded-lg" />
            <p className="text-lg lg:text-xl font-semibold text-gray-500 mt-8">{blogDescription}</p>

            <h1 className="text-2xl lg:text-3xl font-bold text-black my-4 mb-4">
              Comments
            </h1>

            {/* Comment box */}
            <div className="flex flex-col p-4 border rounded-lg shadow-md">
              <form onSubmit={handleSubmit(onSubmit)}>
                <textarea
                  className="resize-none w-full h-24 p-2 border rounded-md focus:outline-none focus:ring focus:ring-primary text-black"
                  placeholder="Add comment..."
                  {...register('comment', { required: 'Comment is required' })}
                />
                {errors.comment && (
                  <span className="text-red-500">{errors.comment.message}</span>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-4">
                    <button type="button" className="text-gray-600 hover:text-primary"><strong>B</strong></button>
                    <button type="button" className="text-gray-600 hover:text-primary"><em>I</em></button>
                    <button type="button" className="text-gray-600 hover:text-primary"><u>U</u></button>
                  </div>
                  {
                    user ? <>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-primary rounded hover:bg-primary"
                      >
                        Submit
                      </button>
                    </> : <>
                      <Link to={"/login"}>
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-primary rounded hover:bg-primary"
                        >
                          LogIn
                        </button>
                      </Link>
                    </>
                  }
                </div>
              </form>
            </div>

            {/* Show Comment */}
            <div className="mt-10">
              {comments.map((comment, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-start">
                    <img
                      src={comment.commentsUrl}
                      alt=""
                      className="h-8 w-8 lg:h-10 lg:w-10 object-cover rounded-full mr-2"
                    />
                    <div>
                      <div className=" bg-blue-100 rounded-2xl p-2">
                        <h1 className="text-[16px] lg:text-[18px] font-bold text-black">{comment.commentName}</h1>
                        <p className="ml-4 font-medium text-gray-700">{comment.comment}</p>
                      </div>
                      <div className="flex text-blue-600 ml-4 lg:ml-10 font-medium cursor-pointer">
                        <p className="ml-2">Like</p>
                        <p className="ml-2" onClick={() => document.getElementById('my_modal_2').showModal()}>Reply</p>
                        <p className="ml-2">Share</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>
        </div>

        {/* Open the modal in Comment Reply Button */}
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-center sm:-mx-2">
              <textarea
                className="resize-none w-full   border rounded-md focus:outline-none focus:ring focus:ring-primary text-black"
                placeholder={`Comment as ${user?.displayName}`}
              />

              <div className="flex items-center justify-between mt-2">

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-primary rounded hover:bg-primary ml-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>


        {/* BlogDetails Right Side */}
        <div className="w-full lg:w-1/4 mt-8 lg:mt-0 lg:p-4">
          <div className="flex flex-col gap-6">
            {/* Search functionality */}
            <label className="input input-bordered flex items-center gap-2 lg:mt-8">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Recent Blogs"
                className="grow"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>

            {/* Recent Blogs */}
            <div>
              <h1 className="text-gray-500 font-bold text-2xl">Recent Posts</h1>
              <hr className="text-gray-500 mt-2" />
              <div className="space-y-4 mt-6">
                {recentBlogs.slice(0, 4).map((blog) => (
                  <div key={blog._id} className="flex items-start">
                    <Link to={`/BlogDetails/${blog._id}`}>
                      <img
                        src={blog.blogImage}
                        alt=""
                        className="w-16 lg:w-20 h-16 lg:h-20 object-cover mr-4 rounded-lg"
                      />
                    </Link>
                    <div>
                      <Link to={`/BlogDetails/${blog._id}`}>
                        <h1 className="font-bold text-sm lg:text-[17px] text-gray-600 hover:text-primary">
                          {blog.blogTitle}
                        </h1>
                      </Link>
                      <p className="text-gray-500 text-xs lg:text-sm font-bold mt-2">{blog.blogPublishDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Categories */}
            <div>
              <h1 className="text-gray-500 font-bold text-2xl">Categories</h1>
              <hr className="text-gray-500 mt-2" />
              <div className="mt-2 space-y-2">
                {blogCategories?.map((category, index) => (
                  <Link key={index}>
                    <div className="  hover:border-primary font-medium text-gray-600 p-2 rounded-lg hover:text-primary">
                      {category}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Blog  blogTags... */}
            <div>
              <h1 className="text-gray-500 font-bold text-2xl">Tags</h1>
              <hr className="text-gray-500 mt-2" />
              <div className="mt-2 flex flex-wrap gap-2">
                {blogTags?.map((tag, index) => (
                  <Link key={index}>
                    <div className="border hover:border-primary font-medium text-gray-600 p-2 rounded-lg hover:text-primary">
                      {tag}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Copy blog url */}
            <button onClick={handleCopyLink} className="btn btn-outline btn-primary">
              <FaCopy className="mr-2" /> Copy Blog URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
