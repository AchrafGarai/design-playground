import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("p/:slug", "routes/demo.tsx"),
] satisfies RouteConfig;
