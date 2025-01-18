import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/main/layout";
import ProtectedRoute from "./pages/Main/ProtectedRoute";
import NotFound from "./pages/Main/NotFound";

import Security from "./pages/Profile/Security";
import { Loading } from "./components/main/Loading";
import Product from "./pages/Main/Product";
import Home from "./pages/Main/Home";
import Category from "./pages/Main/Category";
import { AuthProvider } from "./contexts/AuthContext"; // Import the AuthProvider
import Checkout from "./pages/Main/Checkout";

const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Admin = React.lazy(() => import("./pages/Admin/Admin"));
const CATEGORIES: Array<"camera" | "lens" | "accesories" | "others"> = [
  "camera",
  "lens",
  "accesories",
  "others",
];

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />

        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <AuthProvider>
                <Routes>
                  <Route path="*" element={<NotFound />} />
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/product/:details"
                    element={
                      <Layout>
                        <Product />
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Checkout />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/security"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Security />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  {CATEGORIES.map((name, index) => (
                    <Route
                      key={index}
                      path={`/${name.toLowerCase()}`}
                      element={
                        <Layout>
                          <Category category={name} />
                        </Layout>
                      }
                    />
                  ))}
                </Routes>
              </AuthProvider>
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
