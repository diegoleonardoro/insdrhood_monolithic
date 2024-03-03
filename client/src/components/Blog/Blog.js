import "./blog.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import DOMPurify from 'dompurify';


const Blog = () => {

  const { id } = useParams();
  const { currentuser_ } = useUserContext();

  const [blogHtml, setBlogHtml] = useState('');
  const [title, setTitle]= useState('');

  const getBlog = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post/${id}`);
    console.log("blog", response);
    setTitle(response.data.title);
    const cleanHTML = DOMPurify.sanitize(response.data.body);
    setBlogHtml(cleanHTML)
  }

  useEffect(() => {
    // make request to fetch the blog post:
    getBlog()
  }, [])

  return (
    <div className="blogMainContainer">
      <h1 className="article-title">{title}</h1>
    <div className="blogContainer" dangerouslySetInnerHTML={{ __html: blogHtml }} />
    </div>
  )

}

export default Blog;