import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/Layout';
import BookList from './components/BookList';
import SaleList from './components/SaleList';
import PurchaseList from './components/PurchaseList';
import FinancialList from './components/FinancialList';
import Login from './components/Login';
import { authService } from './services/authService';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
        <ConfigProvider locale={zhCN}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Navigate to="/books" replace />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/books"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BookList />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sales"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <SaleList />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/purchases"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <PurchaseList />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/financial"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <FinancialList />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </ConfigProvider>
  );
};

export default App;
