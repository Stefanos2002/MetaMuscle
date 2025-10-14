import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    route("post/:postId", "routes/post.tsx"),

    route("shop", "routes/shop/layout.tsx", [
      route("all-products", "routes/shop/all-products.tsx"),
      route("whey-protein", "routes/shop/whey-protein.tsx"),
      route("plant-based", "routes/shop/plant-based.tsx"),
      route("mass-gainers", "routes/shop/mass-gainers.tsx"),
      route("pre-post-workout", "routes/shop/pre-post-workout.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
