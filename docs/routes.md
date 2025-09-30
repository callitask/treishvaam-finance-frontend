# Route table

The table below lists the application's routes as defined in `src/App.js`. Authentication requirements are inferred from usage of `PrivateRoute` and `AuthContext`.

| Path | Component / Page | Filepath | Lazy loaded? | Auth required? | Notes |
|------|------------------|----------|---------------|----------------|-------|
| / | BlogPage | src/pages/BlogPage.js | No | No | Main landing page (list of posts) |
| /about | AboutPage | src/pages/AboutPage.js | No | No | Static about page |
| /services | ServicesPage | src/pages/ServicesPage.js | No | No | Services listing |
| /vision | VisionPage | src/pages/VisionPage.js | No | No | Vision / company info |
| /education | EducationPage | src/pages/EducationPage.js | No | No | Education resources |
| /contact | ContactPage | src/pages/ContactPage.js | No | No | Contact form/page |
| /blog | (Navigate to /) | n/a | n/a | No | Redirects to `/` (legacy route) |
| /category/:categorySlug/:userFriendlySlug/:urlArticleId | SinglePostPage | src/pages/SinglePostPage.js | No | No | Article detail page (SEO-friendly URL) |
| /login | LoginPage | src/pages/LoginPage.js | No | No | Login form; PrivateRoute redirects here when not authenticated |
| /manage-posts | Redirect to /dashboard/manage-posts | n/a | n/a | No | Legacy redirect to dashboard route |

-- Private dashboard routes (mount at `/dashboard` with `PrivateRoute` wrapper) --
| /dashboard | DashboardPage (index) | src/pages/DashboardPage.js | No | Yes | Dashboard landing (requires authentication)
| /dashboard/manage-posts | ManagePostsPage | src/pages/ManagePostsPage.js | No | Yes | Admin/manage posts UI
| /dashboard/blog/new | BlogEditorPage | src/pages/BlogEditorPage.js | No | Yes | New post editor (WYSIWYG)
| /dashboard/blog/edit/:userFriendlySlug/:id | BlogEditorPage | src/pages/BlogEditorPage.js | No | Yes | Edit post editor (param-driven)
| /dashboard/settings | SettingsPage | src/pages/SettingsPage.js | No | Yes | User/admin settings |
| /dashboard/api-status | ApiStatusPage | src/pages/ApiStatusPage.js | No | Yes | API status / health page for admins |

Notes on routing discovery

- Routes are declared directly in `src/App.js` using React Router v6 `<Routes>` / `<Route>` components.
- Auth-protected routes are wrapped by the `PrivateRoute` component (`src/components/PrivateRoute.js`) which reads auth state from `AuthContext` (`src/context/AuthContext.js`). If `auth.isAuthenticated` is false the user is redirected to `/login`.
- No dynamic route generation from an external config file was detected. All routes are statically declared in `src/App.js`.
- Lazy-loading: the project currently imports page components synchronously (no `React.lazy` or dynamic import detected). If you want to implement route-based code-splitting, replace imports with `React.lazy(() => import('./pages/SomePage'))` and wrap with `<Suspense>`.
