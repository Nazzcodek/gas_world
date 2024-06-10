import React, { useState, useEffect } from 'react';
import { List, Card, Button, Spin, Layout } from 'antd';
import { useSpring, animated } from 'react-spring';
import axios from 'axios';
import NavBar from './NavBar';

const { Meta } = Card;
const { Header, Content } = Layout;

const Blog = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (post) => {
    setExpandedPost(expandedPost === post.id ? null : post.id);
  };

  const postAnimation = useSpring({
    opacity: loading ? 0 : 1,
    transform: loading ? 'translateY(-20px)' : 'translateY(0px)',
  });

  return (
      <Layout className="layout">
        <Header style={{ backgroundColor: 'white' }}>
          <NavBar />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div style={{ padding: '20px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Blog Posts</h1>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
            </div>
          ) : (
            <animated.div style={postAnimation}>
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={posts}
                renderItem={(post) => (
                  <List.Item>
                    <Card
                      hoverable
                      title={post.title}
                      extra={<Button type="link" onClick={() => handleReadMore(post)}>Read More</Button>}
                      style={{ width: 300, marginBottom: 20 }}
                    >
                      <Meta
                        description={
                          expandedPost === post.id ? post.body : `${post.body.substring(0, 100)}...`
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </animated.div>
          )}
        </div>
      </Content>
    </Layout>
  );
  
};

export default Blog;
