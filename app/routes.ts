import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("post/:postId", "routes/post.tsx"),

  layout("routes/dashboard.tsx", [route("about", "routes/about.tsx")]),
] satisfies RouteConfig;
