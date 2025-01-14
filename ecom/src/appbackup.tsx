import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/main/layout";
import ProtectedRoute from "./pages/Main/ProtectedRoute";
import NotFound from "./pages/Main/NotFound";
import axios from "axios";
import Security from "./pages/Profile/Security";
import { Loading } from "./components/main/Loading";
import Product from "./pages/Main/Product";
import Home from "./pages/Main/Home";
import Category from "./pages/Main/Category";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

// Lazy load the components
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Admin = React.lazy(() => import("./pages/Admin/Admin"));
const CATEGORIES = ["camera", "lens", "accessories", "other"];

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // New loading state

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await axios.get("/get-user");
        if (response.data && response.data.user) {
          setToken(response.data.token);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setToken(null);
      } finally {
        setLoading(false); // Mark loading as complete
      }
    };

    checkUserSession();
  }, []);

  return (
    <BrowserRouter>
      {/* Suspense fallback to display while components are loading */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="*" element={<NotFound />} />
          {/* Main route */}
          <Route
            path="/"
            element={
              <Layout token={token}>
                <Home />
              </Layout>
            }
          />

          {/* Product Details Route */}
          <Route
            path="/product/:details"
            element={
              <Layout token={token}>
                <Product token={token} />
              </Layout>
            }
          />

          {/* Profile Route */}
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute token={token} loading={loading}>
                <Layout token={token}>
                  <Profile token={token} />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/security"
            element={
              <ProtectedRoute token={token} loading={loading}>
                <Layout token={token}>
                  <Security token={token} />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Category Routes */}
          {CATEGORIES.map((name, index) => (
            <Route
              key={index}
              path={`/${name.toLowerCase()}`}
              element={
                <Layout token={token}>
                  <Category category={name} />
                </Layout>
              }
            />
          ))}

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<Loading></Loading>}>
                <Admin />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
