import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Expenses = lazy(() => import('@/pages/Expenses'))
const AddExpense = lazy(() => import('@/pages/AddExpense'))
const Categories = lazy(() => import('@/pages/Categories'))
const Budgets = lazy(() => import('@/pages/Budgets'))
const Splits = lazy(() => import('@/pages/Splits'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppShell />}>
                        <Route index element={<Dashboard />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="expenses/new" element={<AddExpense />} />
                        <Route path="expenses/:id/edit" element={<AddExpense />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="budgets" element={<Budgets />} />
                        <Route path="splits" element={<Splits />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
