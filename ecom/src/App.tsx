import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/main/Layout";
import ProtectedRoute from "./pages/Main/ProtectedRoute";
import { Loading } from "./components/main/Loading";
import { AuthProvider } from "./contexts/AuthContext"; // Import the AuthProvider
import Home from "./pages/Main/Home";
const Orders = React.lazy(() => import("./pages/Profile/Orders"));
const OrderStatus = React.lazy(() => import("./pages/Main/OrderStatus"));
const NotFound = React.lazy(() => import("./pages/Main/NotFound"));
const Checkout = React.lazy(() => import("./pages/Main/Checkout"));
const Security = React.lazy(() => import("./pages/Profile/Security"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const Admin = React.lazy(() => import("./pages/Admin/Admin"));

const Category = React.lazy(() => import("./pages/Main/Category"));
const Product = React.lazy(() => import("./pages/Main/Product"));
const CATEGORIES: Array<"camera" | "lens" | "accessories" | "other" | "all"> = [
  "camera",
  "lens",
  "accessories",
  "other",
  "all",
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
                  <Route
                    path="/order-status"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <OrderStatus />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Orders />
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
